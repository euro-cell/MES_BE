import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IQCSummary } from 'src/common/entities/iqc-summary.entity';
import { IQCListItem } from 'src/common/entities/iqc-list-item.entity';
import {
  CreateIQCSummaryDto,
  UpdateIQCSummaryDto,
  CreateIQCListItemDto,
  UpdateIQCListItemDto,
} from 'src/common/dtos/iqc-summary.dto';

@Injectable()
export class IqcService {
  constructor(
    @InjectRepository(IQCSummary)
    private readonly iqcSummaryRepository: Repository<IQCSummary>,
    @InjectRepository(IQCListItem)
    private readonly iqcListItemRepository: Repository<IQCListItem>,
  ) {}

  async getSummary(productionId: number): Promise<IQCSummary | null> {
    return this.iqcSummaryRepository.findOne({
      where: { production: { id: productionId } },
      relations: ['production'],
    });
  }

  async upsertSummary(
    productionId: number,
    dto: CreateIQCSummaryDto | UpdateIQCSummaryDto,
  ): Promise<IQCSummary> {
    const existing = await this.iqcSummaryRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.iqcSummaryRepository.save(existing);
    }

    const newSummary = this.iqcSummaryRepository.create({
      production: { id: productionId },
      ...dto,
    });

    return this.iqcSummaryRepository.save(newSummary);
  }

  async getListItems(productionId: number): Promise<IQCListItem[]> {
    return this.iqcListItemRepository.find({
      where: { production: { id: productionId } },
      relations: ['production'],
      order: { createdAt: 'ASC' },
    });
  }

  async createListItem(
    productionId: number,
    dto: CreateIQCListItemDto,
  ): Promise<IQCListItem> {
    const newItem = this.iqcListItemRepository.create({
      production: { id: productionId },
      ...dto,
    });

    return this.iqcListItemRepository.save(newItem);
  }

  async updateListItem(
    itemId: number,
    dto: UpdateIQCListItemDto,
  ): Promise<IQCListItem> {
    const item = await this.iqcListItemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`IQC List Item with ID ${itemId} not found`);
    }

    Object.assign(item, dto);
    return this.iqcListItemRepository.save(item);
  }

  async deleteListItem(itemId: number): Promise<void> {
    const result = await this.iqcListItemRepository.delete(itemId);

    if (result.affected === 0) {
      throw new NotFoundException(`IQC List Item with ID ${itemId} not found`);
    }
  }

  /**
   * 부적합 수 자동 업데이트 메서드
   * 각 검사 데이터 Service에서 호출하여 IQCSummary의 부적합 수를 업데이트
   *
   * @param productionId - 생산 ID
   * @param field - 업데이트할 필드명 (예: 'nonConformityCathode')
   * @param count - 부적합 수
   */
  async updateNonConformityCount(
    productionId: number,
    field: keyof Pick<
      IQCSummary,
      | 'nonConformityCathode'
      | 'nonConformityAnode'
      | 'nonConformityConductive'
      | 'nonConformityCollector'
      | 'nonConformitySeparator'
      | 'nonConformityElectrolyte'
      | 'nonConformityPouch'
      | 'nonConformityLeadTab'
    >,
    count: number,
  ): Promise<void> {
    let summary = await this.iqcSummaryRepository.findOne({
      where: { production: { id: productionId } },
    });

    if (!summary) {
      // Summary가 없으면 새로 생성
      summary = this.iqcSummaryRepository.create({
        production: { id: productionId },
        [field]: count,
      });
    } else {
      // 기존 Summary 업데이트
      summary[field] = count;
    }

    await this.iqcSummaryRepository.save(summary);
  }
}
