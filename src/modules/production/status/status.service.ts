import { ConflictException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductionPlan } from 'src/common/entities/production-plan.entity';
import { Repository } from 'typeorm';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
import * as JSZip from 'jszip';
import {
  MixingProcessService,
  CoatingProcessService,
  PressProcessService,
  SlittingProcessService,
  NotchingProcessService,
  VdProcessService,
  FormingProcessService,
  StackingProcessService,
  WeldingProcessService,
  SealingProcessService,
  FillingProcessService,
  FormationProcessService,
  GradingProcessService,
  VisualInspectionProcessService,
} from './processes';
import { UpdateTargetByKeyDto } from 'src/common/dtos/production-target.dto';
import { ProductionTarget } from 'src/common/entities/production-target.entity';
import { ProductionProgressDto } from 'src/common/dtos/production-progress.dto';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductionTarget)
    private readonly productionTargetRepository: Repository<ProductionTarget>,
    private readonly mixingProcessService: MixingProcessService,
    private readonly coatingProcessService: CoatingProcessService,
    private readonly pressProcessService: PressProcessService,
    private readonly slittingProcessService: SlittingProcessService,
    private readonly notchingProcessService: NotchingProcessService,
    private readonly vdProcessService: VdProcessService,
    private readonly formingProcessService: FormingProcessService,
    private readonly stackingProcessService: StackingProcessService,
    private readonly weldingProcessService: WeldingProcessService,
    private readonly sealingProcessService: SealingProcessService,
    private readonly fillingProcessService: FillingProcessService,
    private readonly formationProcessService: FormationProcessService,
    private readonly gradingProcessService: GradingProcessService,
    private readonly visualInspectionProcessService: VisualInspectionProcessService,
  ) {}

  async getStatusData(productionId: number) {
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { production: { id: productionId } },
      relations: ['production'],
    });

    if (!productionPlan) {
      return { name: null, startDate: null, endDate: null };
    }

    return {
      name: productionPlan.production.name,
      startDate: productionPlan.startDate,
      endDate: productionPlan.endDate,
    };
  }

  async getElectrodeStatus(productionId: number, month: string, type: 'cathode' | 'anode') {
    const [mixing, coating, press, slitting, notching] = await Promise.all([
      this.mixingProcessService.getMonthlyData(productionId, month, type),
      this.coatingProcessService.getMonthlyData(productionId, month, type),
      this.pressProcessService.getMonthlyData(productionId, month, type),
      this.slittingProcessService.getMonthlyData(productionId, month, type),
      this.notchingProcessService.getMonthlyData(productionId, month, type),
    ]);

    return {
      category: 'electrode',
      type,
      month,
      processes: {
        mixing,
        coatingSingle: coating.single,
        coatingDouble: coating.double,
        press,
        slitting,
        notching,
      },
    };
  }

  async getAssemblyStatus(productionId: number, month: string) {
    const [vd, forming, stacking, welding, sealing, filling] = await Promise.all([
      this.vdProcessService.getMonthlyData(productionId, month),
      this.formingProcessService.getMonthlyData(productionId, month),
      this.stackingProcessService.getMonthlyData(productionId, month),
      this.weldingProcessService.getMonthlyData(productionId, month),
      this.sealingProcessService.getMonthlyData(productionId, month),
      this.fillingProcessService.getMonthlyData(productionId, month),
    ]);

    return {
      category: 'assembly',
      month,
      processes: {
        vd,
        forming,
        stacking,
        preWelding: welding.preWelding,
        mainWelding: welding.mainWelding,
        sealing,
        filling,
      },
    };
  }

  async getFormationStatus(productionId: number, month: string) {
    const [formation, grading, visualInspection] = await Promise.all([
      this.formationProcessService.getMonthlyData(productionId, month),
      this.gradingProcessService.getMonthlyData(productionId, month),
      this.visualInspectionProcessService.getMonthlyData(productionId, month),
    ]);

    return {
      category: 'formation',
      month,
      processes: {
        preFormation: formation.preFormation,
        degas: formation.degas,
        mainFormation: formation.mainFormation,
        aging: grading.aging,
        grading: grading.grading,
        visualInspection,
      },
    };
  }

  async updateTargetStatus(productionId: number, dto: UpdateTargetByKeyDto) {
    const { processKey, targetQuantity } = dto;

    let target = await this.productionTargetRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (!target) {
      target = this.productionTargetRepository.create({ production: { id: productionId } });
    }

    if (!(processKey in target)) {
      throw new ConflictException(`유효하지 않은 공정 키입니다: ${processKey}`);
    }

    target[processKey] = targetQuantity;
    return await this.productionTargetRepository.save(target);
  }

  async getProgress(productionId: number): Promise<ProductionProgressDto> {
    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const [electrodeData, assemblyData, formationData] = await Promise.all([
      this.calculateElectrodeProgress(productionId, month),
      this.calculateAssemblyProgress(productionId, month),
      this.calculateFormationProgress(productionId, month),
    ]);

    const overall = Math.round(((electrodeData + assemblyData + formationData) / 3) * 100) / 100;

    return { electrode: electrodeData, assembly: assemblyData, formation: formationData, overall };
  }

  private async calculateElectrodeProgress(productionId: number, month: string): Promise<number> {
    try {
      const [cathodeData, anodeData] = await Promise.all([
        this.getElectrodeStatus(productionId, month, 'cathode'),
        this.getElectrodeStatus(productionId, month, 'anode'),
      ]);

      const progressValues: number[] = [];

      // Cathode 공정별 진행률 수집
      if (cathodeData.processes.mixing?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.mixing.total.progress);
      }
      if (cathodeData.processes.coatingSingle?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.coatingSingle.total.progress);
      }
      if (cathodeData.processes.coatingDouble?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.coatingDouble.total.progress);
      }
      if (cathodeData.processes.press?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.press.total.progress);
      }
      if (cathodeData.processes.slitting?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.slitting.total.progress);
      }
      if (cathodeData.processes.notching?.total?.progress !== null) {
        progressValues.push(cathodeData.processes.notching.total.progress);
      }

      // Anode 공정별 진행률 수집
      if (anodeData.processes.mixing?.total?.progress !== null) {
        progressValues.push(anodeData.processes.mixing.total.progress);
      }
      if (anodeData.processes.coatingSingle?.total?.progress !== null) {
        progressValues.push(anodeData.processes.coatingSingle.total.progress);
      }
      if (anodeData.processes.coatingDouble?.total?.progress !== null) {
        progressValues.push(anodeData.processes.coatingDouble.total.progress);
      }
      if (anodeData.processes.press?.total?.progress !== null) {
        progressValues.push(anodeData.processes.press.total.progress);
      }
      if (anodeData.processes.slitting?.total?.progress !== null) {
        progressValues.push(anodeData.processes.slitting.total.progress);
      }
      if (anodeData.processes.notching?.total?.progress !== null) {
        progressValues.push(anodeData.processes.notching.total.progress);
      }

      // 평균 진행률 계산
      if (progressValues.length === 0) return 0;
      const average = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      return 0;
    }
  }

  private async calculateAssemblyProgress(productionId: number, month: string): Promise<number> {
    try {
      const assemblyData = await this.getAssemblyStatus(productionId, month);
      const progressValues: number[] = [];

      // VD - cathode와 anode 진행률
      if (assemblyData.processes.vd?.total?.cathode?.progress !== null) {
        progressValues.push(assemblyData.processes.vd.total.cathode.progress);
      }
      if (assemblyData.processes.vd?.total?.anode?.progress !== null) {
        progressValues.push(assemblyData.processes.vd.total.anode.progress);
      }

      // Forming - 루트 레벨의 progress
      if (assemblyData.processes.forming?.progress !== null) {
        progressValues.push(assemblyData.processes.forming.progress);
      }

      // Stacking
      if (assemblyData.processes.stacking?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.stacking.total.progress);
      }

      // Welding - preWelding과 mainWelding
      if (assemblyData.processes.preWelding?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.preWelding.total.progress);
      }
      if (assemblyData.processes.mainWelding?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.mainWelding.total.progress);
      }

      // Sealing
      if (assemblyData.processes.sealing?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.sealing.total.progress);
      }

      // Filling
      if (assemblyData.processes.filling?.total?.progress !== null) {
        progressValues.push(assemblyData.processes.filling.total.progress);
      }

      if (progressValues.length === 0) return 0;
      const average = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      return 0;
    }
  }

  private async calculateFormationProgress(productionId: number, month: string): Promise<number> {
    try {
      const formationData = await this.getFormationStatus(productionId, month);
      const progressValues: number[] = [];

      // Formation - preFormation, degas, mainFormation
      if (formationData.processes.preFormation?.total?.progress !== null) {
        progressValues.push(formationData.processes.preFormation.total.progress);
      }
      if (formationData.processes.degas?.total?.progress !== null) {
        progressValues.push(formationData.processes.degas.total.progress);
      }
      if (formationData.processes.mainFormation?.total?.progress !== null) {
        progressValues.push(formationData.processes.mainFormation.total.progress);
      }

      // Grading - aging과 grading
      if (formationData.processes.aging?.total?.progress !== null) {
        progressValues.push(formationData.processes.aging.total.progress);
      }
      if (formationData.processes.grading?.total?.progress !== null) {
        progressValues.push(formationData.processes.grading.total.progress);
      }

      // Visual Inspection
      if (formationData.processes.visualInspection?.total?.progress !== null) {
        progressValues.push(formationData.processes.visualInspection.total.progress);
      }

      if (progressValues.length === 0) return 0;
      const average = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
      return Math.round(average * 100) / 100;
    } catch (error) {
      return 0;
    }
  }

  private readonly templatePath = join(process.cwd(), 'data', 'templates', 'status');

  async exportElectrodeStatus(productionId: number): Promise<{ file: StreamableFile; productionName: string }> {
    // 1. 프로젝트 정보 조회
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { production: { id: productionId } },
      relations: ['production'],
    });

    if (!productionPlan) {
      throw new NotFoundException('생산 계획이 존재하지 않습니다.');
    }

    const productionName = productionPlan.production.name;
    const startDate = new Date(productionPlan.startDate);
    const endDate = new Date(productionPlan.endDate);

    // 2. 기간 내 월 목록 계산
    const months = this.getMonthsBetween(startDate, endDate);

    if (months.length === 0) {
      throw new NotFoundException('생산 기간이 유효하지 않습니다.');
    }

    // 3. 템플릿 경로
    const templateFilePath = join(this.templatePath, 'electrode.xlsx');

    // 4. 각 월별 워크북 버퍼 생성 (작업일지 방식과 동일)
    const workbookBuffers: Buffer[] = [];
    const sheetNames: string[] = [];

    for (const month of months) {
      // 각 월마다 템플릿을 새로 로드
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templateFilePath);

      const sheet = workbook.worksheets[0];
      if (!sheet) continue;

      // 월별 데이터 조회
      const [cathodeData, anodeData] = await Promise.all([
        this.getElectrodeStatus(productionId, month, 'cathode'),
        this.getElectrodeStatus(productionId, month, 'anode'),
      ]);

      // ExcelJS로 데이터 입력
      this.fillElectrodeSheetWithExcelJS(sheet, { cathode: cathodeData, anode: anodeData });

      // 시트명 변경
      sheet.name = month; // 2025-01 형식
      sheetNames.push(month);

      // 버퍼로 저장
      const buffer = await workbook.xlsx.writeBuffer();
      workbookBuffers.push(Buffer.from(buffer));
    }

    if (workbookBuffers.length === 0) {
      throw new NotFoundException('생성할 시트가 없습니다.');
    }

    // 5. 단일 시트인 경우 바로 반환
    if (workbookBuffers.length === 1) {
      return {
        file: new StreamableFile(workbookBuffers[0]),
        productionName,
      };
    }

    // 6. 다중 시트: JSZip으로 병합 (작업일지 방식과 동일)
    const mergedBuffer = await this.mergeElectrodeBuffers(workbookBuffers, sheetNames);

    return {
      file: new StreamableFile(Buffer.from(mergedBuffer)),
      productionName,
    };
  }

  /**
   * ExcelJS를 사용하여 전극공정 시트에 데이터 입력
   * D열(1일) ~ AH열(31일): 일별 데이터
   * AJ열(36열): 전체합계 (cumulativeOutput)
   * AL열(38열): 목표수량 (targetQuantity)
   */
  private fillElectrodeSheetWithExcelJS(sheet: ExcelJS.Worksheet, monthData: { cathode: any; anode: any }): void {
    const { cathode, anode } = monthData;

    // 행 매핑 (1-indexed)
    // output: 생산량 행, ng: NG 행 (수율은 수식으로 자동계산)
    const rowMapping = {
      mixing: { cathode: { output: 2 }, anode: { output: 3 } },
      coatingSingle: { cathode: { output: 4 }, anode: { output: 5 } },
      coatingDouble: { cathode: { output: 6, ng: 7 }, anode: { output: 9, ng: 10 } },
      press: { cathode: { output: 12, ng: 13 }, anode: { output: 15, ng: 16 } },
      slitting: { cathode: { output: 18, ng: 19 }, anode: { output: 21, ng: 22 } },
      notching: { cathode: { output: 24, ng: 25 }, anode: { output: 27, ng: 28 } },
    };

    const CUMULATIVE_COL = 36; // AJ열
    const TARGET_COL = 38; // AL열

    for (const [processKey, rows] of Object.entries(rowMapping)) {
      const cathodeProcess = cathode.processes[processKey];
      const anodeProcess = anode.processes[processKey];

      // Cathode 데이터 입력
      if (cathodeProcess?.data) {
        for (const dayData of cathodeProcess.data) {
          const col = 3 + dayData.day; // D열 = 4열
          if (dayData.output > 0) {
            sheet.getCell(rows.cathode.output, col).value = dayData.output;
          }
          if ('ng' in rows.cathode && dayData.ng > 0) {
            sheet.getCell((rows.cathode as any).ng, col).value = dayData.ng;
          }
        }
        // 전체합계 (cumulativeOutput) - AJ열
        if (cathodeProcess.total?.cumulativeOutput > 0) {
          sheet.getCell(rows.cathode.output, CUMULATIVE_COL).value = cathodeProcess.total.cumulativeOutput;
        }
        // 목표수량 (targetQuantity) - AL열
        if (cathodeProcess.total?.targetQuantity > 0) {
          sheet.getCell(rows.cathode.output, TARGET_COL).value = cathodeProcess.total.targetQuantity;
        }
      }

      // Anode 데이터 입력
      if (anodeProcess?.data) {
        for (const dayData of anodeProcess.data) {
          const col = 3 + dayData.day;
          if (dayData.output > 0) {
            sheet.getCell(rows.anode.output, col).value = dayData.output;
          }
          if ('ng' in rows.anode && dayData.ng > 0) {
            sheet.getCell((rows.anode as any).ng, col).value = dayData.ng;
          }
        }
        // 전체합계 (cumulativeOutput) - AJ열
        if (anodeProcess.total?.cumulativeOutput > 0) {
          sheet.getCell(rows.anode.output, CUMULATIVE_COL).value = anodeProcess.total.cumulativeOutput;
        }
        // 목표수량 (targetQuantity) - AL열
        if (anodeProcess.total?.targetQuantity > 0) {
          sheet.getCell(rows.anode.output, TARGET_COL).value = anodeProcess.total.targetQuantity;
        }
      }
    }
  }

  private async mergeElectrodeBuffers(buffers: Buffer[], sheetNames: string[]): Promise<Buffer> {
    // 첫 번째 버퍼를 기준으로 시작
    const baseZip = await JSZip.loadAsync(buffers[0]);

    let workbookXml = await baseZip.file('xl/workbook.xml')?.async('string');
    let relsXml = await baseZip.file('xl/_rels/workbook.xml.rels')?.async('string');
    let contentTypes = await baseZip.file('[Content_Types].xml')?.async('string');
    const baseSharedStringsXml = await baseZip.file('xl/sharedStrings.xml')?.async('string');
    const baseSharedStrings = this.parseSharedStrings(baseSharedStringsXml || '');

    if (!workbookXml || !relsXml || !contentTypes) {
      throw new Error('Invalid xlsx structure');
    }

    // rId, sheetId 최대값 찾기
    const rIdMatches = relsXml.match(/rId(\d+)/g) || [];
    let maxRId = Math.max(...rIdMatches.map((r: string) => parseInt(r.replace('rId', ''), 10)), 0);

    const sheetIdMatches = workbookXml.match(/sheetId="(\d+)"/g) || [];
    let maxSheetId = Math.max(...sheetIdMatches.map((s: string) => parseInt(s.replace(/sheetId="|"/g, ''), 10)), 0);

    // 나머지 버퍼들의 시트 추가
    for (let i = 1; i < buffers.length; i++) {
      const additionalZip = await JSZip.loadAsync(buffers[i]);

      // sharedStrings 파싱 및 재매핑
      const additionalSharedStringsXml = await additionalZip.file('xl/sharedStrings.xml')?.async('string');
      const additionalSharedStrings = this.parseSharedStrings(additionalSharedStringsXml || '');

      let sheetXml = await additionalZip.file('xl/worksheets/sheet1.xml')?.async('string');
      if (!sheetXml) continue;

      // sharedStrings 인덱스 재매핑
      sheetXml = this.remapSharedStringReferences(sheetXml, additionalSharedStrings, baseSharedStrings);

      const newSheetIndex = i + 1;
      baseZip.file(`xl/worksheets/sheet${newSheetIndex}.xml`, sheetXml);

      maxRId++;
      maxSheetId++;
      const newRId = `rId${maxRId}`;

      // [Content_Types].xml 업데이트
      const newOverride = `<Override PartName="/xl/worksheets/sheet${newSheetIndex}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
      contentTypes = contentTypes.replace('</Types>', `${newOverride}\n</Types>`);

      // xl/workbook.xml 업데이트
      const escapedSheetName = this.escapeXml(sheetNames[i]);
      const newSheet = `<sheet name="${escapedSheetName}" sheetId="${maxSheetId}" r:id="${newRId}"/>`;
      workbookXml = workbookXml.replace('</sheets>', `${newSheet}\n</sheets>`);

      // xl/_rels/workbook.xml.rels 업데이트
      const newRel = `<Relationship Id="${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${newSheetIndex}.xml"/>`;
      relsXml = relsXml.replace('</Relationships>', `${newRel}\n</Relationships>`);
    }

    baseZip.file('xl/workbook.xml', workbookXml);
    baseZip.file('xl/_rels/workbook.xml.rels', relsXml);
    baseZip.file('[Content_Types].xml', contentTypes);

    return baseZip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
  }

  private remapSharedStringReferences(sheetXml: string, sourceStrings: string[], targetStrings: string[]): string {
    const targetIndexMap = new Map<string, number>();
    targetStrings.forEach((str, idx) => {
      targetIndexMap.set(str, idx);
    });

    return sheetXml.replace(/<c([^>]*)\s+t="s"([^>]*)>[\s\S]*?<v>(\d+)<\/v>[\s\S]*?<\/c>/g, (match, before, after, indexStr) => {
      const sourceIndex = parseInt(indexStr, 10);
      const sourceString = sourceStrings[sourceIndex];

      if (sourceString === undefined) {
        return match;
      }

      const targetIndex = targetIndexMap.get(sourceString);

      if (targetIndex !== undefined) {
        return match.replace(`<v>${indexStr}</v>`, `<v>${targetIndex}</v>`);
      } else {
        const escapedString = this.escapeXml(sourceString);
        return `<c${before}${after} t="inlineStr"><is><t>${escapedString}</t></is></c>`;
      }
    });
  }

  private getMonthsBetween(startDate: Date, endDate: Date): string[] {
    const months: string[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  private parseSharedStrings(xml: string): string[] {
    const strings: string[] = [];
    if (!xml) return strings;

    const siMatches = xml.match(/<si>[\s\S]*?<\/si>/g) || [];
    for (const si of siMatches) {
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

  private escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}
