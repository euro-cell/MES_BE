import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotCoating } from '../../../../common/entities/lots/lot-02-coating.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogCoating } from '../../../../common/entities/worklogs/worklog-03-coating.entity';
import { WorklogSlurry } from '../../../../common/entities/worklogs/worklog-02-slurry.entity';
import { Material } from '../../../../common/entities/material.entity';

@Injectable()
export class CoatingService {
  constructor(
    @InjectRepository(LotCoating)
    private readonly lotCoatingRepo: Repository<LotCoating>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogCoating)
    private readonly worklogCoatingRepo: Repository<WorklogCoating>,
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepo: Repository<WorklogSlurry>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const coatingWorklogs = await this.worklogCoatingRepo.find({
      where: lastSync ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) } : { production: { id: productionId } },
    });

    for (const coating of coatingWorklogs) {
      const lots = [coating.coatingLot1, coating.coatingLot2, coating.coatingLot3, coating.coatingLot4].filter((lot) => lot);

      for (const lot of lots) {
        const exists = await this.lotCoatingRepo.findOne({
          where: { lot, production: { id: productionId } },
        });

        if (!exists) {
          const slurry = coating.materialLot2
            ? await this.worklogSlurryRepo.findOne({
                where: { lot: coating.materialLot2, production: { id: productionId } },
              })
            : null;

          const lotCoating = this.lotCoatingRepo.create({
            lot,
            production: { id: productionId },
            processDate: coating.manufactureDate,
            worklogCoating: coating,
            worklogSlurry: slurry ?? undefined,
          });
          await this.lotCoatingRepo.save(lotCoating);
        }
      }
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'coating',
        syncedAt: new Date(),
      });
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'coating' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getCoatingLots(productionId: number) {
    const lots = await this.lotCoatingRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogCoating', 'worklogSlurry'],
      order: { processDate: 'DESC' },
    });

    return Promise.all(
      lots.map(async (lot) => {
        const coating = lot.worklogCoating;
        const slurry = lot.worklogSlurry;

        let foilInfo: { lot: string; type: string; thickness: number | null; width: number | null; length: number | null } | null = null;
        if (coating?.materialLot) {
          const material = await this.materialRepo.findOne({
            where: { lotNo: coating.materialLot },
          });
          if (material) {
            foilInfo = this.parseFoilNote(material.note, coating.materialLot, material.type);
          }
        }

        let temp: number | null = null;
        let humidity: number | null = null;
        if (coating?.tempHumi) {
          const tempMatch = coating.tempHumi.match(/(\d+)\s*°C/);
          const humidityMatch = coating.tempHumi.match(/(\d+)\s*%/);
          temp = tempMatch ? Number(tempMatch[1]) : null;
          humidity = humidityMatch ? Number(humidityMatch[1]) : null;
        }

        const lotIndex = coating
          ? [coating.coatingLot1, coating.coatingLot2, coating.coatingLot3, coating.coatingLot4].findIndex((l) => l === lot.lot) + 1
          : 0;

        const coatingSide = coating ? (coating as unknown as Record<string, unknown>)[`coatingSide${lotIndex}`] : null;
        const isSingleSide = typeof coatingSide === 'string' && coatingSide.includes('단면');

        const coatingWidthValue =
          coating && lotIndex > 0 ? (coating as unknown as Record<string, unknown>)[`coatingWidth${lotIndex}`] : null;
        const coatingWidth = coatingWidthValue !== null && coatingWidthValue !== undefined ? Number(coatingWidthValue) : null;

        const misalignmentValue =
          coating && lotIndex > 0 ? (coating as unknown as Record<string, unknown>)[`misalignment${lotIndex}`] : null;
        const misalignment = misalignmentValue !== null && misalignmentValue !== undefined ? Number(misalignmentValue) : null;

        return {
          id: lot.id,
          coatingDate: lot.processDate,
          lot: lot.lot,
          atCoating: {
            temp: temp || null,
            humidity: humidity || null,
          },
          electrodeSpec: {
            coatLength: coating ? Number(coating.productionQuantity1) : null,
            coatingWidth,
            loadingWeight: coating?.coatingConditionSingle || coating?.coatingConditionDouble || null,
          },
          inspection: coating
            ? {
                aSideCoatWeight: isSingleSide
                  ? {
                      op: { start: Number(coating.weightPerAreaFront1M), end: Number(coating.weightPerAreaRear1M) },
                      mid: { start: Number(coating.weightPerAreaFront1C), end: Number(coating.weightPerAreaRear1C) },
                      gear: { start: Number(coating.weightPerAreaFront1D), end: Number(coating.weightPerAreaRear1D) },
                      webSpeed: Number(coating.coatingSpeed),
                      pump: { start: Number(coating.monoPumpFront1), end: Number(coating.monoPumpRear1) },
                    }
                  : null,
                bothCoatWeight: !isSingleSide
                  ? {
                      op: { start: Number(coating.weightPerAreaFront2M), end: Number(coating.weightPerAreaRear2M) },
                      mid: { start: Number(coating.weightPerAreaFront2C), end: Number(coating.weightPerAreaRear2C) },
                      gear: { start: Number(coating.weightPerAreaFront2D), end: Number(coating.weightPerAreaRear2D) },
                      webSpeed: Number(coating.coatingSpeed),
                      pump: Number(coating.monoPumpFront2),
                    }
                  : null,
                bothCoatThickness: !isSingleSide
                  ? {
                      op: { start: Number(coating.thicknessFront2M), end: Number(coating.thicknessRear2M) },
                      mid: { start: Number(coating.thicknessFront2C), end: Number(coating.thicknessRear2C) },
                      gear: { start: Number(coating.thicknessFront2D), end: Number(coating.thicknessRear2D) },
                    }
                  : null,
                misalignment: !isSingleSide ? misalignment : null,
              }
            : null,
          dryingCondition: coating
            ? {
                temperature: {
                  zone1: { start: Number(coating.zone1TempUpper), end: Number(coating.zone1TempLower) },
                  zone2: { start: Number(coating.zone2TempUpper), end: Number(coating.zone2TempLower) },
                  zone3: Number(coating.zone3Temp),
                  zone4: Number(coating.zone4Temp),
                },
                supply: {
                  zone1: { start: Number(coating.zone1SupplyAirflowUpper), end: Number(coating.zone1SupplyAirflowLower) },
                  zone2: { start: Number(coating.zone2SupplyAirflowUpper), end: Number(coating.zone2SupplyAirflowLower) },
                  zone3: Number(coating.zone3SupplyAirflow),
                  zone4: Number(coating.zone4SupplyAirflow),
                },
                exhaust: {
                  zone2: Number(coating.zone12ExhaustAirflow),
                  zone4: Number(coating.zone34ExhaustAirflow),
                },
              }
            : null,
          slurryInfo: slurry
            ? {
                lot: slurry.lot,
                viscosity: Number(slurry.viscosityAfterMixing),
                solidContent: Number(slurry.solidContent),
              }
            : null,
          foilInfo,
        };
      }),
    );
  }

  private parseFoilNote(note: string | null, lot: string, type: string) {
    if (!note) {
      return { lot, type, thickness: null, width: null, length: null };
    }

    const match = note.match(/(\d+)㎛\s*x\s*(\d+)㎜\s*x\s*([\d,]+)m/);
    if (match) {
      return {
        lot,
        type,
        thickness: Number(match[1]),
        width: Number(match[2]),
        length: Number(match[3].replace(/,/g, '')),
      };
    }
    return { lot, type, thickness: null, width: null, length: null };
  }
}
