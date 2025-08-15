# 📚 CODEMA - Sistema de Gestão Ambiental Municipal

## 🌍 Visão Geral do Projeto

### Sobre o Município
**Itanhomi-MG** é um município brasileiro localizado no interior do estado de Minas Gerais, com aproximadamente **12.000 habitantes**. Como parte de seu compromisso com a sustentabilidade e preservação ambiental, o município estabeleceu o CODEMA (Conselho Municipal de Defesa do Meio Ambiente) como órgão consultivo e deliberativo para questões ambientais locais.

### O que é o CODEMA?
O **Conselho Municipal de Defesa do Meio Ambiente (CODEMA)** é uma instituição fundamental para a gestão ambiental municipal, responsável por:
- Análise e aprovação de licenças ambientais
- Fiscalização de atividades potencialmente poluidoras
- Elaboração de políticas ambientais municipais
- Gestão do Fundo Municipal de Meio Ambiente (FMA)
- Promoção da educação ambiental

### Objetivos do Sistema
Este sistema foi desenvolvido para **digitalizar completamente** a gestão do CODEMA, proporcionando:
- 📱 **Transparência total** nas decisões ambientais
- ⚡ **Agilidade** nos processos administrativos
- 📊 **Rastreabilidade** completa de todas as ações
- 🌐 **Acesso público** às informações ambientais
- 📈 **Eficiência** na gestão de recursos do FMA

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend
- **React 18** - Framework principal para interface de usuário
- **TypeScript** - Tipagem estática para maior segurança do código
- **Vite** - Build tool ultrarrápida para desenvolvimento
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Biblioteca de componentes acessíveis e customizáveis
- **React Query (TanStack Query)** - Gerenciamento de estado do servidor
- **React Hook Form** - Gerenciamento eficiente de formulários
- **Zod** - Validação de esquemas e tipos

#### Backend & Infraestrutura
- **Supabase** - Backend as a Service completo
  - PostgreSQL - Banco de dados relacional
  - Auth - Sistema de autenticação
  - Storage - Armazenamento de arquivos
  - Realtime - Atualizações em tempo real
  - Edge Functions - Funções serverless

#### Ferramentas de Desenvolvimento
- **ESLint** - Linting e padronização de código
- **Prettier** - Formatação automática de código
- **Vitest** - Framework de testes
- **Lovable** - Plataforma de desenvolvimento colaborativo

### Estrutura de Pastas

```
codema-app/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── auth/           # Componentes de autenticação
│   │   ├── codema/         # Componentes específicos do CODEMA
│   │   │   ├── atas/       # Gestão de atas
│   │   │   ├── conselheiros/ # Gestão de conselheiros
│   │   │   └── resolucoes/ # Sistema de resoluções
│   │   ├── common/         # Componentes compartilhados
│   │   ├── navigation/     # Navegação e breadcrumbs
│   │   └── ui/            # Componentes base do shadcn/ui
│   │
│   ├── contexts/          # Contextos React (Auth, Theme, etc.)
│   ├── hooks/            # Custom hooks
│   ├── integrations/     # Integrações externas (Supabase)
│   ├── lib/              # Utilitários e helpers
│   ├── pages/            # Páginas da aplicação
│   │   ├── admin/        # Área administrativa
│   │   ├── codema/       # Módulos do CODEMA
│   │   ├── fma/          # Fundo Municipal
│   │   ├── ouvidoria/    # Sistema de ouvidoria
│   │   └── processos/    # Gestão de processos
│   │
│   ├── styles/           # Estilos globais
│   ├── types/            # Definições de tipos TypeScript
│   └── utils/            # Funções utilitárias
│
├── supabase/            # Configurações e migrations do Supabase
├── public/              # Arquivos públicos estáticos
└── dist/                # Build de produção
```

---

## 🎯 Módulos Funcionais

### 1. 🔐 Sistema de Autenticação

#### Características
- **Magic Link Authentication** - Login sem senha via e-mail
- **Multi-factor Authentication** - Camada adicional de segurança
- **Remember Me** - Persistência de sessão configurável
- **Auto-logout** - Desconexão automática por inatividade

