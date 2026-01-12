import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LqcSpec } from 'src/common/entities/lqc-spec.entity';
import { LqcProcessType, LqcItemType } from 'src/common/enums/lqc.enum';
import { CreateLqcSpecDto } from 'src/common/dtos/lqc-spec.dto';

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
}
