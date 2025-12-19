import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { LotCoating } from '../../../../common/entities/lots/lot-02-coating.entity';
import { LotSync } from '../../../../common/entities/lots/lot-sync.entity';
import { WorklogCoating } from '../../../../common/entities/worklogs/worklog-03-coating.entity';
import { WorklogSlurry } from '../../../../common/entities/worklogs/worklog-02-slurry.entity';

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
  ) {}

  async sync(productionId: number) {
    const lastSync = await this.getLastSync(productionId);

    const coatingWorklogs = await this.worklogCoatingRepo.find({
      where: lastSync
        ? { production: { id: productionId }, createdAt: MoreThan(lastSync.syncedAt) }
        : { production: { id: productionId } },
    });

    for (const coating of coatingWorklogs) {
      const lots = [
        coating.coatingLot1,
        coating.coatingLot2,
        coating.coatingLot3,
        coating.coatingLot4,
      ].filter((lot) => lot);

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
}
