# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Approach

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Commands

```bash
npm run dev          # Start in watch mode (development)
npm run build        # Compile TypeScript to dist/
npm run start:prod   # Run compiled production build
npm run lint         # ESLint with auto-fix
npm run format       # Prettier format
npm run test         # Run unit tests
npm run test:cov     # Jest with coverage
npm run migration:run    # Build + run TypeORM migrations
npm run migration:revert # Build + revert last migration
```

Run a single test file:
```bash
npx jest src/modules/auth/auth.service.spec.ts
```

## Environment Setup

Copy `.env.sample` to `.env` and fill in:
- `PORT` — server port
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` — PostgreSQL connection
- `FRONTEND_ORIGIN` — allowed CORS origin
- `SESSION_SECRET`, `SESSION_MAX_AGE`, `SESSION_SECURE` — express-session config
- `RUSTFS_ENDPOINT`, `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY`, `RUSTFS_BUCKET`, `RUSTFS_REGION` — RustFS (S3-compatible) object storage

## Architecture

NestJS monolithic backend for a Manufacturing Execution System (MES). PostgreSQL via TypeORM with SnakeNamingStrategy. Session-based auth (Passport + express-session), not JWT.

### Module Layout

```
src/
├── app/              # Root module, imports all feature modules
├── common/           # Shared infrastructure
│   ├── configs/      # DB, Swagger, CORS, session, multer configuration
│   ├── decorators/   # @RequirePermission, @GetUser
│   ├── entities/     # 53 TypeORM entities (shared across modules)
│   ├── enums/        # UserRole, MenuName, PermissionAction + domain enums
│   ├── guards/       # PermissionGuard (applied globally via APP_GUARD)
│   ├── dtos/         # Shared DTOs
│   └── services/     # ExcelService, RustFsService, MenuSeedService
└── modules/          # Feature domains
    ├── auth/         # Login/logout, Passport LocalStrategy
    ├── user/         # User CRUD
    ├── project/      # Core MES: plan, material, specification, worklog, status, lot (API prefix: /project)
    ├── material/     # Material master data + COA
    ├── specification/# Specs and certificates
    ├── quality/      # IQC / LQC / OQC quality control
    ├── drawing/      # Technical drawings and versions
    ├── equipment/    # Equipment + maintenance logs
    ├── cell-inventory/# Cell battery inventory + NCR
    ├── dashboard/    # Analytics
    └── menu-access/  # Menu/permission management
```

### Key Patterns

- **Permission system**: Decorate controller methods with `@RequirePermission(menu, action)`. `PermissionGuard` (global `APP_GUARD`) checks the authenticated user's role and menu permissions. GET requests bypass the guard by default.
- **Entities**: All shared TypeORM entities live in `src/common/entities/`. Use `@DeleteDateColumn()` for soft deletes.
- **Routing**: Sub-modules under `project/` are registered via NestJS `RouterModule` with a `/project` prefix.
- **File storage**: RustFS (S3-compatible) via `RustFsService`; uploaded files accessible at `/uploads/`.
- **Excel export**: Use the shared `ExcelService` from `src/common/services/`.
- **API docs**: Swagger available at `/docs` in development.
- **Session expiry**: Responses include `X-Session-Expires` header with session expiration time.

### Auth Flow

1. `POST /auth/login` → Passport `LocalStrategy` → `AuthService.validateUser()`
2. Successful login serializes user into session (`SessionSerializer`)
3. Subsequent requests use the session cookie; `@GetUser()` decorator extracts the user from `req.user`

### TypeORM

- `synchronize: true` in development — **반드시 운영 전 `false`로 변경 후 마이그레이션 사용**
- Migration scripts: `npm run migration:run` / `npm run migration:revert`
- Connection pool: 10 connections
- All entities must be registered in `src/common/configs/typeorm.config.ts`

### Code Style

- Prettier: 140 char line width, single quotes, trailing commas, 2-space indent
- ESLint: `@typescript-eslint/no-explicit-any` is off (`any` permitted)
- `noImplicitAny: false` in tsconfig
- Error messages and Swagger descriptions are written in Korean
