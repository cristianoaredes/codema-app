# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CODEMA - Sistema de Gestão Municipal for Itanhomi-MG
- **Municipality**: Itanhomi-MG (12,000 inhabitants)
- **Organization**: Conselho Municipal de Defesa do Meio Ambiente (CODEMA)
- **Purpose**: Complete digitalization of environmental council management
- **Stack**: React 18 + TypeScript + Vite + shadcn/ui + Supabase

## Common Development Commands

```bash
# Development
npm run dev           # Start development server on http://localhost:5173

# Build & Preview
npm run build         # Production build
npm run build:dev     # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint          # Run ESLint checks

# Supabase Database
npx supabase start    # Start local Supabase
npx supabase db reset # Reset database
npx supabase gen types typescript --local > src/integrations/supabase/types.ts  # Generate types
```

## Architecture & Structure

### Key Application Modules

1. **Authentication System** (`src/components/auth/`)
   - Multi-level role-based access (admin, president, secretary, counselor, citizen)
   - Magic link authentication via Supabase Auth
   - Protected routes with role verification

2. **Counselor Management** (`src/components/codema/conselheiros/`)
   - Complete CRUD for council members
   - Mandate expiration alerts (30, 15, 7 days)
   - Consecutive absence tracking with automatic alerts
   - Impediment management system

3. **Meeting System** (`src/components/codema/reunioes/`)
   - Intelligent scheduling with automatic convocation
   - Digital attendance control with quorum calculation
   - Automated email notifications
   - Minutes generation and version control

4. **Protocol System** (`src/utils/generators/protocoloGenerator.ts`)
   - Automatic protocol generation (PROC-001/2025 format)
   - Support for 10 document types
   - Complete traceability and backup

### Database Architecture

**Supabase Project**: `aqvbhmpdzvdbhvxhnemi`
- 19 implemented tables with complete RLS policies
- 35 security policies configured
- 11 audit triggers active
- Foreign key relationships validated

Key tables:
- `profiles` - User profiles with roles
- `reunioes` - Meeting management
- `presencas` - Attendance tracking
- `impedimentos` - Legal impediments
- `audit_logs` - Complete audit trail

### State Management Pattern

The application uses React Query for server state and local React state for UI:
- Supabase client configured with PKCE flow
- Custom hooks for data fetching (`useConselheiros`, `useReunioes`, etc.)
- Optimistic updates with proper error handling

### Component Patterns

- All UI components from shadcn/ui library
- Form handling with react-hook-form + zod validation
- Toast notifications with sonner
- Data tables with @tanstack/react-table

## Critical Implementation Notes

### TypeScript Configuration
- TypeScript is configured with relaxed rules (`noImplicitAny: false`, `strictNullChecks: false`)
- Path alias configured: `@/*` maps to `./src/*`
- ESLint has specific exceptions for codema modules

### Supabase Integration
- Client initialized in `src/integrations/supabase/client.ts`
- Types generated from database schema
- RLS policies enforce row-level security
- All database operations require authenticated user

### Protocol Generation
The protocol system is central to legal compliance:
```typescript
// Always use ProtocoloGenerator class for new protocols
import { ProtocoloGenerator } from '@/utils/generators/protocoloGenerator';
const protocolo = await ProtocoloGenerator.gerarProtocolo('PROC');
```

### Email System
Integrated email queue for automated notifications:
- Convocation emails for meetings
- Mandate expiration alerts
- System notifications

## Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=https://aqvbhmpdzvdbhvxhnemi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Testing Approach

No formal test framework configured. Manual testing via:
1. Development server with hot reload
2. Supabase Studio for database inspection
3. Browser DevTools for debugging

## Key Business Rules

1. **Quorum Calculation**: Simple majority (50% + 1) for regular decisions
2. **Mandate Alerts**: Automatic at 30, 15, and 7 days before expiration
3. **Absence Tracking**: Alert after 3 consecutive absences
4. **Protocol Format**: TYPE-XXX/YYYY (e.g., PROC-001/2025)
5. **Role Hierarchy**: admin > president > secretary > counselor > citizen

## Important Files to Know

- `src/App.tsx` - Main routing and layout
- `src/components/auth/AuthProvider.tsx` - Authentication context
- `src/integrations/supabase/client.ts` - Database client
- `src/utils/generators/protocoloGenerator.ts` - Protocol generation
- `docs/CODEMA_PROJECT_OVERVIEW.md` - Complete project documentation
- `supabase/migrations/` - Database schema evolution