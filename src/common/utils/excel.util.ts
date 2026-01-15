/**
 * Excel 유틸리티 클래스
 * 순수 함수들로 구성 (데이터 포맷팅, 유효성 검사 등)
 */
export class ExcelUtil {
  /**
   * 날짜를 "YYYY-MM-DD" 형식으로 변환
   * @param date - Date 객체 또는 null/undefined
   * @returns 포맷된 날짜 문자열 또는 빈 문자열
   */
  static formatDate(date: Date | null | undefined): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * 날짜를 "YYYY.MM.DD" 형식으로 변환 (작성일자용)
   * @param date - Date 객체
   * @returns 포맷된 날짜 문자열
   */
  static formatDateDot(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  }

  /**
   * null/undefined를 빈 문자열로 변환
   * @param value - 임의의 값
   * @returns 문자열 또는 빈 문자열
   */
  static sanitizeValue(value: any): string {
    return value ?? '';
  }

  /**
   * 셀에 테두리 적용
   * @param cell - ExcelJS Cell 객체
   */
  static applyCellBorder(cell: any): void {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  }

  /**
   * 셀에 자동 줄바꿈 적용
   * @param cell - ExcelJS Cell 객체
   */
  static applyWrapText(cell: any): void {
    cell.alignment = {
      ...cell.alignment,
      wrapText: true,
      vertical: 'top',
    };
  }

  /**
   * 텍스트 길이와 셀 너비를 기반으로 필요한 행 높이 계산
   * @param text - 셀의 텍스트
   * @param cellWidth - 셀의 너비 (문자 수 기준, 기본값: 10)
   * @param baseHeight - 기본 행 높이 (기본값: 15)
   * @returns 계산된 행 높이
   */
  static calculateRowHeight(text: string, cellWidth: number = 10, baseHeight: number = 15): number {
    if (!text) return baseHeight;

    const textLength = String(text).length;
    const lines = Math.ceil(textLength / cellWidth);

    // 줄바꿈 문자가 있는 경우 직접 계산
    const newlineCount = (String(text).match(/\n/g) || []).length;
    const actualLines = Math.max(lines, newlineCount + 1);

    return Math.max(baseHeight, actualLines * baseHeight);
  }

  /**
   * 행의 여러 셀 중 최대 높이 반환
   * @param heights - 각 셀의 높이 배열
   * @returns 최대 높이
   */
  static getMaxHeight(heights: number[]): number {
    return Math.max(...heights, 15); // 최소 15
  }
}
