# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start in watch mode (development)
npm run build        # Compile TypeScript to dist/
npm run start:prod   # Run compiled production build
npm run lint         # ESLint with auto-fix
npm run format       # Prettier format
npm run test         # Run unit tests (src/**/*.spec.ts)
npm run test:watch   # Jest watch mode
npm run test:cov     # Jest with coverage
```

Run a single test file:
```bash
npx jest src/modules/auth/auth.service.spec.ts
```

## Environment Setup

Copy `.env.sample` to `.env` and fill in:
- `PORT` — server port
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` — PostgreSQL connection
- `FRONTEND_ORIGIN` — allowed CORS origin
- `SESSION_SECRET` — express-session secret

## Architecture

NestJS monolithic backend for a Manufacturing Execution System (MES). PostgreSQL via TypeORM with SnakeNamingStrategy. Session-based auth (Passport + express-session), not JWT.

### Module Layout

```
src/
├── app/              # Root module, imports all feature modules
├── common/           # Shared infrastructure
│   ├── configs/      # DB, Swagger, CORS, session, multer configuration
│   ├── decorators/   # @RequirePermission, @GetUser
│   ├── entities/     # 51 TypeORM entities (shared across modules)
│   ├── enums/        # UserRole: ADMIN, CEO, DIRECTOR, MANAGER, ASSISTANT, STAFF
│   ├── guards/       # PermissionGuard (applied globally via APP_GUARD)
│   ├── dtos/         # Shared DTOs
│   └── services/     # ExcelService (ExcelJS-based export)
└── modules/          # Feature domains
    ├── auth/         # Login/logout, Passport LocalStrategy
    ├── user/         # User CRUD
    ├── production/   # Core MES: plan, material, specification, worklog, status, lot
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
- **Routing**: Sub-modules under `production/` are registered via NestJS `RouterModule` with a `/production` prefix.
- **File uploads**: Multer middleware; uploaded files are served as static assets at `/uploads/` from `/data/uploads`.
- **Excel export**: Use the shared `ExcelService` from `src/common/services/`.
- **API docs**: Swagger available at `/docs` in development.

### Auth Flow

1. `POST /auth/login` → Passport `LocalStrategy` → `AuthService.validateUser()`
2. Successful login serializes user into session (`SessionSerializer`)
3. Subsequent requests use the session cookie; `@GetUser()` decorator extracts the user from `req.user`

### TypeORM

- Auto-sync enabled (`synchronize: true`) — schema changes apply on restart
- Connection pool: 10 connections
- All entities must be registered in `src/common/configs/typeorm.config.ts`

### Code Style

- Prettier: 140 char line width, single quotes, trailing commas, 2-space indent
- ESLint: `@typescript-eslint/no-explicit-any` is off (use of `any` is permitted)
- `noImplicitAny: false` in tsconfig — implicit `any` is allowed
- Error messages and Swagger descriptions are written in Korean
