import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSpecificationDto } from 'src/common/dtos/specification.dto';
import { ProductionSpecification } from 'src/common/entities/production-specifications.entity';
import { Production } from 'src/common/entities/production.entity';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class ProductSpecificationService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    @InjectRepository(ProductionSpecification)
    private readonly productionSpecRepossitory: Repository<ProductionSpecification>,
  ) {}
  async createSpecification(productionId: number, dto: CreateSpecificationDto) {
    try {
      const production = await this.productionRepository.findOneByOrFail({ id: productionId });
      const productionSpec = await this.productionSpecRepossitory.create({
        production,
        cathode: dto.cathode,
        anode: dto.anode,
        assembly: dto.assembly,
        cell: dto.cell,
      });
      return await this.productionSpecRepossitory.save(productionSpec);
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
      if (error instanceof QueryFailedError) throw new ConflictException('이미 등록된 생산 계획이 있습니다.');
      throw error;
    }
  }
}
