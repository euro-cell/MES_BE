import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
import * as JSZip from 'jszip';

// Worklog Entities
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';
import { WorklogCoating } from 'src/common/entities/worklogs/worklog-03-coating.entity';
import { WorklogPress } from 'src/common/entities/worklogs/worklog-04-press.entity';
import { WorklogNotching } from 'src/common/entities/worklogs/worklog-06-notching.entity';
import { WorklogVd } from 'src/common/entities/worklogs/worklog-07-vd.entity';
import { WorklogForming } from 'src/common/entities/worklogs/worklog-08-forming.entity';
import { WorklogStacking } from 'src/common/entities/worklogs/worklog-09-stacking.entity';
import { WorklogWelding } from 'src/common/entities/worklogs/worklog-10-welding.entity';
import { WorklogSealing } from 'src/common/entities/worklogs/worklog-11-sealing.entity';
import { WorklogFilling } from 'src/common/entities/worklogs/worklog-12-filling.entity';
import { WorklogFormation } from 'src/common/entities/worklogs/worklog-13-formation.entity';
import { WorklogGrading } from 'src/common/entities/worklogs/worklog-14-grading.entity';
import { WorklogVisualInspection } from 'src/common/entities/worklogs/worklog-15-visual-inspection.entity';

import { ExportWorklogRequestDto } from 'src/common/dtos/worklog/export-worklog.dto';

export enum ProcessTemplateFile {
  binder = '01.Binder.xlsx',
  slurry = '02.Slurry.xlsx',
  coating = '03.Coating.xlsx',
  press = '04.Press.xlsx',
  notching = '06.Notching.xlsx',
  vd = '07.VD.xlsx',
  forming = '08.Forming.xlsx',
  stacking = '09.Stacking.xlsx',
  welding = '10.Welding.xlsx',
  sealing = '11.Sealing.xlsx',
  filling = '12.Filling.xlsx',
  formation = '13.Formation.xlsx',
  grading = '14.Grading.xlsx',
  inspection = '15.VisualInspection.xlsx',
}

type WorklogEntity =
  | WorklogBinder
  | WorklogSlurry
  | WorklogCoating
  | WorklogPress
  | WorklogNotching
  | WorklogVd
  | WorklogForming
  | WorklogStacking
  | WorklogWelding
  | WorklogSealing
  | WorklogFilling
  | WorklogFormation
  | WorklogGrading
  | WorklogVisualInspection;

@Injectable()
export class WorklogService {
  private readonly templatePath = join(process.cwd(), 'data', 'templates');

  constructor(
    @InjectRepository(WorklogBinder)
    private readonly binderRepository: Repository<WorklogBinder>,
    @InjectRepository(WorklogSlurry)
    private readonly slurryRepository: Repository<WorklogSlurry>,
    @InjectRepository(WorklogCoating)
    private readonly coatingRepository: Repository<WorklogCoating>,
    @InjectRepository(WorklogPress)
    private readonly pressRepository: Repository<WorklogPress>,
    @InjectRepository(WorklogNotching)
    private readonly notchingRepository: Repository<WorklogNotching>,
    @InjectRepository(WorklogVd)
    private readonly vdRepository: Repository<WorklogVd>,
    @InjectRepository(WorklogForming)
    private readonly formingRepository: Repository<WorklogForming>,
    @InjectRepository(WorklogStacking)
    private readonly stackingRepository: Repository<WorklogStacking>,
    @InjectRepository(WorklogWelding)
    private readonly weldingRepository: Repository<WorklogWelding>,
    @InjectRepository(WorklogSealing)
    private readonly sealingRepository: Repository<WorklogSealing>,
    @InjectRepository(WorklogFilling)
    private readonly fillingRepository: Repository<WorklogFilling>,
    @InjectRepository(WorklogFormation)
    private readonly formationRepository: Repository<WorklogFormation>,
    @InjectRepository(WorklogGrading)
    private readonly gradingRepository: Repository<WorklogGrading>,
    @InjectRepository(WorklogVisualInspection)
    private readonly visualInspectionRepository: Repository<WorklogVisualInspection>,
  ) {}

