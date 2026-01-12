import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LqcSpec } from 'src/common/entities/lqc-spec.entity';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';

@Injectable()
export class LqcService {
  constructor(
    @InjectRepository(LqcSpec)
    private readonly lqcSpecRepository: Repository<LqcSpec>,
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
}
