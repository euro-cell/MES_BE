import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMaterialDto } from 'src/common/dtos/production-material.dto';
import { ProductionMaterial } from 'src/common/entities/production-material.entity';
import { Production } from 'src/common/entities/production.entity';
import { EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class ProductMaterialService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    @InjectRepository(ProductionMaterial)
    private readonly productionMaterRepossitory: Repository<ProductionMaterial>,
  ) {}

  async createMaterial(productionId: number, dto: CreateMaterialDto) {
    try {
      const production = await this.productionRepository.findOneByOrFail({ id: productionId });

      await this.productionMaterRepossitory.delete({ production: { id: productionId } });

      const materials = dto.materials.map((item) =>
        this.productionMaterRepossitory.create({
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
      return await this.productionMaterRepossitory.save(materials);
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
    }
  }

  async findOneMaterial(productionId: number) {
    const materials = await this.productionMaterRepossitory.find({
      where: { production: { id: productionId } },
      order: { classification: 'ASC', category: 'ASC' },
    });
    if (!materials.length) throw new NotFoundException('해당 생산 자재 소요량을 찾을 수 없습니다.');

    const grouped = materials.reduce(
      (acc, item) => {
        acc[item.classification] = acc[item.classification] || [];
        acc[item.classification].push({
          category: item.category,
          material: item.material,
          model: item.model,
          company: item.company,
          unit: item.unit,
          requiredAmount: item.requiredAmount,
        });
        return acc;
      },
      {} as Record<string, any[]>,
    );
    return { productionId, materials: grouped };
  }
}