  async getTemplateFilePath(processName: string): Promise<string> {
    try {
      const fileName = ProcessTemplateFile[processName.toLowerCase()];
      const filePath = join(this.templatePath, fileName);
      return filePath;
    } catch (error) {
      throw new NotFoundException('템플릿 파일을 찾을 수 없습니다.');
    }
  }

  /**
   * 다중 작업일지 Excel 내보내기
   * @returns { file: StreamableFile, productionName: string }
   */
  async exportWorklogs(
    processType: string,
    dto: ExportWorklogRequestDto,
  ): Promise<{ file: StreamableFile; productionName: string }> {
    const { projectId, worklogIds } = dto;

    // 1. 공정별 repository 및 템플릿 파일 가져오기
    const repository = this.getRepositoryByProcessType(processType);
    const templateFileName = ProcessTemplateFile[processType.toLowerCase()];

    if (!templateFileName) {
      throw new NotFoundException(`템플릿 파일을 찾을 수 없습니다: ${processType}`);
    }

    // 2. 작업일지 데이터 조회 (프로젝트 ID로 필터링)
    const worklogs = await repository.find({
      where: { id: In(worklogIds), production: { id: projectId } },
      relations: ['production'],
      order: { manufactureDate: 'ASC', id: 'ASC' },
    });

    if (worklogs.length === 0) {
      throw new NotFoundException('작업일지를 찾을 수 없습니다.');
    }

    // 프로젝트명 추출 (첫 번째 작업일지의 production에서)
    const productionName = worklogs[0]?.['production']?.name || '';

    // 3. 시트명 중복 처리를 위한 Map (YYMMDD -> count)
    const sheetNameCountMap = new Map<string, number>();

    // 4. 원본 템플릿을 첫 번째 시트로 유지하기 위해 먼저 로드
    const baseWorkbook = new ExcelJS.Workbook();
    await baseWorkbook.xlsx.readFile(join(this.templatePath, templateFileName));
    const originalSheetName = baseWorkbook.worksheets[0]?.name || '원본';

    // 원본 템플릿 버퍼 저장 (첫 번째 시트로 사용)
    const baseBuffer = await baseWorkbook.xlsx.writeBuffer();

    // 5. 각 작업일지별로 처리하여 버퍼 배열 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workbookBuffers: any[] = [];
    const sheetNames: string[] = [originalSheetName]; // 첫 번째는 원본 시트명

    for (const worklog of worklogs) {
      // 템플릿 로드
      const templateWorkbook = new ExcelJS.Workbook();
      await templateWorkbook.xlsx.readFile(join(this.templatePath, templateFileName));

      const templateSheet = templateWorkbook.worksheets[0];
      if (!templateSheet) continue;

      // Named Range로 데이터 바인딩
      this.bindDataToNamedRanges(templateWorkbook, templateSheet, worklog);

      // 시트명 생성 (YYMMDD 형식)
      const sheetName = this.generateSheetName(worklog.manufactureDate, sheetNameCountMap);

      // 시트명 변경
      templateSheet.name = sheetName;
      sheetNames.push(sheetName);

      // 버퍼로 저장
      const wbBuffer = await templateWorkbook.xlsx.writeBuffer();
      workbookBuffers.push(wbBuffer);
    }

    if (workbookBuffers.length === 0) {
      throw new NotFoundException('작업일지를 처리할 수 없습니다.');
    }

    // 6. 원본 시트 + 데이터 시트들을 병합
    const mergedBuffer = await this.mergeXlsxBuffersWithOriginal(baseBuffer, workbookBuffers, sheetNames);

    return {
      file: new StreamableFile(Buffer.from(mergedBuffer)),
      productionName,
    };
  }

