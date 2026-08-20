import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as os from 'os';
import * as path from 'path';

const execFileAsync = promisify(execFile);

const UNIVER_TEMP_DIR = path.join(os.tmpdir(), 'univer-iqc-proto');
const IMPORT_MAX_ATTEMPTS = 2;

function toFileUrl(absolutePath: string): string {
  return `file://${absolutePath.replace(/\\/g, '/')}`;
}

/**
 * multipart/form-data의 파일명은 Multer/busboy가 기본적으로 Latin-1로 디코딩하기 때문에,
 * 브라우저가 UTF-8로 보낸 한글 파일명이 깨져서 들어온다 (예: "검사.xlsx" -> mojibake).
 * Latin-1로 잘못 해석된 바이트를 원래 UTF-8 바이트로 되돌려 재디코딩한다.
 */
function fixLatin1FileName(originalName: string): string {
  const fixed = Buffer.from(originalName, 'latin1').toString('utf-8');
  return fixed.includes('�') ? originalName : fixed;
}

/**
 * Windows의 `univer.cmd` shim은 실제로 node로 bin/univer.js를 호출하는 배치 파일이라
 * execFile('univer', ...)로 직접 실행할 수 없다 (ENOENT). shell:true는 cmd.exe를 거치면서
 * 인자 이스케이프가 깨져 인젝션 위험이 생기므로, shim을 파싱해 실제 JS 엔트리를 찾아
 * node로 직접 실행한다.
 */
function resolveUniverCommand(): { command: string; prependArgs: string[] } {
  if (process.platform !== 'win32') {
    return { command: 'univer', prependArgs: [] };
  }
  const cmdPath = execFileSyncWhere('univer.cmd') ?? execFileSyncWhere('univer');
  if (!cmdPath || !cmdPath.toLowerCase().endsWith('.cmd')) {
    return { command: 'univer', prependArgs: [] };
  }
  const shimContent = fsSync.readFileSync(cmdPath, 'utf-8');
  const match = shimContent.match(/"%dp0%\\(node_modules\\univer-cli\\bin\\univer\.js)"/i);
  if (!match) {
    return { command: 'univer', prependArgs: [] };
  }
  const scriptPath = path.join(path.dirname(cmdPath), match[1]);
  return { command: process.execPath, prependArgs: [scriptPath] };
}

function execFileSyncWhere(name: string): string | null {
  try {
    const { execFileSync } = require('child_process') as typeof import('child_process');
    const output = execFileSync('where', [name], { encoding: 'utf-8' });
    const firstLine = output.split(/\r?\n/).find((line) => line.trim().length > 0);
    return firstLine?.trim() ?? null;
  } catch {
    return null;
  }
}

@Injectable()
export class UniverCliService {
  private readonly logger = new Logger(UniverCliService.name);
  private readonly univerCommand = resolveUniverCommand();
  private daemonEnsured: Promise<void> | null = null;

  /**
   * xlsx를 import하고 daemon 뷰어 URL을 반환한다 (읽기 전용 열람 화면, IQC Proto3 실험용).
   * 워크북 JSON을 프론트로 내려보내지 않고, daemon이 서빙하는 뷰어를 iframe으로 임베드하는
   * 용도. daemon은 Univer Pro 라이선스 게이트 없이 차트까지 렌더링하는 것으로 검증됨.
   */
  async convertXlsxToViewerUrl(file: Express.Multer.File): Promise<{ viewerUrl: string; originalName: string }> {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }
    const originalName = fixLatin1FileName(file.originalname);
    const ext = path.extname(originalName).toLowerCase();
    if (ext !== '.xlsx') {
      throw new BadRequestException('xlsx 파일만 업로드할 수 있습니다.');
    }

    await this.ensureDaemonRunning();
    await fs.mkdir(UNIVER_TEMP_DIR, { recursive: true });

