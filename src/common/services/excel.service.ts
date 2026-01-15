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
    }
  ): Promise<void> {
    const { title, dataMapper, itemsPerPage, emptyRowsAfterPage } = options;
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1; // 데이터가 없어도 최소 1페이지

    // 첫 페이지 헤더 업데이트 (1-5행은 템플릿에 이미 존재)
    this.updatePageHeader(worksheet, 1, 1, totalPages, title);

    // 첫 페이지 데이터 채우기 (6행부터 시작)
    const firstPageDataCount = Math.min(itemsPerPage, data.length);
    for (let i = 0; i < firstPageDataCount; i++) {
      const row = worksheet.getRow(6 + i);
      dataMapper(data[i], row, i);
      row.commit();
    }

    // 첫 페이지 빈 행 추가
    for (let i = 0; i < emptyRowsAfterPage; i++) {
      worksheet.addRow([]);
    }

    // 두 번째 페이지부터 처리
    for (let page = 2; page <= totalPages; page++) {
      const pageStartRow = worksheet.rowCount + 1;
      const dataStartIndex = (page - 1) * itemsPerPage;
      const dataEndIndex = Math.min(page * itemsPerPage, data.length);

      // 템플릿 헤더 복사 (1-5행)
      this.copyTemplateRows(worksheet, 1, 5, pageStartRow);

      // 페이지 헤더 업데이트
      this.updatePageHeader(worksheet, pageStartRow, page, totalPages, title);

      // 데이터 채우기
      for (let i = dataStartIndex; i < dataEndIndex; i++) {
        const rowIndex = i - dataStartIndex;
        const row = worksheet.getRow(pageStartRow + 5 + rowIndex);
        dataMapper(data[i], row, rowIndex);
        row.commit();
      }

      // 빈 행 추가
      for (let i = 0; i < emptyRowsAfterPage; i++) {
        worksheet.addRow([]);
      }
    }
  }

  /**
   * 페이지 헤더 업데이트
   * @param worksheet - ExcelJS Worksheet
   * @param pageStartRow - 페이지 시작 행 번호
   * @param pageNum - 현재 페이지 번호
   * @param totalPages - 전체 페이지 수
   * @param title - 문서 제목
   */
  private updatePageHeader(
    worksheet: ExcelJS.Worksheet,
    pageStartRow: number,
    pageNum: number,
    totalPages: number,
    title: string
  ): void {
    // C3: 제목
    const titleCell = worksheet.getCell(`C${pageStartRow + 2}`);
    titleCell.value = title;

    // L3: 페이지 정보 (예: "01/02")
    const pageInfoCell = worksheet.getCell(`L${pageStartRow + 2}`);
    pageInfoCell.value = `${String(pageNum).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}`;

    // L4: 작성일자 (예: "2026.01.15")
    const dateCell = worksheet.getCell(`L${pageStartRow + 3}`);
    dateCell.value = ExcelUtil.formatDateDot(new Date());
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
    for (let i = 0; i <= sourceEnd - sourceStart; i++) {
      const sourceRow = worksheet.getRow(sourceStart + i);
      const targetRow = worksheet.getRow(targetStart + i);

      // 행 높이 복사
      targetRow.height = sourceRow.height;

      // 각 셀 복사 (값, 스타일, 병합 등)
      sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const targetCell = targetRow.getCell(colNumber);

        // 값 복사 (제목, 페이지 정보, 날짜는 나중에 업데이트)
        targetCell.value = cell.value;

        // 스타일 복사
        targetCell.style = { ...cell.style };

        // 병합 정보 복사
        if (cell.isMerged) {
          const master = cell.master;
          if (master === cell) {
            const mergeAddress = cell.address;
            const match = mergeAddress.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
            if (match) {
              const [, startCol, startRow, endCol, endRow] = match;
              const rowOffset = targetStart - sourceStart;
              worksheet.mergeCells(
                `${startCol}${parseInt(startRow) + rowOffset}:${endCol}${parseInt(endRow) + rowOffset}`
              );
            }
          }
        }
      });

      targetRow.commit();
    }
  }
}
