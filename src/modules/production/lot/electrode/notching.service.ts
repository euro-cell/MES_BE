import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotNotching } from '../../../../common/entities/lots/lot-04-notching.entity';
import { LotPress } from '../../../../common/entities/lots/lot-03-press.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogNotching } from '../../../../common/entities/worklogs/worklog-06-notching.entity';

@Injectable()
export class NotchingService {
  constructor(
    @InjectRepository(LotNotching)
    private readonly lotNotchingRepo: Repository<LotNotching>,
    @InjectRepository(LotPress)
    private readonly lotPressRepo: Repository<LotPress>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogNotching)
    private readonly worklogNotchingRepo: Repository<WorklogNotching>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const notchingWorklogs = await this.worklogNotchingRepo.find({
      where: lastSync ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) } : { production: { id: productionId } },
    });

    for (const notching of notchingWorklogs) {
      const lots = [
        { notchingLot: notching.notchingLot1, pressLot: notching.pressLot1 },
        { notchingLot: notching.notchingLot2, pressLot: notching.pressLot2 },
        { notchingLot: notching.notchingLot3, pressLot: notching.pressLot3 },
        { notchingLot: notching.notchingLot4, pressLot: notching.pressLot4 },
        { notchingLot: notching.notchingLot5, pressLot: notching.pressLot5 },
      ].filter((item) => item.notchingLot);

      for (const { notchingLot, pressLot } of lots) {
        const exists = await this.lotNotchingRepo.findOne({
          where: {
            lot: notchingLot,
            production: { id: productionId },
            worklogNotching: { id: notching.id },
          },
        });

        if (!exists) {
          const lotPress = pressLot
            ? await this.lotPressRepo.findOne({
                where: { lot: pressLot, production: { id: productionId } },
              })
            : null;

          const lotNotching = this.lotNotchingRepo.create({
            lot: notchingLot,
            production: { id: productionId },
            processDate: notching.manufactureDate,
            worklogNotching: notching,
            lotPress: lotPress ?? undefined,
          });
          await this.lotNotchingRepo.save(lotNotching);
        }
      }
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'notching',
        syncedAt: new Date(),
      });
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'notching' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getNotchingLots(productionId: number) {
    const lots = await this.lotNotchingRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogNotching'],
      order: { processDate: 'DESC' },
    });

    return lots.map((lotEntry) => {
      const notching = lotEntry.worklogNotching;

      let temp: number | null = null;
      let humidity: number | null = null;
      if (notching?.tempHumi) {
        const tempMatch = notching.tempHumi.match(/(\d+)\s*°C/);
        const humidityMatch = notching.tempHumi.match(/(\d+)\s*%/);
        temp = tempMatch ? Number(tempMatch[1]) : null;
        humidity = humidityMatch ? Number(humidityMatch[1]) : null;
      }

      const lotIndex = notching
        ? [notching.notchingLot1, notching.notchingLot2, notching.notchingLot3, notching.notchingLot4, notching.notchingLot5].findIndex(
            (l) => l === lotEntry.lot,
          ) + 1
        : 0;

      let notchingQuantity = 0;
      let defectQuantity = 0;
      let goodQuantity = 0;
      let overTab: number | null = null;
      let wide: number | null = null;
      let length: number | null = null;
      let missMatch: number | null = null;

      if (notching && lotIndex > 0) {
        const notchingRecord = notching as unknown as Record<string, unknown>;

        const notchingQty = notchingRecord[`notchingQuantity${lotIndex}`];
        const defectQty = notchingRecord[`defectQuantity${lotIndex}`];
        const goodQty = notchingRecord[`goodQuantity${lotIndex}`];

        notchingQuantity = notchingQty !== null && notchingQty !== undefined ? Number(notchingQty) : 0;
        defectQuantity = defectQty !== null && defectQty !== undefined ? Number(defectQty) : 0;
        goodQuantity = goodQty !== null && goodQty !== undefined ? Number(goodQty) : 0;

        const overTabValue = notchingRecord[`overTab${lotIndex}`];
        const wideValue = notchingRecord[`wide${lotIndex}`];
        const lengthValue = notchingRecord[`length${lotIndex}`];
        const missMatchValue = notchingRecord[`missMatch${lotIndex}`];

        overTab = overTabValue !== null && overTabValue !== undefined ? Number(overTabValue) : null;
        wide = wideValue !== null && wideValue !== undefined ? Number(wideValue) : null;
        length = lengthValue !== null && lengthValue !== undefined ? Number(lengthValue) : null;
        missMatch = missMatchValue !== null && missMatchValue !== undefined ? Number(missMatchValue) : null;
      }

      const fractionDefective = notchingQuantity > 0 ? (goodQuantity / notchingQuantity) * 100 : 0;

      return {
        id: lotEntry.id,
        notchingDate: lotEntry.processDate,
        lot: lotEntry.lot,
        atNotching: {
          temp: temp ?? null,
          humidity: humidity ?? null,
        },
        electrodeSpec: {
          overTab: overTab,
          wide: wide,
          length: length,
          missMatch: missMatch,
        },
        production: {
          totalOutput: notchingQuantity,
          defective: defectQuantity,
          quantity: goodQuantity,
          fractionDefective: Number(fractionDefective.toFixed(2)),
        },
      };
    });
  }
}
