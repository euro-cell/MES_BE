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
export class IqcProtoService {
  private readonly logger = new Logger(IqcProtoService.name);
  private readonly univerCommand = resolveUniverCommand();

  async convertToWorkbookData(file: Express.Multer.File): Promise<{ workbookData: unknown }> {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx') {
      throw new BadRequestException('xlsx 파일만 업로드할 수 있습니다.');
    }

    await fs.mkdir(UNIVER_TEMP_DIR, { recursive: true });

    const uuid = randomUUID();
    const sourcePath = path.join(UNIVER_TEMP_DIR, `${uuid}_${file.originalname}`);
    const univerFileName = `${uuid}.univer`;
    const univerPath = path.join(UNIVER_TEMP_DIR, univerFileName);
    const univerFileUrl = toFileUrl(univerPath);

    await fs.writeFile(sourcePath, file.buffer);

    const unitId = await this.runImport(sourcePath, univerPath, file.originalname);

    const worktreeId = await this.runWorktreeAdd(univerPath, file.originalname);

    try {
      const workbookData = await this.runExtractSnapshot(univerFileUrl, worktreeId, unitId);
      return { workbookData };
    } finally {
      await this.runWorktreeDiscard(univerFileUrl, worktreeId);
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

  private async runWorktreeDiscard(univerFileUrl: string, worktreeId: string): Promise<void> {
    try {
      await this.runCli(['worktree', 'discard', univerFileUrl, '--worktree', worktreeId, '--json']);
    } catch (err: any) {
      this.logger.warn(`worktree discard 실패 (무시): ${err.message}`);
    }
  }
}
