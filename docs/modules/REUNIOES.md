# REUNIÕES - Sistema de Gestão de Reuniões do CODEMA

## Status Atual da Implementação

### Rotas e Páginas

- Rotas protegidas (requer CODEMA):
  - `/reunioes` → `src/pages/Reunioes.tsx`
  - `/reunioes/nova` → `src/pages/reunioes/NovaReuniao.tsx`
  - `/reunioes/:id` → `src/pages/reunioes/ReuniaoDetalhes.tsx`

Permissões:
- As rotas acima estão protegidas por `ProtectedRoute` com `requireCODEMAAccess` em `src/App.tsx`.

Observações de estrutura:
- O módulo não utiliza `src/pages/codema/reunioes/`. A listagem principal está em `src/pages/Reunioes.tsx` e os detalhes/criação em `src/pages/reunioes/`.

### ✅ Implementado (90%)
- Agendamento de reuniões ordinárias e extraordinárias
- Sistema de convocação eletrônica
- Controle de presença com horário de chegada
- Gestão de pauta estruturada em JSON
- Geração de protocolos para convocações e atas
- Visualização detalhada com informações completas
- Sistema de confirmação de presença
- Integração com módulo de conselheiros
- Status de reunião (agendada, realizada, cancelada)
- Envio de convocações em lote

### ⚠️ Parcialmente Implementado
- Sistema de votação durante reuniões
- Anexação de documentos à pauta
- Transmissão ao vivo/gravação

### ❌ Não Implementado
- Videoconferência integrada
- Transcrição automática de atas
- Sistema de deliberações online
- Assinatura digital de presença

## Requisitos Legais e Conformidade

### Base Legal Principal
- **Regimento Interno do CODEMA** - Define periodicidade e regras
- **Lei de Acesso à Informação (12.527/2011)** - Publicidade das reuniões
- **Decreto Municipal** - Regulamenta funcionamento
- **Resolução CONAMA 237/1997** - Participação pública

### Requisitos de Conformidade

#### 1. Convocação Antecipada
- **Ordinárias**: Mínimo 7 dias de antecedência
- **Extraordinárias**: Mínimo 48 horas
- **Meio**: Convocação por escrito com pauta
- **Implementação**: Sistema automático com protocolo

#### 2. Quórum Mínimo
- **Instalação**: Maioria simples (50% + 1)
- **Deliberação**: Conforme regimento
- **Verificação**: Automática antes do início
- **Registro**: Em ata com lista de presença

#### 3. Publicidade
- **Reuniões**: Abertas ao público (exceto casos especiais)
- **Pautas**: Publicadas com antecedência
- **Atas**: Disponibilizadas em até 10 dias
- **Decisões**: Publicadas no DOU municipal

#### 4. Documentação
- **Convocação**: Com número de protocolo
- **Lista de Presença**: Assinada ou digital
- **Ata**: Detalhada com todas as deliberações
- **Gravação**: Quando determinado

## Plano de Implementação

### Fase 1: Melhorias no Sistema Atual (Sprint 1-2)

#### 1.1 Gestão de Pauta Avançada
```typescript
interface PautaAvancada {
  itens: ItemPauta[];
  documentos_anexos: Documento[];
  tempo_estimado: number;
  relator_designado?: string;
  tipo_deliberacao: 'votacao' | 'discussao' | 'informe';
  requer_quorum_qualificado: boolean;
}
```

#### 1.2 Sistema de Votação
- Registro individual de votos
- Tipos: aberta, secreta, nominal
- Apuração automática
- Registro em ata

#### 1.3 Melhorias na Convocação
- Templates personalizáveis
- Múltiplos canais (email, SMS, WhatsApp)
- Confirmação com justificativa
- Reenvio automático

### Fase 2: Funcionalidades Síncronas (Sprint 3-4)

#### 2.1 Reunião Virtual
- Integração com Zoom/Meet/Teams
- Controle de presença online
- Compartilhamento de tela
- Chat durante reunião

