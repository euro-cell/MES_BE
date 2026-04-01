import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProjectMaterialDto, UpdateProjectMaterialDto } from 'src/common/dtos/project/project-material.dto';
import { Material } from 'src/common/entities/material/material.entity';
import { ProjectMaterial } from 'src/common/entities/project/project-material.entity';
import { Project } from 'src/common/entities/project/project.entity';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class ProductMaterialService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMaterial)
    private readonly projectMaterialRepository: Repository<ProjectMaterial>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    private readonly dataSource: DataSource,
  ) {}

  async createMaterial(projectId: number, dto: CreateProjectMaterialDto) {
    try {
      const project = await this.projectRepository.findOneByOrFail({ id: projectId });

      await this.projectMaterialRepository.delete({ project: { id: projectId } });

      const materials = dto.materials.map((item) =>
        this.projectMaterialRepository.create({
          project,
          classification: item.classification,
          category: item.category,
          material: item.type,
          model: item.name,
          company: item.company,
          requiredAmount: item.quantity,
          unit: item.unit,
        }),
      );
      return await this.projectMaterialRepository.save(materials);
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new NotFoundException('해당 프로젝트를 찾을 수 없습니다.');
    }
  }

  async findOneMaterial(projectId: number) {
    const currentMaterials = await this.projectMaterialRepository.find({
      where: { project: { id: projectId } },
      order: { classification: 'ASC', category: 'ASC' },
    });

    if (!currentMaterials.length) throw new NotFoundException('해당 생산 자재 소요량을 찾을 수 없습니다.');

    const allProjectMaterials = await this.projectMaterialRepository.find({ relations: ['project'] });

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

        const otherProjectsUsage = allProjectMaterials
          .filter((p) => p.model.trim() === key && p.project?.id !== projectId)
          .reduce((sum, p) => sum + p.requiredAmount, 0);

        const usedBefore = localUsage[key] ?? 0;

        const availableStock = totalStock - (otherProjectsUsage + usedBefore + item.requiredAmount);

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
    return { projectId, materials: grouped };
  }

  async updateMaterial(projectId: number, dto: UpdateProjectMaterialDto) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('해당 생산 자재 소요량을 찾을 수 없습니다.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(ProjectMaterial, { project: { id: projectId } });

      const newMaterials = (dto.materials ?? []).map((m) =>
        queryRunner.manager.create(ProjectMaterial, {
          project,
          classification: m.classification,
          category: m.category,
          material: m.type,
          model: m.name,
          company: m.company,
          unit: m.unit,
          requiredAmount: m.quantity,
        }),
      );

      await queryRunner.manager.save(ProjectMaterial, newMaterials);

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

  async removeMaterial(projectId: number) {
    const existing = await this.projectMaterialRepository.find({ where: { project: { id: projectId } } });
    if (!existing.length) throw new NotFoundException('삭제할 자재 소요량을 찾을 수 없습니다.');
    return await this.projectMaterialRepository.remove(existing);
  }
}