    const uuid = randomUUID();
    const sourcePath = path.join(UNIVER_TEMP_DIR, `${uuid}_${originalName}`);
    const univerFileName = `${uuid}.univer`;
    const univerPath = path.join(UNIVER_TEMP_DIR, univerFileName);
    const univerFileUrl = toFileUrl(univerPath);

    await fs.writeFile(sourcePath, file.buffer);

    const unitId = await this.runImport(sourcePath, univerPath, originalName);
    const worktreeId = await this.runWorktreeAdd(univerPath, originalName);

    const viewerUrl = await this.runOpen(univerPath, worktreeId, unitId);
    return { viewerUrl: this.toExternalViewerUrl(viewerUrl), originalName };
  }

  /**
   * `daemon start --json`은 항상 텍스트만 반환하므로(CLI 자체 사양), 먼저 `daemon status --json`으로
   * 이미 떠 있는지 확인하고 없을 때만 시작한다. 서버 프로세스 생애주기 동안 1회만 보장하면 되므로
   * 결과를 메모이즈한다.
   */
  private async ensureDaemonRunning(): Promise<void> {
    if (!this.daemonEnsured) {
      this.daemonEnsured = this.checkAndStartDaemon().catch((err: any) => {
        this.daemonEnsured = null;
        throw new InternalServerErrorException(`Univer daemon 시작에 실패했습니다: ${err.message}`);
      });
    }
    await this.daemonEnsured;
  }

  private async checkAndStartDaemon(): Promise<void> {
    const status = await this.runCli(['daemon', 'status', '--json']);
    if (status.daemon?.state === 'running') {
      return;
    }
    const { command, prependArgs } = this.univerCommand;
    await execFileAsync(command, [...prependArgs, 'daemon', 'start'], { maxBuffer: 10 * 1024 * 1024 });
  }

  /**
   * `open`만 다른 CLI 명령(import/status/execute 등)과 달리 `file://` 스킴을 인식하지 못하고
   * 상대 경로로 취급해 실행 프로세스의 cwd 기준으로 잘못 재해석한다 (CLI 자체의 동작 불일치).
   * 그래서 이 명령에는 file:// 접두사 없이 순수 OS 절대경로를 그대로 넘긴다.
   */
  private async runOpen(univerPath: string, worktreeId: string, unitId: string): Promise<string> {
    const args = ['open', univerPath, '--worktree', worktreeId, '--unit', unitId, '--json'];
    const result = await this.runCli(args);
    if (result.ok === false || !result.openUrl) {
      throw new InternalServerErrorException(`뷰어 URL 조회에 실패했습니다: ${result.error ?? '알 수 없는 오류'}`);
    }
    return result.openUrl;
  }

  /**
   * daemon은 자신이 리스닝하는 루프백 주소(예: http://127.0.0.1:9123)로 뷰어 URL을 만든다.
   * 이건 daemon이 도는 컨테이너 자기 자신 기준 주소라 브라우저에서는 무의미하다(사용자 PC의
   * 127.0.0.1로 요청이 감). nginx가 /univer-viewer/ 경로로 daemon을 프록시하고 있으므로,
   * daemon이 준 origin을 FRONTEND_ORIGIN 기준의 그 경로로 치환해서 내려준다. 별도 환경변수
   * 없이 이미 서버 도메인을 담고 있는 FRONTEND_ORIGIN을 재사용한다.
   */
  private toExternalViewerUrl(daemonViewerUrl: string): string {
    const frontendOrigin = process.env.FRONTEND_ORIGIN;
    if (!frontendOrigin) {
      return daemonViewerUrl;
    }
    const daemonUrl = new URL(daemonViewerUrl);
    return `${frontendOrigin.replace(/\/$/, '')}/univer-viewer${daemonUrl.pathname}${daemonUrl.search}`;
  }

  async convertXlsxToWorkbook(file: Express.Multer.File): Promise<{ workbookData: unknown; originalName: string }> {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }
    const originalName = fixLatin1FileName(file.originalname);
    const ext = path.extname(originalName).toLowerCase();
    if (ext !== '.xlsx') {
      throw new BadRequestException('xlsx 파일만 업로드할 수 있습니다.');
    }

    await fs.mkdir(UNIVER_TEMP_DIR, { recursive: true });

    const uuid = randomUUID();
    const sourcePath = path.join(UNIVER_TEMP_DIR, `${uuid}_${originalName}`);
    const univerFileName = `${uuid}.univer`;
    const univerPath = path.join(UNIVER_TEMP_DIR, univerFileName);
    const univerFileUrl = toFileUrl(univerPath);

    await fs.writeFile(sourcePath, file.buffer);

    const unitId = await this.runImport(sourcePath, univerPath, originalName);

    const worktreeId = await this.runWorktreeAdd(univerPath, originalName);

    try {
      const workbookData = await this.runExtractSnapshot(univerFileUrl, worktreeId, unitId);
      return { workbookData, originalName };
    } finally {
      await this.runWorktreeDiscard(univerFileUrl, worktreeId);
    }
  }

  async convertWorkbookToXlsx(workbookData: Record<string, unknown>): Promise<{ buffer: Buffer; fileName: string }> {
    if (!workbookData || typeof workbookData !== 'object') {
      throw new BadRequestException('workbookData가 필요합니다.');
    }

    await fs.mkdir(UNIVER_TEMP_DIR, { recursive: true });

    const uuid = randomUUID();
    const univerFileName = `${uuid}.univer`;
    const univerPath = path.join(UNIVER_TEMP_DIR, univerFileName);
    const univerFileUrl = toFileUrl(univerPath);
    const outputPath = path.join(UNIVER_TEMP_DIR, `${uuid}.xlsx`);
    const scriptPath = path.join(UNIVER_TEMP_DIR, `${uuid}-inject.js`);

    await this.runCli(['new', univerFileUrl, '--json']);

    const worktreeId = await this.runWorktreeAdd(univerPath, 'export');

    try {
      const dummyUnitId = await this.runUnitAdd(univerFileUrl, worktreeId);

      const injectScript = `const fWorkbook = univerAPI.createWorkbook(${JSON.stringify(workbookData)}); return { id: fWorkbook.getId(), name: fWorkbook.getName() };`;
      await fs.writeFile(scriptPath, injectScript, 'utf-8');

      const injected = await this.runInjectWorkbook(univerFileUrl, worktreeId, dummyUnitId, scriptPath);

      await this.runExport(univerFileUrl, worktreeId, injected.unitId, outputPath);

      const buffer = await fs.readFile(outputPath);
      const baseName = injected.name || 'export';
      const fileName = baseName.toLowerCase().endsWith('.xlsx') ? baseName : `${baseName}.xlsx`;
      return { buffer, fileName };
    } finally {
      await this.runWorktreeDiscard(univerFileUrl, worktreeId);
      await fs.rm(scriptPath, { force: true });
      // TODO: 프로토타입 범위 - univerPath/outputPath 임시 파일은 정리하지 않음
    }
  }

  private async runCli(args: string[], cwd?: string): Promise<any> {
    try {
      const { command, prependArgs } = this.univerCommand;
      const { stdout } = await execFileAsync(command, [...prependArgs, ...args], {
        cwd,
        maxBuffer: 200 * 1024 * 1024,
      });
      return JSON.parse(stdout);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        throw new InternalServerErrorException('Univer CLI가 설치되어 있지 않습니다.');
      }
      const stdout = err.stdout as string | undefined;
      if (stdout) {
        try {
          return JSON.parse(stdout);
        } catch {
          // fall through to generic error below
        }
      }
      throw new InternalServerErrorException(`Univer CLI 실행 실패: ${err.message}`);
    }
  }

  private async runImport(sourcePath: string, univerPath: string, originalName: string): Promise<string> {
    const args = ['import', '--file', sourcePath, toFileUrl(univerPath), '--name', originalName, '--json'];

    let lastError: string | undefined;
    for (let attempt = 1; attempt <= IMPORT_MAX_ATTEMPTS; attempt++) {
      const result = await this.runCli(args);
      if (result.success !== false && result.unitId) {
        return result.unitId;
      }
      lastError = result.error;
      this.logger.warn(`univer import 실패 (시도 ${attempt}/${IMPORT_MAX_ATTEMPTS}): ${lastError}`);
    }
    throw new InternalServerErrorException(`Univer 파일 변환에 실패했습니다: ${lastError}`);
  }

  private async runWorktreeAdd(univerPath: string, originalName: string): Promise<string> {
    const args = ['worktree', 'add', toFileUrl(univerPath), '--name', originalName, '--json'];
    const result = await this.runCli(args);
    if (result.success === false || !result.worktreeId) {
      throw new InternalServerErrorException(`Univer worktree 생성에 실패했습니다: ${result.error ?? '알 수 없는 오류'}`);
    }
    return result.worktreeId;
  }

  private async runExtractSnapshot(univerFileUrl: string, worktreeId: string, unitId: string): Promise<unknown> {
    const args = [
      'execute',
      univerFileUrl,
      '--worktree',
      worktreeId,
      '--unit',
      unitId,
      '-e',
      'return workbook.save();',
      '--json',
    ];
    const result = await this.runCli(args);
    if (result.success === false || result.error) {
      throw new InternalServerErrorException(`워크북 스냅샷 추출에 실패했습니다: ${result.error ?? '알 수 없는 오류'}`);
    }
    return result.value;
  }

  private async runUnitAdd(univerFileUrl: string, worktreeId: string): Promise<string> {
    const args = ['unit', 'add', univerFileUrl, '--worktree', worktreeId, '--type', 'sheet', '--name', 'dummy', '--json'];
    const result = await this.runCli(args);
    if (result.success === false || !result.unitId) {
      throw new InternalServerErrorException(`임시 unit 생성에 실패했습니다: ${result.error ?? '알 수 없는 오류'}`);
    }
    return result.unitId;
  }

  private async runInjectWorkbook(
    univerFileUrl: string,
    worktreeId: string,
    dummyUnitId: string,
    scriptPath: string,
  ): Promise<{ unitId: string; name: string }> {
    const args = ['execute', univerFileUrl, '--worktree', worktreeId, '--unit', dummyUnitId, '--script', scriptPath, '--json'];

    let lastError: string | undefined;
    for (let attempt = 1; attempt <= IMPORT_MAX_ATTEMPTS; attempt++) {
      const result = await this.runCli(args);
      if (result.success !== false && result.value?.id) {
        return { unitId: result.value.id, name: result.value.name };
      }
      lastError = result.error;
      this.logger.warn(`워크북 주입 실패 (시도 ${attempt}/${IMPORT_MAX_ATTEMPTS}): ${lastError}`);
    }
    throw new InternalServerErrorException(`워크북 데이터 주입에 실패했습니다: ${lastError}`);
  }

  private async runExport(univerFileUrl: string, worktreeId: string, unitId: string, outputPath: string): Promise<void> {
    const args = ['export', univerFileUrl, outputPath, '--worktree', worktreeId, '--unit', unitId, '--json'];
    const result = await this.runCli(args);
    if (result.success === false) {
      throw new InternalServerErrorException(`xlsx 내보내기에 실패했습니다: ${result.error ?? '알 수 없는 오류'}`);
    }
  }

  private async runWorktreeDiscard(univerFileUrl: string, worktreeId: string): Promise<void> {
    try {
      await this.runCli(['worktree', 'discard', univerFileUrl, '--worktree', worktreeId, '--json']);
    } catch (err: any) {
      this.logger.warn(`worktree discard 실패 (무시): ${err.message}`);
    }
  }
}
