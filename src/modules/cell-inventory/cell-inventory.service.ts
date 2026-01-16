import { Injectable, ConflictException, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellInventory } from 'src/common/entities/cell-inventory.entity';
import { CellGrade } from 'src/common/enums/cell-inventory.enum';
import {
  CreateCellInventoryDto,
  UpdateCellInventoryDto,
  ProjectStatisticsDto,
  GradeStatisticsDto,
  StorageUsageItemDto,
} from 'src/common/dtos/cell-inventory.dto';
import { ExcelService } from 'src/common/services/excel.service';
import { ExcelUtil } from 'src/common/utils/excel.util';
import { NcrService } from './ncr/ncr.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class CellInventoryService {
  constructor(
    @InjectRepository(CellInventory)
    private readonly cellInventoryRepository: Repository<CellInventory>,
    private readonly excelService: ExcelService,
    private readonly ncrService: NcrService,
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
      where: { lot: dto.lot, projectName: dto.projectName },
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
      where: { lot: dto.lot, projectName: dto.projectName },
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
      select: ['projectName', 'projectNo', 'grade', 'isShipped'],
      order: { projectName: 'ASC', projectNo: 'ASC', grade: 'ASC' },
    });

    // projectName + projectNo 조합으로 그룹핑
    const projectMap = new Map<
      string,
      {
        projectName: string;
        projectNo: string | null;
        grades: Map<string, { inStock: number; shipped: number }>;
      }
    >();

    for (const cell of cells) {
      const key = `${cell.projectName}::${cell.projectNo || ''}`;

      if (!projectMap.has(key)) {
        projectMap.set(key, {
          projectName: cell.projectName,
          projectNo: cell.projectNo,
          grades: new Map(),
        });
      }

      const project = projectMap.get(key)!;
      if (!project.grades.has(cell.grade)) {
        project.grades.set(cell.grade, { inStock: 0, shipped: 0 });
      }

      const stats = project.grades.get(cell.grade)!;
      stats.inStock += 1;
      if (cell.isShipped) {
        stats.shipped += 1;
      }
    }

    const result: ProjectStatisticsDto[] = [];
    const gradeValues = Object.values(CellGrade);

    for (const [, project] of projectMap.entries()) {
      const grades: GradeStatisticsDto[] = [];
      let totalAvailable = 0;

      // 모든 등급에 대해 통계 생성 (없거나 0인 경우 null)
      for (const gradeValue of gradeValues) {
        const stats = project.grades.get(gradeValue);

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
      result.push({
        projectName: project.projectName,
        projectNo: project.projectNo,
        grades,
        totalAvailable,
      });
    }
    return result;
  }

  async getStorageUsage(): Promise<Record<string, StorageUsageItemDto>> {
    const storageCapacity: Record<string, number> = {
      A: 96,
      B: 96,
      C: 96,
      D: 96,
      E: 96,
      F: 96,
      G: 64,
      H: 64,
      I: 64,
      J: 64,
    };

    const storageLocations: string[] = [];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const numbers = [1, 2, 3, 4, 5];

    for (const letter of letters) {
      for (const num of numbers) {
        storageLocations.push(`${letter}-${num}`);
      }
    }

    const result: Record<string, StorageUsageItemDto> = {};
    for (const location of storageLocations) {
      const letter = location.split('-')[0];
      const capacity = storageCapacity[letter] || 96;
      result[location] = {
        count: 0,
        capacity: capacity,
        usage: 0,
      };
    }

    const cells = await this.cellInventoryRepository.find({
      select: ['storageLocation', 'isShipped'],
      where: { isShipped: false },
    });

    for (const cell of cells) {
      if (cell.storageLocation && result[cell.storageLocation]) {
        result[cell.storageLocation].count += 1;
      }
    }

    for (const location of storageLocations) {
      const letter = location.split('-')[0];
      const capacity = storageCapacity[letter] || 96;
      result[location].usage = Math.round((result[location].count / capacity) * 100);
    }
    return result;
  }

  async getProjectCells(projectName: string) {
    return await this.cellInventoryRepository.find({
      where: { projectName },
      order: { lot: 'ASC', grade: 'ASC' },
    });
  }

  async downloadExcel(): Promise<StreamableFile> {
    const workbook = await this.excelService.loadTemplate('cell_inventory.xlsx');
    const worksheet = workbook.getWorksheet('셀 입출고 확인');
    if (!worksheet) {
      throw new NotFoundException('워크시트를 찾을 수 없습니다: 셀 입출고 확인');
    }

    // 프로젝트별 통계 데이터 조회
    const projectStats = await this.getProjectStatisticsForExcel();

    // 데이터 시작 행 (5행부터)
    const dataStartRow = 5;
    const rowsPerProject = 3;
    const templateTotalRow = 8; // 템플릿의 총 수량 행 위치
    const grades = [CellGrade.GOOD, CellGrade.NCR, CellGrade.NG];

    // 프로젝트가 2개 이상이면 행 삽입 필요
    const additionalProjects = Math.max(0, projectStats.length - 1);
    const rowsToInsert = additionalProjects * rowsPerProject;

    // 기존 데이터 영역의 병합 해제 (5~7행의 B열, D열)
    this.safeUnmergeCells(worksheet, `B${dataStartRow}:B${dataStartRow + 2}`);
    this.safeUnmergeCells(worksheet, `D${dataStartRow}:D${dataStartRow + 2}`);

    if (rowsToInsert > 0) {
      // 8행(총 수량 행) 위치에 행 삽입 - 총 수량 행이 아래로 밀림
      worksheet.spliceRows(templateTotalRow, 0, ...Array(rowsToInsert).fill([]));

      // 삽입된 행에 스타일 복사 (5~7행 기준)
      for (let i = 0; i < rowsToInsert; i++) {
        const sourceRowNum = dataStartRow + (i % rowsPerProject);
        const targetRowNum = templateTotalRow + i;
        this.copyRowStyle(worksheet, sourceRowNum, targetRowNum);
      }
    }

    // 총합계 변수
    let grandTotalAvailable = 0;
    let grandTotalInStock = 0;
    let grandTotalShipped = 0;

    // 각 프로젝트 데이터 채우기
    for (let i = 0; i < projectStats.length; i++) {
      const project = projectStats[i];
      const startRow = dataStartRow + i * rowsPerProject;

      // B열: 프로젝트명 (3행 병합)
      const projectNameCell = worksheet.getCell(`B${startRow}`);
      projectNameCell.value = project.projectNo ? `${project.projectName}(${project.projectNo})` : project.projectName;

      // B열 3행 병합
      this.safeMergeCells(worksheet, `B${startRow}:B${startRow + 2}`);
      projectNameCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // D열: 총합 (3행 병합)
      const totalCell = worksheet.getCell(`D${startRow}`);
      totalCell.value = project.totalAvailable;
      // D열 3행 병합
      this.safeMergeCells(worksheet, `D${startRow}:D${startRow + 2}`);
      totalCell.alignment = { vertical: 'middle', horizontal: 'center' };

      grandTotalAvailable += project.totalAvailable;

      // 각 등급별 데이터 채우기
      for (let j = 0; j < grades.length; j++) {
        const rowNum = startRow + j;
        const gradeData = project.grades[grades[j]];

        // C열: 등급
        worksheet.getCell(`C${rowNum}`).value = grades[j];

        // E열: 보유 수량
        worksheet.getCell(`E${rowNum}`).value = gradeData.available;

        // F열: 총 입고량
        worksheet.getCell(`F${rowNum}`).value = gradeData.inStock;

        // G열: 총 출고량
        worksheet.getCell(`G${rowNum}`).value = gradeData.shipped;

        // H열: 기타 (빈 값)
        worksheet.getCell(`H${rowNum}`).value = '';

        grandTotalInStock += gradeData.inStock;
        grandTotalShipped += gradeData.shipped;

        // 테두리 적용
        for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
          ExcelUtil.applyCellBorder(worksheet.getCell(`${col}${rowNum}`));
        }
      }
    }

    // 총 수량 행 (삽입된 행만큼 밀린 위치)
    const totalRow = templateTotalRow + rowsToInsert;

    // 총 수량 행 데이터 업데이트 (템플릿에 이미 병합/스타일 있음)
    worksheet.getCell(`B${totalRow}`).value = '창고 내 총 셀 수량';
    worksheet.getCell(`D${totalRow}`).value = grandTotalAvailable;
    worksheet.getCell(`F${totalRow}`).value = grandTotalInStock;
    worksheet.getCell(`G${totalRow}`).value = grandTotalShipped;

    // ===== 시트2: NCR 세부 수량 파악 =====
    await this.fillNcrSheet(workbook);

    const buffer = await workbook.xlsx.writeBuffer();
    return new StreamableFile(Buffer.from(buffer));
  }

  private async fillNcrSheet(workbook: ExcelJS.Workbook): Promise<void> {
    const worksheet = workbook.getWorksheet('NCR 세부 수량 파악');
    if (!worksheet) return;

    // NCR 통계 데이터 조회
    const ncrStats = await this.ncrService.getStatistics();
    const { data: ncrData, projects } = ncrStats;

    // NCR 코드 순서 정의
    const ncrCodeOrder = [
      'F-NCR1',
      'F-NCR2',
      'F-NCR3',
      'F-NCR4',
      'F-NCR5',
      'F-NCR6',
      'F-NCR7',
      'F-NCR8',
      'NCR1',
      'NCR2',
      'NCR3',
      'NCR4',
      'NCR5',
      'NCR6',
      'NCR7',
      'NCR8',
      'NCR9',
      'NCR10',
      'NCR11',
      '기타-1',
      '기타-2',
    ];

    const dataStartRow = 5;
    const dataStartCol = 6; // F열 = 6

    // 공유 수식 오류 방지: 영향받는 영역의 셀을 먼저 초기화
    // ExcelJS에서 수식이 있는 셀 접근 시 오류가 발생할 수 있으므로 워크시트 모델 직접 수정
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worksheetModel = worksheet as any;
    if (worksheetModel._rows) {
      for (let rowIdx = 3; rowIdx <= 27; rowIdx++) {
        const row = worksheetModel._rows[rowIdx];
        if (row && row._cells) {
          for (let colIdx = dataStartCol; colIdx <= dataStartCol + 20; colIdx++) {
            if (row._cells[colIdx]) {
              row._cells[colIdx] = undefined;
            }
          }
        }
      }
    }

    // 프로젝트가 1개 초과면 열 삽입 필요 (기존 열들은 오른쪽으로 밀림)
    const additionalCols = Math.max(0, projects.length - 1);
    if (additionalCols > 0) {
      // G열(7)부터 열 삽입 - F열은 첫 번째 프로젝트용
      worksheet.spliceColumns(dataStartCol + 1, 0, ...Array(additionalCols).fill([]));
    }

    // 3행: 프로젝트명, 4행: 프로젝트 번호(no) 헤더 추가
    for (let i = 0; i < projects.length; i++) {
      const col = dataStartCol + i;
      const project = projects[i];

      // 3행: 프로젝트명
      const nameCell = worksheet.getCell(3, col);
      nameCell.value = project.projectName;
      nameCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ExcelUtil.applyCellBorder(nameCell);

      // 4행: 프로젝트 번호 (no)
      const noCell = worksheet.getCell(4, col);
      noCell.value = project.projectNo || '';
      noCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ExcelUtil.applyCellBorder(noCell);
    }

    // NCR 코드별 데이터를 Map으로 변환
    const ncrDataMap = new Map<string, typeof ncrData[0]>();
    for (const item of ncrData) {
      ncrDataMap.set(item.code, item);
    }

    // 프로젝트별 총합 계산용
    const projectTotals: number[] = Array(projects.length).fill(0);
    let grandTotal = 0;

    // NCR 코드별 데이터 채우기
    for (let rowIdx = 0; rowIdx < ncrCodeOrder.length; rowIdx++) {
      const ncrCode = ncrCodeOrder[rowIdx];
      const rowNum = dataStartRow + rowIdx;
      const ncrItem = ncrDataMap.get(ncrCode);

      for (let colIdx = 0; colIdx < projects.length; colIdx++) {
        const col = dataStartCol + colIdx;
        const project = projects[colIdx];

        let count = 0;
        if (ncrItem) {
          const countData = ncrItem.counts.find(
            (c) => c.projectName === project.projectName && c.projectNo === project.projectNo,
          );
          count = countData?.count || 0;
        }

        const cell = worksheet.getCell(rowNum, col);
        cell.value = count > 0 ? count : '';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(cell);

        projectTotals[colIdx] += count;
        grandTotal += count;
      }
    }

    // 26행: 총 합 (각 프로젝트별) - 노란색 배경, 굵은 글씨
    const totalSumRow = dataStartRow + ncrCodeOrder.length; // 26행
    for (let colIdx = 0; colIdx < projects.length; colIdx++) {
      const col = dataStartCol + colIdx;
      const cell = worksheet.getCell(totalSumRow, col);
      cell.value = projectTotals[colIdx] > 0 ? projectTotals[colIdx] : '';
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }, // 노란색
      };
      cell.font = { bold: true };
      ExcelUtil.applyCellBorder(cell);
    }

    // 27행: 총 합의 합
    const grandTotalRow = totalSumRow + 1; // 27행
    if (projects.length > 1) {
      // 프로젝트 열 병합
      const startCol = this.getColumnLetter(dataStartCol);
      const endCol = this.getColumnLetter(dataStartCol + projects.length - 1);
      this.safeMergeCells(worksheet, `${startCol}${grandTotalRow}:${endCol}${grandTotalRow}`);
    }
    const grandTotalCell = worksheet.getCell(grandTotalRow, dataStartCol);
    grandTotalCell.value = grandTotal > 0 ? grandTotal : '';
    grandTotalCell.alignment = { vertical: 'middle', horizontal: 'center' };
    ExcelUtil.applyCellBorder(grandTotalCell);

    // 2행: 제목 행 병합 (B열부터 마지막 프로젝트 열까지)
    const lastProjectCol = dataStartCol + projects.length - 1;
    const endColLetter = this.getColumnLetter(lastProjectCol);
    this.safeMergeCells(worksheet, `B2:${endColLetter}2`);
  }

  private getColumnLetter(colNumber: number): string {
    let letter = '';
    while (colNumber > 0) {
      const mod = (colNumber - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      colNumber = Math.floor((colNumber - 1) / 26);
    }
    return letter;
  }

  private copyRowStyle(worksheet: ExcelJS.Worksheet, sourceRowNum: number, targetRowNum: number): void {
    const sourceRow = worksheet.getRow(sourceRowNum);
    const targetRow = worksheet.getRow(targetRowNum);

    targetRow.height = sourceRow.height;

    sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const targetCell = targetRow.getCell(colNumber);
      targetCell.style = { ...cell.style };
    });

    targetRow.commit();
  }

  private safeUnmergeCells(worksheet: ExcelJS.Worksheet, range: string): void {
    try {
      worksheet.unMergeCells(range);
    } catch {
      // 병합되어 있지 않은 경우 무시
    }
  }

  private safeMergeCells(worksheet: ExcelJS.Worksheet, range: string): void {
    // 먼저 해제 후 병합
    try {
      worksheet.unMergeCells(range);
    } catch {
      // 병합되어 있지 않은 경우 무시
    }
    worksheet.mergeCells(range);
  }

  private async getProjectStatisticsForExcel(): Promise<
    Array<{
      projectName: string;
      projectNo: string | null;
      totalAvailable: number;
      grades: Record<CellGrade, { inStock: number; shipped: number; available: number }>;
    }>
  > {
    const cells = await this.cellInventoryRepository.find({
      select: ['projectName', 'projectNo', 'grade', 'isShipped'],
      order: { projectName: 'ASC', projectNo: 'ASC' },
    });

    // projectName + projectNo 조합으로 그룹핑
    const projectMap = new Map<
      string,
      {
        projectName: string;
        projectNo: string | null;
        grades: Map<CellGrade, { inStock: number; shipped: number }>;
      }
    >();

    for (const cell of cells) {
      // projectName과 projectNo 조합을 키로 사용
      const key = `${cell.projectName}::${cell.projectNo || ''}`;

      if (!projectMap.has(key)) {
        projectMap.set(key, {
          projectName: cell.projectName,
          projectNo: cell.projectNo,
          grades: new Map(),
        });
      }

      const project = projectMap.get(key)!;
      if (!project.grades.has(cell.grade)) {
        project.grades.set(cell.grade, { inStock: 0, shipped: 0 });
      }

      const gradeStats = project.grades.get(cell.grade)!;
      gradeStats.inStock += 1;
      if (cell.isShipped) {
        gradeStats.shipped += 1;
      }
    }

    const result: Array<{
      projectName: string;
      projectNo: string | null;
      totalAvailable: number;
      grades: Record<CellGrade, { inStock: number; shipped: number; available: number }>;
    }> = [];

    for (const [, project] of projectMap.entries()) {
      const grades = {} as Record<CellGrade, { inStock: number; shipped: number; available: number }>;
      let totalAvailable = 0;

      for (const grade of Object.values(CellGrade)) {
        const stats = project.grades.get(grade) || { inStock: 0, shipped: 0 };
        const available = stats.inStock - stats.shipped;
        grades[grade] = {
          inStock: stats.inStock,
          shipped: stats.shipped,
          available,
        };
        totalAvailable += available;
      }

      result.push({
        projectName: project.projectName,
        projectNo: project.projectNo,
        totalAvailable,
        grades,
      });
    }

    return result;
  }

  getExportFilename(): string {
    return '셀_입출고현황.xlsx';
  }
}
