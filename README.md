# 🌿 CODEMA - Sistema de Gestão Ambiental Municipal

![CI Pipeline](https://github.com/cristianocosta/codema-app/workflows/CI%20Pipeline/badge.svg)
![Deploy](https://github.com/cristianocosta/codema-app/workflows/Deploy%20to%20Production/badge.svg)
![Tests](https://img.shields.io/badge/tests-15%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-70%25-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18.3-blue)

Sistema completo de digitalização do Conselho Municipal de Defesa do Meio Ambiente de Itanhomi-MG.

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

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Containerização**: Docker + Docker Compose
- **Web Server**: Nginx (produção)
- **Deploy**: Docker / Netlify / Vercel

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

- **🔐 Autenticação**: Magic link com múltiplos níveis de acesso
- **👥 Conselheiros**: Gestão completa de membros do conselho
- **📅 Reuniões**: Agendamento, convocação e controle de presença
- **📝 Atas**: Elaboração, versionamento e aprovação
- **📜 Resoluções**: Criação e publicação de resoluções
- **🔢 Protocolos**: Sistema automático de numeração
- **📢 Ouvidoria**: Denúncias e fiscalização ambiental
- **💰 FMA**: Gestão do Fundo Municipal de Meio Ambiente

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
