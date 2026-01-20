import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamableFile } from '@nestjs/common';
import { Maintenance } from 'src/common/entities/maintenance.entity';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from 'src/common/dtos/maintenance.dto';
import { ExcelService } from 'src/common/services/excel.service';
import { ExcelUtil } from 'src/common/utils/excel.util';
import * as ExcelJS from 'exceljs';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    private readonly excelService: ExcelService,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create(createMaintenanceDto);
    return this.maintenanceRepository.save(maintenance);
  }

  async findAll() {
    const maintenances = await this.maintenanceRepository.find({
      relations: ['equipment'],
      order: { inspectionDate: 'ASC' },
    });

    return maintenances.map((m) => ({
      id: m.id,
      equipmentId: m.equipmentId,
      assetNo: m.equipment?.assetNo,
      equipmentNo: m.equipment?.equipmentNo,
      equipmentName: m.equipment?.name,
      inspectionDate: m.inspectionDate,
      replacementHistory: m.replacementHistory,
      usedParts: m.usedParts,
      maintainer: m.maintainer,
      verifier: m.verifier,
      remark: m.remark,
    }));
  }

  async update(id: number, updateMaintenanceDto: UpdateMaintenanceDto) {
    await this.maintenanceRepository.update(id, updateMaintenanceDto);
    return this.maintenanceRepository.findOneBy({ id });
  }

  async remove(id: number) {
    return this.maintenanceRepository.delete(id);
  }

  async exportMaintenance(): Promise<StreamableFile> {
    const maintenanceData = await this.findAll();

    return this.excelService.generateExcel({
      templateName: 'equipment/maintenance_template.xlsx',
      title: '유지보수 관리 대장',
      data: maintenanceData,
      dataMapper: (maintenance, row, rowIndex) => {
        this.mapMaintenanceToRow(maintenance, row, rowIndex);
      },
      headerRows: 3,
      updateHeader: false,
    });
  }

  private mapMaintenanceToRow(maintenance: any, row: ExcelJS.Row, rowIndex: number): void {
    const heights: number[] = [];

    // B열: 번호 (1부터 시작)
    row.getCell('B').value = rowIndex + 1;

    // C-K열: 유지보수 데이터
    row.getCell('C').value = ExcelUtil.formatDate(maintenance.inspectionDate);
    row.getCell('D').value = ExcelUtil.sanitizeValue(maintenance.assetNo);
    row.getCell('E').value = ExcelUtil.sanitizeValue(maintenance.equipmentNo);
    row.getCell('F').value = ExcelUtil.sanitizeValue(maintenance.equipmentName);
    row.getCell('G').value = ExcelUtil.sanitizeValue(maintenance.replacementHistory);
    row.getCell('H').value = ExcelUtil.sanitizeValue(maintenance.usedParts);
    row.getCell('I').value = ExcelUtil.sanitizeValue(maintenance.maintainer);
    row.getCell('J').value = ExcelUtil.sanitizeValue(maintenance.verifier);
    row.getCell('K').value = ExcelUtil.sanitizeValue(maintenance.remark);

    // 긴 텍스트 셀에 대해 높이 계산
    heights.push(ExcelUtil.calculateRowHeight(maintenance.replacementHistory, 20)); // 교체이력
    heights.push(ExcelUtil.calculateRowHeight(maintenance.usedParts, 20)); // 사용부품
    heights.push(ExcelUtil.calculateRowHeight(maintenance.remark, 20)); // 비고

    // B열부터 K열까지 테두리 및 자동 줄바꿈 적용
    for (let col = 'B'.charCodeAt(0); col <= 'K'.charCodeAt(0); col++) {
      const cell = row.getCell(String.fromCharCode(col));
      ExcelUtil.applyCellBorder(cell);
      ExcelUtil.applyWrapText(cell);
    }

    // 행 높이 설정 (최대 높이 사용)
    row.height = ExcelUtil.getMaxHeight(heights);
  }

  getMaintenanceExportFilename(): string {
    return '유지보수_관리대장.xlsx';
  }
}
