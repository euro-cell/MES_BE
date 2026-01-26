import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { StreamableFile } from '@nestjs/common';
import { Equipment } from 'src/common/entities/equipment.entity';
import { CreateEquipmentDto, UpdateEquipmentDto } from 'src/common/dtos/equipment.dto';
import { EquipmentCategory } from 'src/common/enums/equipment.enum';
import { ExcelService } from 'src/common/services/excel.service';
import { ExcelUtil } from 'src/common/utils/excel.util';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    private readonly excelService: ExcelService,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async findByCategory(category: EquipmentCategory): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { category },
      order: { id: 'ASC' },
    });
  }

  async findMixersByCategory(category: EquipmentCategory): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { category, name: ILike('%Mixer%') },
      order: { id: 'ASC' },
    });
  }

  async findIdByName(name: string): Promise<number | null> {
    const equipment = await this.equipmentRepository.findOne({
      where: { name },
      select: ['id'],
    });
    return equipment?.id || null;
  }

  async findNameById(id: number): Promise<string | null> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      select: ['name'],
    });
    return equipment?.name || null;
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    await this.equipmentRepository.update(id, updateEquipmentDto);
    return this.equipmentRepository.findOneBy({ id });
  }

  async remove(id: number) {
    return this.equipmentRepository.delete(id);
  }

  async exportEquipmentByCategory(category: EquipmentCategory): Promise<StreamableFile> {
    const equipments = await this.findByCategory(category);

    const templateName =
      category === EquipmentCategory.MEASUREMENT ? 'equipment/equipment_measurement_template.xlsx' : 'equipment/equipment_template.xlsx';

    const titleMap = {
      [EquipmentCategory.PRODUCTION]: '생산 설비 관리 대장',
      [EquipmentCategory.DEVELOPMENT]: '개발 설비 관리 대장',
      [EquipmentCategory.MEASUREMENT]: '측정 설비 관리 대장',
    };

    // 측정 설비는 P3/P4, 나머지는 L3/L4 사용
    const pageInfoCell = category === EquipmentCategory.MEASUREMENT ? 'P3' : 'L3';
    const dateCell = category === EquipmentCategory.MEASUREMENT ? 'P4' : 'L4';

    return this.excelService.generateExcel({
      templateName,
      title: titleMap[category],
      data: equipments,
      dataMapper: (equipment, row, rowIndex) => {
        this.mapEquipmentToRow(equipment, row, category, rowIndex);
      },
      pageInfoCell,
      dateCell,
    });
  }

  private mapEquipmentToRow(equipment: Equipment, row: ExcelJS.Row, category: EquipmentCategory, rowIndex: number): void {
    const worksheet = row.worksheet;
    const rowNumber = row.number;
    const heights: number[] = [];

    // C열: 번호 (1부터 시작)
    row.getCell('C').value = rowIndex + 1;

    if (category === EquipmentCategory.MEASUREMENT) {
      // 측정 설비: 12개 컬럼 (D열부터 시작)
      row.getCell('D').value = ExcelUtil.sanitizeValue(equipment.assetNo);
      row.getCell('E').value = ExcelUtil.sanitizeValue(equipment.equipmentNo);
      row.getCell('F').value = ExcelUtil.sanitizeValue(equipment.name);
      row.getCell('G').value = ExcelUtil.sanitizeValue(equipment.manufacturer);
      row.getCell('H').value = ExcelUtil.sanitizeValue(equipment.deviceNo);
      row.getCell('I').value = ExcelUtil.formatDate(equipment.purchaseDate);
      row.getCell('J').value = ExcelUtil.formatDate(equipment.calibrationDate);
      row.getCell('K').value = ExcelUtil.formatDate(equipment.nextCalibrationDate);
      row.getCell('L').value = ExcelUtil.sanitizeValue(equipment.calibrationAgency);
      row.getCell('M').value = ExcelUtil.sanitizeValue(equipment.grade);
      row.getCell('N').value = ExcelUtil.sanitizeValue(equipment.maintenanceMethod);
      row.getCell('O').value = ExcelUtil.sanitizeValue(equipment.remark);

      // 비고 열 병합 (O-P) - 이미 병합되어 있지 않은 경우만
      if (!row.getCell('O').isMerged) {
        worksheet.mergeCells(`O${rowNumber}:P${rowNumber}`);
      }

      // 긴 텍스트 셀에 대해 높이 계산
      heights.push(ExcelUtil.calculateRowHeight(equipment.remark, 30)); // 비고 (병합된 셀이라 너비 더 큼)
      heights.push(ExcelUtil.calculateRowHeight(equipment.maintenanceMethod, 15)); // 보전방법
    } else {
      // 생산/개발 설비: 8개 컬럼 (D열부터 시작)
      row.getCell('D').value = ExcelUtil.sanitizeValue(equipment.assetNo);
      row.getCell('E').value = ExcelUtil.sanitizeValue(equipment.equipmentNo);
      row.getCell('F').value = ExcelUtil.sanitizeValue(equipment.name);
      row.getCell('G').value = ExcelUtil.sanitizeValue(equipment.manufacturer);
      row.getCell('H').value = ExcelUtil.formatDate(equipment.purchaseDate);
      row.getCell('I').value = ExcelUtil.sanitizeValue(equipment.grade);
      row.getCell('J').value = ExcelUtil.sanitizeValue(equipment.maintenanceMethod);
      row.getCell('K').value = ExcelUtil.sanitizeValue(equipment.remark);

      // 비고 열 병합 (K-L) - 이미 병합되어 있지 않은 경우만
      if (!row.getCell('K').isMerged) {
        worksheet.mergeCells(`K${rowNumber}:L${rowNumber}`);
      }

      // 긴 텍스트 셀에 대해 높이 계산
      heights.push(ExcelUtil.calculateRowHeight(equipment.remark, 25)); // 비고 (병합된 셀이라 너비 더 큼)
      heights.push(ExcelUtil.calculateRowHeight(equipment.maintenanceMethod, 15)); // 보전방법
    }

    // C열부터 테두리 및 자동 줄바꿈 적용 (A, B 열 제외)
    const endColumn = category === EquipmentCategory.MEASUREMENT ? 'P' : 'L';
    for (let col = 'C'.charCodeAt(0); col <= endColumn.charCodeAt(0); col++) {
      const cell = row.getCell(String.fromCharCode(col));
      ExcelUtil.applyCellBorder(cell);
      ExcelUtil.applyWrapText(cell);
    }

    // 행 높이 설정 (최대 높이 사용)
    row.height = ExcelUtil.getMaxHeight(heights);
  }

  getEquipmentExportFilename(category: EquipmentCategory): string {
    const filenameMap = {
      [EquipmentCategory.PRODUCTION]: '생산_설비_관리대장.xlsx',
      [EquipmentCategory.DEVELOPMENT]: '개발_설비_관리대장.xlsx',
      [EquipmentCategory.MEASUREMENT]: '측정_설비_관리대장.xlsx',
    };

    return filenameMap[category];
  }
}
