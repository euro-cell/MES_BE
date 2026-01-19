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

    // ===== 시트3+: 프로젝트별 시트 =====
    await this.fillProjectSheets(workbook);

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

    // 공유 수식 오류 방지 및 템플릿 테두리 초기화
    // ExcelJS에서 수식이 있는 셀 접근 시 오류가 발생할 수 있으므로 워크시트 모델 직접 수정
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const worksheetModel = worksheet as any;
    if (worksheetModel._rows) {
      // 3~27행: 프로젝트 열 영역 (수식 제거)
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
      // 28행 이후: 템플릿에 있을 수 있는 테두리 완전 제거 (B열부터 넓은 범위)
      for (let rowIdx = 28; rowIdx <= 100; rowIdx++) {
        const row = worksheetModel._rows[rowIdx];
        if (row && row._cells) {
          for (let colIdx = 2; colIdx <= 30; colIdx++) {
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
    // 병합 전에 모든 프로젝트 열에 스타일 적용
    for (let colIdx = 0; colIdx < projects.length; colIdx++) {
      const col = dataStartCol + colIdx;
      const cell = worksheet.getCell(grandTotalRow, col);
      cell.value = colIdx === 0 ? (grandTotal > 0 ? grandTotal : '') : '';
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      ExcelUtil.applyCellBorder(cell);
    }
    if (projects.length > 1) {
      // 프로젝트 열 병합
      const startCol = this.getColumnLetter(dataStartCol);
      const endCol = this.getColumnLetter(dataStartCol + projects.length - 1);
      this.safeMergeCells(worksheet, `${startCol}${grandTotalRow}:${endCol}${grandTotalRow}`);
    }

    // 2행: 제목 행 병합 (B열부터 마지막 프로젝트 열까지)
    const lastProjectCol = dataStartCol + projects.length - 1;
    const endColLetter = this.getColumnLetter(lastProjectCol);
    this.safeMergeCells(worksheet, `B2:${endColLetter}2`);

    // ===== 프로젝트별 NCR 상세 내역 테이블 추가 =====
    await this.fillNcrDetailTables(worksheet, projects, lastProjectCol);

    // fillNcrDetailTables 실행 후 생기는 테두리 제거 (내부 모델 직접 수정)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wsModel = worksheet as any;
    if (wsModel._rows) {
      for (let rowIdx = 28; rowIdx <= 150; rowIdx++) {
        const row = wsModel._rows[rowIdx];
        if (row && row._cells) {
          for (let colIdx = 2; colIdx <= lastProjectCol; colIdx++) {
            if (row._cells[colIdx]) {
              row._cells[colIdx] = undefined;
            }
          }
        }
      }
    }
  }

  private async fillNcrDetailTables(
    worksheet: ExcelJS.Worksheet,
    projects: Array<{ projectName: string; projectNo: string | null }>,
    lastProjectCol: number,
  ): Promise<void> {
    // 구분자 열 (프로젝트 열 끝난 다음 열)
    const separatorCol = lastProjectCol + 1;
    worksheet.getColumn(separatorCol).width = 1.38;

    // 각 프로젝트별 상세 테이블 시작 열
    let currentCol = separatorCol + 1;

    for (const project of projects) {
      // 프로젝트의 NCR 상세 데이터 조회
      const detailData = await this.ncrService.getDetail(project.projectName, project.projectNo || undefined);
      const { ncrDetails } = detailData;

      if (ncrDetails.length === 0) continue;

      // 테이블은 3열 구성: 구분, title, 수량
      const tableWidth = 3;
      const col1 = currentCol; // 구분
      const col2 = currentCol + 1; // title
      const col3 = currentCol + 2; // 수량

      // 2행: 프로젝트명 헤더 (3열 병합)
      const projectHeader = project.projectNo
        ? `${project.projectName}(${project.projectNo})`
        : project.projectName;

      // 병합 전에 모든 셀에 스타일 적용 (테두리 제외)
      for (let c = col1; c <= col3; c++) {
        const cell = worksheet.getCell(2, c);
        cell.value = c === col1 ? projectHeader : '';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { bold: true };
      }
      this.safeMergeCells(worksheet, `${this.getColumnLetter(col1)}2:${this.getColumnLetter(col3)}2`);

      // 3행부터 NCR별 테이블 작성
      let currentRow = 3;

      for (const ncr of ncrDetails) {
        // items가 없으면 건너뛰기
        if (!ncr.items || ncr.items.length === 0) continue;

        // NCR 제목 행 (3열 병합) - 테두리 없음, 굵기 없음
        for (let c = col1; c <= col3; c++) {
          const cell = worksheet.getCell(currentRow, c);
          cell.value = c === col1 ? ncr.title : '';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        this.safeMergeCells(
          worksheet,
          `${this.getColumnLetter(col1)}${currentRow}:${this.getColumnLetter(col3)}${currentRow}`,
        );
        currentRow++;

        // 테이블 헤더: 구분, [item.title], 수량 - 흰색 배경 5% 더 어둡게
        // 첫 번째 item의 title을 헤더로 사용
        const firstItemTitle = ncr.items[0]?.title || '';
        const headers = ['구분', firstItemTitle, '수량'];
        for (let i = 0; i < headers.length; i++) {
          const cell = worksheet.getCell(currentRow, col1 + i);
          cell.value = headers[i];
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }, // 흰색, 배경 1, 5% 더 어둡게
          };
          ExcelUtil.applyCellBorder(cell);
        }
        currentRow++;

        // 항목 데이터: 구분=details, 두번째열=type, 수량=count
        let itemTotal = 0;
        for (const item of ncr.items) {
          const cell1 = worksheet.getCell(currentRow, col1);
          cell1.value = item.details || '';
          cell1.alignment = { vertical: 'middle', horizontal: 'center' };
          ExcelUtil.applyCellBorder(cell1);

          const cell2 = worksheet.getCell(currentRow, col2);
          cell2.value = item.type || '';
          cell2.alignment = { vertical: 'middle', horizontal: 'center' };
          ExcelUtil.applyCellBorder(cell2);

          const cell3 = worksheet.getCell(currentRow, col3);
          cell3.value = item.count || 0;
          cell3.alignment = { vertical: 'middle', horizontal: 'center' };
          ExcelUtil.applyCellBorder(cell3);

          itemTotal += item.count || 0;
          currentRow++;
        }

        // 합계 행 - 배경색 없이 테두리만
        const sumCell1 = worksheet.getCell(currentRow, col1);
        sumCell1.value = '합계';
        sumCell1.alignment = { vertical: 'middle', horizontal: 'center' };
        sumCell1.font = { bold: true };
        ExcelUtil.applyCellBorder(sumCell1);

        const sumCell2 = worksheet.getCell(currentRow, col2);
        sumCell2.value = '';
        ExcelUtil.applyCellBorder(sumCell2);

        this.safeMergeCells(
          worksheet,
          `${this.getColumnLetter(col1)}${currentRow}:${this.getColumnLetter(col2)}${currentRow}`,
        );

        const sumValueCell = worksheet.getCell(currentRow, col3);
        sumValueCell.value = itemTotal;
        sumValueCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sumValueCell.font = { bold: true };
        ExcelUtil.applyCellBorder(sumValueCell);
        currentRow++;

        // 한 행 건너뛰기
        currentRow++;
      }

      // 다음 프로젝트를 위해 구분자 열 추가 후 다음 열로 이동
      currentCol = currentCol + tableWidth + 1; // 테이블 3열 + 구분자 1열
      worksheet.getColumn(currentCol - 1).width = 1.38; // 구분자 열 너비
    }
  }

  private async fillProjectSheets(workbook: ExcelJS.Workbook): Promise<void> {
    const templateSheet = workbook.getWorksheet('프로젝트');
    if (!templateSheet) return;

    // 고유한 프로젝트명 목록 조회 (projectNo가 달라도 projectName이 같으면 하나로)
    const allCells = await this.cellInventoryRepository.find({
      select: ['projectName'],
    });

    const uniqueProjectNames = [...new Set(allCells.map((c) => c.projectName))].sort();

    // 각 프로젝트명별로 시트 생성
    for (const projectName of uniqueProjectNames) {
      // 템플릿 시트 복사
      const newSheet = workbook.addWorksheet(projectName);

      // 템플릿에서 열 너비 복사
      templateSheet.columns.forEach((col, index) => {
        if (col.width) {
          newSheet.getColumn(index + 1).width = col.width;
        }
      });

      // 템플릿의 모든 행/스타일 복사 (1~2행)
      for (let rowNum = 1; rowNum <= 2; rowNum++) {
        const srcRow = templateSheet.getRow(rowNum);
        const destRow = newSheet.getRow(rowNum);
        destRow.height = srcRow.height;
        srcRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const destCell = destRow.getCell(colNumber);
          destCell.value = cell.value;
          destCell.style = { ...cell.style };
        });
        destRow.commit();
      }

      // 해당 프로젝트명의 모든 셀 데이터 조회
      const projectCells = await this.getProjectCells(projectName);

      // 데이터 채우기 (3행부터)
      const dataStartRow = 3;
      for (let i = 0; i < projectCells.length; i++) {
        const cell = projectCells[i];
        const rowNum = dataStartRow + i;

        // 출고 상태면 주황색 배경
        const orangeFill: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC000' }, // 주황색
        };

        // B(2): No.
        const noCell = newSheet.getCell(rowNum, 2);
        noCell.value = i + 1;
        noCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(noCell);
        if (cell.isShipped) noCell.fill = orangeFill;

        // C(3): Lot No.
        const lotCell = newSheet.getCell(rowNum, 3);
        lotCell.value = cell.lot || '';
        lotCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(lotCell);
        if (cell.isShipped) lotCell.fill = orangeFill;

        // D(4): 프로젝트명
        const projectNameCell = newSheet.getCell(rowNum, 4);
        projectNameCell.value = cell.projectName || '';
        projectNameCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(projectNameCell);
        if (cell.isShipped) projectNameCell.fill = orangeFill;

        // E(5): Project No.
        const projectNoCell = newSheet.getCell(rowNum, 5);
        projectNoCell.value = cell.projectNo || '';
        projectNoCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(projectNoCell);
        if (cell.isShipped) projectNoCell.fill = orangeFill;

        // F(6): 모델
        const modelCell = newSheet.getCell(rowNum, 6);
        modelCell.value = cell.model || '';
        modelCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(modelCell);
        if (cell.isShipped) modelCell.fill = orangeFill;

        // G(7): 등급
        const gradeCell = newSheet.getCell(rowNum, 7);
        gradeCell.value = cell.grade || '';
        gradeCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(gradeCell);
        if (cell.isShipped) gradeCell.fill = orangeFill;

        // H(8): NCR 등급
        const ncrGradeCell = newSheet.getCell(rowNum, 8);
        ncrGradeCell.value = cell.ncrGrade || '';
        ncrGradeCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(ncrGradeCell);
        if (cell.isShipped) ncrGradeCell.fill = orangeFill;

        // I(9): 보관 일자
        const dateCell = newSheet.getCell(rowNum, 9);
        dateCell.value = cell.date ? ExcelUtil.formatDate(cell.date) : '';
        dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(dateCell);
        if (cell.isShipped) dateCell.fill = orangeFill;

        // J(10): 보관 위치
        const storageCell = newSheet.getCell(rowNum, 10);
        storageCell.value = cell.storageLocation || '';
        storageCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(storageCell);
        if (cell.isShipped) storageCell.fill = orangeFill;

        // K(11): 출고 일자
        const shippingDateCell = newSheet.getCell(rowNum, 11);
        shippingDateCell.value = cell.shippingDate ? ExcelUtil.formatDate(cell.shippingDate) : '';
        shippingDateCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(shippingDateCell);
        if (cell.isShipped) shippingDateCell.fill = orangeFill;

        // L(12): 출고 현황
        const shippingStatusCell = newSheet.getCell(rowNum, 12);
        shippingStatusCell.value = cell.shippingStatus || '';
        shippingStatusCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(shippingStatusCell);
        if (cell.isShipped) shippingStatusCell.fill = orangeFill;

        // M(13): 인계자
        const delivererCell = newSheet.getCell(rowNum, 13);
        delivererCell.value = cell.deliverer || '';
        delivererCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(delivererCell);
        if (cell.isShipped) delivererCell.fill = orangeFill;

        // N(14): 인수자
        const receiverCell = newSheet.getCell(rowNum, 14);
        receiverCell.value = cell.receiver || '';
        receiverCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(receiverCell);
        if (cell.isShipped) receiverCell.fill = orangeFill;

        // O(15): 상세
        const detailsCell = newSheet.getCell(rowNum, 15);
        detailsCell.value = cell.details || '';
        detailsCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(detailsCell);
        if (cell.isShipped) detailsCell.fill = orangeFill;

        // P(16): 상태
        const statusCell = newSheet.getCell(rowNum, 16);
        statusCell.value = cell.isShipped ? '출고' : '보관중';
        statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(statusCell);
        if (cell.isShipped) statusCell.fill = orangeFill;

        // Q(17): 재입고
        const restockedCell = newSheet.getCell(rowNum, 17);
        restockedCell.value = cell.isRestocked ? 'Y' : '';
        restockedCell.alignment = { vertical: 'middle', horizontal: 'center' };
        ExcelUtil.applyCellBorder(restockedCell);
        if (cell.isShipped) restockedCell.fill = orangeFill;
      }

      // 2행 헤더에 필터 적용 (B2:Q2 + 데이터 영역)
      const lastDataRow = dataStartRow + projectCells.length - 1;
      newSheet.autoFilter = {
        from: { row: 2, column: 2 }, // B2
        to: { row: Math.max(2, lastDataRow), column: 17 }, // Q열
      };
    }

    // 템플릿 시트 삭제
    workbook.removeWorksheet(templateSheet.id);
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
    // 범위 파싱
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) {
      worksheet.mergeCells(range);
      return;
    }

    const startCol = this.columnLetterToNumber(match[1]);
    const startRow = parseInt(match[2]);
    const endCol = this.columnLetterToNumber(match[3]);
    const endRow = parseInt(match[4]);

    // 범위 내 모든 셀의 기존 병합 해제
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        try {
          const cell = worksheet.getCell(row, col);
          if (cell.isMerged) {
            worksheet.unMergeCells(row, col, row, col);
          }
        } catch {
          // 무시
        }
      }
    }

    // 새로운 병합 적용
    try {
      worksheet.mergeCells(range);
    } catch {
      // 병합 실패 시 무시
    }
  }

  private columnLetterToNumber(letter: string): number {
    let result = 0;
    for (let i = 0; i < letter.length; i++) {
      result = result * 26 + (letter.charCodeAt(i) - 64);
    }
    return result;
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
