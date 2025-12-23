import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotSealing } from '../../../../common/entities/lots/lot-07-sealing.entity';
import { LotWelding } from '../../../../common/entities/lots/lot-06-welding.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogSealing } from '../../../../common/entities/worklogs/worklog-11-sealing.entity';
import { WorklogFilling } from '../../../../common/entities/worklogs/worklog-12-filling.entity';

@Injectable()
export class SealingLotService {
  constructor(
    @InjectRepository(LotSealing)
    private readonly lotSealingRepo: Repository<LotSealing>,
    @InjectRepository(LotWelding)
    private readonly lotWeldingRepo: Repository<LotWelding>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogSealing)
    private readonly worklogSealingRepo: Repository<WorklogSealing>,
    @InjectRepository(WorklogFilling)
    private readonly worklogFillingRepo: Repository<WorklogFilling>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    // Get welding lots that need sealing lot entries (sorted by lot)
    const weldingLots = await this.lotWeldingRepo.find({
      where: { production: { id: productionId } },
      order: { lot: 'ASC' },
    });

    // Get sealing worklogs
    const sealingWorklogs = await this.worklogSealingRepo.find({
      where: { production: { id: productionId } },
    });

    // Parse defects from remarks
    const parseDefectNumbers = (remark: string, field: string): number[] => {
      if (!remark) return [];
      const regex = new RegExp(`${field}\\s*:\\s*([^\\n]*)`, 'i');
      const match = remark.match(regex);
      if (!match) return [];
      const value = match[1].trim();
      if (!value) return [];
      return value.split(',').map(Number).filter(Boolean);
    };

    // Extract JR number from lot
    const extractJrNumber = (lot: string): number | null => {
      const match = lot?.match(/\d{4}$/);
      return match ? Number(match[0]) : null;
    };

    // Parse pouch lots and usage to determine which pouch lot each JR gets
    const getPouchLotForJr = (
      pouchLotField: string | null,
      pouchUsageField: string | null,
      jrNumber: number,
      jrRangeStart: number,
    ): string | null => {
      if (!pouchLotField || !pouchUsageField) return pouchLotField;

      const lots = pouchLotField.split('/').map((s) => s.trim());
      const usages = pouchUsageField.split('/').map((s) => Number(s.trim())).filter((n) => !isNaN(n));

      if (lots.length !== usages.length || lots.length === 0) return pouchLotField;

      // Calculate which pouch lot this JR belongs to
      const jrOffset = jrNumber - jrRangeStart; // 0-based index within the worklog
      let cumulative = 0;
      for (let i = 0; i < usages.length; i++) {
        cumulative += usages[i];
        if (jrOffset < cumulative) {
          return lots[i];
        }
      }
      return lots[lots.length - 1]; // fallback to last lot
    };