  /**
   * 원본 시트를 유지하면서 여러 xlsx 버퍼를 하나로 병합
   * @param baseBuffer 원본 템플릿 버퍼 (첫 번째 시트로 유지)
   * @param dataBuffers 데이터가 채워진 워크북 버퍼들
   * @param sheetNames 시트명 배열 (첫 번째는 원본 시트명)
   */
  private async mergeXlsxBuffersWithOriginal(
    baseBuffer: ExcelJS.Buffer,
    dataBuffers: Buffer[],
    sheetNames: string[],
  ): Promise<Buffer> {
    // 원본 템플릿을 기준으로 시작
    const baseZip = await JSZip.loadAsync(baseBuffer);

    // 기존 시트 정보 파악
    let workbookXml = await baseZip.file('xl/workbook.xml')?.async('string');
    let relsXml = await baseZip.file('xl/_rels/workbook.xml.rels')?.async('string');
    let contentTypes = await baseZip.file('[Content_Types].xml')?.async('string');

    // 기준 sharedStrings 파싱
    const baseSharedStringsXml = await baseZip.file('xl/sharedStrings.xml')?.async('string');
    const baseSharedStrings = this.parseSharedStrings(baseSharedStringsXml || '');

    if (!workbookXml || !relsXml || !contentTypes) {
      throw new Error('Invalid xlsx structure');
    }

    // 현재 가장 큰 rId 찾기
    const rIdMatches = relsXml.match(/rId(\d+)/g) || [];
    let maxRId = Math.max(...rIdMatches.map((r: string) => parseInt(r.replace('rId', ''), 10)), 0);

    // 현재 가장 큰 sheetId 찾기
    const sheetIdMatches = workbookXml.match(/sheetId="(\d+)"/g) || [];
    let maxSheetId = Math.max(...sheetIdMatches.map((s: string) => parseInt(s.replace(/sheetId="|"/g, ''), 10)), 0);

    // 데이터 버퍼들의 시트를 추가 (원본 다음부터)
    for (let i = 0; i < dataBuffers.length; i++) {
      const additionalZip = await JSZip.loadAsync(dataBuffers[i]);

      // 추가 워크북의 sharedStrings 파싱
      const additionalSharedStringsXml = await additionalZip.file('xl/sharedStrings.xml')?.async('string');
      const additionalSharedStrings = this.parseSharedStrings(additionalSharedStringsXml || '');

      // 시트 XML 읽기
      let sheetXml = await additionalZip.file('xl/worksheets/sheet1.xml')?.async('string');
      if (!sheetXml) continue;

      // sharedStrings 인덱스를 기준 워크북의 인덱스로 재매핑
      sheetXml = this.remapSharedStringReferences(sheetXml, additionalSharedStrings, baseSharedStrings);

      const newSheetIndex = i + 2; // 원본이 1이므로 2부터 시작
      const newSheetPath = `xl/worksheets/sheet${newSheetIndex}.xml`;
      baseZip.file(newSheetPath, sheetXml);

      // rId와 sheetId 증가
      maxRId++;
      maxSheetId++;
      const newRId = `rId${maxRId}`;

      // [Content_Types].xml 업데이트
      const newOverride = `<Override PartName="/xl/worksheets/sheet${newSheetIndex}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
      contentTypes = contentTypes.replace('</Types>', `${newOverride}\n</Types>`);

      // xl/workbook.xml 업데이트 - 시트 추가 (sheetNames[i+1]은 데이터 시트명)
      const escapedSheetName = this.escapeXml(sheetNames[i + 1]);
      const newSheet = `<sheet name="${escapedSheetName}" sheetId="${maxSheetId}" r:id="${newRId}"/>`;
      workbookXml = workbookXml.replace('</sheets>', `${newSheet}\n</sheets>`);

      // xl/_rels/workbook.xml.rels 업데이트
      const newRel = `<Relationship Id="${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${newSheetIndex}.xml"/>`;
      relsXml = relsXml.replace('</Relationships>', `${newRel}\n</Relationships>`);
    }

    // 수정된 XML 파일들 저장
    baseZip.file('xl/workbook.xml', workbookXml);
    baseZip.file('xl/_rels/workbook.xml.rels', relsXml);
    baseZip.file('[Content_Types].xml', contentTypes);

    // 최종 버퍼 생성
    return baseZip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
  }

  /**
   * JSZip을 사용하여 여러 xlsx 버퍼를 하나로 병합 (사용하지 않음 - 참고용)
   * XML 레벨에서 병합하여 서식을 완전히 보존
   */
  private async mergeXlsxBuffers(buffers: Buffer[], sheetNames: string[]): Promise<Buffer> {
    // 첫 번째 xlsx를 기준으로 시작
    const baseZip = await JSZip.loadAsync(buffers[0]);

    // 기존 시트 정보 파악
    let workbookXml = await baseZip.file('xl/workbook.xml')?.async('string');
    let relsXml = await baseZip.file('xl/_rels/workbook.xml.rels')?.async('string');
    let contentTypes = await baseZip.file('[Content_Types].xml')?.async('string');

    // 기준 sharedStrings 파싱
    const baseSharedStringsXml = await baseZip.file('xl/sharedStrings.xml')?.async('string');
    const baseSharedStrings = this.parseSharedStrings(baseSharedStringsXml || '');

    if (!workbookXml || !relsXml || !contentTypes) {
      throw new Error('Invalid xlsx structure');
    }

    // 현재 가장 큰 rId 찾기
    const rIdMatches = relsXml.match(/rId(\d+)/g) || [];
    let maxRId = Math.max(...rIdMatches.map((r: string) => parseInt(r.replace('rId', ''), 10)), 0);

    // 현재 가장 큰 sheetId 찾기
    const sheetIdMatches = workbookXml.match(/sheetId="(\d+)"/g) || [];
    let maxSheetId = Math.max(...sheetIdMatches.map((s: string) => parseInt(s.replace(/sheetId="|"/g, ''), 10)), 0);

    // 나머지 버퍼들의 시트를 추가
    for (let i = 1; i < buffers.length; i++) {
      const additionalZip = await JSZip.loadAsync(buffers[i]);

      // 추가 워크북의 sharedStrings 파싱
      const additionalSharedStringsXml = await additionalZip.file('xl/sharedStrings.xml')?.async('string');
      const additionalSharedStrings = this.parseSharedStrings(additionalSharedStringsXml || '');

      // 시트 XML 읽기
      let sheetXml = await additionalZip.file('xl/worksheets/sheet1.xml')?.async('string');
      if (!sheetXml) continue;

      // sharedStrings 인덱스를 기준 워크북의 인덱스로 재매핑
      sheetXml = this.remapSharedStringReferences(sheetXml, additionalSharedStrings, baseSharedStrings);

      const newSheetIndex = i + 1;
      const newSheetPath = `xl/worksheets/sheet${newSheetIndex}.xml`;
      baseZip.file(newSheetPath, sheetXml);

      // rId와 sheetId 증가
      maxRId++;
      maxSheetId++;
      const newRId = `rId${maxRId}`;

      // [Content_Types].xml 업데이트
      const newOverride = `<Override PartName="/xl/worksheets/sheet${newSheetIndex}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
      contentTypes = contentTypes.replace('</Types>', `${newOverride}\n</Types>`);

      // xl/workbook.xml 업데이트 - 시트 추가
      const escapedSheetName = this.escapeXml(sheetNames[i]);
      const newSheet = `<sheet name="${escapedSheetName}" sheetId="${maxSheetId}" r:id="${newRId}"/>`;
      workbookXml = workbookXml.replace('</sheets>', `${newSheet}\n</sheets>`);

      // xl/_rels/workbook.xml.rels 업데이트
      const newRel = `<Relationship Id="${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${newSheetIndex}.xml"/>`;
      relsXml = relsXml.replace('</Relationships>', `${newRel}\n</Relationships>`);
    }

    // 수정된 XML 파일들 저장
    baseZip.file('xl/workbook.xml', workbookXml);
    baseZip.file('xl/_rels/workbook.xml.rels', relsXml);
    baseZip.file('[Content_Types].xml', contentTypes);

    // 최종 버퍼 생성
    return baseZip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
  }

