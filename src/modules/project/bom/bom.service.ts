import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomTemplate } from 'src/common/entities/bom/bom-template.entity';
import { BomTemplateRow } from 'src/common/entities/bom/bom-template-row.entity';
import { Material } from 'src/common/entities/material/material.entity';
import { CreateBomTemplateDto } from 'src/common/dtos/bom/bom.dto';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(BomTemplate)
    private readonly bomTemplateRepo: Repository<BomTemplate>,
    @InjectRepository(BomTemplateRow)
    private readonly bomTemplateRowRepo: Repository<BomTemplateRow>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async createTemplate(dto: CreateBomTemplateDto): Promise<{ id: number; name: string }> {
    if (!dto.rows || dto.rows.length === 0) {
      throw new BadRequestException('rows는 최소 1개 이상이어야 합니다.');
    }

    const materialIds = dto.rows.map((r) => r.materialId);
    const materials = await this.materialRepo.findByIds(materialIds);
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
