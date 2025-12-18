import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotMixing } from '../../../../common/entities/lots/lot-01-mixing.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogBinder } from '../../../../common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from '../../../../common/entities/worklogs/worklog-02-slurry.entity';

@Injectable()
export class MixingService {
  constructor(
    @InjectRepository(LotMixing)
    private readonly lotMixingRepo: Repository<LotMixing>,
    @InjectRepository(LotSync)
    private readonly lotSyncRepo: Repository<LotSync>,
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepo: Repository<WorklogBinder>,
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepo: Repository<WorklogSlurry>,
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const slurryWorklogs = await this.worklogSlurryRepo.find({
      where: lastSync ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) } : { production: { id: productionId } },
    });

    for (const slurry of slurryWorklogs) {
      if (!slurry.lot) continue;

      const exists = await this.lotMixingRepo.findOne({
        where: { lot: slurry.lot, production: { id: productionId } },
      });

      if (!exists) {
        const binder = await this.worklogBinderRepo.findOne({
          where: { lot: slurry.lot, production: { id: productionId } },
        });

        const lotMixing = this.lotMixingRepo.create({
          lot: slurry.lot,
          production: { id: productionId },
          processDate: slurry.manufactureDate,
          worklogSlurry: slurry,
          worklogBinder: binder ?? undefined,
        });
        await this.lotMixingRepo.save(lotMixing);
      }
    }

    if (lastSync) {
      lastSync.syncedAt = new Date();
      await this.lotSyncRepo.save(lastSync);
    } else {
      await this.lotSyncRepo.save({
        production: { id: productionId },
        process: 'mixing',
        syncedAt: new Date(),
      });
    }
  }

  async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'mixing' },
      order: { syncedAt: 'DESC' },
    });
  }

  async getMixingLots(productionId: number) {
    const lots = await this.lotMixingRepo.find({
      where: { production: { id: productionId } },
      relations: ['worklogBinder', 'worklogSlurry'],
      order: { processDate: 'DESC' },
    });

    return lots.map((lot) => ({
      id: lot.id,
      lot: lot.lot,
      processDate: lot.processDate,
      binder: lot.worklogBinder
        ? {
            viscosity: Number(lot.worklogBinder.viscosity),
            solidContent1: Number(lot.worklogBinder.solidContent1),
            solidContent2: Number(lot.worklogBinder.solidContent2),
            solidContent3: Number(lot.worklogBinder.solidContent3),
          }
        : null,
      slurry: lot.worklogSlurry
        ? {
            tempHumi: lot.worklogSlurry.tempHumi,
            activeMaterialInput: Number(lot.worklogSlurry.material1ActualInput),
            viscosityAfterMixing: Number(lot.worklogSlurry.viscosityAfterMixing),
            viscosityAfterDefoaming: Number(lot.worklogSlurry.viscosityAfterDefoaming),
            viscosityAfterStabilization: Number(lot.worklogSlurry.viscosityAfterStabilization),
            solidContent1: Number(lot.worklogSlurry.solidContent1Percentage),
            solidContent2: Number(lot.worklogSlurry.solidContent2Percentage),
            solidContent3: Number(lot.worklogSlurry.solidContent3Percentage),
            grindGage: [
              lot.worklogSlurry.grindGageFineParticle1,
              lot.worklogSlurry.grindGageLine1,
              lot.worklogSlurry.grindGageNonCoating1,
            ].join('-'),
          }
        : null,
    }));
  }
}