  /**
   * sharedStrings.xml에서 문자열 배열 파싱
   */
  private parseSharedStrings(xml: string): string[] {
    const strings: string[] = [];
    if (!xml) return strings;

    // <si> 태그 내의 텍스트 추출
    const siMatches = xml.match(/<si>[\s\S]*?<\/si>/g) || [];
    for (const si of siMatches) {
      // <t> 태그 내용 추출 (여러 <t> 태그가 있을 수 있음 - rich text)
      const tMatches = si.match(/<t[^>]*>([^<]*)<\/t>/g) || [];
      let text = '';
      for (const t of tMatches) {
        const match = t.match(/<t[^>]*>([^<]*)<\/t>/);
        if (match) {
          text += match[1];
        }
      }
      strings.push(text);
    }

    return strings;
  }

  /**
   * 시트 XML의 sharedString 참조를 재매핑
   * 소스 워크북의 인덱스를 타겟 워크북의 인덱스로 변환
   */
  private remapSharedStringReferences(
    sheetXml: string,
    sourceStrings: string[],
    targetStrings: string[],
  ): string {
    // 타겟 문자열의 인덱스 맵 생성
    const targetIndexMap = new Map<string, number>();
    targetStrings.forEach((str, idx) => {
      targetIndexMap.set(str, idx);
    });

    // t="s" 속성이 있는 셀의 값을 재매핑
    // <c r="A1" t="s"><v>0</v></c> 형식
    return sheetXml.replace(/<c([^>]*)\s+t="s"([^>]*)>[\s\S]*?<v>(\d+)<\/v>[\s\S]*?<\/c>/g, (match, before, after, indexStr) => {
      const sourceIndex = parseInt(indexStr, 10);
      const sourceString = sourceStrings[sourceIndex];

      if (sourceString === undefined) {
        return match; // 원본 유지
      }

      // 타겟에서 같은 문자열의 인덱스 찾기
      const targetIndex = targetIndexMap.get(sourceString);

      if (targetIndex !== undefined) {
        // 같은 문자열이 타겟에 있으면 인덱스 교체
        return match.replace(`<v>${indexStr}</v>`, `<v>${targetIndex}</v>`);
      } else {
        // 타겟에 없으면 인라인 문자열로 변환
        const escapedString = this.escapeXml(sourceString);
        return `<c${before}${after} t="inlineStr"><is><t>${escapedString}</t></is></c>`;
      }
    });
  }