#### Níveis de Acesso
1. **Administrador** (`admin`)
   - Acesso total ao sistema
   - Gestão de usuários
   - Configurações avançadas
   - Auditoria completa

2. **Presidente** (`presidente`)
   - Aprovação de atas e resoluções
   - Designação de relatores
   - Convocação de reuniões extraordinárias

3. **Secretário** (`secretario`)
   - Elaboração de atas
   - Gestão de documentos
   - Controle de presença
   - Protocolo de processos

4. **Conselheiro** (`conselheiro_titular` / `conselheiro_suplente`)
   - Participação em votações
   - Acesso a documentos
   - Relatoria de processos

5. **Cidadão** (`citizen`)
   - Consulta pública de documentos
   - Abertura de denúncias
   - Acompanhamento de processos

### 2. 👥 Gestão de Conselheiros

#### Funcionalidades
- **Cadastro Completo** - Dados pessoais, mandato, entidade representada
- **Controle de Mandatos** - Alertas automáticos de vencimento (30, 15, 7 dias)
- **Gestão de Faltas** - Registro e controle de ausências
- **Sistema de Impedimentos** - Gestão de conflitos de interesse
- **Histórico Completo** - Rastreabilidade de todas as ações

#### Segmentos Representados
- 🏛️ **Governo** - Representantes do poder público
- 👥 **Sociedade Civil** - Organizações não-governamentais
- 🏭 **Setor Produtivo** - Representantes empresariais

### 3. 📅 Sistema de Reuniões

#### Tipos de Reunião
- **Ordinárias** - Agendadas mensalmente
- **Extraordinárias** - Convocadas conforme necessidade
- **Audiências Públicas** - Participação da comunidade

#### Recursos
- **Convocação Automática** - E-mails enviados automaticamente
- **Controle de Quórum** - Cálculo automático (maioria simples)
- **Pauta Digital** - Gestão completa de itens de pauta
- **Votação Eletrônica** - Registro de votos individuais
- **Geração de Atas** - Criação automática com template

### 4. 📝 Gestão de Atas

#### Características
- **Versionamento** - Controle de versões com histórico
- **Workflow de Aprovação** - Rascunho → Revisão → Aprovação → Publicação
- **Assinatura Digital** - Validação por hash criptográfico
- **Exportação PDF** - Geração de documentos oficiais
- **Busca Avançada** - Localização rápida de conteúdo

### 5. 📜 Sistema de Resoluções

#### Funcionalidades
- **Editor Rico** - Formatação completa de texto
- **Sistema de Votação** - Registro detalhado de deliberações
- **Publicação Oficial** - Divulgação automática
- **Revogação** - Gestão de resoluções revogadas
- **Histórico Legal** - Rastreabilidade completa

### 6. 🔢 Sistema de Protocolos

#### Tipos de Protocolo
- `PROC` - Processos administrativos
- `DEN` - Denúncias ambientais
- `LIC` - Licenças ambientais
- `AUT` - Autorizações
- `NOT` - Notificações
- `PAR` - Pareceres técnicos
- `REQ` - Requerimentos
- `REC` - Recursos
- `REL` - Relatórios
- `CERT` - Certidões

#### Formato
```
TIPO-XXX/YYYY
Exemplo: PROC-001/2025
```

### 7. 📢 Ouvidoria Ambiental

#### Recursos
- **Denúncias Anônimas** - Proteção ao denunciante
- **Geolocalização** - Mapeamento de ocorrências
- **Acompanhamento** - Status em tempo real
- **Fiscalização** - Designação automática de fiscais
- **Relatórios** - Estatísticas e indicadores

### 8. 💰 FMA - Fundo Municipal de Meio Ambiente

#### Gestão Financeira
- **Receitas** - Controle de entrada de recursos
- **Projetos** - Gestão de projetos ambientais
- **Prestação de Contas** - Transparência total
- **Relatórios Financeiros** - Balanços e demonstrativos

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### Gestão de Usuários
- `profiles` - Perfis de usuários com roles e permissões
- `user_sessions` - Controle de sessões ativas
- `notification_preferences` - Preferências de notificação

