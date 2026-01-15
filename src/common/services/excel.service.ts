import { Injectable, NotFoundException } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { ExcelUtil } from '../utils/excel.util';

/**
 * Excel 생성 옵션 인터페이스
 */
export interface ExcelGenerateOptions<T> {
  templateName: string;           // 템플릿 파일명
  title: string;                  // 문서 제목
  data: T[];                      // 엑셀에 넣을 데이터
  dataMapper: (item: T, row: ExcelJS.Row, rowIndex: number) => void;  // 데이터를 행에 매핑하는 함수
  itemsPerPage?: number;          // 페이지당 데이터 개수 (기본값: 27)
  emptyRowsAfterPage?: number;    // 페이지 후 빈 행 개수 (기본값: 2)
  pageInfoCell?: string;          // 페이지 번호 셀 위치 (기본값: 'L3')
  dateCell?: string;              // 작성일자 셀 위치 (기본값: 'L4')
  headerRows?: number;            // 헤더 행 수 (기본값: 5)
  updateHeader?: boolean;         // 제목/페이지/날짜 업데이트 여부 (기본값: true)
}

@Injectable()
export class ExcelService {
  private readonly templatePath = path.join(process.cwd(), 'data', 'templates');

  /**
   * 템플릿 기반 엑셀 파일 생성
   * @param options - Excel 생성 옵션
   * @returns StreamableFile
   */
  async generateExcel<T>(options: ExcelGenerateOptions<T>): Promise<StreamableFile> {
    const {
      templateName,
      title,
      data,
      dataMapper,
      itemsPerPage = 27,
      emptyRowsAfterPage = 2,
      pageInfoCell = 'L3',
      dateCell = 'L4',
      headerRows = 5,
      updateHeader = true,
    } = options;

    // 템플릿 로드
    const workbook = await this.loadTemplate(templateName);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new NotFoundException('워크시트를 찾을 수 없습니다.');
    }

