import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotFormation } from '../../../../common/entities/lots/lot-08-formation.entity';
import { LotSealing } from '../../../../common/entities/lots/lot-07-sealing.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogFormation } from '../../../../common/entities/worklogs/worklog-13-formation.entity';
import { WorklogGrading } from '../../../../common/entities/worklogs/worklog-14-grading.entity';
import { RegisterRawDataDto } from '../../../../common/dtos/lot/register-rawdata.dto';

@Injectable()
export class FormationLotService {
  constructor(
    @InjectRepository(LotFormation)
    private readonly lotFormationRepo: Repository<LotFormation>,
    @InjectRepository(LotSealing)
    private readonly lotSealingRepo: Repository<LotSealing>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogFormation)
    private readonly worklogFormationRepo: Repository<WorklogFormation>,
    @InjectRepository(WorklogGrading)
    private readonly worklogGradingRepo: Repository<WorklogGrading>,
  ) {}

  private generateFormationLot(date: Date | string, cellNumber: number): string {
    const factory = 'O';
    const line = '1';
    const dateObj = date instanceof Date ? date : new Date(date);
    const year = dateObj.getFullYear();
    const yearCode = String.fromCharCode('A'.charCodeAt(0) + (year - 2022));
    const month = dateObj.getMonth();
    const monthCode = String.fromCharCode('A'.charCodeAt(0) + month);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const cellNo = String(cellNumber).padStart(4, '0');
    return `${factory}${line}${yearCode}${monthCode}${day}${cellNo}`;
  }

  private parseCellNumberRange(range: string): number[] {
    if (!range) return [];

    const numbers: number[] = [];
    // 콤마로 구분된 각 부분을 처리
    const parts = range.split(',').map((part) => part.trim());

    for (const part of parts) {
      // 범위 형식 (1-5 또는 1~5)
      const rangeMatch = part.match(/^(\d+)\s*[-~]\s*(\d+)$/);
      if (rangeMatch) {
        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
        continue;
      }

      // 단일 숫자
      const singleMatch = part.match(/^(\d+)$/);
      if (singleMatch) {
        numbers.push(Number(singleMatch[1]));
      }
    }

    return numbers;
  }

  private extractCellNumberFromSealingLot(sealingLot: string): number {
    if (!sealingLot) return 0;
    const last4Digits = sealingLot.slice(-4);
    const cellNumber = Number(last4Digits);
    return isNaN(cellNumber) ? 0 : cellNumber;
  }

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const goodSealingLots = await this.lotSealingRepo.find({
      where: {
        production: { id: productionId },
        isDefectiveFromStacking: false,
        isDefectiveFromWelding: false,
        isDefectiveFromSealing: false,
      },
      order: { lot: 'ASC' },
    });

    const formationWorklogs = await this.worklogFormationRepo.find({
      where: { production: { id: productionId } },
      order: { manufactureDate: 'ASC' },
    });

    const gradingWorklogs = await this.worklogGradingRepo.find({
      where: { production: { id: productionId } },
      order: { manufactureDate: 'ASC' },
    });

    for (const sealingLot of goodSealingLots) {
      const existsFormation = await this.lotFormationRepo.findOne({
        where: {
          lotSealing: { id: sealingLot.id },
          production: { id: productionId },
        },
        relations: ['worklogFormation', 'worklogGrading'],
      });

      if (existsFormation) {
        await this.matchWorklogsToFormationLot(existsFormation, formationWorklogs, gradingWorklogs);
        continue;
      }

      const cellNumber = this.extractCellNumberFromSealingLot(sealingLot.lot);
      const processDate = sealingLot.fillingDate || sealingLot.processDate || new Date();
      const formationLotNumber = this.generateFormationLot(processDate, cellNumber);

      const lotFormation = this.lotFormationRepo.create({
        lot: formationLotNumber,
        production: { id: productionId },
        processDate: processDate,
        lotSealing: sealingLot,
      });

      await this.lotFormationRepo.save(lotFormation);
      await this.matchWorklogsToFormationLot(lotFormation, formationWorklogs, gradingWorklogs);
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'formation',
        syncedAt: new Date(),
      });
    }
  }

  private async matchWorklogsToFormationLot(
    formationLot: LotFormation,
    formationWorklogs: WorklogFormation[],
    gradingWorklogs: WorklogGrading[],
  ) {
    let updated = false;
    const cellNumber = Number(formationLot.lot.slice(-4));

    if (!formationLot.worklogFormation) {
      for (const worklog of formationWorklogs) {
        if (this.isFormationWorklogMatch(worklog, cellNumber)) {
          formationLot.worklogFormation = worklog;
          updated = true;
          break;
        }
      }
    }

    if (formationLot.worklogFormation) {
      const preFormationEquipment = this.findPreFormationUnitNumber(formationLot.worklogFormation, cellNumber);
      const mainFormationEquipment = this.findMainFormationUnitNumber(formationLot.worklogFormation, cellNumber);

      if (preFormationEquipment && !formationLot.preFormationEquipment) {
        formationLot.preFormationEquipment = preFormationEquipment;
        updated = true;
      }
      if (mainFormationEquipment && !formationLot.mainFormationEquipment) {
        formationLot.mainFormationEquipment = mainFormationEquipment;
        updated = true;
      }

      const defectNumbers = this.parseDefectNumbersFromRemark(formationLot.worklogFormation.remark);
      if (defectNumbers.includes(cellNumber) && !formationLot.isDefectiveFromFinalSealing) {
        formationLot.isDefectiveFromFinalSealing = true;
        updated = true;
      }
    }

    if (!formationLot.worklogGrading) {
      for (const worklog of gradingWorklogs) {
        if (this.isGradingWorklogMatch(worklog, cellNumber)) {
          formationLot.worklogGrading = worklog;
          updated = true;
          break;
        }
      }
    }

    if (formationLot.worklogGrading) {
      const gradingEquipment = this.findGradingUnitNumber(formationLot.worklogGrading, cellNumber);

      if (gradingEquipment && !formationLot.gradingEquipment) {
        formationLot.gradingEquipment = gradingEquipment;
        updated = true;
      }
    }

    if (updated) {
      await this.lotFormationRepo.save(formationLot);
    }
  }

  private parseDefectNumbersFromRemark(remark: string | null): number[] {
    if (!remark) return [];

    const defectNumbers: number[] = [];
    const defectSectionMatch = remark.match(/불량\s*현황([\s\S]*?)(?:특이\s*사항|$)/i);
    if (!defectSectionMatch) return [];

    const defectSection = defectSectionMatch[1];
    const lines = defectSection.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const numbersPart = line.substring(colonIndex + 1);
        const numbers = numbersPart.match(/\d+/g);
        if (numbers) {
          for (const num of numbers) {
            defectNumbers.push(Number(num));
          }
        }
      }
    }

    return defectNumbers;
  }

  private parseDefectsByType(remark: string | null): { sealingWidth: number[]; visual: number[] } {
    const result = { sealingWidth: [] as number[], visual: [] as number[] };
    if (!remark) return result;

    const defectSectionMatch = remark.match(/불량\s*현황([\s\S]*?)(?:특이\s*사항|$)/i);
    if (!defectSectionMatch) return result;

    const defectSection = defectSectionMatch[1];
    const lines = defectSection.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const defectType = line.substring(0, colonIndex);
      const numbersPart = line.substring(colonIndex + 1);
      const numbers = numbersPart.match(/\d+/g);

      if (!numbers) continue;

      const cellNumbers = numbers.map((n) => Number(n));

      if (defectType.includes('실') && defectType.includes('폭')) {
        result.sealingWidth.push(...cellNumbers);
      } else if (defectType.includes('외관')) {
        result.visual.push(...cellNumbers);
      }
    }

    return result;
  }

  private isFormationWorklogMatch(worklog: WorklogFormation, cellNumber: number): boolean {
    const generalRange = this.parseCellNumberRange(worklog.cellNumberRange);
    if (generalRange.includes(cellNumber)) return true;

    for (let i = 1; i <= 5; i++) {
      const rangeField = `preFormation${i}CellNumberRange` as keyof WorklogFormation;
      const range = this.parseCellNumberRange(worklog[rangeField] as string);
      if (range.includes(cellNumber)) return true;
    }

    for (let i = 1; i <= 5; i++) {
      const rangeField = `mainFormation${i}CellNumberRange` as keyof WorklogFormation;
      const range = this.parseCellNumberRange(worklog[rangeField] as string);
      if (range.includes(cellNumber)) return true;
    }

    return false;
  }

  private isGradingWorklogMatch(worklog: WorklogGrading, cellNumber: number): boolean {
    const generalRange = this.parseCellNumberRange(worklog.cellNumberRange);
    if (generalRange.includes(cellNumber)) return true;

    for (let i = 1; i <= 5; i++) {
      const rangeField = `grading${i}CellNumberRange` as keyof WorklogGrading;
      const range = this.parseCellNumberRange(worklog[rangeField] as string);
      if (range.includes(cellNumber)) return true;
    }

    return false;
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'formation' },
      order: { syncedAt: 'DESC' },
    });
  }

  private findPreFormationUnitNumber(worklog: WorklogFormation | null, cellNumber: number): string | null {
    if (!worklog) return null;

    for (let i = 1; i <= 5; i++) {
      const rangeField = `preFormation${i}CellNumberRange` as keyof WorklogFormation;
      const unitField = `preFormation${i}UnitNumber` as keyof WorklogFormation;
      const range = this.parseCellNumberRange(worklog[rangeField] as string);
      if (range.includes(cellNumber)) {
        return (worklog[unitField] as string) || null;
      }
    }
    return null;
  }

  private findMainFormationUnitNumber(worklog: WorklogFormation | null, cellNumber: number): string | null {
    if (!worklog) return null;

    for (let i = 1; i <= 5; i++) {
      const rangeField = `mainFormation${i}CellNumberRange` as keyof WorklogFormation;
      const unitField = `mainFormation${i}UnitNumber` as keyof WorklogFormation;
      const range = this.parseCellNumberRange(worklog[rangeField] as string);
      if (range.includes(cellNumber)) {
        return (worklog[unitField] as string) || null;
      }
    }
    return null;
  }

  private findGradingUnitNumber(worklog: WorklogGrading | null, cellNumber: number): string | null {
    if (!worklog) return null;

    for (let i = 1; i <= 5; i++) {
      const rangeField = `grading${i}CellNumberRange` as keyof WorklogGrading;
      const unitField = `grading${i}UnitNumber` as keyof WorklogGrading;
      const range = this.parseCellNumberRange(worklog[rangeField] as string);
      if (range.includes(cellNumber)) {
        return (worklog[unitField] as string) || null;
      }
    }
    return null;
  }

  private isFinalSealingInspectionDefective(lotFormation: LotFormation): boolean {
    return lotFormation.finalSideBottomSealingWidth === false || lotFormation.finalVisualInspection === false;
  }

  private isDefective(lotFormation: LotFormation): boolean {
    return lotFormation.isDefectiveFromFinalSealing || this.isFinalSealingInspectionDefective(lotFormation);
  }

  private getSealingThickness(worklog: WorklogFormation | null, index: number): number | null {
    if (!worklog || index < 1 || index > 5) return null;

    const field = `sealingThickness${index}` as keyof WorklogFormation;
    const value = worklog[field] as number | null;
    return value ?? null;
  }

  private getFinalSealingInspection(
    worklog: WorklogFormation | null,
    cellNumber: number,
  ): { sideBottomSealingWidth: boolean; visualInspection: boolean } {
    const defects = this.parseDefectsByType(worklog?.remark || null);

    return {
      sideBottomSealingWidth: !defects.sealingWidth.includes(cellNumber),
      visualInspection: !defects.visual.includes(cellNumber),
    };
  }

  // ===== Raw Data 헤더 → 엔티티 필드 매핑 =====
  private readonly headerToFieldMap: Record<string, keyof LotFormation> = {
    // Pre-Formation
    'Pre-Formation PFC': 'pfc',
    'Pre-Formation PFD': 'rfd',
    'Pre-Formation RFD': 'rfd',
    'Pre-Formation For.Eff_1': 'forEff1',
    // Final Sealing
    'Final Sealing Pouch Sealing Thickness': 'finalPouchSealingThickness',
    // Main Formation
    'Main Formation MFC': 'mfc',
    'Main Formation OCV1': 'ocv1',
    'Main Formation IR1': 'ir1',
    'Main Formation OCV2-4': 'ocv2_4',
    'Main Formation IR2-4': 'ir2_4',
    'Main Formation OCV2-7': 'ocv2_7',
    'Main Formation IR2-7': 'ir2_7',
    'Main Formation Delta V': 'deltaV',
    'Main Formation MFD': 'mfd',
    'Main Formation For.Eff_2': 'formEff2',
    // Grading
    'Grading MFD': 'mfd',
    'Grading FormEff2': 'formEff2',
    'Grading STC': 'stc',
    'Grading STD': 'std',
    'Grading For.Eff_3': 'formEff3',
    'Grading FormEff3': 'formEff3',
    'Grading Temp.': 'gradingTemp',
    'Grading Temp': 'gradingTemp',
    'Grading Wh': 'wh',
    'Grading Nominal V': 'nominalV',
    'Grading NominalV': 'nominalV',
    // SOC
    'SOC25 SOC': 'soc',
    'SOC25 Capacity': 'socCapacity',
    'SOC25 DC_IR': 'dcIr',
    'SOC25 OCV3': 'ocv3',
    'SOC25 IR3': 'ir3',
  };

  // CH No. 헤더 → 엔티티 필드 매핑 (문자열, 별도 처리)
  private readonly chNoHeaderToFieldMap: Record<string, keyof LotFormation> = {
    'Pre-Formation CH No.': 'preFormationChNo',
    'Main Formation CH No.': 'mainFormationChNo',
    'Grading CH No.': 'gradingChNo',
  };

  // CH No. 값 변환: "11-1-1_20260121" → "1/1"
  private parseChNoValue(value: string): string {
    // 앞 3글자 제거
    const withoutPrefix = value.substring(3);
    // 다음 3글자 추출하고 -를 /로 변환
    const next3 = withoutPrefix.substring(0, 3);
    return next3.replace(/-/g, '/');
  }

  async registerRawData(productionId: number, dto: RegisterRawDataDto) {
    const { headers, data } = dto;

    // lot 필드 찾기 (여러 형식 지원: "lot", "Lot Lot" 등)
    const lotHeader = headers.find((h) => h.toLowerCase().includes('lot') && !h.toLowerCase().includes('cell'));
    if (!lotHeader) {
      throw new BadRequestException('headers에 lot 필드가 필요합니다.');
    }

    if (!data || data.length === 0) {
      throw new BadRequestException('data 배열이 비어있습니다.');
    }

    const results = {
      total: data.length,
      updated: 0,
      created: 0,
      skipped: 0,
    };

    for (const row of data) {
      const lotValue = row[lotHeader];
      if (!lotValue) {
        results.skipped++;
        continue;
      }

      let lotFormation = await this.lotFormationRepo.findOne({
        where: {
          production: { id: productionId },
          lot: lotValue,
        },
      });

      if (!lotFormation) {
        // 새 레코드 생성
        lotFormation = this.lotFormationRepo.create({
          lot: lotValue,
          production: { id: productionId },
          processDate: new Date(),
        });
        results.created++;
      } else {
        results.updated++;
      }

      // 헤더 매핑에 따라 값 설정
      for (const header of headers) {
        if (header === lotHeader) continue;

        const value = row[header];
        if (value === undefined || value === null || value === '') continue;

        // CH No. 필드 처리 (문자열 변환)
        const chNoFieldName = this.chNoHeaderToFieldMap[header];
        if (chNoFieldName) {
          (lotFormation as any)[chNoFieldName] = this.parseChNoValue(value);
          continue;
        }

        // 일반 숫자 필드 처리
        const fieldName = this.headerToFieldMap[header];
        if (!fieldName) continue;

        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          (lotFormation as any)[fieldName] = numericValue;
        }
      }

      await this.lotFormationRepo.save(lotFormation);
    }

    return {
      success: true,
      message: `Raw Data 등록 완료: 총 ${results.total}건 중 ${results.updated}건 업데이트, ${results.created}건 생성, ${results.skipped}건 스킵`,
      results,
    };
  }

  async getFormationLots(productionId: number) {
    const lots = await this.lotFormationRepo.find({
      where: { production: { id: productionId } },
      relations: ['lotSealing', 'worklogFormation'],
      order: { lot: 'ASC' },
    });

    const worklogIndexMap = new Map<number, number>();

    return lots.map((lotEntry) => {
      const cellNumber = Number(lotEntry.lot.slice(-4));

      let thicknessIndex = 0;
      if (lotEntry.worklogFormation) {
        const worklogId = lotEntry.worklogFormation.id;
        const currentIndex = (worklogIndexMap.get(worklogId) || 0) + 1;
        worklogIndexMap.set(worklogId, currentIndex);
        thicknessIndex = currentIndex;
      }

      const inspection = this.getFinalSealingInspection(lotEntry.worklogFormation, cellNumber);

      return {
        id: lotEntry.id,
        date: lotEntry.processDate,
        lot: lotEntry.lot,
        assyLot: lotEntry.lotSealing?.lot || null,
        isDefective: this.isDefective(lotEntry),
        preFormation: {
          equipment: lotEntry.preFormationEquipment,
          chNo: lotEntry.preFormationChNo,
          pfc: lotEntry.pfc,
          rfd: lotEntry.rfd,
          forEff1: lotEntry.forEff1,
        },
        finalSealing: {
          pouchSealingThickness: this.getSealingThickness(lotEntry.worklogFormation, thicknessIndex),
          sideBottomSealingWidth: inspection.sideBottomSealingWidth,
          visualInspection: inspection.visualInspection,
        },
        mainFormation: {
          equipment: lotEntry.mainFormationEquipment,
          chNo: lotEntry.mainFormationChNo,
          mfc: lotEntry.mfc,
        },
        ocvIr1: {
          ocv1: lotEntry.ocv1,
          ir1: lotEntry.ir1,
        },
        aging4Days: {
          ocv2_4: lotEntry.ocv2_4,
          ir2_4: lotEntry.ir2_4,
        },
        aging7Days: {
          ocv2_7: lotEntry.ocv2_7,
          ir2_7: lotEntry.ir2_7,
          deltaV: lotEntry.deltaV,
        },
        grading: {
          equipment: lotEntry.gradingEquipment,
          chNo: lotEntry.gradingChNo,
          mfd: lotEntry.mfd,
          formEff2: lotEntry.formEff2,
          stc: lotEntry.stc,
          std: lotEntry.std,
          formEff3: lotEntry.formEff3,
          gradingTemp: lotEntry.gradingTemp,
          wh: lotEntry.wh,
          nominalV: lotEntry.nominalV,
        },
        soc: {
          socCapacity: lotEntry.socCapacity,
          soc: lotEntry.soc,
          dcIr: lotEntry.dcIr,
        },
        ocvIr3: {
          ocv3: lotEntry.ocv3,
          ir3: lotEntry.ir3,
        },
      };
    });
  }
}
