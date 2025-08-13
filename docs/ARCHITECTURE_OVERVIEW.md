# CODEMA – Arquitetura, Racional e Plano 80/20

## 1. Contexto e Objetivo
O sistema CODEMA digitaliza processos do Conselho Municipal de Defesa do Meio Ambiente de Itanhomi-MG. Este documento consolida:
- O que já existe e por quê
- Decisões arquiteturais principais
- Simplificações (80/20) para operação estável
- Próximos passos com foco em qualidade e manutenção

## 2. Stack Técnica (resumo)
- Frontend: React 18 + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS (componentes reutilizáveis em `src/components/ui`)
- Estado/Server: TanStack Query
- Forms & validação: React Hook Form + Zod
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Testes: Vitest + Testing Library + jsdom
- Build/Dev: Vite (HMR); Docker opcional para padronizar ambiente

## 3. Módulos Atuais e Motivações
- Autenticação (`src/components/auth/`, `src/hooks/useAuth.ts`): Acesso seguro com níveis de permissão (via Supabase Auth).
- Conselheiros (`src/components/codema/conselheiros/`, `src/pages/codema/conselheiros/`): Gestão de membros do conselho, necessária para quórum e atos oficiais.
- Reuniões (`src/components/codema/reunioes/`, `src/pages/reunioes/`): Agendamento, convocação e controle de presença (cumprimento legal e transparência).
- Atas (`src/components/codema/atas/`): Elaboração, versionamento e aprovação — registro formal das decisões.
- Resoluções (`src/components/codema/resolucoes/`): Criação e publicação de atos normativos — publicidade e validade jurídica.
- Protocolos (`src/pages/codema/protocolos/`, migrations relacionadas): Numeração automática — organização e rastreabilidade.
- Ouvidoria (`src/pages/ouvidoria/`): Recebimento e gestão de denúncias — participação social.
- FMA (`src/pages/fma/`): Gestão do Fundo Municipal do Meio Ambiente — governança financeira.
- Auditoria/Logs (`src/utils/monitoring/`, migrations de audit logs): Rastreabilidade e conformidade.
- Painel/Dashboard (`src/pages/Dashboard.tsx` + cards): Visão rápida de status e indicadores.
## 4. Estrutura de Pastas (alto nível)

- `src/components/`
  - `auth/`: telas e provider de autenticação
  - `codema/`: domínios de negócio (atas, resoluções, conselheiros, reuniões)
  - `ui/`: componentes reutilizáveis shadcn/ui (botões, inputs, diálogos, etc.)
- `src/pages/`: rotas de alto nível
- `src/hooks/`: hooks compartilhados (auth, buscas, teclado, toasts)
- `src/integrations/supabase/`: cliente e tipos
- `src/utils/`: utilitários (monitoramento, e-mail, geração, etc.)
- `supabase/migrations/`: SQL versionado do schema

## 5. Decisões Arquiteturais (ADR curto)
- SPA com React + Vite: simplicidade, HMR, ecossistema rico.
- Supabase como backend: acelera entrega (Auth, DB, Storage), reduzendo peças próprias.
- shadcn/ui: padrão visual consistente e acessibilidade.
- TanStack Query: cache e sincronização de dados remotos confiável.
- Form + Zod: UX melhor em formulários, tipagem e validação unificadas.
- Docker (opcional): ambiente padronizado para dev/CI, imagem prod via Nginx estático.

## 6. Fluxos Críticos (resumo)
- Login: Supabase Auth → `AuthProvider` → rotas protegidas (`ProtectedRoute`).
- CRUD Conselheiros: hooks de dados + formulários (React Hook Form) + validações.
- Reuniões: criação → convocação → presenças → atas → resoluções (encadeado por telas).
- Publicação de Resoluções: revisão → status → publicação (com histórico/auditoria).
- Auditoria: logs de ações relevantes (migrations + `utils/monitoring`).

## 7. 80/20 – Núcleo para operar “perfeito”
1) Autenticação e perfis mínimos (admin, membro, leitura)
2) Conselheiros (cadastro e status)
3) Reuniões (agenda, presença)
4) Atas (redação e aprovação)
5) Resoluções (criação e publicação)
6) Logs/Auditoria básica

Cortar/adiar do escopo inicial (pode voltar depois):
- FMA (se não for obrigatório agora)
- Ouvidoria (migrar para fase 2, se puder)
- Protocolos avançados (ficar no básico)
- Features de “Studio/BI” ou dashboards avançados

## 8. Simplificações imediatas
- Consolidar componentes UI duplicados e remover wrappers não usados.
- Remover serviços/utilitários não referenciados.
- Padronizar estados de carregamento/erro (componente único).
- Centralizar schemas Zod por domínio.
- Revisar RLS/Policies do Supabase para níveis essenciais apenas.
- Reduzir variáveis de ambiente às essenciais.

## 9. Qualidade e Observabilidade
- Testes: focar em unitários de hooks e forms críticos + integrações mínimas das rotas principais.
- Monitoração: eventos de auditoria principais; métricas leves (tempo de resposta, erros UI).
- Segurança: verificação de roles nas rotas e consultas; validação de inputs.

## 10. Roadmap curto (4-6 semanas)
- Semana 1: limpeza e remoções (dead code, duplicações), testes mínimos de smoke.
- Semana 2: consolidar módulos 80/20, revisar políticas e schemas.
- Semana 3: hardening de autenticação e navegação.
- Semana 4: testes de regressão e acessibilidade.
- Semana 5-6: docs finais, refinamentos e automações de CI.