#### 2.2 Sistema de Deliberação
- Proposta de encaminhamentos
- Discussão estruturada
- Votação em tempo real
- Resultado imediato

#### 2.3 Gestão de Tempo
- Cronômetro por item de pauta
- Alertas de tempo
- Histórico de duração
- Otimização de pautas

### Fase 3: Automação e IA (Sprint 5-6)

#### 3.1 Transcrição Automática
- Gravação de áudio
- Transcrição via IA
- Identificação de falantes
- Geração de minuta de ata

#### 3.2 Assinatura Digital
- QR Code para presença
- Assinatura eletrônica de ata
- Certificação ICP-Brasil
- Validação em blockchain

#### 3.3 Analytics de Reuniões
- Métricas de participação
- Análise de eficiência
- Padrões de votação
- Relatórios gerenciais

## Requisitos Técnicos

### Modelo de Dados Expandido
```sql
-- Tabela de itens de pauta (nova)
CREATE TABLE reunioes_pauta_itens (
  id UUID PRIMARY KEY,
  reuniao_id UUID REFERENCES reunioes(id),
  numero_ordem INTEGER NOT NULL,
  tipo VARCHAR(50), -- informe, discussao, deliberacao
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  relator_id UUID REFERENCES conselheiros(id),
  tempo_estimado INTEGER, -- em minutos
  documentos JSONB,
  requer_votacao BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de votações (nova)
CREATE TABLE reunioes_votacoes (
  id UUID PRIMARY KEY,
  reuniao_id UUID REFERENCES reunioes(id),
  pauta_item_id UUID REFERENCES reunioes_pauta_itens(id),
  tipo_votacao VARCHAR(20), -- aberta, secreta, nominal
  descricao TEXT,
  opcoes JSONB, -- ["Aprovar", "Rejeitar", "Abster"]
  quorum_minimo INTEGER,
  iniciada_em TIMESTAMP,
  encerrada_em TIMESTAMP,
  resultado JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de votos (nova)
CREATE TABLE reunioes_votos (
  id UUID PRIMARY KEY,
  votacao_id UUID REFERENCES reunioes_votacoes(id),
  conselheiro_id UUID REFERENCES conselheiros(id),
  voto VARCHAR(50),
  justificativa TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(votacao_id, conselheiro_id)
);

-- Tabela de documentos de reunião (nova)
CREATE TABLE reunioes_documentos (
  id UUID PRIMARY KEY,
  reuniao_id UUID REFERENCES reunioes(id),
  tipo VARCHAR(50), -- pauta, ata, anexo, apresentacao
  titulo VARCHAR(255),
  url TEXT,
  publico BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### APIs e Endpoints
- `GET /api/reunioes` - Lista com filtros
- `POST /api/reunioes` - Criar reunião
- `PUT /api/reunioes/:id` - Atualizar reunião
- `POST /api/reunioes/:id/convocar` - Enviar convocações
- `POST /api/reunioes/:id/presenca` - Registrar presença
- `GET /api/reunioes/:id/pauta` - Obter pauta detalhada
- `POST /api/reunioes/:id/votacao` - Iniciar votação
- `POST /api/reunioes/:id/voto` - Registrar voto
- `GET /api/reunioes/:id/ata` - Gerar minuta de ata
- `POST /api/reunioes/:id/transmissao` - Iniciar transmissão

### Integrações Necessárias
- **Calendário**: Google Calendar, Outlook
- **Videoconferência**: Zoom, Google Meet, Teams
- **Streaming**: YouTube, Facebook Live
- **Transcrição**: Google Speech-to-Text, AWS Transcribe
- **Notificações**: Email (SendGrid), SMS (Twilio), WhatsApp

## Recomendações UI/UX

### Interface de Reunião

#### Visão Presidente/Secretário
- Dashboard de controle da reunião
- Gestão de palavra e tempo
- Controle de votações
- Moderação de participantes
- Geração de ata em tempo real

#### Visão Conselheiro
- Pauta interativa
- Sistema de inscrição para fala
- Interface de votação simplificada
- Acesso a documentos
- Chat/comentários

#### Visão Público
- Transmissão ao vivo
- Pauta em tempo real
- Resultados de votações
- Chat moderado
- Documentos públicos

### Mobile Experience
- App dedicado para conselheiros
- Push notifications
- Votação offline com sincronização
- Assinatura de presença por geolocalização
- Acesso rápido a documentos

### Acessibilidade
- Legendas em tempo real
- Interpretação em Libras
- Alto contraste
- Navegação por voz
- Descrição de imagens

## Fluxo Operacional

### Pré-Reunião
1. **Definição de Pauta** (D-15)
   - Coleta de sugestões
   - Priorização de itens
   - Designação de relatores

2. **Preparação** (D-10)
   - Elaboração de materiais
   - Revisão de documentos
   - Confirmação de infraestrutura

3. **Convocação** (D-7)
   - Geração de protocolo
   - Envio multicanal
   - Publicação da pauta

4. **Confirmações** (D-2)
   - Recebimento de confirmações
   - Verificação de quórum
   - Ajustes necessários

### Durante a Reunião
1. **Abertura**
   - Verificação de quórum
   - Registro de presença
   - Aprovação de pauta

2. **Desenvolvimento**
   - Apresentação de itens
   - Discussões organizadas
   - Votações quando necessário

3. **Encerramento**
   - Resumo de decisões
   - Próximos encaminhamentos
   - Definição de responsáveis

### Pós-Reunião
1. **Documentação** (D+2)
   - Elaboração da ata
   - Revisão e correções
   - Coleta de assinaturas

2. **Publicação** (D+5)
   - Publicação da ata
   - Divulgação de decisões
   - Atualização de status

3. **Follow-up** (D+7)
   - Acompanhamento de deliberações
   - Cobrança de pendências
   - Preparação próxima reunião

## Métricas de Sucesso

### KPIs Operacionais
- Taxa de presença média: >75%
- Confirmações antecipadas: >80%
- Duração média: <2 horas
- Itens de pauta concluídos: >90%

### KPIs de Conformidade
- Convocações no prazo: 100%
- Quórum atingido: >95%
- Atas publicadas no prazo: 100%
- Protocolos gerados: 100%

### KPIs de Engajamento
- Participação nas discussões: >60%
- Votações com participação total: >90%
- Satisfação com o processo: >8/10
- Público nas transmissões: crescente

## Cronograma e Prioridades

### Prioridade Alta (Imediato)
- ✅ Sistema base de reuniões
- ✅ Convocações e presença
- ⏳ Sistema de votação
- ⏳ Gestão avançada de pauta

### Prioridade Média (30-60 dias)
- Videoconferência integrada
- Transmissão ao vivo
- App mobile
- Templates de documentos

### Prioridade Baixa (60-90 dias)
- Transcrição automática
- IA para minutas
- Blockchain para atas
- Analytics avançado

## Considerações de Segurança

### Durante Reuniões Virtuais
- Sala com senha e waiting room
- Controle de microfone e câmera
- Gravação com consentimento
- Backup de conexão

### Votações
- Voto único por conselheiro
- Auditoria completa
- Resultado inviolável
- Sigilo quando necessário

### Documentação
- Versionamento de atas
- Assinatura digital
- Integridade verificável
- Armazenamento seguro

## Observações Finais

O módulo de Reuniões é o coração operacional do CODEMA, onde as decisões são tomadas e registradas. A implementação atual está sólida, mas pode se beneficiar significativamente de funcionalidades modernas como votação eletrônica e transmissão ao vivo, aumentando a transparência e participação pública.

**Próximos Passos Recomendados:**
1. Implementar sistema completo de votação
2. Adicionar videoconferência integrada
3. Desenvolver app mobile para conselheiros
4. Criar sistema de transcrição automática