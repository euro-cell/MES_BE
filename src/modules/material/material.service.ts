import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from 'src/common/entities/material.entity';
import { MaterialProcess } from 'src/common/enums/material.enum';
import { Repository } from 'typeorm';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
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
}
