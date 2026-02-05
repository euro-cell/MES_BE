import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IQCSummary } from 'src/common/entities/iqc-summary.entity';
import { IQCListItem } from 'src/common/entities/iqc-list-item.entity';
import { IQCCathodeMaterial1 } from 'src/common/entities/iqc-cathode-material-1.entity';
import { IQCCathodeMaterial1Result } from 'src/common/entities/iqc-cathode-material-1-result.entity';
import { IQCCathodeMaterial1Image } from 'src/common/entities/iqc-cathode-material-1-image.entity';
import {
  CreateIQCSummaryDto,
  UpdateIQCSummaryDto,
  CreateIQCListItemDto,
  UpdateIQCListItemDto,
} from 'src/common/dtos/iqc-summary.dto';
import {
  CreateIQCCathodeMaterial1Dto,
  UpdateIQCCathodeMaterial1Dto,
} from 'src/common/dtos/iqc-cathode-material-1.dto';

@Injectable()
export class IqcService {
  constructor(
    @InjectRepository(IQCSummary)
    private readonly iqcSummaryRepository: Repository<IQCSummary>,
    @InjectRepository(IQCListItem)
    private readonly iqcListItemRepository: Repository<IQCListItem>,
    @InjectRepository(IQCCathodeMaterial1)
    private readonly cathodeMaterial1Repository: Repository<IQCCathodeMaterial1>,
    @InjectRepository(IQCCathodeMaterial1Result)
    private readonly cathodeMaterial1ResultRepository: Repository<IQCCathodeMaterial1Result>,
    @InjectRepository(IQCCathodeMaterial1Image)
    private readonly cathodeMaterial1ImageRepository: Repository<IQCCathodeMaterial1Image>,
    private readonly dataSource: DataSource,
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

  // ===== 양극재1 검사 관련 =====

  async getCathodeMaterial1(productionId: number): Promise<IQCCathodeMaterial1 | null> {
    return this.cathodeMaterial1Repository.findOne({
      where: { production: { id: productionId } },
      relations: ['production', 'results', 'images'],
    });
  }

  async upsertCathodeMaterial1(
    productionId: number,
    dto: CreateIQCCathodeMaterial1Dto | UpdateIQCCathodeMaterial1Dto,
  ): Promise<IQCCathodeMaterial1> {
    return this.dataSource.transaction(async (manager) => {
      // 1. 기존 데이터 확인
      let cathodeMaterial1 = await manager.findOne(IQCCathodeMaterial1, {
        where: { production: { id: productionId } },
        relations: ['results', 'images'],
      });

      if (cathodeMaterial1) {
        // 기존 데이터 업데이트
        cathodeMaterial1.inspectionDate = dto.inspectionDate ? new Date(dto.inspectionDate) : null;
        cathodeMaterial1.lot = dto.lot || null;
        cathodeMaterial1.manufacturer = dto.manufacturer || null;
        cathodeMaterial1.coaReference = dto.coaReference || null;
        cathodeMaterial1.remarks = dto.remarks || null;

        // 기존 결과 및 이미지 삭제
        if (cathodeMaterial1.results?.length > 0) {
          await manager.delete(IQCCathodeMaterial1Result, {
            cathodeMaterial1: { id: cathodeMaterial1.id },
          });
        }
        if (cathodeMaterial1.images?.length > 0) {
          await manager.delete(IQCCathodeMaterial1Image, {
            cathodeMaterial1: { id: cathodeMaterial1.id },
          });
        }

        cathodeMaterial1 = await manager.save(cathodeMaterial1);
      } else {
        // 신규 생성
        cathodeMaterial1 = manager.create(IQCCathodeMaterial1, {
          production: { id: productionId },
          inspectionDate: dto.inspectionDate ? new Date(dto.inspectionDate) : null,
          lot: dto.lot || null,
          manufacturer: dto.manufacturer || null,
          coaReference: dto.coaReference || null,
          remarks: dto.remarks || null,
        });

        cathodeMaterial1 = await manager.save(cathodeMaterial1);
      }

      // 2. 검사 결과 저장
      if (dto.results && dto.results.length > 0) {
        const results = dto.results.map((result) =>
          manager.create(IQCCathodeMaterial1Result, {
            cathodeMaterial1: { id: cathodeMaterial1.id },
            item: result.item,
            standard: result.standard || null,
            result: result.result || null,
            pass: result.pass,
          }),
        );
        await manager.save(results);
      }

      // 3. 이미지 저장
      if (dto.images && dto.images.length > 0) {
        const images = dto.images.map((image) =>
          manager.create(IQCCathodeMaterial1Image, {
            cathodeMaterial1: { id: cathodeMaterial1.id },
            imageUrl: image.imageUrl,
          }),
        );
        await manager.save(images);
      }

      // 4. 양극재 부적합 수 계산 및 업데이트 (양극재1 + 양극재2)
      await this.updateCathodeNonConformityCount(productionId, manager);

      // 5. 최종 데이터 반환
      const result = await manager.findOne(IQCCathodeMaterial1, {
        where: { id: cathodeMaterial1.id },
        relations: ['production', 'results', 'images'],
      });

      if (!result) {
        throw new NotFoundException('Failed to retrieve saved cathode material 1 data');
      }

      return result;
    });
  }

  /**
   * 양극재 부적합 수 계산 및 업데이트
   * 양극재1과 양극재2의 불합격 개수를 합산하여 업데이트
   */
  private async updateCathodeNonConformityCount(
    productionId: number,
    manager?: any,
  ): Promise<void> {
    const repo = manager || this.cathodeMaterial1ResultRepository;

    // 양극재1 불합격 개수
    const cathode1FailCount = await repo.count({
      where: {
        cathodeMaterial1: { production: { id: productionId } },
        pass: false,
      },
    });

    // TODO: 양극재2 구현 시 추가
    // 현재는 양극재1만 계산
    const totalFailCount = cathode1FailCount;

    // Summary 업데이트
    await this.updateNonConformityCount(
      productionId,
      'nonConformityCathode',
      totalFailCount,
    );
  }
}
