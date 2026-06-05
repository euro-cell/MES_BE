# Eurocell MES Backend

Eurocell 배터리 셀 제조 실행 시스템(MES)의 백엔드입니다.

## 기술 스택

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL + TypeORM (SnakeNamingStrategy)
- **Auth**: Passport + express-session (세션 기반 인증)
- **File Storage**: RustFS (S3 호환 오브젝트 스토리지)
- **API Docs**: Swagger (`/docs`)

## 환경 설정

`.env.sample`을 복사해 `.env`를 생성하고 아래 항목을 채웁니다.

```env
PORT=

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASS=

FRONTEND_ORIGIN=

SESSION_SECRET=
SESSION_MAX_AGE=
SESSION_SECURE=

RUSTFS_ENDPOINT=
RUSTFS_ACCESS_KEY=
RUSTFS_SECRET_KEY=
RUSTFS_BUCKET=
RUSTFS_REGION=
```

## 실행

```bash
# 패키지 설치
npm install

# 개발 (watch 모드)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## 모듈 구조

| 모듈             | 설명                                           |
| ---------------- | ---------------------------------------------- |
| `auth`           | 로그인/로그아웃, Passport LocalStrategy        |
| `user`           | 사용자 CRUD                                    |
| `project`        | 생산계획, 자재, 규격, 작업일지, 상태, LOT 관리 |
| `material`       | 자재 마스터 데이터, COA                        |
| `specification`  | 규격 및 인증서                                 |
| `quality`        | IQC / LQC / OQC 품질 관리                      |
| `drawing`        | 도면 및 버전 관리                              |
| `equipment`      | 설비 및 유지보수 이력                          |
| `cell-inventory` | 배터리 셀 재고, NCR                            |
| `dashboard`      | 분석 대시보드                                  |
| `menu-access`    | 메뉴 및 권한 관리                              |

## API 문서

개발 모드 실행 후 `/docs`에서 Swagger UI를 확인할 수 있습니다.