  /**
   * XML 특수문자 이스케이프
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 공정 타입에 따른 repository 반환
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getRepositoryByProcessType(processType: string): Repository<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repositoryMap: Record<string, Repository<any>> = {
      binder: this.binderRepository,
      slurry: this.slurryRepository,
      coating: this.coatingRepository,
      press: this.pressRepository,
      notching: this.notchingRepository,
      vd: this.vdRepository,
      forming: this.formingRepository,
      stacking: this.stackingRepository,
      welding: this.weldingRepository,
      sealing: this.sealingRepository,
      filling: this.fillingRepository,
      formation: this.formationRepository,
      grading: this.gradingRepository,
      inspection: this.visualInspectionRepository,
    };

    const repository = repositoryMap[processType.toLowerCase()];
    if (!repository) {
      throw new NotFoundException(`지원하지 않는 공정 타입입니다: ${processType}`);
    }

    return repository;
  }

  /**
   * Named Range를 사용하여 데이터 바인딩
   */
  private bindDataToNamedRanges(workbook: ExcelJS.Workbook, worksheet: ExcelJS.Worksheet, data: WorklogEntity): void {
    // workbook.model에서 definedNames 가져오기
    const workbookModel = (workbook as any).model;
    const definedNames: Array<{ name: string; ranges: string[] }> = workbookModel?.definedNames || [];

    for (const def of definedNames) {
      const rangeName = def.name;
      if (!rangeName) continue;

      // 필드 값 가져오기
      const fieldValue = this.getFieldValue(data, rangeName);
      if (fieldValue === undefined) continue;

      // Named Range의 셀 주소 파싱
      const rangeStr = def.ranges?.[0];
      const cellAddress = this.parseNamedRangeAddress(rangeStr, worksheet.name);
      if (!cellAddress) continue;

      // 셀에 값 설정
      const cell = worksheet.getCell(cellAddress);
      cell.value = this.formatCellValue(fieldValue);
    }
  }