    // 페이지 생성 및 데이터 채우기
    await this.createPages(worksheet, data, {
      title,
      dataMapper,
      itemsPerPage,
      emptyRowsAfterPage,
      pageInfoCell,
      dateCell,
      headerRows,
      updateHeader,
    });

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();
    return new StreamableFile(Buffer.from(buffer));
  }

  /**
   * 템플릿 파일 로드
   * @param templateName - 템플릿 파일명
   * @returns ExcelJS Workbook
   */
  private async loadTemplate(templateName: string): Promise<ExcelJS.Workbook> {
    const templateFilePath = path.join(this.templatePath, templateName);

    if (!fs.existsSync(templateFilePath)) {
      throw new NotFoundException(`템플릿 파일을 찾을 수 없습니다: ${templateName}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templateFilePath);
    return workbook;
  }

  /**
   * 페이지 생성 및 데이터 채우기
   * @param worksheet - ExcelJS Worksheet
   * @param data - 데이터 배열
   * @param options - 페이지 생성 옵션
   */
  private async createPages<T>(
    worksheet: ExcelJS.Worksheet,
    data: T[],
    options: {
      title: string;
      dataMapper: (item: T, row: ExcelJS.Row, rowIndex: number) => void;
      itemsPerPage: number;
      emptyRowsAfterPage: number;
      pageInfoCell: string;
      dateCell: string;
      headerRows: number;
      updateHeader: boolean;
    }
  ): Promise<void> {
    const { title, dataMapper, itemsPerPage, emptyRowsAfterPage, pageInfoCell, dateCell, headerRows, updateHeader } = options;
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1; // 데이터가 없어도 최소 1페이지
    const rowsPerPage = headerRows + itemsPerPage + emptyRowsAfterPage; // 예: 헤더 5 + 데이터 27 + 빈 행 2 = 34행

    // 1단계: 모든 페이지 구조 미리 생성
    for (let page = 1; page <= totalPages; page++) {
      const pageStartRow = (page - 1) * rowsPerPage + 1;

      if (page === 1) {
        // 첫 페이지: 템플릿에 이미 헤더 존재, 데이터+빈행만 생성
        if (updateHeader) {
          this.updatePageHeader(worksheet, 1, page, totalPages, title, pageInfoCell, dateCell);
        }

        // 헤더+1부터 rowsPerPage까지 생성 (데이터 영역 + 빈 행)
        for (let i = headerRows + 1; i <= rowsPerPage; i++) {
          const row = worksheet.getRow(i);
          // 행 높이 복사 (템플릿 데이터 시작 행 기준)
          if (i >= headerRows + 1 && i <= headerRows + itemsPerPage) {
            row.height = worksheet.getRow(headerRows + 1).height || 15;
          }
          row.commit();
        }
      } else {
        // 2페이지부터: 전체 행 복사
        this.copyTemplateRows(worksheet, 1, rowsPerPage, pageStartRow);
        if (updateHeader) {
          this.updatePageHeader(worksheet, pageStartRow, page, totalPages, title, pageInfoCell, dateCell);
        }
      }

      // 페이지 나누기 설정 (마지막 페이지 제외)
      if (page < totalPages) {
        const pageEndRow = pageStartRow + rowsPerPage - 1;
        worksheet.getRow(pageEndRow).addPageBreak();
      }
    }

    // 2단계: 데이터 채우기
    for (let i = 0; i < data.length; i++) {
      const page = Math.floor(i / itemsPerPage) + 1;
      const pageStartRow = (page - 1) * rowsPerPage + 1;
      const rowIndexInPage = i % itemsPerPage;
      const rowNumber = pageStartRow + headerRows + rowIndexInPage; // 헤더 행 + 데이터 행

      const row = worksheet.getRow(rowNumber);
      dataMapper(data[i], row, i); // 전체 인덱스 전달 (넘버링 연속)
      row.commit();
    }
  }

  /**
   * 페이지 헤더 업데이트
   * @param worksheet - ExcelJS Worksheet
   * @param pageStartRow - 페이지 시작 행 번호
   * @param pageNum - 현재 페이지 번호
   * @param totalPages - 전체 페이지 수
   * @param title - 문서 제목
   * @param pageInfoCell - 페이지 번호 셀 위치 (예: 'L3', 'P3')
   * @param dateCell - 작성일자 셀 위치 (예: 'L4', 'P4')
   */
  private updatePageHeader(
    worksheet: ExcelJS.Worksheet,
    pageStartRow: number,
    pageNum: number,
    totalPages: number,
    title: string,
    pageInfoCell: string,
    dateCell: string
  ): void {
    // 셀 위치 파싱 (예: 'L3' -> column: 'L', baseRow: 3)
    const parseCell = (cellRef: string) => {
      const match = cellRef.match(/^([A-Z]+)(\d+)$/);
      if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);
      return { column: match[1], baseRow: parseInt(match[2]) };
    };

    const pageInfo = parseCell(pageInfoCell);
    const dateInfo = parseCell(dateCell);

    // C3: 제목
    const titleCell = worksheet.getCell(`C${pageStartRow + 2}`);
    titleCell.value = title;

    // 페이지 정보 (예: L3 또는 P3)
    const pageInfoCellRef = worksheet.getCell(`${pageInfo.column}${pageStartRow + pageInfo.baseRow - 1}`);
    pageInfoCellRef.value = `${String(pageNum).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}`;

    // 작성일자 (예: L4 또는 P4)
    const dateCellRef = worksheet.getCell(`${dateInfo.column}${pageStartRow + dateInfo.baseRow - 1}`);
    dateCellRef.value = ExcelUtil.formatDateDot(new Date());
  }

  /**
   * 템플릿 행 복사 (스타일 포함)
   * @param worksheet - ExcelJS Worksheet
   * @param sourceStart - 복사 시작 행 번호
   * @param sourceEnd - 복사 종료 행 번호
   * @param targetStart - 붙여넣기 시작 행 번호
   */
  private copyTemplateRows(
    worksheet: ExcelJS.Worksheet,
    sourceStart: number,
    sourceEnd: number,
    targetStart: number
  ): void {
    const rowOffset = targetStart - sourceStart;

    // 1. 병합 정보 수집
    const merges: string[] = [];
    const worksheetModel = worksheet.model as any;
    if (worksheetModel.merges) {
      worksheetModel.merges.forEach((merge: string) => {
        const match = merge.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
        if (match) {
          const [, startCol, startRow, endCol, endRow] = match;
          const startRowNum = parseInt(startRow);
          const endRowNum = parseInt(endRow);

          // 복사 대상 행 범위에 포함되는 병합만 추가
          if (startRowNum >= sourceStart && endRowNum <= sourceEnd) {
            const newMerge = `${startCol}${startRowNum + rowOffset}:${endCol}${endRowNum + rowOffset}`;
            merges.push(newMerge);
          }
        }
      });
    }

    // 2. 행 복사
    for (let i = 0; i <= sourceEnd - sourceStart; i++) {
      const sourceRow = worksheet.getRow(sourceStart + i);
      const targetRow = worksheet.getRow(targetStart + i);

      // 행 높이 복사
      targetRow.height = sourceRow.height;

      // 각 셀 복사 (값, 스타일)
      sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const targetCell = targetRow.getCell(colNumber);

        // 값 복사
        targetCell.value = cell.value;

        // 스타일 복사
        targetCell.style = { ...cell.style };
      });

      targetRow.commit();
    }

    // 3. 병합 적용
    merges.forEach((merge) => {
      try {
        worksheet.mergeCells(merge);
      } catch (error) {
        // 이미 병합된 경우 무시
      }
    });
  }
}
