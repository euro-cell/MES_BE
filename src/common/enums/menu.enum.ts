export enum MenuName {
  // 생산 관리
  PRODUCTION_PLAN = '생산계획',
  SPECIFICATION = '설계 및 자재 소요량',
  WORKLOG = '작업 일지',
  PRODUCTION_STATUS = '생산 현황 (수율)',
  LOT_MANAGEMENT = 'Lot 관리',
  LOT_SEARCH = 'Lot 검색',
  // 재고 관리
  MATERIAL_MANAGEMENT = '원자재 관리',
  CELL_MANAGEMENT = '셀 관리',
  // 품질 관리
  IQC = 'IQC',
  LQC = 'LQC',
  OQC = 'OQC',
  // 설비 관리
  EQUIPMENT_PRODUCTION = '생산',
  EQUIPMENT_DEVELOPMENT = '개발',
  EQUIPMENT_MEASUREMENT = '측정',
  // 도면 관리
  DRAWING_ALL = '전체',
  DRAWING_FACTORY = '공장',
  DRAWING_EQUIPMENT = '설비',
  DRAWING_PRODUCT = '제품',
  DRAWING_OEM_ODM = 'OEM/ODM',
  // 기타
  USER_MANAGEMENT = '인원등록',
  MENU_ACCESS = '메뉴접근관리',
  ENVIRONMENT_MANAGEMENT = '환경관리',
  CUSTOMER_CODE_MANAGEMENT = '고객 코드 관리 대장',
  // 3depth 메뉴
  EQUIPMENT_LIST = '설비 관리 대장',
  EQUIPMENT_MAINTENANCE = '유지보수 관리 대장',
  HUMIDITY = '공정 온/습도',
  ELECTRODE = '전극',
  ASSEMBLY = '조립',
  CELL_IN_OUT = '입/출고 등록',
  CELL_RACK_STORAGE = 'RACK 보관 현황',
  CELL_NCR = 'NCR 세부 현황',
  CELL_PROJECT = '프로젝트별 입/출고 현황',
}

export enum PermissionAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}
