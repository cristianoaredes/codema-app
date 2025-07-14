# CODEMA - Lista de Tarefas Completa

## 🚨 Prioridade CRÍTICA (Compliance Legal Imediata)

### Módulo 1: Cadastro de Conselheiros ✅ COMPLETO
- [x] Criar tabela `conselheiros` com campos específicos
  ```sql
  -- mandato_inicio, mandato_fim, entidade_representada, segmento, etc.
  ```
- [x] Criar página `/codema/conselheiros`
- [x] Implementar CRUD completo de conselheiros
- [x] Sistema de alertas para mandatos expirando (30 dias antes)
- [x] Contador de faltas consecutivas
- [x] Integração com perfis existentes

### Módulo 11: Controle de Impedimentos ✅ COMPLETO
- [x] Adicionar tabela `impedimentos_conselheiros`
- [x] Criar formulário de declaração de impedimentos
- [x] Validação automática antes de votações
- [x] Bloqueio de voto quando há impedimento
- [x] Registro em ata do impedimento

### Módulo 12: Logs de Auditoria ✅ COMPLETO
- [x] Implementar tabela `audit_logs` com campos obrigatórios
- [x] Criar middleware para capturar todas as ações
- [x] Interface de consulta de logs (admin only)
- [ ] Exportação de logs para TCE-MG
- [ ] Retenção automática por 5 anos

### Módulo 13: Sistema de Autenticação e Autorização ✅ COMPLETO
- [x] Implementar autenticação tradicional (email/senha)
- [x] Implementar autenticação sem senha (Magic Link)
- [x] Sistema completo de perfis e permissões
- [x] 7 tipos de usuário: citizen, conselheiro_titular, conselheiro_suplente, secretario, presidente, moderator, admin
- [x] Proteção de rotas baseada em roles
- [x] Interface de gestão de usuários para admins
- [x] Hooks de autenticação (useAuth)
- [x] Componentes de proteção (ProtectedRoute)
- [x] Provider de contexto de autenticação
- [x] Configuração completa do Supabase Auth

### Módulo 14: Integração App-wide e Organização ✅ COMPLETO
- [x] Integração completa do AuthProvider em App.tsx
- [x] Estrutura de roteamento com proteção baseada em roles
- [x] Dashboard dinâmico baseado em permissões de usuário
- [x] Navegação lateral (AppSidebar) com visibilidade baseada em roles
- [x] Reorganização completa da estrutura de pastas por domínio
- [x] Sistema de tipos TypeScript abrangente e organizado
- [x] Estrutura de importações limpa com barrel exports
- [x] Componentes organizados por domínio (auth, common, dashboard, forms, codema)
- [x] Remoção de arquivos duplicados e limpeza de código
- [x] Correção de incompatibilidades export/import após reorganização
- [x] Validação de build sem erros após reorganização

## 🔴 Prioridade ALTA (Funcionalidades Core)

### Módulo 2: Agenda e Convocações (Aprimorar Existente) ✅ COMPLETO
- [x] Adicionar sistema de convocação à página de Reuniões
- [x] Gerador automático de convocações (7 dias ordinária, 48h extraordinária)
- [x] Template de convocação personalizável
- [x] Integração com email (SendGrid/AWS SES)
- [x] Integração com WhatsApp Business API
- [x] Sistema de confirmação de presença
- [x] Lembrete automático 24h antes

### Módulo 3: Lavratura Eletrônica de Atas ✅ COMPLETO
- [x] Criar editor de atas com campos obrigatórios
- [x] Template padrão seguindo legislação
- [x] Sistema de revisão colaborativa
- [ ] Integração com assinatura digital gov.br
- [x] Geração de PDF/A para arquivo
- [ ] Publicação automática após assinatura
- [x] Versionamento de rascunhos

### Módulo 4: Controle de Resoluções ✅ COMPLETO
- [x] Sistema de numeração automática (RES-001/2024)
- [x] Editor de resoluções com base legal
- [x] Fluxo de aprovação (minuta -> votação -> publicação)
- [x] Sistema de votação nominal
- [x] Assinatura digital do presidente
- [x] Publicação automática no portal
- [x] Controle de revogações

### Módulo 8: Portal da Transparência CODEMA
- [ ] Criar rota pública `/transparencia/codema`
- [ ] Dashboard com dados em tempo real
- [ ] Seção de conselheiros com mandatos
- [ ] Atas das últimas reuniões
- [ ] Resoluções vigentes
- [ ] Processos em tramitação
- [ ] Execução do FMA
- [ ] Sistema e-SIC integrado

## 🟡 Prioridade MÉDIA (Melhorias Importantes)

