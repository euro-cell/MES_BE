import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotStacking } from '../../../../common/entities/lots/lot-05-stacking.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogStacking } from '../../../../common/entities/worklogs/worklog-09-stacking.entity';

@Injectable()
export class StackingService {
  constructor(
    @InjectRepository(LotStacking)
    private readonly lotStackingRepo: Repository<LotStacking>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogStacking)
    private readonly worklogStackingRepo: Repository<WorklogStacking>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const stackingWorklogs = await this.worklogStackingRepo.find({
      where: lastSync
        ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) }
        : { production: { id: productionId } },
    });

    for (const stacking of stackingWorklogs) {
      const jrRanges = [
        { jrRange: stacking.jr1Range, cathodeLot: stacking.jr1CathodeLot, anodeLot: stacking.jr1AnodeLot, separatorLot: stacking.jr1SeparatorLot },
        { jrRange: stacking.jr2Range, cathodeLot: stacking.jr2CathodeLot, anodeLot: stacking.jr2AnodeLot, separatorLot: stacking.jr2SeparatorLot },
        { jrRange: stacking.jr3Range, cathodeLot: stacking.jr3CathodeLot, anodeLot: stacking.jr3AnodeLot, separatorLot: stacking.jr3SeparatorLot },
        { jrRange: stacking.jr4Range, cathodeLot: stacking.jr4CathodeLot, anodeLot: stacking.jr4AnodeLot, separatorLot: stacking.jr4SeparatorLot },
      ].filter((item) => item.jrRange);

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

      const parseRange = (range: string): number[] => {
        const match = range?.match(/(\d+)\s*~\s*(\d+)/);
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

      // Parse defects from remark
      const parseDefects = (remark: string): { hipot: number[]; weight: number[]; thickness: number[]; alignment: number[] } => {
        const defects: { hipot: number[]; weight: number[]; thickness: number[]; alignment: number[] } = {
          hipot: [],
          weight: [],
          thickness: [],
          alignment: [],
        };
        if (!remark) return defects;

        const hipotMatch = remark.match(/Hi-pot\s*:\s*([\d,\s]+)/i);
        const weightMatch = remark.match(/무게\s*:\s*([\d,\s]+)/);
        const thicknessMatch = remark.match(/두께\s*:\s*([\d,\s]+)/);
        const alignmentMatch = remark.match(/Alignment\s*:\s*([\d,\s]+)/i);

        if (hipotMatch) {
          defects.hipot = hipotMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (weightMatch) {
          defects.weight = weightMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (thicknessMatch) {
          defects.thickness = thicknessMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (alignmentMatch) {
          defects.alignment = alignmentMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }

        return defects;
      };

      const defects = parseDefects(stacking.remark || '');

      for (const jr of jrRanges) {
        const jrNumbers = parseRange(jr.jrRange);

        for (const jrNum of jrNumbers) {
          const lotNumber = generateLot(stacking.manufactureDate, jrNum);

          // Check if this JR number has any defect
          const hasDefect =
            defects.weight.includes(jrNum) ||
            defects.thickness.includes(jrNum) ||
            defects.alignment.includes(jrNum) ||
            defects.hipot.includes(jrNum);

          const exists = await this.lotStackingRepo.findOne({
            where: {
              lot: lotNumber,
              production: { id: productionId },
              worklogStacking: { id: stacking.id },
            },
          });

          if (!exists) {
            const lotStacking = this.lotStackingRepo.create({
              lot: lotNumber,
              jrRange: jr.jrRange,
              production: { id: productionId },
              processDate: stacking.manufactureDate,
              worklogStacking: stacking,
              isDefective: hasDefect,
            });
            await this.lotStackingRepo.save(lotStacking);
          } else {
            // Update existing record with defect status
            exists.isDefective = hasDefect;
            await this.lotStackingRepo.save(exists);
          }
        }
      }
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'stacking',
        syncedAt: new Date(),
      });
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'stacking' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getStackingLots(productionId: number) {
    const lots = await this.lotStackingRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogStacking'],
      order: { processDate: 'DESC' },
    });

    return lots.map((lotEntry) => {
      const stacking = lotEntry.worklogStacking;

      let temp: number | null = null;
      let humidity: number | null = null;
      if (stacking?.tempHumi) {
        const tempMatch = stacking.tempHumi.match(/(\d+)\s*°C/);
        const humidityMatch = stacking.tempHumi.match(/(\d+)\s*%/);
        temp = tempMatch ? Number(tempMatch[1]) : null;
        humidity = humidityMatch ? Number(humidityMatch[1]) : null;
      }

      const jrIndex = stacking
        ? [stacking.jr1Range, stacking.jr2Range, stacking.jr3Range, stacking.jr4Range].findIndex((r) => r === lotEntry.jrRange) + 1
        : 0;

      let cathodeLotValues: string[] = [];
      let anodeLotValues: string[] = [];
      let separatorLot: string | null = null;

      if (stacking && jrIndex > 0) {
        const stackingRecord = stacking as unknown as Record<string, unknown>;
        const cathodeLot = (stackingRecord[`jr${jrIndex}CathodeLot`] as string) ?? null;
        const anodeLot = (stackingRecord[`jr${jrIndex}AnodeLot`] as string) ?? null;
        separatorLot = (stackingRecord[`jr${jrIndex}SeparatorLot`] as string) ?? null;

        // Parse cathodeLot - split by newline, comma, or slash
        if (cathodeLot) {
          cathodeLotValues = cathodeLot
            .split(/[\n,/]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 2);
        }

        // Parse anodeLot - split by newline, comma, or slash
        if (anodeLot) {
          anodeLotValues = anodeLot
            .split(/[\n,/]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 2);
        }
      }

      // Extract JR number from LOT (e.g., "DK150015" -> 15)
      const extractJrNumber = (lot: string): number | null => {
        const match = lot?.match(/\d{4}$/);
        if (match) {
          return Number(match[0]);
        }
        return null;
      };

      const currentJrNumber = extractJrNumber(lotEntry.lot);

      const parseDefects = (remark: string): { hipot: number[]; weight: number[]; thickness: number[]; alignment: number[] } => {
        const defects: { hipot: number[]; weight: number[]; thickness: number[]; alignment: number[] } = {
          hipot: [],
          weight: [],
          thickness: [],
          alignment: []
        };
        if (!remark) return defects;

        const hipotMatch = remark.match(/Hi-pot\s*:\s*([\d,\s]+)/i);
        const weightMatch = remark.match(/무게\s*:\s*([\d,\s]+)/);
        const thicknessMatch = remark.match(/두께\s*:\s*([\d,\s]+)/);
        const alignmentMatch = remark.match(/Alignment\s*:\s*([\d,\s]+)/i);

        if (hipotMatch) {
          defects.hipot = hipotMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (weightMatch) {
          defects.weight = weightMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (thicknessMatch) {
          defects.thickness = thicknessMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }
        if (alignmentMatch) {
          defects.alignment = alignmentMatch[1].split(/[,\s]+/).map(Number).filter(Boolean);
        }

        return defects;
      };

      const defects = parseDefects(stacking?.remark || '');

      const hasDefect = (defectList: number[]): boolean => {
        if (currentJrNumber === null) return false;
        return defectList.includes(currentJrNumber);
      };

      const stackValue = stacking?.stackCount ? `${stacking.stackCount}/${stacking.stackCount - 1}` : 'P';

      const weightStatus = hasDefect(defects.weight) ? 'NP' : 'P';
      const thicknessStatus = hasDefect(defects.thickness) ? 'NP' : 'P';
      const alignmentStatus = hasDefect(defects.alignment) ? 'NP' : 'P';
      const irStatus = hasDefect(defects.hipot) ? 'NP' : 'P';

      return {
        id: lotEntry.id,
        productionDate: lotEntry.processDate,
        lot: lotEntry.lot,
        isDefective: lotEntry.isDefective,
        atStacking: {
          temp: temp ?? null,
          humidity: humidity ?? null,
        },
        jellyrollSpec: {
          stack: stackValue,
          weight: weightStatus,
          thickness: thicknessStatus,
          alignment: alignmentStatus,
          ir: irStatus,
        },
        magazine: {
          notchingAnode: {
            row1: cathodeLotValues[0] ?? null,
            row2: cathodeLotValues[1] ?? null,
          },
          notchingCathode: {
            row1: anodeLotValues[0] ?? null,
            row2: anodeLotValues[1] ?? null,
          },
          separate: separatorLot ?? null,
        },
      };
    });
  }
}
