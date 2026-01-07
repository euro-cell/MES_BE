import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import { CellGrade } from 'src/common/enums/cell-inventory.enum';
import {
  CreateCellInventoryDto,
  UpdateCellInventoryDto,
  ProjectStatisticsDto,
  GradeStatisticsDto,
} from 'src/common/dtos/cell-inventory.dto';

@Injectable()
export class CellInventoryService {
  constructor(
    @InjectRepository(CellInventory)
    private readonly cellInventoryRepository: Repository<CellInventory>,
  ) {}

  async create(dto: CreateCellInventoryDto) {
    const existing = await this.cellInventoryRepository.findOne({
      where: { lot: dto.lot, projectName: dto.projectName },
    });
    if (existing) throw new ConflictException('이미 입고된 셀입니다.');

    const cellInventory = this.cellInventoryRepository.create(dto);
    return await this.cellInventoryRepository.save(cellInventory);
  }

  async upsert(dto: UpdateCellInventoryDto) {
    const existing = await this.cellInventoryRepository.findOne({
      where: { lot: dto.lot },
    });

    if (existing && existing.isShipped) throw new ConflictException('이미 출고된 셀입니다.');

    const updateData: Partial<CellInventory> = { ...dto };

    if (dto.date) {
      updateData.shippingDate = new Date(dto.date);
      delete updateData.date;
    }
    updateData.isShipped = true;
    updateData.storageLocation = null;

    if (existing) {
      await this.cellInventoryRepository.update(existing.id, updateData);
      return await this.cellInventoryRepository.findOne({ where: { id: existing.id } });
    } else {
      const cellInventory = this.cellInventoryRepository.create(updateData);
      return await this.cellInventoryRepository.save(cellInventory);
    }
  }

  async restock(dto: CreateCellInventoryDto) {
    const existing = await this.cellInventoryRepository.findOne({
      where: { lot: dto.lot },
    });
    if (!existing) throw new NotFoundException('해당하는 셀이 없습니다.');
    if (!existing.isShipped) throw new ConflictException('출고된 이력이 없는 셀입니다.');

    const updateData: Partial<CellInventory> = {
      grade: dto.grade,
      storageLocation: dto.storageLocation,
      date: new Date(dto.date),
      projectName: dto.projectName,
      projectNo: dto.projectNo,
      model: dto.model,
      ncrGrade: dto.ncrGrade,
      deliverer: dto.deliverer,
      receiver: dto.receiver,
      details: dto.details,
      isRestocked: true,
      shippingDate: null,
      shippingStatus: null,
      isShipped: false,
    };

    await this.cellInventoryRepository.update(existing.id, updateData);
    return await this.cellInventoryRepository.findOne({ where: { id: existing.id } });
  }

  async getStatistics(): Promise<ProjectStatisticsDto[]> {
    const cells = await this.cellInventoryRepository.find({
      select: ['projectName', 'grade', 'isShipped'],
      order: { projectName: 'ASC', grade: 'ASC' },
    });

    const projectMap = new Map<string, Map<string, { inStock: number; shipped: number }>>();

    for (const cell of cells) {
      if (!projectMap.has(cell.projectName)) {
        projectMap.set(cell.projectName, new Map());
      }

      const gradeMap = projectMap.get(cell.projectName)!;
      if (!gradeMap.has(cell.grade)) {
        gradeMap.set(cell.grade, { inStock: 0, shipped: 0 });
      }

      const stats = gradeMap.get(cell.grade)!;
      stats.inStock += 1;
      if (cell.isShipped) {
        stats.shipped += 1;
      }
    }

    const result: ProjectStatisticsDto[] = [];
    const gradeValues = Object.values(CellGrade);

    for (const [projectName, gradeMap] of projectMap.entries()) {
      const grades: GradeStatisticsDto[] = [];
      let totalAvailable = 0;

      // 모든 등급에 대해 통계 생성 (없거나 0인 경우 null)
      for (const gradeValue of gradeValues) {
        const stats = gradeMap.get(gradeValue);

        if (stats && stats.inStock > 0) {
          const available = stats.inStock - stats.shipped;
          grades.push({
            grade: gradeValue as CellGrade,
            inStock: stats.inStock,
            shipped: stats.shipped || null,
            available: available || null,
          });
          totalAvailable += available;
        } else {
          grades.push({
            grade: gradeValue as CellGrade,
            inStock: null,
            shipped: null,
            available: null,
          });
        }
      }
      result.push({ projectName, grades, totalAvailable });
    }
    return result;
  }
}
