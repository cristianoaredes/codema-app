# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines
- Respond to the user in pt-br; write code/identifiers in EN.

## Common Development Commands

```bash
# Development
npm run dev                # Start dev server on http://localhost:5173
npm run build              # Production build
npm run build:dev          # Development build  
npm run preview            # Preview production build
npm run lint               # ESLint checks

# Testing
npm run test               # Run tests once
npm run test:watch         # Watch mode for tests
npm run test:coverage      # Coverage report

# Supabase
npx supabase start         # Start local Supabase
npx supabase db reset      # Reset database
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Docker Development Commands
- Start/rebuild dev stack: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
- Stop stack: `docker compose down`
- Deps changed (package.json): `docker compose exec app npm install`; if needed: `docker compose build app && docker compose up -d`
- Production build: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
- Scripts disponíveis: `./scripts/docker/docker-dev.sh`, `./scripts/docker/docker-prod.sh`, `./scripts/docker/docker-build.sh`

## Supabase Workflow
- Commit SQL migrations under `supabase/migrations`
- Run `npx supabase db reset` locally to apply migrations
- Regenerate TypeScript types using `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`
- Commit regenerated types to version control

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **UI Library**: shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: TanStack Query + React Hook Form + Zod validation
- **Routing**: React Router v6
- **Complete Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase (Postgres/Auth/Storage/Realtime), TanStack Query, React Hook Form, Zod, React Router v6

### Project Structure
```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── codema/            # CODEMA-specific modules
│   │   ├── atas/          # Meeting minutes management
│   │   ├── conselheiros/  # Council members management
│   │   └── resolucoes/    # Resolutions system
│   ├── common/            # Shared components
│   └── ui/                # shadcn/ui base components
├── hooks/                 # Custom React hooks
├── pages/                 # Route pages
├── integrations/supabase/ # Supabase client and types
├── services/              # Business logic and services
└── utils/generators/      # Protocol and number generators

docker/
├── nginx/                 # Nginx configuration files
└── scripts/               # Docker utility scripts

scripts/
├── docker/                # Docker management scripts
├── database/              # Database scripts
├── dev/                   # Development utilities
└── test/                  # Test utilities

