import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBatteryDesignDto } from 'src/common/dtos/specification.dto';
import { Production } from 'src/common/entities/production.entity';
import { Specification } from 'src/common/entities/specification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectRepository(Specification)
    private readonly specificationRepository: Repository<Specification>,

    @InjectRepository(Production)
    private readonly productionRepository: Repository<any>,
  ) {}

  async createSpecification(productionId: number, dto: CreateBatteryDesignDto) {
    const production = await this.productionRepository.findOne({ where: { id: productionId } });
    if (!production) throw new NotFoundException('해당 생산 정보를 찾을 수 없습니다.');

    let specification = await this.specificationRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (specification) {
      specification.cathode = dto.cathode;
      specification.anode = dto.anode;
      specification.assembly = dto.assembly;
      specification.cell = dto.cell;
    } else {
      specification = this.specificationRepository.create({
        production,
        cathode: dto.cathode,
        anode: dto.anode,
        assembly: dto.assembly,
        cell: dto.cell,
      });
    }
    return await this.specificationRepository.save(specification);
  }
}