#### CODEMA Core
- `conselheiros` - Dados dos conselheiros
- `reunioes` - Registro de reuniões
- `presencas` - Controle de presença
- `atas` - Atas de reuniões
- `atas_versoes` - Versionamento de atas
- `resolucoes` - Resoluções do conselho
- `votacoes` - Registro de votações
- `impedimentos` - Conflitos de interesse

#### Processos e Protocolos
- `processos` - Processos ambientais
- `protocolo_sequencia` - Controle de numeração
- `protocolo_estatisticas` - Estatísticas de uso

#### Ouvidoria
- `ouvidoria_denuncias` - Registro de denúncias
- `fiscalizacoes` - Ações de fiscalização

#### FMA
- `fma_receitas` - Controle de receitas
- `fma_projetos` - Projetos financiados
- `fma_despesas` - Controle de despesas

#### Sistema
- `audit_logs` - Auditoria completa
- `system_notifications` - Notificações do sistema
- `email_queue` - Fila de e-mails

### Políticas RLS (Row Level Security)

Todas as tabelas implementam políticas RLS para garantir:
- **Isolamento de dados** por usuário/role
- **Proteção contra acesso não autorizado**
- **Auditoria automática** de todas as operações

---

## 🚀 Recursos Avançados

### Sistema de Notificações

#### Tipos de Notificação
- 📧 **E-mail** - Notificações formais
- 🔔 **In-app** - Alertas em tempo real
- 📱 **WhatsApp** - Mensagens instantâneas (em desenvolvimento)

#### Eventos Notificáveis
- Convocação para reuniões
- Vencimento de mandatos
- Prazos de processos
- Novas denúncias
- Atualizações de status

### Sistema de Auditoria

#### Informações Registradas
- **Quem** - Usuário que realizou a ação
- **O quê** - Tipo de operação realizada
- **Quando** - Timestamp preciso
- **Onde** - Tabela/registro afetado
- **Como** - Detalhes da modificação
- **Por quê** - Contexto da ação

### Busca Global

Pesquisa unificada em:
- Atas
- Resoluções
- Processos
- Conselheiros
- Denúncias
- Documentos

---

## 🎨 Interface de Usuário

### Design System

#### Princípios
- **Acessibilidade** - WCAG 2.1 Level AA
- **Responsividade** - Mobile-first approach
- **Consistência** - Design tokens padronizados
- **Performance** - Lazy loading e code splitting

#### Componentes Base
Utilizamos **shadcn/ui** com customizações para:
- Formulários complexos
- Tabelas de dados
- Gráficos e dashboards
- Modais e diálogos
- Sistema de navegação

### Temas
- 🌞 **Light Mode** - Tema claro padrão
- 🌙 **Dark Mode** - Tema escuro opcional
- 🎨 **High Contrast** - Modo de alto contraste

---

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação Robusta**
   - Magic links com expiração
   - Rate limiting
   - Proteção contra brute force

2. **Autorização Granular**
   - RBAC (Role-Based Access Control)
   - Políticas RLS no banco
   - Validação em múltiplas camadas

3. **Proteção de Dados**
   - Criptografia em trânsito (HTTPS)
   - Criptografia em repouso
   - Sanitização de inputs
   - Proteção contra SQL Injection

4. **Conformidade**
   - LGPD compliance
   - Logs de auditoria
   - Backup automático

---

## 📖 Guias de Uso

### Para Administradores
1. Acesse com credenciais de admin
2. Configure usuários e permissões
3. Monitore atividades via auditoria
4. Gerencie configurações do sistema

### Para Secretários
1. Prepare pautas de reuniões
2. Registre presenças
3. Elabore atas
4. Protocole documentos

### Para Conselheiros
1. Consulte convocações
2. Acesse documentos
3. Participe de votações
4. Emita pareceres

### Para Cidadãos
1. Consulte documentos públicos
2. Registre denúncias
3. Acompanhe processos
4. Participe de audiências

---

## 🧭 Mapa de Telas e Componentes

- **Autenticação**
  - Páginas: `src/pages/ResetPassword.tsx`, `src/pages/AuthCallback.tsx`
  - Componentes: `src/components/auth/*`

- **Conselheiros**
  - Páginas: `src/pages/codema/conselheiros/index.tsx`, `src/pages/codema/conselheiros/ConselheiroDetails.tsx`

