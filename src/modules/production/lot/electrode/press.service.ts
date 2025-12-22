import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotPress } from '../../../../common/entities/lots/lot-03-press.entity';
import { LotCoating } from '../../../../common/entities/lots/lot-02-coating.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogPress } from '../../../../common/entities/worklogs/worklog-04-press.entity';

@Injectable()
export class PressService {
  constructor(
    @InjectRepository(LotPress)
    private readonly lotPressRepo: Repository<LotPress>,
    @InjectRepository(LotCoating)
    private readonly lotCoatingRepo: Repository<LotCoating>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogPress)
    private readonly worklogPressRepo: Repository<WorklogPress>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const pressWorklogs = await this.worklogPressRepo.find({
      where: lastSync ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) } : { production: { id: productionId } },
    });

    for (const press of pressWorklogs) {
      const lots = [
        { pressLot: press.pressLot1, coatingLot: press.coatingLot1 },
        { pressLot: press.pressLot2, coatingLot: press.coatingLot2 },
        { pressLot: press.pressLot3, coatingLot: press.coatingLot3 },
        { pressLot: press.pressLot4, coatingLot: press.coatingLot4 },
        { pressLot: press.pressLot5, coatingLot: press.coatingLot5 },
      ].filter((item) => item.pressLot);

      for (const { pressLot, coatingLot } of lots) {
        const exists = await this.lotPressRepo.findOne({
          where: { lot: pressLot, production: { id: productionId } },
        });

        if (!exists) {
          const lotCoating = coatingLot
            ? await this.lotCoatingRepo.findOne({
                where: { lot: coatingLot, production: { id: productionId } },
              })
            : null;

          const lotPress = this.lotPressRepo.create({
            lot: pressLot,
            production: { id: productionId },
            processDate: press.manufactureDate,
            worklogPress: press,
            lotCoating: lotCoating ?? undefined,
          });
          await this.lotPressRepo.save(lotPress);
        }
      }
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'calendering',
        syncedAt: new Date(),
      });
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'calendering' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getPressLots(productionId: number) {
    const lots = await this.lotPressRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogPress', 'lotCoating', 'lotCoating.worklogCoating'],
      order: { processDate: 'DESC' },
    });

    return lots.map((lot) => {
      const press = lot.worklogPress;
      const coatingWorklog = lot.lotCoating?.worklogCoating;

      const lotIndex = press
        ? [press.pressLot1, press.pressLot2, press.pressLot3, press.pressLot4, press.pressLot5].findIndex((l) => l === lot.lot) + 1
        : 0;

      let temp: number | null = null;
      let humidity: number | null = null;
      if (press?.tempHumi) {
        const tempMatch = press.tempHumi.match(/(\d+)\s*°C/);
        const humidityMatch = press.tempHumi.match(/(\d+)\s*%/);
        temp = tempMatch ? Number(tempMatch[1]) : null;
        humidity = humidityMatch ? Number(humidityMatch[1]) : null;
      }

      const pressRecord = press as unknown as Record<string, unknown>;
      const pressQuantity = press && lotIndex > 0 ? pressRecord[`pressQuantity${lotIndex}`] : null;

      const thicknessFrontM = press && lotIndex > 0 ? pressRecord[`thicknessFront${lotIndex}M`] : null;
      const thicknessFrontC = press && lotIndex > 0 ? pressRecord[`thicknessFront${lotIndex}C`] : null;
      const thicknessFrontD = press && lotIndex > 0 ? pressRecord[`thicknessFront${lotIndex}D`] : null;
      const thicknessRearM = press && lotIndex > 0 ? pressRecord[`thicknessRear${lotIndex}M`] : null;
      const thicknessRearC = press && lotIndex > 0 ? pressRecord[`thicknessRear${lotIndex}C`] : null;
      const thicknessRearD = press && lotIndex > 0 ? pressRecord[`thicknessRear${lotIndex}D`] : null;

      const weightPerAreaFrontM = press && lotIndex > 0 ? pressRecord[`weightPerAreaFront${lotIndex}M`] : null;
      const weightPerAreaFrontC = press && lotIndex > 0 ? pressRecord[`weightPerAreaFront${lotIndex}C`] : null;
      const weightPerAreaFrontD = press && lotIndex > 0 ? pressRecord[`weightPerAreaFront${lotIndex}D`] : null;

      return {
        id: lot.id,
        calenderingDate: lot.processDate,
        lot: lot.lot,
        atCalendering: {
          temp: temp ?? null,
          humidity: humidity ?? null,
        },
        calenderingLen: pressQuantity !== null && pressQuantity !== undefined ? Number(pressQuantity) : null,
        electrodeSpec: {
          pressingThick: press ? Number(press.targetThickness) : null,
          loadingWeight: coatingWorklog?.coatingConditionDouble ?? null,
        },
        realInspection: press
          ? {
              conditions: press.rollTemperatureMain || press.rollTemperatureInfeed ? 'Heating' : 'Cooling',
              pressingTemp: Number(press.rollTemperatureMain),
              thickness: {
                op: {
                  start: thicknessFrontM !== null && thicknessFrontM !== undefined ? Number(thicknessFrontM) : null,
                  end: thicknessRearM !== null && thicknessRearM !== undefined ? Number(thicknessRearM) : null,
                },
                mid: {
                  start: thicknessFrontC !== null && thicknessFrontC !== undefined ? Number(thicknessFrontC) : null,
                  end: thicknessRearC !== null && thicknessRearC !== undefined ? Number(thicknessRearC) : null,
                },
                gear: {
                  start: thicknessFrontD !== null && thicknessFrontD !== undefined ? Number(thicknessFrontD) : null,
                  end: thicknessRearD !== null && thicknessRearD !== undefined ? Number(thicknessRearD) : null,
                },
              },
              coatWeight: {
                spec: press.targetThickness ? Number(press.targetThickness) : null,
                p1: weightPerAreaFrontM !== null && weightPerAreaFrontM !== undefined ? Number(weightPerAreaFrontM) : null,
                p3: weightPerAreaFrontC !== null && weightPerAreaFrontC !== undefined ? Number(weightPerAreaFrontC) : null,
                p4: weightPerAreaFrontD !== null && weightPerAreaFrontD !== undefined ? Number(weightPerAreaFrontD) : null,
              },
            }
          : null,
      };
    });
  }
}