    for (const weldingLot of weldingLots) {
      const lotNumber = weldingLot.lot;
      const jrNum = extractJrNumber(lotNumber);

      // Parse JR range helper
      const parseJrRange = (jrField: string): { numbers: number[]; start: number } => {
        if (!jrField) return { numbers: [], start: 0 };
        const match = jrField.match(/(\d+)\s*~\s*(\d+)/);
        if (match) {
          const start = Number(match[1]);
          const end = Number(match[2]);
          const numbers: number[] = [];
          for (let i = start; i <= end; i++) {
            numbers.push(i);
          }
          return { numbers, start };
        }
        return { numbers: [], start: 0 };
      };

      // Find matching sealing worklog by date and JR number
      let jrRangeStart = 1;
      const matchingSealing = sealingWorklogs.find((s) => {
        const topJrRange = parseJrRange(s.topJrNumber);
        const sideJrRange = parseJrRange(s.sideJrNumber);
        const hipot3JrRange = parseJrRange(s.hipot3JrNumber);
        const allJrNumbers = [...new Set([...topJrRange.numbers, ...sideJrRange.numbers, ...hipot3JrRange.numbers])];

        if (jrNum !== null && allJrNumbers.includes(jrNum)) {
          // Get the minimum start from all ranges
          const starts = [topJrRange.start, sideJrRange.start, hipot3JrRange.start].filter((s) => s > 0);
          jrRangeStart = starts.length > 0 ? Math.min(...starts) : 1;
          return true;
        }
        return false;
      });

      // Parse defects from matched sealing worklog
      let hasSealingDefect = false;
      if (matchingSealing && jrNum !== null) {
        const topDefects = {
          sealProtrusion: parseDefectNumbers(matchingSealing.remarkTop || '', 'Seal\\s*돌출'),
          pouchThickness: parseDefectNumbers(matchingSealing.remarkTop || '', '파우치\\s*두께'),
          topSealThickness: parseDefectNumbers(matchingSealing.remarkTop || '', '탑실\\s*두께'),
          appearance: parseDefectNumbers(matchingSealing.remarkTop || '', '외관'),
          etc: parseDefectNumbers(matchingSealing.remarkTop || '', '기타'),
        };

        const sideDefects = {
          pouchThickness: parseDefectNumbers(matchingSealing.remarkSide || '', '파우치\\s*두께'),
          sealWidth: parseDefectNumbers(matchingSealing.remarkSide || '', '실\\s*폭'),
          appearance: parseDefectNumbers(matchingSealing.remarkSide || '', '외관'),
          hiPot: parseDefectNumbers(matchingSealing.remarkSide || '', 'H-pot'),
          etc: parseDefectNumbers(matchingSealing.remarkSide || '', '기타'),
        };

        hasSealingDefect =
          [...topDefects.sealProtrusion, ...topDefects.pouchThickness, ...topDefects.topSealThickness].includes(jrNum) ||
          [...topDefects.appearance, ...topDefects.etc].includes(jrNum) ||
          [...sideDefects.pouchThickness, ...sideDefects.sealWidth].includes(jrNum) ||
          [...sideDefects.appearance, ...sideDefects.hiPot, ...sideDefects.etc].includes(jrNum);
      }

      const exists = await this.lotSealingRepo.findOne({
        where: {
          lot: lotNumber,
          production: { id: productionId },
        },
      });

      // Determine the correct pouch lot for this JR (only if not defective from previous process)
      const isDefectiveFromPrevious = weldingLot.isDefectiveFromStacking || weldingLot.isDefectiveFromWelding;
      const pouchLotForThisJr =
        matchingSealing && jrNum !== null && !isDefectiveFromPrevious
          ? getPouchLotForJr(matchingSealing.pouchLot, matchingSealing.pouchUsage, jrNum, jrRangeStart)
          : null;

      if (!exists) {
        const lotSealing = this.lotSealingRepo.create({
          lot: lotNumber,
          weldingLot: lotNumber,
          production: { id: productionId },
          processDate: weldingLot.processDate,
          worklogSealing: isDefectiveFromPrevious ? undefined : matchingSealing || undefined,
          pouchLot: pouchLotForThisJr || undefined,
          isDefectiveFromStacking: weldingLot.isDefectiveFromStacking,
          isDefectiveFromWelding: weldingLot.isDefectiveFromWelding,
          isDefectiveFromSealing: hasSealingDefect,
        });
        await this.lotSealingRepo.save(lotSealing);
      } else {
        exists.isDefectiveFromStacking = weldingLot.isDefectiveFromStacking;
        exists.isDefectiveFromWelding = weldingLot.isDefectiveFromWelding;
        exists.isDefectiveFromSealing = hasSealingDefect;
        if (matchingSealing && !isDefectiveFromPrevious) {
          exists.worklogSealing = matchingSealing;
          if (pouchLotForThisJr) {
            exists.pouchLot = pouchLotForThisJr;
          }
        }
        await this.lotSealingRepo.save(exists);
      }
    }