docs/
└── design-system/         # Design system documentation
```

### Key Systems

**Authentication & Authorization**
- Magic link authentication via Supabase Auth
- Role-based access: admin > presidente > secretario > conselheiro > citizen
- Protected routes with role verification

**Protocol Generation** (`src/utils/generators/protocoloGenerator.ts`)
- Format: `TYPE-XXX/YYYY` (e.g., PROC-001/2025)
- Types: PROC, RES, OUV, REU, ATA, CONV, DOC, PROJ, REL, NOT
- Database-backed sequential numbering

**Database Schema**
- **Supabase Project**: `aqvbhmpdzvdbhvxhnemi`
- 19+ tables with RLS policies
- Key tables: profiles, reunioes, presencas, atas, resolucoes, impedimentos, audit_logs
- All operations require authenticated user

### TypeScript Configuration
- Relaxed rules: `noImplicitAny: false`, `strictNullChecks: false`
- Path alias: `@/*` → `./src/*`
- ESLint configured with exceptions for codema modules
- **TypeScript/Lint Guidelines**:
  - Use relaxed TypeScript settings (noImplicitAny=false, strictNullChecks=false)
  - ESLint forbids 'any' except in codema components and utils
  - Follow React Hooks rules
  - Maintain file's existing indentation and style

### Business Rules
1. **Quorum**: Simple majority (50% + 1)
2. **Mandate Alerts**: 30, 15, 7 days before expiration
3. **Absence Tracking**: Alert after 3 consecutive absences
4. **Protocol Format**: TYPE-XXX/YYYY

### Environment Setup
```env
VITE_SUPABASE_URL=https://aqvbhmpdzvdbhvxhnemi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Paths/Aliases
- `@` resolves to `./src`.

### Key Directories
- `src/components/`: Contains all React components
- `src/hooks/`: Custom React hooks
- `src/pages/`: Application route pages
- `src/integrations/supabase/`: Supabase client configuration and type definitions
- `src/services/`: Business logic and application services
- `src/utils/generators/`: Utility functions for generating protocols and other sequential identifiers
- `docker/`: Docker configuration files (nginx, scripts)
- `scripts/`: Utility scripts organized by category (docker, database, dev, test)
- `docs/`: Project documentation and design system

## Supabase Configuration
- **Project ID**: `aqvbhmpdzvdbhvxhnemi`
- **Row Level Security (RLS)**:
  - Enabled on all tables
  - All database operations require authenticated user
  - Always regenerate TypeScript types after schema changes using `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`

## Testing Configuration
- **Testing Framework**: 
  - Vitest with jsdom
  - Setup file: src/setupTests.ts
  - Coverage configuration:
    - v8 includes src/**/*.{ts,tsx}
    - Excludes src/**/__tests__/** and src/mocks/**

## UI/UX Guidelines
- Prefer components from `src/components/ui/*` (shadcn/ui)
- Ensure accessibility, responsive layout, and consistent variants
- **UI Consistency**:
  - Prefer components from src/components/ui/*
  - Ensure accessibility (labels, roles, keyboard)
  - Implement responsive behavior
  - Use consistent variants (CVA)
  - Prefer components from src/components/ui/*; ensure accessibility, responsive layout, and consistent variants

## Development Workflow

- Editing workflow: make minimal, focused edits; preserve indentation; after edits run tests and lint; use absolute paths when referencing files

### Version Control Workflow
- Use a lightweight GitFlow — work on short-lived feature branches, open small PRs, squash-merge into main after review
- **Branch Naming Convention**:
  - feature/<short-desc>, fix/<short-desc>, chore/<short-desc>, docs/<short-desc>, refactor/<short-desc>
  - Reference task IDs when applicable (e.g., feature/123-login-page)
- **Version Control Best Practices**:
  - One task per branch: keep scope tight; avoid mixing unrelated changes.
  - **Commits**: Conventional Commits (feat:, fix:, chore:, docs:, refactor:, test:); one logical change per commit; prefer small atomic commits.
  - **Merge Strategy**:
    - Merge strategy: squash and merge; PR title reflects the final Conventional Commit.

### Pre-Deployment Checklist
- Pre-PR checks: run npm run lint and npm run test; ensure no type errors; update .env.example if env changes; update docs if behavior/UX changes.

### Pull Request Guidelines
- PR size: target <250 lines changed; include screenshots/GIFs for UI changes; describe rationale, risks, and testing steps.

## Development Principles
- **Definition of Done**: 
  - Tests passing
  - Lint clean
  - Types generated if DB changed
  - Docs updated
  - No console errors
  - Accessibility basics addressed

## State Management Principles
- **Query State Management**:
  - Use TanStack Query for server state
  - Invalidate related queries after mutations
  - Avoid ad-hoc global state

## Error Handling Principles
- Error handling: handle edge cases first; fail fast with clear user feedback; log meaningful errors (avoid silent catch).

## Task Management
- Task tracking: maintain TODO.md with checklists; one PR per checklist item when feasible; reference the item in PR description.

## Security Principles
- Environment & security: never commit secrets; require VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY; principle of least privilege.
  - Environment: requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (do not commit secrets).

## Authentication & Authorization Updates
- RBAC/Auth: magic link auth via Supabase; role order admin > presidente > secretario > conselheiro > citizen; protected routes with role checks.

## Generators Protocols
- **Protocol Generator**: Located at `src/utils/generators/protocoloGenerator.ts`
- **Protocol Format**: `TYPE-XXX/YYYY` (e.g., PROC-001/2025)
- **Supported Protocol Types**: 
  - PROC: Processo
  - RES: Resolução
  - OUV: Ouvidoria
  - REU: Reunião
  - ATA: Ata
  - CONV: Convite
  - DOC: Documento
  - PROJ: Projeto
  - REL: Relatório
  - NOT: Notificação

## Development Environment Tips
- Docker dev: code changes auto-reload via Vite HMR; no container restart required.
- HMR port configured: 24678 for WebSocket connections
- Nginx security headers configured for production
- Resource limits and health checks configured in docker-compose

## Recent Improvements (January 2025)
- ✅ Docker setup otimizado com multi-stage builds e non-root users
- ✅ Nginx configurado com headers de segurança e otimizações de performance
- ✅ Scripts automatizados para desenvolvimento e produção
- ✅ Estrutura de projeto reorganizada e limpa
- ✅ Remoção de dependências móveis (Capacitor/iOS)
- ✅ Consolidação de diretórios e arquivos de configuração