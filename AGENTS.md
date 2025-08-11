# Repository Guidelines

## Project Structure & Module Organization
- App: `src/` with `components/`, `pages/`, `hooks/`, `utils/`, `services/`, `types/`, `integrations/supabase/`, `styles/`, `assets/`.
- Entry points: `index.html`, `src/main.tsx`, `src/App.tsx`.
- Static assets: `public/` (copied as-is), built output: `dist/`.
- Infrastructure: `Dockerfile`, `docker-compose.yml`, env files (`.env`, `.env.example`).
- Docs: `docs/` (architecture, UX, Supabase notes). Mobile: `ios/` via Capacitor.

## Build, Test, and Development Commands
```bash
# Install deps
npm ci  # or: npm install

# Local development (Vite on :8080 in Docker, default host locally)
npm run dev

# Lint TypeScript/React per eslint.config.js
npm run lint

# Production build and preview
npm run build
npm run preview  # serves dist

# Docker (dev)
docker compose up  # app:8080, adminer:8081, postgres:5432

# Docker (prod image)
docker build -t codema-app . && docker run -p 80:80 codema-app
```
Environment: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` or your compose environment.

## Coding Style & Naming Conventions
- Language: TypeScript + React (functional components).
- Linting: run `npm run lint`; rules disallow `any` except for whitelisted paths (see `eslint.config.js`).
- Files: components `PascalCase` in `src/components/...` using `.tsx`; hooks start with `use*` in `src/hooks/`; utilities `.ts` in `src/utils/`.
- Styling: Tailwind CSS; prefer utility classes and shared UI primitives under `src/components/ui/`.

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest + React Testing Library, colocate as `*.test.ts(x)` and add an `npm test` script.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits used in history, e.g. `feat(scope): message`, `fix: ...`, `refactor(auth): ...`. Automated commits may use `[dyad]` prefix.
- PRs: include clear description, link issues, screenshots/GIFs for UI changes, and notes on Supabase/schema or env impacts.
- Checklist: `npm run lint` passes, app builds (`npm run build`), and relevant docs updated.

## Security & Configuration Tips
- Never commit secrets. Use `.env` (see `.env.example`).
- Supabase: migrations under `supabase/migrations/`; avoid exposing service keys in frontend.
- Mobile: for iOS builds, run `npx cap sync ios` after `npm run build`.
