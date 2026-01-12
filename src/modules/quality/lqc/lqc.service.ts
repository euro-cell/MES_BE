import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LqcSpec } from 'src/common/entities/lqc-spec.entity';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';
import { CreateLqcSpecDto } from 'src/common/dtos/lqc-spec.dto';
import { WorklogBinder } from 'src/common/entities/worklogs/worklog-01-binder.entity';
import { WorklogSlurry } from 'src/common/entities/worklogs/worklog-02-slurry.entity';

@Injectable()
export class LqcService {
  constructor(
    @InjectRepository(LqcSpec)
    private readonly lqcSpecRepository: Repository<LqcSpec>,
    @InjectRepository(WorklogBinder)
    private readonly worklogBinderRepository: Repository<WorklogBinder>,
    @InjectRepository(WorklogSlurry)
    private readonly worklogSlurryRepository: Repository<WorklogSlurry>,
  ) {}

  async getSpec(productionId: number, processType?: LqcProcessType, itemType?: LqcItemType): Promise<LqcSpec[]> {
    const query = this.lqcSpecRepository.createQueryBuilder('spec').where('spec.production_id = :productionId', { productionId });

    if (processType) {
      query.andWhere('spec.processType = :processType', { processType });
    }

    if (itemType) {
      query.andWhere('spec.itemType = :itemType', { itemType });
    }

    return query.getMany();
  }

  async upsertSpec(productionId: number, dto: CreateLqcSpecDto): Promise<LqcSpec> {
    const existing = await this.lqcSpecRepository.findOne({
      where: {
        production: { id: productionId },
        processType: dto.processType,
        itemType: dto.itemType,
      },
    });

    if (existing) {
      existing.specs = dto.specs;
      return this.lqcSpecRepository.save(existing);
    }

    const newSpec = this.lqcSpecRepository.create({
      production: { id: productionId },
      processType: dto.processType,
      itemType: dto.itemType,
      specs: dto.specs,
    });

    return this.lqcSpecRepository.save(newSpec);
  }

  async getBinderWorklogData(productionId: number, electrode?: 'A' | 'C') {
    const query = this.worklogBinderRepository
      .createQueryBuilder('binder')
      .select([
        'binder.id',
        'binder.manufactureDate',
        'binder.lot',
        'binder.solidContent1',
        'binder.solidContent2',
        'binder.solidContent3',
        'binder.viscosity',
      ])
      .where('binder.production_id = :productionId', { productionId });

    if (electrode) {
      // LOT 5번째 인덱스(index 4)로 양극(C)/음극(A) 구분
      query.andWhere('SUBSTRING(binder.lot, 5, 1) = :electrode', { electrode });
    }

    query.orderBy('binder.manufactureDate', 'DESC');

    return query.getMany();
  }

  async getSlurryWorklogData(productionId: number, electrode?: 'A' | 'C') {
    const query = this.worklogSlurryRepository
      .createQueryBuilder('slurry')
      .select([
        'slurry.id',
        'slurry.manufactureDate',
        'slurry.lot',
        'slurry.solidContent1Percentage',
        'slurry.solidContent2Percentage',
        'slurry.solidContent3Percentage',
        'slurry.grindGageFineParticle2',
        'slurry.viscosityAfterStabilization',
      ])
      .where('slurry.production_id = :productionId', { productionId });

    if (electrode) {
      query.andWhere('SUBSTRING(slurry.lot, 5, 1) = :electrode', { electrode });
    }

    query.orderBy('slurry.manufactureDate', 'DESC');

    return query.getMany();
  }
}
