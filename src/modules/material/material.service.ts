import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from 'src/common/entities/material.entity';
import { Production } from 'src/common/entities/production.entity';
import { MaterialProcess } from 'src/common/enums/material.enum';
import { Repository } from 'typeorm';
import { CreateMaterialDto, UpdateMaterialDto } from 'src/common/dtos/material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
  ) {}

  async findAllMaterials(category?: string) {
    const query = this.materialRepository.createQueryBuilder('material').where('material.deletedAt IS NULL');

    if (category) {
      query.andWhere('material.category = :category', { category });
      query.orderBy('material.name', 'ASC');
    } else {
      query.orderBy('material.id', 'ASC');
    }

    return query.getMany();
  }

  async findByElectrode(isZeroStock: boolean = false) {
    const query = this.materialRepository
      .createQueryBuilder('material')
      .where('material.process = :process', { process: MaterialProcess.ELECTRODE })
      .andWhere('material.deletedAt IS NULL');

    // 기본값: 재고가 있는 것만 조회
    if (!isZeroStock) {
      query.andWhere('material.stock > 0');
    }

    return query.orderBy('material.id', 'ASC').getMany();
  }

  async findByAssembly(isZeroStock: boolean = false) {
    const query = this.materialRepository
      .createQueryBuilder('material')
      .where('material.process = :process', { process: MaterialProcess.ASSEMBLY })
      .andWhere('material.deletedAt IS NULL');

    // 기본값: 재고가 있는 것만 조회
    if (!isZeroStock) {
      query.andWhere('material.stock > 0');
    }

    return query.orderBy('material.id', 'ASC').getMany();
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

  async createElectrodeMaterial(dto: CreateMaterialDto) {
    const material = this.materialRepository.create({
      ...dto,
      process: MaterialProcess.ELECTRODE,
    });
    return this.materialRepository.save(material);
  }

  async updateElectrodeMaterial(id: number, updateMaterialDto: UpdateMaterialDto) {
    await this.materialRepository.update(id, {
      ...updateMaterialDto,
      process: MaterialProcess.ELECTRODE,
    });
    return this.materialRepository.findOne({ where: { id } });
  }

  async deleteElectrodeMaterial(id: number, isHardDelete: boolean = false) {
    if (isHardDelete) {
      // 하드 딜리트: 데이터 완전 삭제
      return this.materialRepository.delete(id);
    } else {
      // 소프트 딜리트: deletedAt 설정
      return this.materialRepository.softDelete(id);
    }
  }
}