### Módulo 5: Processos (Aprimorar Existente)
- [ ] Adicionar numeração automática (PROC-001/2024)
- [ ] Sistema de distribuição para relatores
- [ ] Alertas de prazo (30 dias)
- [ ] Upload múltiplo de documentos
- [ ] Fluxograma visual do processo
- [ ] Notificações por etapa
- [ ] Histórico de tramitações

### Módulo 6: FMA (Aprimorar Existente)
- [ ] Relatório trimestral automático
- [ ] Gráficos de receitas vs despesas
- [ ] Exportação formato TCE-MG
- [ ] Vinculação projetos com resoluções
- [ ] Sistema de prestação de contas
- [ ] Alertas de inadimplência
- [ ] Dashboard executivo

### Módulo 9: Ouvidoria (Aprimorar Existente)
- [ ] Opção de denúncia anônima
- [ ] Integração com Google Maps
- [ ] Upload de fotos/vídeos
- [ ] Sistema de protocolo único
- [ ] Acompanhamento pelo denunciante
- [ ] Estatísticas por tipo/região
- [ ] App mobile (PWA)

### Módulo 10: Painel de Indicadores
- [ ] KPIs principais do CODEMA
- [ ] Tempo médio de tramitação
- [ ] Taxa de aprovação de processos
- [ ] Execução orçamentária FMA
- [ ] Participação em reuniões
- [ ] Relatório anual automático
- [ ] Exportação para PDF/Excel

## 🟢 Prioridade BAIXA (Nice to Have)

### Melhorias Gerais
- [ ] Dark mode em todas as páginas
- [ ] Notificações push (PWA)
- [ ] App mobile nativo
- [ ] Integração com eSocial
- [ ] OCR para digitalização de documentos antigos
- [ ] Busca por voz
- [ ] Chatbot para dúvidas frequentes
- [ ] Modo offline para reuniões

## 📋 Checklist de Implementação por Módulo

### Para CADA módulo implementar:
- [ ] Componentes React com TypeScript
- [ ] Hooks customizados (React Query)
- [ ] Validação com Zod
- [ ] Testes unitários (Vitest)
- [ ] Testes E2E (Playwright)
- [ ] Documentação técnica
- [ ] Manual do usuário
- [ ] Vídeo tutorial

## 🛠️ Setup Técnico Necessário

### Novas Dependências
```bash
# Assinatura Digital
npm install @govbr/assinador

# Notificações
npm install @sendgrid/mail twilio

# Mapas
npm install @react-google-maps/api

# PDF/A
npm install jspdf jspdf-pdfa

# OCR (opcional)
npm install tesseract.js

# Auditoria
npm install express-winston winston
```

### Variáveis de Ambiente ✅ CONFIGURADO
```env
# Supabase - CONFIGURADO
NEXT_PUBLIC_SUPABASE_URL=https://aqvbhmpdzvdbhvxhnemi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ENABLE_PASSWORDLESS=true
NEXT_PUBLIC_ENABLE_MAGIC_LINK=true

# Email - PENDENTE
SENDGRID_API_KEY=
EMAIL_FROM=

# WhatsApp - PENDENTE
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
WHATSAPP_NUMBER=

# Mapas - PENDENTE
GOOGLE_MAPS_API_KEY=

# Assinatura Digital
GOVBR_CLIENT_ID=
GOVBR_CLIENT_SECRET=

# Storage
S3_BUCKET=
S3_REGION=
```

## 📅 Cronograma Sugerido

### Sprint 1 (Semana 1-2) ✅ COMPLETO
- [x] Módulo 1: Cadastro de Conselheiros
- [x] Módulo 11: Impedimentos
- [x] Módulo 12: Auditoria

### Sprint 2 (Semana 3-4) ✅ COMPLETO
- [x] Módulo 2: Aprimorar Convocações
- [x] Módulo 3: Atas Eletrônicas

### Sprint 3 (Semana 5-6) ✅ COMPLETO
- [x] Módulo 4: Resoluções
- [x] Módulo 13: Sistema de Autenticação e Autorização
- [x] Módulo 14: Integração App-wide e Organização

### Sprint 4 (Semana 7-8) 🚧 EM PROGRESSO
- [ ] Módulo 8: Portal Transparência (parte 1)
- [ ] Módulo 10: Indicadores
- [ ] Configuração de Real-time Subscriptions (Supabase)

### Sprint 5 (Semana 9-10)
- Melhorias Módulo 5: Processos
- Melhorias Módulo 6: FMA

### Sprint 6 (Semana 11-12)
- Melhorias Módulo 9: Ouvidoria
- Testes integrados
- Documentação

