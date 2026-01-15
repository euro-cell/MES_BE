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
}
