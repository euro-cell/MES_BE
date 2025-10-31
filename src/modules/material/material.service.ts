import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from 'src/common/entities/material.entity';
import { ProductionMaterial } from 'src/common/entities/production-material.entity';
import { Production } from 'src/common/entities/production.entity';
import { MaterialProcess } from 'src/common/enums/material.enum';
import { Repository } from 'typeorm';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
  ) {}

  async findAllMaterials() {
    return this.materialRepository.find({ order: { id: 'ASC' } });
  }

  async findByElectrode() {
    return this.materialRepository.find({ where: { process: MaterialProcess.ELECTRODE } });
  }

  async findByAssembly() {
    return this.materialRepository.find({ where: { process: MaterialProcess.ASSEMBLY } });
  }

  async findByMaterialProduction() {
    const productions = await this.productionRepository.find({ order: { id: 'DESC' }, relations: ['productionMaterials'] });
    const result = productions.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      mode: p.mode,
      year: p.year,
      month: p.month,
      round: p.round,
      batteryType: p.batteryType,
      capacity: p.capacity,
      hasMaterials: p.productionMaterials && p.productionMaterials.length > 0,
    }));
    return result;
  }

  async getDistinctCategories() {
    const categories = await this.materialRepository
      .createQueryBuilder('material')
      .select('DISTINCT material.category', 'category')
      .orderBy('material.category', 'ASC')
      .getRawMany();
    return categories.map((c) => c.category);
  }
}