  /**
   * Named Range 주소 파싱 (예: 'Sheet1'!$B$3 -> B3)
   * 템플릿에 시트가 하나뿐이므로 시트명 비교 생략
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private parseNamedRangeAddress(rangeStr: string, targetSheetName: string): string | null {
    if (!rangeStr) return null;

    // 시트명!셀주소 형식 파싱 (시트명 없는 경우도 처리)
    const match = rangeStr.match(/(?:'?[^'!]+'?!)?(\$?[A-Z]+\$?\d+)/i);
    if (!match) return null;

    const cellRef = match[1];

    // $ 기호 제거하여 순수 셀 주소 반환
    return cellRef.replace(/\$/g, '');
  }

  /**
   * 데이터 객체에서 필드 값 가져오기
   */
  private getFieldValue(data: WorklogEntity, fieldName: string): any {
    // production 관계에서 값 가져오기
    if ((fieldName === 'productionName' || fieldName === 'productionId') && data['production']) {
      return data['production'].name;
    }

    // 직접 필드 접근
    if (fieldName in data) {
      return data[fieldName];
    }

    return undefined;
  }

  /**
   * 셀 값 포맷팅
   * DB의 decimal 타입이 문자열로 올 수 있으므로 숫자 변환 시도
   */
  private formatCellValue(value: any): string | number | Date {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      return value;
    }

    // 문자열이 숫자로 변환 가능한지 확인 (DB decimal 타입 처리)
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // 빈 문자열이 아니고, 숫자 형식인 경우
      if (trimmed !== '' && !isNaN(Number(trimmed)) && trimmed !== '') {
        const num = Number(trimmed);
        // 유효한 숫자인 경우 숫자로 반환
        if (isFinite(num)) {
          return num;
        }
      }
    }

    return String(value);
  }

  /**
   * 시트명 생성 (YYMMDD 형식, 중복 시 _2, _3 등 추가)
   */
  private generateSheetName(date: Date, countMap: Map<string, number>): string {
    const d = new Date(date);
    const year = String(d.getFullYear()).slice(-2);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const baseName = `${year}${month}${day}`;

    const currentCount = countMap.get(baseName) || 0;
    const newCount = currentCount + 1;
    countMap.set(baseName, newCount);

    if (newCount === 1) {
      return baseName;
    } else {
      return `${baseName}_${newCount}`;
    }
  }

  /**
   * 내보내기 파일명 생성
   * 형식: {공정명}_작업일지_{프로젝트명}_{YYYYMMDD}.xlsx
   */
  getExportFilename(processType: string, productionName?: string): string {
    const processNames: Record<string, string> = {
      binder: '바인더 믹싱',
      slurry: '슬러리 믹싱',
      coating: '코팅',
      press: '프레스',
      notching: '노칭',
      vd: '진공 건조',
      forming: '포밍',
      stacking: '스택',
      welding: '웰딩',
      sealing: '실링',
      filling: '전해액 주액',
      formation: '화성(Formation)',
      grading: '화성(Grading)',
      inspection: '외관검사',
    };

    const processName = processNames[processType.toLowerCase()] || processType;
    const now = new Date();
    const dateStr = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    if (productionName) {
      return `${processName}_작업일지_${productionName}_${dateStr}.xlsx`;
    }
    return `${processName}_작업일지_${dateStr}.xlsx`;
  }
}