### Sprint 7 (Semana 13-14)
- Treinamento usuários
- Ajustes finais
- Deploy produção

## 🎯 Definition of Done

Para considerar um módulo COMPLETO:
- [ ] Código funcionando em produção
- [ ] Testes com cobertura > 80%
- [ ] Documentação atualizada
- [ ] Validação jurídica aprovada
- [ ] Treinamento realizado
- [ ] Sem bugs críticos por 7 dias

## 📊 Métricas de Acompanhamento

- **Velocidade**: Story points por sprint
- **Bugs**: Taxa de defeitos por módulo
- **Cobertura**: % de testes automatizados
- **Satisfação**: NPS dos usuários
- **Compliance**: % requisitos legais atendidos

## 🗄️ Status do Banco de Dados ✅ COMPLETO

### Supabase Configurado e Migrado
- **Projeto**: codema-app (aqvbhmpdzvdbhvxhnemi.supabase.co)
- **Status**: ACTIVE_HEALTHY
- **Região**: sa-east-1 (São Paulo)
- **Migrações**: Todas aplicadas com sucesso

### Tabelas Criadas (25 tabelas)
- ✅ **Autenticação**: profiles, audit_logs
- ✅ **Conselheiros**: conselheiros, impedimentos_conselheiros  
- ✅ **Reuniões**: reunioes, convocacoes, convocacao_templates, convocacao_agendamentos, lembretes, presencas
- ✅ **Atas**: atas, atas_templates, atas_versoes, atas_revisoes, atas_notificacoes
- ✅ **Resoluções**: resolucoes, resolucoes_templates, resolucoes_votos, resolucoes_tramitacao, resolucoes_publicacao, resolucoes_revogacoes
- ✅ **Documentos**: documentos
- ✅ **Relatórios**: reports, service_categories, service_ratings

### Recursos Implementados
- ✅ **RLS (Row Level Security)** em todas as tabelas
- ✅ **Políticas de acesso** baseadas em roles
- ✅ **Triggers de auditoria** automáticos
- ✅ **Funções de negócio** (numeração, votação, etc.)
- ✅ **Índices de performance**
- ✅ **Templates padrão** inseridos

## 🏗️ Arquitetura e Organização do Código ✅ COMPLETO

### Estrutura de Pastas Reorganizada
```
src/
├── components/
│   ├── auth/              # Autenticação (AuthPage, ProtectedRoute, AuthProvider)
│   ├── common/            # Componentes compartilhados (Header, Navigation)
│   ├── dashboard/         # Dashboard e homepage (HeroSection, ReportForm, RecentReports)
│   ├── forms/             # Formulários reutilizáveis (FileUpload, ServiceRating)
│   ├── codema/            # Componentes específicos do CODEMA
│   │   ├── conselheiros/  # Gestão de conselheiros
│   │   ├── reunioes/      # Gestão de reuniões
│   │   ├── atas/          # Gestão de atas
│   │   ├── resolucoes/    # Gestão de resoluções
│   │   └── impedimentos/  # Gestão de impedimentos
│   └── ui/                # Componentes shadcn/ui
├── hooks/                 # Hooks organizados por domínio
├── types/                 # Tipos TypeScript organizados
├── pages/                 # Páginas da aplicação
└── utils/                 # Utilitários organizados
```

### Melhorias de Código Implementadas
- [x] **Barrel Exports**: Importações limpas via index.ts com consistência export/import
- [x] **Domain-Driven Design**: Organização por domínio de negócio
- [x] **TypeScript Types**: Sistema de tipos abrangente e organizado
- [x] **Clean Imports**: Paths semânticos e previsíveis
- [x] **Component Organization**: Separação clara de responsabilidades
- [x] **Role-based UI**: Interface adaptada às permissões do usuário
- [x] **Build Validation**: Build completo funcionando sem erros

## 🚀 Quick Wins ✅ TODOS COMPLETOS

1. [x] **Numeração automática** em Processos e Resoluções (1 dia)
2. [x] **Alertas de prazo** em Processos (2 dias)  
3. [x] **Export PDF** nas Atas existentes (1 dia)
4. [x] **Contador de quórum** nas Reuniões (1 dia)
5. [x] **Autenticação com Magic Link** (1 dia)
6. [x] **Sistema de Roles completo** (2 dias)
7. [x] **Organização completa do código** (1 dia)
8. [ ] **Relatório básico** do FMA (2 dias)

## ⚠️ Pontos de Atenção

1. **Integração gov.br** pode demorar (fazer POC)
2. **WhatsApp Business** precisa aprovação
3. **LGPD** revisar todos os formulários
4. **Backup** implementar desde o início
5. **Performance** com muitos documentos