    // Match filling worklogs to good lots
    await this.matchFillingWorklogs(productionId);

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'sealing',
        syncedAt: new Date(),
      });
    }
  }

  private async matchFillingWorklogs(productionId: number) {
    // Get filling worklogs ordered by date
    const fillingWorklogs = await this.worklogFillingRepo.find({
      where: { production: { id: productionId } },
      order: { manufactureDate: 'ASC' },
    });

    if (fillingWorklogs.length === 0) return;

    // Get good lots (not defective from any process) ordered by lot
    const goodLots = await this.lotSealingRepo.find({
      where: {
        production: { id: productionId },
        isDefectiveFromStacking: false,
        isDefectiveFromWelding: false,
        isDefectiveFromSealing: false,
      },
      order: { lot: 'ASC' },
    });

    let fillingIndex = 0;
    let fillingCount = 0;

    for (const lot of goodLots) {
      if (fillingIndex >= fillingWorklogs.length) break;

      const currentFilling = fillingWorklogs[fillingIndex];
      const capacity = currentFilling.fillingWorkQuantity || 0;

      lot.worklogFilling = currentFilling;
      lot.fillingDate = currentFilling.manufactureDate;
      lot.electrolyteLot = currentFilling.electrolyteLot;

      await this.lotSealingRepo.save(lot);

      fillingCount++;
      if (fillingCount >= capacity) {
        fillingIndex++;
        fillingCount = 0;
      }
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'sealing' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getSealingLots(productionId: number) {
    const lots = await this.lotSealingRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogSealing', 'worklogFilling'],
      order: { lot: 'ASC' },
    });

    return lots.map((lotEntry) => {
      const sealing = lotEntry.worklogSealing;
      const filling = lotEntry.worklogFilling;

      let temp: number | null = null;
      let humidity: number | null = null;
      if (sealing?.tempHumi) {
        const tempMatch = sealing.tempHumi.match(/(\d+)\s*°C/);
        const humidityMatch = sealing.tempHumi.match(/(\d+)\s*%/);
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
      const parseDefectNumbers = (remark: string, field: string): number[] => {
        if (!remark) return [];
        const regex = new RegExp(`${field}\\s*:\\s*([^\\n]*)`, 'i');
        const match = remark.match(regex);
        if (!match) return [];
        const value = match[1].trim();
        if (!value) return [];
        return value.split(',').map(Number).filter(Boolean);
      };

      const topDefects = {
        sealProtrusion: parseDefectNumbers(sealing?.remarkTop || '', 'Seal\\s*돌출'),
        pouchThickness: parseDefectNumbers(sealing?.remarkTop || '', '파우치\\s*두께'),
        topSealThickness: parseDefectNumbers(sealing?.remarkTop || '', '탑실\\s*두께'),
        appearance: parseDefectNumbers(sealing?.remarkTop || '', '외관'),
        etc: parseDefectNumbers(sealing?.remarkTop || '', '기타'),
      };

      const sideDefects = {
        pouchThickness: parseDefectNumbers(sealing?.remarkSide || '', '파우치\\s*두께'),
        sealWidth: parseDefectNumbers(sealing?.remarkSide || '', '실\\s*폭'),
        appearance: parseDefectNumbers(sealing?.remarkSide || '', '외관'),
        hiPot: parseDefectNumbers(sealing?.remarkSide || '', 'H-pot'),
        etc: parseDefectNumbers(sealing?.remarkSide || '', '기타'),
      };

      const hasDefect = (defectList: number[]): boolean => {
        if (currentJrNumber === null) return false;
        return defectList.includes(currentJrNumber);
      };

      // Parse checklist to get thickness values
      // Format: "11 - 281/717/705/267\n24 - 281/758/719/272\n38 - 285/719/713/269"
      // 11 means JR 11-23, 24 means JR 24-37, 38 means JR 38 to end
      const parseChecklistThickness = (
        checklist: string | null,
        jrNumber: number | null,
      ): number[] => {
        if (!checklist || jrNumber === null) return [];
        const lines = checklist.split('\n').filter((l) => l.trim());
        const ranges: { start: number; values: number[] }[] = [];

        // Parse all lines to get start numbers and values
        for (const line of lines) {
          const match = line.match(/(\d+)\s*-\s*(.+)/);
          if (match) {
            const start = Number(match[1]);
            const values = match[2].split('/').map((v) => Number(v.trim())).filter((v) => !isNaN(v));
            ranges.push({ start, values });
          }
        }

        if (ranges.length === 0) return [];

        // Sort by start number
        ranges.sort((a, b) => a.start - b.start);

        // Find the correct range for this JR number
        for (let i = ranges.length - 1; i >= 0; i--) {
          if (jrNumber >= ranges[i].start) {
            return ranges[i].values;
          }
        }

        return ranges[0].values; // fallback to first range
      };

      // Get thickness values from checklists
      const topThicknessValues = parseChecklistThickness(sealing?.topChecklist, currentJrNumber);
      const sideThicknessValues = parseChecklistThickness(sealing?.sideChecklist, currentJrNumber);

      // Top: [0]=pouch1, [1]=tab1, [2]=tab2, [3]=pouch2 → pouchThickness=min(0,3), tabThickness=min(1,2)
      const topPouchThicknessValue =
        topThicknessValues.length >= 4
          ? Math.min(topThicknessValues[0], topThicknessValues[3])
          : topThicknessValues.length > 0
            ? topThicknessValues[0]
            : null;
      const topTabThicknessValue =
        topThicknessValues.length >= 4
          ? Math.min(topThicknessValues[1], topThicknessValues[2])
          : topThicknessValues.length >= 2
            ? topThicknessValues[1]
            : null;

      // Side: min of all values
      const sidePouchThicknessValue =
        sideThicknessValues.length > 0 ? Math.min(...sideThicknessValues) : null;

      // Check if "기타" defect exists (unknown defect type - all fields should be null)
      const hasEtcDefect = hasDefect(topDefects.etc) || hasDefect(sideDefects.etc);

      // If defective from stacking, welding, or "기타" defect, all sealing fields are null
      if (lotEntry.isDefectiveFromStacking || lotEntry.isDefectiveFromWelding || hasEtcDefect) {
        return {
          id: lotEntry.id,
          date: sealing?.manufactureDate || lotEntry.processDate,
          lot: lotEntry.lot,
          isDefectiveFromStacking: lotEntry.isDefectiveFromStacking,
          isDefectiveFromWelding: lotEntry.isDefectiveFromWelding,
          isDefectiveFromSealing: lotEntry.isDefectiveFromSealing,
          atAssy: {
            temp: temp ?? null,
            humidity: humidity ?? null,
          },
          topSealing: {
            sealantHeight: null,
            pouchSealingThickness: null,
            tabSealingThickness: null,
            visualInspection: null,
          },
          sideSealing: {
            pouchSealingThickness: null,
            sideBottomSealingWidth: null,
            visualInspection: null,
            irCheck: null,
          },
          filling: {
            injection: lotEntry.fillingDate,
            lot: lotEntry.electrolyteLot,
          },
          pouch: {
            lot: lotEntry.pouchLot,
          },
        };
      }

      // Top sealing checks - sequential order
      // 1. Sealant Height (돌출높이)
      const sealantHeight = hasDefect(topDefects.sealProtrusion) ? 'NP' : 'P';
      const sealantHeightFailed = sealantHeight === 'NP';

      // 2. Pouch Sealing Thickness (파우치 두께)
      const topPouchThickness: number | string | null = sealantHeightFailed
        ? null
        : hasDefect(topDefects.pouchThickness)
          ? 'NP'
          : topPouchThicknessValue;
      const topPouchFailed = sealantHeightFailed || topPouchThickness === 'NP';

      // 3. Tab Sealing Thickness (탑실 두께)
      const tabSealingThickness: number | string | null = topPouchFailed
        ? null
        : hasDefect(topDefects.topSealThickness)
          ? 'NP'
          : topTabThicknessValue;
      const tabSealingFailed = topPouchFailed || tabSealingThickness === 'NP';

      // 4. Visual Inspection (외관)
      const topVisual = tabSealingFailed
        ? null
        : hasDefect(topDefects.appearance)
          ? 'NP'
          : 'P';
      const topFailed = tabSealingFailed || topVisual === 'NP';

      // Side sealing checks - sequential order (only if top sealing passed)
      // 1. Pouch Sealing Thickness (파우치 두께)
      const sidePouchThickness: number | string | null = topFailed
        ? null
        : hasDefect(sideDefects.pouchThickness)
          ? 'NP'
          : sidePouchThicknessValue;
      const sidePouchFailed = topFailed || sidePouchThickness === 'NP';

      // 2. Side/Bottom Sealing Width (실 폭)
      const sideWidth = sidePouchFailed
        ? null
        : hasDefect(sideDefects.sealWidth)
          ? 'NP'
          : 'P';
      const sideWidthFailed = sidePouchFailed || sideWidth === 'NP';

      // 3. Visual Inspection (외관)
      const sideVisual = sideWidthFailed
        ? null
        : hasDefect(sideDefects.appearance)
          ? 'NP'
          : 'P';
      const sideVisualFailed = sideWidthFailed || sideVisual === 'NP';

      // 4. IR Check (H-pot)
      const irCheck = sideVisualFailed
        ? null
        : hasDefect(sideDefects.hiPot)
          ? 'NP'
          : 'P';

      return {
        id: lotEntry.id,
        date: sealing?.manufactureDate || lotEntry.processDate,
        lot: lotEntry.lot,
        isDefectiveFromStacking: lotEntry.isDefectiveFromStacking,
        isDefectiveFromWelding: lotEntry.isDefectiveFromWelding,
        isDefectiveFromSealing: lotEntry.isDefectiveFromSealing,
        atAssy: {
          temp: temp ?? null,
          humidity: humidity ?? null,
        },
        topSealing: {
          sealantHeight: sealantHeight,
          pouchSealingThickness: topPouchThickness,
          tabSealingThickness: tabSealingThickness,
          visualInspection: topVisual,
        },
        sideSealing: {
          pouchSealingThickness: sidePouchThickness,
          sideBottomSealingWidth: sideWidth,
          visualInspection: sideVisual,
          irCheck: irCheck,
        },
        filling: {
          injection: lotEntry.fillingDate,
          lot: lotEntry.electrolyteLot,
        },
        pouch: {
          lot: lotEntry.pouchLot,
        },
      };
    });
  }
}