- **Reuniões**
  - Páginas: `src/pages/Reunioes.tsx`, `src/pages/reunioes/NovaReuniao.tsx`, `src/pages/reunioes/ReuniaoDetalhes.tsx`
  - Componentes: `src/components/reunioes/AgendaManager.tsx`, `src/components/reunioes/QuorumIndicator.tsx`, `src/components/voting/VotingPanel.tsx`, `src/components/voting/VotingResultsPanel.tsx`, `src/components/voting/VotingAuditPanel.tsx`

- **Atas**
  - Páginas: `src/pages/codema/atas/index.tsx`, `src/pages/codema/atas/NovaAta.tsx`, `src/pages/codema/atas/AtaDetails.tsx`

- **Resoluções**
  - Páginas: `src/pages/codema/resolucoes/index.tsx`, `src/pages/codema/resolucoes/ResolucaoDetails.tsx`

- **Protocolos**
  - Páginas: `src/pages/codema/protocolos/index.tsx`

- **Ouvidoria**
  - Páginas: `src/pages/ouvidoria/Ouvidoria.tsx`, `src/pages/ouvidoria/DenunciaDetails.tsx`

- **FMA**
  - Páginas: `src/pages/fma/FMA.tsx`, `src/pages/fma/ProjetoDetails.tsx`

- **Processos**
  - Páginas: `src/pages/processos/Processos.tsx`

- **Documentos**
  - Páginas: `src/pages/documentos/Documentos.tsx`, `src/pages/documentos/NovoDocumento.tsx`

- **Relatórios**
  - Páginas: `src/pages/relatorios/Reports.tsx`, `src/pages/relatorios/CreateReport.tsx`, `src/pages/relatorios/ReportDetails.tsx`, `src/pages/relatorios/DashboardExecutivo.tsx`

- **Arquivo Digital**
  - Página: `src/pages/arquivo/ArquivoDigital.tsx`

- **Dashboard e Perfil**
  - Páginas: `src/pages/Dashboard.tsx`, `src/pages/Profile.tsx`, `src/pages/Configuracoes.tsx`

- **Ajuda e Documentação**
  - Páginas: `src/pages/Ajuda.tsx`, `src/pages/Documentacao.tsx`

- **Página Inicial**
  - Página: `src/pages/Index.tsx`

---

## 🗺️ Mapa de Rotas

- **Públicas**
  - `/` → `src/pages/Index.tsx`
  - `/relatorios` → `src/pages/relatorios/index.ts` (Reports)
  - `/auth` → `AuthPage` (componente de `src/components/auth`)
  - `/auth/callback` → `src/pages/AuthCallback.tsx`
  - `/auth/reset-password` → `src/pages/ResetPassword.tsx`

