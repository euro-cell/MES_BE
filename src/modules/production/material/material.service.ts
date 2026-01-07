import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductionMaterialDto, UpdateProductionMaterialDto } from 'src/common/dtos/production-material.dto';
import { Material } from 'src/common/entities/material.entity';
import { ProductionMaterial } from 'src/common/entities/production-material.entity';
import { Production } from 'src/common/entities/production.entity';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class ProductMaterialService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    @InjectRepository(ProductionMaterial)
    private readonly productionMaterRepository: Repository<ProductionMaterial>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    private readonly dataSource: DataSource,
  ) {}

  async createMaterial(productionId: number, dto: CreateProductionMaterialDto) {
    try {
      const production = await this.productionRepository.findOneByOrFail({ id: productionId });

      await this.productionMaterRepository.delete({ production: { id: productionId } });

      const materials = dto.materials.map((item) =>
        this.productionMaterRepository.create({
          production,
          classification: item.classification,
          category: item.category,
          material: item.type,
          model: item.name,
          company: item.company,
          requiredAmount: item.quantity,
          unit: item.unit,
        }),
      );
      return await this.productionMaterRepository.save(materials);
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
    }
  }

  async findOneMaterial(productionId: number) {
    const currentMaterials = await this.productionMaterRepository.find({
      where: { production: { id: productionId } },
      order: { classification: 'ASC', category: 'ASC' },
    });

    if (!currentMaterials.length) throw new NotFoundException('해당 생산 자재 소요량을 찾을 수 없습니다.');

    const allProductionMaterials = await this.productionMaterRepository.find({ relations: ['production'] });

    const allMaterials = await this.materialRepository.find();

    const stockMap = allMaterials.reduce(
      (acc, mat) => {
        const key = mat.name.trim();
        acc[key] = (acc[key] || 0) + (mat.stock || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    const localUsage: Record<string, number> = {};

    const grouped = currentMaterials.reduce(
      (acc, item) => {
        const key = item.model.trim();
        const totalStock = stockMap[key] ?? 0;

        const otherProductsUsage = allProductionMaterials
          .filter((p) => p.model.trim() === key && p.production?.id !== productionId)
          .reduce((sum, p) => sum + p.requiredAmount, 0);

        const usedBefore = localUsage[key] ?? 0;

        const availableStock = totalStock - (otherProductsUsage + usedBefore + item.requiredAmount);

        localUsage[key] = usedBefore + item.requiredAmount;

        const shortage = availableStock;

        acc[item.classification] = acc[item.classification] || [];
        acc[item.classification].push({
          category: item.category,
          material: item.material,
          model: item.model,
          company: item.company,
          unit: item.unit,
          requiredAmount: item.requiredAmount,
          availableStock,
          shortage,
        });
        return acc;
      },
      {} as Record<string, any[]>,
    );
    return { productionId, materials: grouped };
  }

  async updateMaterial(productionId: number, dto: UpdateProductionMaterialDto) {
    const production = await this.productionRepository.findOne({ where: { id: productionId } });
    if (!production) throw new NotFoundException('해당 생산 자재 소요량을 찾을 수 없습니다.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(ProductionMaterial, { production: { id: productionId } });

      const newMaterials = (dto.materials ?? []).map((m) =>
        queryRunner.manager.create(ProductionMaterial, {
          production,
          classification: m.classification,
          category: m.category,
          material: m.type,
          model: m.name,
          company: m.company,
          unit: m.unit,
          requiredAmount: m.quantity,
        }),
      );

      await queryRunner.manager.save(ProductionMaterial, newMaterials);

      await queryRunner.commitTransaction();

      console.log('✅ [자재 수정 완료]', newMaterials.length, '건 갱신됨');
      return { message: '자재 소요량이 수정되었습니다.', count: newMaterials.length };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ 자재 수정 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeMaterial(productionId: number) {
    const existing = await this.productionMaterRepository.find({ where: { production: { id: productionId } } });
    if (!existing.length) throw new NotFoundException('삭제할 자재 소요량을 찾을 수 없습니다.');
    return await this.productionMaterRepository.remove(existing);
  }
}
