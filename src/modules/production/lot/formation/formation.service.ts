import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotFormation } from '../../../../common/entities/lots/lot-08-formation.entity';
import { LotSealing } from '../../../../common/entities/lots/lot-07-sealing.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogFormation } from '../../../../common/entities/worklogs/worklog-13-formation.entity';
import { WorklogGrading } from '../../../../common/entities/worklogs/worklog-14-grading.entity';

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
    const match = range.match(/(\d+)\s*~\s*(\d+)/);
    if (!match) return [];
    const start = Number(match[1]);
    const end = Number(match[2]);
    const numbers: number[] = [];
    for (let i = start; i <= end; i++) {
      numbers.push(i);
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
