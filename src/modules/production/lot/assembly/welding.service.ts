import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotWelding } from '../../../../common/entities/lots/lot-06-welding.entity';
import { LotStacking } from '../../../../common/entities/lots/lot-05-stacking.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogWelding } from '../../../../common/entities/worklogs/worklog-10-welding.entity';

@Injectable()
export class WeldingService {
  constructor(
    @InjectRepository(LotWelding)
    private readonly lotWeldingRepo: Repository<LotWelding>,
    @InjectRepository(LotStacking)
    private readonly lotStackingRepo: Repository<LotStacking>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogWelding)
    private readonly worklogWeldingRepo: Repository<WorklogWelding>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const weldingWorklogs = await this.worklogWeldingRepo.find({
      where: lastSync
        ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) }
        : { production: { id: productionId } },
    });

    for (const welding of weldingWorklogs) {
      // Parse JR number ranges to extract individual JR numbers
      const parseJrNumbers = (jrNumberField: string): number[] => {
        if (!jrNumberField) return [];
        const match = jrNumberField.match(/(\d+)\s*~\s*(\d+)/);
        if (match) {
          const start = Number(match[1]);
          const end = Number(match[2]);
          const numbers: number[] = [];
          for (let i = start; i <= end; i++) {
            numbers.push(i);
          }
          return numbers;
        }
        return [];
      };

      // Get all JR numbers from all stages
      const jrNumbers = [
        ...parseJrNumbers(welding.preWeldingJrNumber),
        ...parseJrNumbers(welding.mainWeldingJrNumber),
        ...parseJrNumbers(welding.hipot2JrNumber),
        ...parseJrNumbers(welding.tapingJrNumber),
      ];

      // Remove duplicates
      const uniqueJrNumbers = [...new Set(jrNumbers)];

      // Generate LOT from manufactureDate and JR number
      const generateLot = (date: Date | string, jrNum: number): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();

        const yearCode = String.fromCharCode(65 + (year - 2022));
        const monthCode = String.fromCharCode(64 + month);
        const dayCode = String(day).padStart(2, '0');
        const jrCode = String(jrNum).padStart(4, '0');

        return `${yearCode}${monthCode}${dayCode}${jrCode}`;
      };

      // Parse defects from remarks
      const parseDefectNumbers = (remark: string): number[] => {
        if (!remark) return [];
        const matches = remark.match(/\d+/g);
        return matches ? matches.map(Number) : [];
      };

      // Parse pre-welding defects by category
      const parsePreWeldingDefects = (
        remark: string,
      ): { align: number[]; welding: number[]; etc: number[] } => {
        const defects: { align: number[]; welding: number[]; etc: number[] } = {
          align: [],
          welding: [],
          etc: [],
        };
        if (!remark) return defects;

        const alignMatch = remark.match(/Align\s*:\s*([\d,\s]+)/i);
        const weldingMatch = remark.match(/소착\s*:\s*([\d,\s]+)/);
        const etcMatch = remark.match(/기타\s*:\s*([\d,\s]+)/);

        if (alignMatch) {
          defects.align = alignMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (weldingMatch) {
          defects.welding = weldingMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (etcMatch) {
          defects.etc = etcMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }

        return defects;
      };

      const preWeldingDefects = parsePreWeldingDefects(welding.preWeldingDefectRemark || '');
      const mainWeldingDefects = parseDefectNumbers(welding.mainWeldingDefectRemark || '');
      const hipot2Defects = parseDefectNumbers(welding.hipot2DefectRemark || '');
      const tapingDefects = parseDefectNumbers(welding.tapingDefectRemark || '');

      for (const jrNum of uniqueJrNumbers) {
        const weldingLotNumber = generateLot(welding.manufactureDate, jrNum);

        // Find stacking lot to check if it was defective (may not exist)
        const stackingLotEntry = await this.lotStackingRepo.findOne({
          where: { lot: weldingLotNumber, production: { id: productionId } },
        });

        // Check if this JR has welding defects
        const hasWeldingDefect =
          [...preWeldingDefects.align, ...preWeldingDefects.welding, ...preWeldingDefects.etc].includes(jrNum) ||
          mainWeldingDefects.includes(jrNum) ||
          hipot2Defects.includes(jrNum) ||
          tapingDefects.includes(jrNum);

        const exists = await this.lotWeldingRepo.findOne({
          where: {
            lot: weldingLotNumber,
            production: { id: productionId },
            worklogWelding: { id: welding.id },
          },
        });

        if (!exists) {
          const lotWelding = this.lotWeldingRepo.create({
            lot: weldingLotNumber,
            stackingLot: weldingLotNumber,
            production: { id: productionId },
            processDate: welding.manufactureDate,
            worklogWelding: welding,
            isDefectiveFromStacking: stackingLotEntry?.isDefective || false,
            isDefectiveFromWelding: hasWeldingDefect,
          });
          await this.lotWeldingRepo.save(lotWelding);
        } else {
          exists.isDefectiveFromStacking = stackingLotEntry?.isDefective || false;
          exists.isDefectiveFromWelding = hasWeldingDefect;
          await this.lotWeldingRepo.save(exists);
        }
      }
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'welding',
        syncedAt: new Date(),
      });
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'welding' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getWeldingLots(productionId: number) {
    const lots = await this.lotWeldingRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogWelding'],
      order: { processDate: 'DESC' },
    });

    return lots.map((lotEntry) => {
      const welding = lotEntry.worklogWelding;

      let temp: number | null = null;
      let humidity: number | null = null;
      if (welding?.tempHumi) {
        const tempMatch = welding.tempHumi.match(/(\d+)\s*°C/);
        const humidityMatch = welding.tempHumi.match(/(\d+)\s*%/);
        temp = tempMatch ? Number(tempMatch[1]) : null;
        humidity = humidityMatch ? Number(humidityMatch[1]) : null;
      }

      // Extract JR number from lot
      const extractJrNumber = (lot: string): number | null => {
        const match = lot?.match(/\d{4}$/);
        if (match) {
          return Number(match[0]);
        }
        return null;
      };

      const currentJrNumber = extractJrNumber(lotEntry.lot);

      // Parse defects
      const parseDefectNumbers = (remark: string): number[] => {
        if (!remark) return [];
        const matches = remark.match(/\d+/g);
        return matches ? matches.map(Number) : [];
      };

      const parsePreWeldingDefects = (
        remark: string,
      ): { align: number[]; welding: number[]; etc: number[] } => {
        const defects: { align: number[]; welding: number[]; etc: number[] } = {
          align: [],
          welding: [],
          etc: [],
        };
        if (!remark) return defects;

        const alignMatch = remark.match(/Align\s*:\s*([\d,\s]+)/i);
        const weldingMatch = remark.match(/소착\s*:\s*([\d,\s]+)/);
        const etcMatch = remark.match(/기타\s*:\s*([\d,\s]+)/);

        if (alignMatch) {
          defects.align = alignMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (weldingMatch) {
          defects.welding = weldingMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (etcMatch) {
          defects.etc = etcMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }

        return defects;
      };

      const preWeldingDefects = parsePreWeldingDefects(welding?.preWeldingDefectRemark || '');
      const mainWeldingDefects = parseDefectNumbers(welding?.mainWeldingDefectRemark || '');
      const hipot2Defects = parseDefectNumbers(welding?.hipot2DefectRemark || '');
      const tapingDefects = parseDefectNumbers(welding?.tapingDefectRemark || '');

      // If defective from stacking, don't process welding at all
      if (lotEntry.isDefectiveFromStacking) {
        return {
          id: lotEntry.id,
          weldingDate: lotEntry.processDate,
          lot: lotEntry.lot,
          isDefectiveFromStacking: lotEntry.isDefectiveFromStacking,
          isDefectiveFromWelding: lotEntry.isDefectiveFromWelding,
          atWelding: {
            temp: temp ?? null,
            humidity: humidity ?? null,
          },
          preWelding: {
            weldingPosition: null,
            trimPosition: null,
          },
          mainWelding: {
            weldingPosition: null,
            irCheck: null,
            taping: null,
          },
        };
      }

      // Check defects for this JR number
      const hasDefect = (defectList: number[]): boolean => {
        if (currentJrNumber === null) return false;
        return defectList.includes(currentJrNumber);
      };

      // Pre-welding: weldingPosition checks welding + etc
      const preWeldingPosition = hasDefect([...preWeldingDefects.welding, ...preWeldingDefects.etc]) ? 'NP' : 'P';

      // If weldingPosition failed, don't proceed to trimPosition
      const trimPosition = preWeldingPosition === 'NP' ? null : (hasDefect(preWeldingDefects.align) ? 'NP' : 'P');

      // If any pre-welding failed, don't proceed to main welding
      const preWeldingFailed = preWeldingPosition === 'NP' || trimPosition === 'NP';

      // Main welding: weldingPosition checks all mainWeldingDefects
      const mainWeldingPosition = preWeldingFailed ? null : (hasDefect(mainWeldingDefects) ? 'NP' : 'P');

      // If main welding failed, don't proceed to IR check
      const mainWeldingFailed = mainWeldingPosition === 'NP';
      const irCheck = preWeldingFailed || mainWeldingFailed ? null : (hasDefect(hipot2Defects) ? 'NP' : 'P');

      // If IR check failed, don't proceed to taping
      const irCheckFailed = irCheck === 'NP';
      const taping = preWeldingFailed || mainWeldingFailed || irCheckFailed ? null : (hasDefect(tapingDefects) ? 'NP' : 'P');

      return {
        id: lotEntry.id,
        weldingDate: lotEntry.processDate,
        lot: lotEntry.lot,
        isDefectiveFromStacking: lotEntry.isDefectiveFromStacking,
        isDefectiveFromWelding: lotEntry.isDefectiveFromWelding,
        atWelding: {
          temp: temp ?? null,
          humidity: humidity ?? null,
        },
        preWelding: {
          weldingPosition: preWeldingPosition,
          trimPosition: trimPosition,
        },
        mainWelding: {
          weldingPosition: mainWeldingPosition,
          irCheck: irCheck,
          taping: taping,
        },
      };
    });
  }
}
