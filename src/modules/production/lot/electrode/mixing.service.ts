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

  private async getLastSync(productionId: number) {
    return this.lotSyncRepo.findOne({
      where: { production: { id: productionId }, process: 'mixing' },
      order: { syncedAt: 'DESC' },
    });
  }
}