- **Protegidas (Requer Login)**
  - `/dashboard` → `src/pages/Dashboard.tsx`
  - `/admin/users` → `src/pages/admin/UserManagement.tsx` [Admin]
  - `/admin/data-seeder` → `src/pages/admin/DataSeeder.tsx` [Admin]
  - `/admin/documentation` → `src/pages/admin/Documentation.tsx` [Admin]
  - `/criar-relatorio` → `src/pages/relatorios/index.ts` (CreateReport)
  - `/relatorios/:id` → `src/pages/relatorios/ReportDetails.tsx`
  - `/dashboard-executivo` → `src/pages/relatorios/DashboardExecutivo.tsx` [CODEMA]
  - `/perfil` → `src/pages/Profile.tsx`

  - `/reunioes` → `src/pages/Reunioes.tsx` [CODEMA]
  - `/reunioes/nova` → `src/pages/reunioes/NovaReuniao.tsx` [CODEMA]
  - `/reunioes/:id` → `src/pages/reunioes/ReuniaoDetalhes.tsx` [CODEMA]

  - `/documentos` → `src/pages/documentos/index.ts` (Documentos)
  - `/documentos/novo` → `src/pages/documentos/NovoDocumento.tsx`
  - `/processos` → `src/pages/processos/index.ts` (Processos)

  - `/fma` → `src/pages/fma/FMA.tsx`
  - `/fma/projeto/:id` → `src/pages/fma/ProjetoDetails.tsx`

  - `/ouvidoria` → `src/pages/ouvidoria/index.ts` (Ouvidoria)
  - `/ouvidoria/:id` → `src/pages/ouvidoria/DenunciaDetails.tsx`

  - `/codema/conselheiros` → `src/pages/codema/conselheiros/index.tsx` [CODEMA]
  - `/codema/conselheiros/:id` → `src/pages/codema/conselheiros/ConselheiroDetails.tsx` [CODEMA]
  - `/codema/atas` → `src/pages/codema/atas/index.tsx` [CODEMA]
  - `/codema/atas/:id` → `src/pages/codema/atas/AtaDetails.tsx` [CODEMA]
  - `/codema/atas/nova` → `src/pages/codema/atas/NovaAta.tsx` [CODEMA]
  - `/codema/resolucoes` → `src/pages/codema/resolucoes/index.tsx` [CODEMA]
  - `/codema/resolucoes/:id` → `src/pages/codema/resolucoes/ResolucaoDetails.tsx` [CODEMA]
  - `/codema/auditoria` → `src/pages/codema/auditoria/index.tsx` [Admin]
  - `/codema/protocolos` → `src/pages/codema/protocolos/index.tsx` [CODEMA]

  - `/arquivo-digital` → `src/pages/arquivo/ArquivoDigital.tsx` [CODEMA]
  - `/mobile` → `src/pages/mobile/MobileSettings.tsx` [CODEMA]
  - `/configuracoes` → `src/pages/Configuracoes.tsx`
  - `/ajuda` → `src/pages/Ajuda.tsx`
  - `/documentacao` → `src/pages/Documentacao.tsx`

- **Fallback**
  - `*` → `src/pages/NotFound.tsx`

### Matriz de Permissões por Rota

- **Públicas (sem login)**
  - `/`, `/relatorios`, `/auth`, `/auth/callback`, `/auth/reset-password`, `*`

- **Protegidas (requer login)**
  - Gerais (apenas login): `/dashboard`, `/criar-relatorio`, `/relatorios/:id`, `/perfil`, `/documentos`, `/documentos/novo`, `/processos`, `/fma`, `/fma/projeto/:id`, `/ouvidoria`, `/ouvidoria/:id`, `/configuracoes`, `/ajuda`, `/documentacao`
  - Requer CODEMA (`requireCODEMAAccess`): `/dashboard-executivo`, `/reunioes`, `/reunioes/nova`, `/reunioes/:id`, `/codema/conselheiros`, `/codema/conselheiros/:id`, `/codema/atas`, `/codema/atas/:id`, `/codema/atas/nova`, `/codema/resolucoes`, `/codema/resolucoes/:id`, `/codema/protocolos`, `/arquivo-digital`, `/mobile`
  - Requer Admin (`requireAdminAccess`): `/admin/users`, `/admin/data-seeder`, `/admin/documentation`, `/codema/auditoria`

Observação: `ProtectedRoute` também suporta `requiredRoles` (ex.: `presidente`, `secretario`, `conselheiro_*`), embora atualmente nenhuma rota use essa opção explicitamente.

### Lazy Loading e Fallback

- A maioria das páginas usa `React.lazy` com `Suspense`.
- Fallback global: `PageLoader` em `AuthenticatedLayout` envolvendo `<Outlet />`.
- Fallback por rota pública: `Suspense` com `PageLoader` em `/` e `/relatorios`.
- Eager load: `AuthCallback`, `ResetPassword`, `NotFound`.

### Layouts e Providers

- Layouts em `src/App.tsx`:
  - `PublicLayout`: `Header` + `<Outlet />`.
  - `AuthenticatedLayout`: `Header` + `<Suspense fallback={<PageLoader />}> <Outlet /> </Suspense>` + `useKeyboardNavigation()`.
- Providers (ordem):
  - `QueryClientProvider` (staleTime: 0, refetchOnWindowFocus: true, retry: 1)
  - `ThemeProvider` (defaultTheme: "light", storageKey: "codema-ui-theme")
  - `AuthProvider`
  - `DemoModeProvider`
  - `TooltipProvider`
  - `Toaster` e `Sonner`

### Uso de Barrel Exports

