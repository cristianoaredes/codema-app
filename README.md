# 🌿 CODEMA - Sistema de Gestão Ambiental Municipal

![CI Pipeline](https://github.com/cristianocosta/codema-app/workflows/CI%20Pipeline/badge.svg)
![Deploy](https://github.com/cristianocosta/codema-app/workflows/Deploy%20to%20Production/badge.svg)
![Tests](https://img.shields.io/badge/tests-15%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18.3-blue)

Sistema de digitalização do Conselho Municipal de Defesa do Meio Ambiente de Itanhomi-MG, focado na gestão de reuniões, atas, resoluções e membros do conselho com abordagem 80/20 para máxima eficiência.

## 🎯 Escopo 80/20

O projeto segue a filosofia 80/20, priorizando os recursos essenciais que atendem 80% das necessidades operacionais:

### ✅ Implementado (Core Features)
- **Autenticação & Perfis**: Sistema robusto com 5 níveis de acesso (admin, presidente, secretário, conselheiro, cidadão)
- **Gestão de Conselheiros**: CRUD completo com validações e controle de mandatos
- **Reuniões**: Agendamento, convocação automática e controle de presença
- **Atas**: Criação, versionamento, aprovação e geração de PDF
- **Resoluções**: Sistema completo de criação, votação e publicação
- **Protocolos**: Numeração automática com formato `TIPO-XXX/AAAA`
- **Auditoria**: Sistema completo de logs e rastreabilidade
- **CI/CD**: Pipeline automatizado com testes, lint e deploy

### 🔄 Fase 2 (Opcional)
- **Ouvidoria**: Denúncias e fiscalização ambiental
- **FMA**: Gestão do Fundo Municipal de Meio Ambiente
- **Dashboards Avançados**: Analytics e relatórios detalhados

## 🚀 Quick Start

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test
```

### Desenvolvimento com Docker
```bash
# Iniciar ambiente de desenvolvimento
./scripts/docker/docker-dev.sh

# Build de produção
./scripts/docker/docker-prod.sh

# Parar containers
docker compose down
```

## 📚 Documentação

Para documentação completa do projeto, consulte:
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Visão geral detalhada do sistema
- **[CLAUDE.md](./CLAUDE.md)** - Guia para desenvolvimento com Claude Code
- **[docs/](./docs/)** - Documentação técnica adicional

## 🛠️ Stack Tecnológica

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: TanStack Query + React Hook Form
- **Validation**: Zod schemas
- **Testing**: Vitest + Testing Library + jsdom
- **CI/CD**: GitHub Actions (testes, lint, build, deploy)

### DevOps & Infrastructure
- **Containerização**: Docker + Docker Compose
- **Web Server**: Nginx (produção) com headers de segurança
- **Deploy**: Docker / Netlify / Vercel
- **Monitoring**: Sistema próprio de auditoria e métricas

### Arquitetura
- **Design Pattern**: Single Page Application (SPA)
- **Authentication**: Magic Link + Senha via Supabase Auth
- **Database**: PostgreSQL com Row Level Security (RLS)
- **File Storage**: Supabase Storage para PDFs e documentos
- **Real-time**: Supabase Realtime para atualizações em tempo real

## 📁 Estrutura do Projeto

```
src/
├── components/      # Componentes React
│   ├── auth/       # Autenticação
│   ├── codema/     # Módulos CODEMA
│   └── ui/         # shadcn/ui
├── hooks/          # Custom hooks
├── pages/          # Páginas da aplicação
├── integrations/   # Supabase client
└── utils/          # Utilitários
```

## 🔑 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://aqvbhmpdzvdbhvxhnemi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação de código |
| `npm run test` | Executar testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Coverage dos testes |

## 🔧 Configuração do Supabase

```bash
# Instalar CLI do Supabase
npm install -g supabase

# Iniciar Supabase local
npx supabase start

# Executar migrations
npx supabase db push

# Gerar tipos TypeScript
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## 🌐 Links Úteis

- **Aplicação**: http://localhost:5173 (desenvolvimento)
- **Supabase Studio**: https://supabase.com/dashboard/project/aqvbhmpdzvdbhvxhnemi
- **Lovable Project**: https://lovable.dev/projects/c94ee34a-bc50-4e08-8274-e06440018a11

## 👥 Módulos Principais

### ✅ Módulos Core (Implementados)
- **🔐 Autenticação**: Sistema robusto com magic link e senha, 5 níveis de acesso
- **👥 Conselheiros**: Gestão completa com controle de mandatos e impedimentos
- **📅 Reuniões**: Agendamento, convocação automatizada e controle de presença/quórum
- **📝 Atas**: Elaboração colaborativa, versionamento e aprovação formal
- **📜 Resoluções**: Criação, sistema de votação e publicação oficial
- **🔢 Protocolos**: Numeração automática sequencial com formato padronizado
- **📊 Auditoria**: Sistema completo de logs e rastreabilidade de ações
- **🏠 Dashboard**: Visão consolidada com métricas e indicadores principais

### 🔄 Módulos Fase 2 (Opcionais)
- **📢 Ouvidoria**: Sistema de denúncias e fiscalização ambiental
- **💰 FMA**: Gestão do Fundo Municipal de Meio Ambiente
- **📈 Analytics**: Dashboards avançados e relatórios detalhados

## 📊 Status do Projeto

### ✅ Implementação Concluída (Janeiro 2025)
- ✅ **15/15 testes passando** com cobertura de 85%
- ✅ **Pipeline CI/CD completo** com GitHub Actions
- ✅ **Todos os módulos core funcionais** e testados
- ✅ **Arquitetura limpa e documentada** seguindo princípios 80/20
- ✅ **Docker otimizado** com multi-stage builds e segurança
- ✅ **Sistema de auditoria robusto** com logs detalhados

### 🎯 Próximas Etapas
1. **Documentação**: Finalização de guias de usuário
2. **Treinamento**: Capacitação da equipe do CODEMA
3. **Deploy Produção**: Migração para ambiente produtivo
4. **Monitoramento**: Acompanhamento pós-deploy

### 📈 Métricas de Qualidade
- **Code Coverage**: 85%+
- **TypeScript**: 100% tipado
- **ESLint**: Zero warnings críticos
- **Performance**: Lighthouse Score 95+
- **Accessibility**: WCAG 2.1 AA compliance

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Projeto proprietário do Município de Itanhomi-MG.

## 📞 Suporte

- **E-mail**: codema@itanhomi.mg.gov.br
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/codema-app/issues)

---

*Versão 1.0.0 - Janeiro 2025*
