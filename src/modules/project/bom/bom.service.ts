import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BomTemplate } from 'src/common/entities/bom/bom-template.entity';
import { BomTemplateRow } from 'src/common/entities/bom/bom-template-row.entity';
import { ProjectBom } from 'src/common/entities/bom/project-bom.entity';
import { Material } from 'src/common/entities/material/material.entity';
import { Project } from 'src/common/entities/project/project.entity';
import { CreateBomTemplateDto, LinkBomTemplateDto, UpdateBomTemplateDto } from 'src/common/dtos/bom/bom.dto';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(BomTemplate)
    private readonly bomTemplateRepo: Repository<BomTemplate>,
    @InjectRepository(BomTemplateRow)
    private readonly bomTemplateRowRepo: Repository<BomTemplateRow>,
    @InjectRepository(ProjectBom)
    private readonly projectBomRepo: Repository<ProjectBom>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async createTemplate(dto: CreateBomTemplateDto): Promise<{ id: number; name: string }> {
    if (!dto.rows || dto.rows.length === 0) {
      throw new BadRequestException('rows는 최소 1개 이상이어야 합니다.');
    }

    const materialIds = dto.rows.map((r) => r.materialId);
    const materials = await this.materialRepo.find({ where: { id: In(materialIds) } });
    const foundIds = new Set(materials.map((m) => m.id));
    for (const id of materialIds) {
      if (!foundIds.has(id)) {
        throw new BadRequestException(`존재하지 않는 자재 ID입니다: ${id}`);
      }
    }

    const template = new BomTemplate();
    template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.usdRate !== undefined) template.usdRate = dto.usdRate;
    if (dto.jpyRate !== undefined) template.jpyRate = dto.jpyRate;
    if (dto.eurRate !== undefined) template.eurRate = dto.eurRate;

    const saved = await this.bomTemplateRepo.save(template);

    const rows: BomTemplateRow[] = dto.rows.map((r) => {
      const row = new BomTemplateRow();
      row.classification = r.classification;
      if (r.yieldRate !== undefined) row.yieldRate = r.yieldRate;
      row.currency = r.currency;
      if (r.purchasePrice !== undefined) row.purchasePrice = r.purchasePrice;
      if (r.tariff !== undefined) row.tariff = r.tariff;
      if (r.etc !== undefined) row.etc = r.etc;
      row.netQty = r.netQty;
      row.bomTemplate = { id: saved.id } as BomTemplate;
      row.material = { id: r.materialId } as Material;
      return row;
    });

    await this.bomTemplateRowRepo.save(rows);

    return { id: saved.id, name: saved.name };
  }

  async findAllTemplates(): Promise<{ id: number; name: string; description: string; createdAt: Date }[]> {
    const templates = await this.bomTemplateRepo.find({
      order: { createdAt: 'DESC' },
    });

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      createdAt: t.createdAt,
    }));
  }

  async findTemplateById(id: number) {
    const template = await this.bomTemplateRepo.findOne({
      where: { id },
      relations: ['rows', 'rows.material'],
    });

    if (!template) {
      throw new NotFoundException('BOM 템플릿을 찾을 수 없습니다.');
    }

    return this.formatTemplateWithRows(template);
  }

  async updateTemplate(id: number, dto: UpdateBomTemplateDto) {
    const template = await this.bomTemplateRepo.findOne({ where: { id }, relations: ['rows'] });
    if (!template) throw new NotFoundException('BOM 템플릿을 찾을 수 없습니다.');

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.usdRate !== undefined) template.usdRate = dto.usdRate;
    if (dto.jpyRate !== undefined) template.jpyRate = dto.jpyRate;
    if (dto.eurRate !== undefined) template.eurRate = dto.eurRate;

    await this.bomTemplateRepo.save(template);

    if (dto.rows !== undefined) {
      const materialIds = dto.rows.map((r) => r.materialId);
      const materials = await this.materialRepo.find({ where: { id: In(materialIds) } });
      const foundIds = new Set(materials.map((m) => m.id));
      for (const mid of materialIds) {
        if (!foundIds.has(mid)) throw new BadRequestException(`존재하지 않는 자재 ID입니다: ${mid}`);
      }

      await this.bomTemplateRowRepo.delete({ bomTemplate: { id } });

      const rows: BomTemplateRow[] = dto.rows.map((r) => {
        const row = new BomTemplateRow();
        row.classification = r.classification;
        if (r.yieldRate !== undefined) row.yieldRate = r.yieldRate;
        row.currency = r.currency;
        if (r.purchasePrice !== undefined) row.purchasePrice = r.purchasePrice;
        if (r.tariff !== undefined) row.tariff = r.tariff;
        if (r.etc !== undefined) row.etc = r.etc;
        row.netQty = r.netQty;
        row.bomTemplate = { id } as BomTemplate;
        row.material = { id: r.materialId } as Material;
        return row;
      });

      await this.bomTemplateRowRepo.save(rows);
    }

    return this.findTemplateById(id);
  }

  async linkTemplate(projectId: number, dto: LinkBomTemplateDto): Promise<{ projectId: number; templateId: number }> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const template = await this.bomTemplateRepo.findOne({ where: { id: dto.templateId } });
    if (!template) throw new NotFoundException('BOM 템플릿을 찾을 수 없습니다.');

    const existing = await this.projectBomRepo.findOne({ where: { project: { id: projectId } } });

    if (existing) {
      existing.bomTemplate = template;
      await this.projectBomRepo.save(existing);
    } else {
      const link = new ProjectBom();
      link.project = project;
      link.bomTemplate = template;
      await this.projectBomRepo.save(link);
    }

    return { projectId, templateId: dto.templateId };
  }

  async findByProject(projectId: number) {
    const link = await this.projectBomRepo.findOne({
      where: { project: { id: projectId } },
      relations: ['bomTemplate', 'bomTemplate.rows', 'bomTemplate.rows.material'],
    });

    if (!link) throw new NotFoundException('연결된 BOM 템플릿이 없습니다.');

    return this.formatTemplateWithRows(link.bomTemplate);
  }

  private formatTemplateWithRows(template: BomTemplate) {
    return {
      id: template.id,
      name: template.name,
      description: template.description ?? '',
      usdRate: template.usdRate ?? null,
      jpyRate: template.jpyRate ?? null,
      eurRate: template.eurRate ?? null,
      rows: template.rows.map((row) => ({
        id: row.id,
        classification: row.classification,
        materialId: row.material?.id ?? null,
        materialType: row.material?.type ?? null,
        category: row.material?.category ?? null,
        product: row.material?.name ?? null,
        manufacturer: row.material?.company ?? null,
        unit: row.material?.unit ?? null,
        yieldRate: row.yieldRate !== null ? Number(row.yieldRate) : null,
        currency: row.currency,
        purchasePrice: row.purchasePrice !== null ? Number(row.purchasePrice) : null,
        tariff: row.tariff !== null ? Number(row.tariff) : null,
        etc: row.etc !== null ? Number(row.etc) : null,
        netQty: row.netQty !== null ? Number(row.netQty) : null,
      })),
    };
  }
}