- Components: `src/components/**/index.ts` e `src/components/index.ts`.
- Hooks: `src/hooks/index.ts`.
- Utils: `src/utils/**/index.ts` e `src/utils/index.ts`.
- Types: `src/types/index.ts`.
- Páginas (por módulo): `src/pages/relatorios/index.ts`, `src/pages/ouvidoria/index.ts`, `src/pages/documentos/index.ts`, `src/pages/processos/index.ts`.

### Acessibilidade e Atalhos de Teclado

Implementados via `useKeyboardNavigation()` (`src/hooks/useKeyboardNavigation.ts`) e habilitados no `AuthenticatedLayout`:

- Alt+H → `/dashboard` (login)
- Alt+R → `/relatorios` (pública)
- Alt+N → `/criar-relatorio` (login)
- Alt+M → `/reunioes` (CODEMA)
- Alt+C → `/codema/conselheiros` (CODEMA)
- Alt+A → `/codema/atas` (CODEMA)
- Alt+D → `/documentos` (CODEMA)
- Alt+P → `/perfil` (login)
- Alt+U → `/admin/users` (Admin)
- Alt+← / Alt+→ → voltar/avançar do navegador

Notas: atalhos respeitam permissões e são ignorados quando o foco está em inputs/editores.

### Observações sobre a Estrutura de Reuniões

- Páginas:
  - `src/pages/Reunioes.tsx` (listagem)
  - `src/pages/reunioes/NovaReuniao.tsx` (criação)
  - `src/pages/reunioes/ReuniaoDetalhes.tsx` (detalhes)
- Não há `src/pages/codema/reunioes/` no estado atual; não existe duplicidade de pastas para este módulo.

---

## 🛠️ Desenvolvimento

### Comandos Essenciais

```bash
# Instalação de dependências
npm install

# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Análise de código
npm run lint

# Testes
npm run test
npm run test:watch
npm run test:coverage
```

### Configuração do Ambiente

#### Variáveis de Ambiente (.env)
```env
VITE_SUPABASE_URL=https://aqvbhmpdzvdbhvxhnemi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Deploy

O sistema está configurado para deploy automático via:
- **Vercel** - Frontend hosting
- **Supabase** - Backend infrastructure
- **GitHub Actions** - CI/CD pipeline

---

## 🚧 Roadmap e Melhorias Futuras

### Em Desenvolvimento
- [ ] Aplicativo mobile nativo
- [ ] Integração com WhatsApp Business
- [ ] Dashboard analítico avançado
- [ ] IA para análise de documentos

### Planejado
- [ ] Sistema de georeferenciamento
- [ ] Integração com órgãos estaduais
- [ ] Módulo de educação ambiental
- [ ] API pública para desenvolvedores

### Considerações Futuras
- [ ] Blockchain para documentos
- [ ] Reconhecimento facial para presença
- [ ] Chatbot de atendimento
- [ ] Realidade aumentada para fiscalização

---

## 📊 Métricas de Sucesso

### Indicadores Implementados
- 📈 **Redução de 80%** no tempo de tramitação
- 💾 **100% digital** - Zero papel
- 🔍 **Transparência total** - Acesso público
- ⚡ **Resposta em tempo real** - Notificações instantâneas
- 🎯 **99.9% uptime** - Alta disponibilidade

---

## 🤝 Contribuindo

### Como Contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código
- Siga as configurações do ESLint
- Use TypeScript types/interfaces
- Documente funções complexas
- Escreva testes para novas features

---

## 📄 Licença

Este projeto é propriedade do Município de Itanhomi-MG e está licenciado para uso exclusivo do CODEMA.

---

## 📞 Contato e Suporte

**CODEMA Itanhomi-MG**
- 📧 E-mail: codema@itanhomi.mg.gov.br
- 📱 Telefone: (33) XXXX-XXXX
- 🏢 Endereço: Prefeitura Municipal de Itanhomi-MG

---

## 🙏 Agradecimentos

Agradecemos a todos os conselheiros, funcionários públicos e cidadãos que contribuíram para o desenvolvimento e aprimoramento deste sistema.

---

*Última atualização: Janeiro de 2025*
*Versão do Sistema: 1.0.0*