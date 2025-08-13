# RESOLUÇÕES - Sistema de Gestão de Resoluções do CODEMA

## Status Atual da Implementação

### ✅ Implementado (85%)
- Sistema CRUD completo para resoluções
- Geração automática de número de protocolo
- Editor de texto com formatação
- Sistema de tags para categorização
- Controle de status (rascunho, aprovada, publicada, revogada)
- Listagem com filtros por status e busca
- Visualização detalhada com histórico
- Interface responsiva otimizada

### ⚠️ Parcialmente Implementado
- Editor rich text avançado
- Sistema de comentários e discussões
- Workflow de aprovação
- Versionamento de alterações

### ❌ Não Implementado
- Tramitação com pareceres técnicos
- Consulta pública online
- Assinatura digital obrigatória
- Publicação automática no DOU

## Requisitos Legais e Conformidade

### Base Legal Principal
- **Lei 6.938/1981** - Política Nacional do Meio Ambiente
- **Resolução CONAMA 237/1997** - Competências e procedimentos
- **Lei Complementar 140/2011** - Competências ambientais
- **Regimento Interno do CODEMA** - Procedimentos específicos
- **Lei de Processo Administrativo Municipal**

### Requisitos de Conformidade

#### 1. Competência Normativa
- **Matérias Ambientais**: Dentro da competência municipal
- **Interesse Local**: Assuntos de relevância local
- **Complementar**: Não conflitante com normas superiores
- **Motivação**: Fundamentação técnica e jurídica obrigatória

#### 2. Processo de Elaboração
- **Proposta**: Por qualquer conselheiro ou secretaria
- **Instrução**: Parecer técnico obrigatório
- **Discussão**: Em até 2 reuniões consecutivas
- **Votação**: Quórum qualificado (2/3 dos presentes)
- **Aprovação**: Maioria dos votos válidos

#### 3. Publicação e Vigência
- **Prazo**: 10 dias após aprovação
- **Meios**: DOU municipal e site oficial
- **Vigência**: 30 dias após publicação (salvo urgência)
- **Numeração**: Sequencial anual (RES-XXX/AAAA)

#### 4. Revisão e Revogação
- **Prazo**: Revisão a cada 5 anos
- **Iniciativa**: Qualquer conselheiro ou secretaria
- **Processo**: Mesmo rito de elaboração
- **Efeitos**: Prospectivos (salvo disposição contrária)

## Plano de Implementação

### Fase 1: Tramitação e Workflow (Sprint 1-2)

#### 1.1 Sistema de Tramitação
```typescript
interface TramitacaoResolucao {
  id: string;
  resolucao_id: string;
  etapa_atual: EtapaTramitacao;
  historico: HistoricoTramitacao[];
  pareceres: ParecerTecnico[];
  prazo_limite: Date;
  responsavel_atual: string;
}

enum EtapaTramitacao {
  PROPOSTA = 'proposta',
  ANALISE_TECNICA = 'analise_tecnica',
  DISCUSSAO_1 = 'discussao_1',
  DISCUSSAO_2 = 'discussao_2',
  VOTACAO = 'votacao',
  APROVADA = 'aprovada',
  PUBLICACAO = 'publicacao',
  VIGENTE = 'vigente'
}
```

#### 1.2 Pareceres Técnicos
- Requisição automática para área técnica
- Templates de parecer por matéria
- Prazo de resposta configurável
- Notificações de vencimento
- Histórico de pareceristas

#### 1.3 Sistema de Discussão
- Emendas propostas
- Comentários por artigo
- Versão consolidada automática
- Destaque de alterações
- Ata das discussões

### Fase 2: Consulta Pública (Sprint 3-4)

#### 2.1 Portal de Consulta
- Página pública para cada resolução
- Sistema de comentários moderados
- Prazo de consulta configurável
- Relatório de participação
- Resposta consolidada

#### 2.2 Notificação de Interessados
- Cadastro de interessados por tema
- Notificação automática por email/SMS
- Feed RSS de novas resoluções
- Newsletter periódica
- Audiência pública quando necessário

#### 2.3 Análise de Impacto
- Template de análise de impacto
- Estimativa de custos
- Beneficiários identificados
- Impacto regulatório
- Prazo de adequação

### Fase 3: Publicação e Vigência (Sprint 5-6)

#### 3.1 Publicação Automatizada
- Integração com DOU municipal
- Template DOCX/PDF oficial
- Assinatura digital integrada
- QR Code de validação
- Arquivo permanente

#### 3.2 Controle de Vigência
- Cálculo automático de vigência
- Alertas de entrada em vigor
- Notificação aos regulados
- Dashboard de cumprimento
- Relatório de efetividade

#### 3.3 Revisão Periódica
- Agenda automática de revisões
- Análise de efetividade
- Proposta de alterações
- Histórico de cumprimento
- Indicadores de resultado

## Requisitos Técnicos

### Modelo de Dados Expandido
```sql
-- Tabela de tramitação (nova)
CREATE TABLE resolucoes_tramitacao (
  id UUID PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id),
  etapa VARCHAR(50) NOT NULL,
  data_entrada TIMESTAMP DEFAULT NOW(),
  data_saida TIMESTAMP,
  responsavel_id UUID REFERENCES profiles(id),
  prazo_limite TIMESTAMP,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de pareceres (nova)
CREATE TABLE resolucoes_pareceres (
  id UUID PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id),
  tipo_parecer VARCHAR(50), -- tecnico, juridico, financeiro
  parecerista_id UUID REFERENCES profiles(id),
  conteudo TEXT,
  parecer VARCHAR(20), -- favoravel, contrario, com_ressalvas
  fundamentacao TEXT,
  data_parecer TIMESTAMP DEFAULT NOW(),
  anexos JSONB
);

-- Tabela de consulta pública (nova)  
CREATE TABLE resolucoes_consulta_publica (
  id UUID PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id),
  inicio_consulta DATE,
  fim_consulta DATE,
  total_participantes INTEGER DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  relatorio_url TEXT,
  ativa BOOLEAN DEFAULT true
);

-- Tabela de comentários públicos (nova)
CREATE TABLE resolucoes_comentarios_publicos (
  id UUID PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id),
  nome_participante VARCHAR(255),
  email_participante VARCHAR(255),
  organizacao VARCHAR(255),
  comentario TEXT,
  artigo_referenciado VARCHAR(10),
  moderado BOOLEAN DEFAULT false,
  aprovado BOOLEAN DEFAULT false,
  resposta_oficial TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de emendas (nova)
CREATE TABLE resolucoes_emendas (
  id UUID PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id),
  proponente_id UUID REFERENCES conselheiros(id),
  tipo_emenda VARCHAR(50), -- aditiva, substitutiva, supressiva
  artigo_original VARCHAR(10),
  texto_original TEXT,
  texto_proposto TEXT,
  justificativa TEXT,
  votacao_resultado VARCHAR(20),
  aprovada BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de versões (nova)
CREATE TABLE resolucoes_versoes (
  id UUID PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id),
  versao INTEGER,
  conteudo JSONB,
  modificacoes TEXT,
  autor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_resolucoes_status ON resolucoes(status);
CREATE INDEX idx_resolucoes_tags ON resolucoes USING gin(tags);
CREATE INDEX idx_resolucoes_fulltext ON resolucoes USING gin(to_tsvector('portuguese', titulo || ' ' || ementa || ' ' || conteudo));
CREATE INDEX idx_tramitacao_ativa ON resolucoes_tramitacao(resolucao_id, ativo) WHERE ativo = true;
CREATE INDEX idx_consulta_ativa ON resolucoes_consulta_publica(resolucao_id, ativa) WHERE ativa = true;
```

### APIs e Endpoints
- `GET /api/resolucoes` - Lista com filtros avançados
- `POST /api/resolucoes` - Criar nova resolução
- `PUT /api/resolucoes/:id` - Atualizar resolução
- `POST /api/resolucoes/:id/tramitar` - Avançar tramitação
- `GET /api/resolucoes/:id/tramitacao` - Histórico de tramitação
- `POST /api/resolucoes/:id/parecer` - Adicionar parecer
- `GET /api/resolucoes/:id/pareceres` - Lista de pareceres
- `POST /api/resolucoes/:id/emenda` - Propor emenda
- `GET /api/resolucoes/:id/emendas` - Lista de emendas
- `POST /api/resolucoes/:id/consulta` - Iniciar consulta pública
- `GET /api/resolucoes/:id/comentarios` - Comentários públicos
- `POST /api/resolucoes/:id/comentar` - Adicionar comentário público
- `POST /api/resolucoes/:id/votar` - Registrar votação
- `POST /api/resolucoes/:id/publicar` - Publicar resolução
- `GET /api/resolucoes/:id/pdf` - Gerar PDF oficial
- `GET /api/resolucoes/vigentes` - Resoluções vigentes
- `GET /api/resolucoes/dashboard` - Dashboard gerencial

### Integrações Necessárias
- **Editor**: TinyMCE ou CKEditor avançado
- **PDF**: Template oficial com brasão
- **DOU**: API do diário oficial municipal
- **Assinatura**: Certificado digital ICP-Brasil
- **Email**: SendGrid para notificações em massa
- **SEI**: Sistema Eletrônico de Informações

## Recomendações UI/UX

### Interface de Elaboração

#### Editor Jurídico
- Templates por tipo de matéria
- Numeração automática de artigos
- Referência cruzada a outras normas
- Glossário jurídico integrado
- Verificação de constitucionalidade

#### Tramitação Visual
- Kanban board do processo
- Timeline com prazos
- Indicadores de etapa
- Alertas de vencimento
- Painel do responsável

#### Colaboração
- Comentários inline
- Sugestões de alteração
- Chat integrado por resolução
- Notificações em tempo real
- Histórico de colaboradores

### Portal Público

#### Navegação Intuitiva
- Busca semântica
- Filtros por matéria
- Tag cloud interativa
- Mapa conceitual
- FAQ por tema

#### Participação Cidadã
- Interface amigável para comentários
- Tutorial de participação
- Linguagem cidadã disponível
- Resumo executivo
- Impacto na prática

#### Transparência
- Status em tempo real
- Histórico completo
- Documentos anexos
- Pareceres técnicos
- Resultado das votações

### Mobile Experience
- PWA para conselheiros
- Notificações push
- Leitura offline
- Votação mobile
- Dashboard executivo

## Fluxo Operacional

### Elaboração e Instrução

1. **Proposta Inicial** (D+0)
   - Identificação da necessidade
   - Minuta inicial
   - Justificativa técnica
   - Análise de competência

2. **Instrução Técnica** (D+0 a D+15)
   - Distribuição para área técnica
   - Parecer técnico detalhado
   - Análise de impacto
   - Proposta de alterações

3. **Análise Jurídica** (D+10 a D+20)
   - Verificação de legalidade
   - Análise de competência
   - Adequação formal
   - Parecer jurídico

### Discussão e Aprovação

1. **Primeira Discussão** (Reunião N)
   - Apresentação da proposta
   - Debate geral
   - Sugestões de emendas
   - Prazo para emendas (5 dias)

2. **Análise de Emendas** (D+21 a D+30)
   - Recebimento de emendas
   - Análise técnica das emendas
   - Parecer sobre emendas
   - Versão consolidada

3. **Segunda Discussão** (Reunião N+1)
   - Análise das emendas
   - Debate específico
   - Ajustes finais
   - Encaminhamento para votação

4. **Votação** (Reunião N+2)
   - Leitura da versão final
   - Votação por artigo se solicitado
   - Votação da resolução
   - Proclamação do resultado

### Publicação e Vigência

1. **Preparação** (D+31 a D+35)
   - Redação final
   - Assinatura digital
   - Numeração oficial
   - QR Code de validação

2. **Publicação** (D+35 a D+40)
   - Publicação no DOU
   - Publicação no site
   - Notificação aos interessados
   - Arquivo oficial

3. **Vigência** (D+70)
   - Entrada em vigor
   - Monitoramento
   - Suporte à implementação
   - Avaliação inicial

## Métricas de Sucesso

### KPIs de Processo
- Tempo médio de tramitação: <45 dias
- Taxa de aprovação: >70%
- Emendas por resolução: <5
- Prazos cumpridos: >90%

### KPIs de Participação
- Participantes por consulta: >50
- Comentários úteis: >20
- Taxa de resposta oficial: 100%
- Satisfação dos participantes: >7/10

### KPIs de Efetividade
- Resoluções vigentes aplicadas: >80%
- Taxa de revisão: <20%
- Conflitos com normas superiores: 0
- Questionamentos judiciais: <5%

## Cronograma e Prioridades

### Prioridade Alta (Imediato)
- ✅ CRUD básico funcional
- ⏳ Sistema de tramitação completo
- ⏳ Workflow de aprovação
- ⏳ Editor jurídico avançado

### Prioridade Média (30-60 dias)
- Consulta pública online
- Pareceres técnicos
- Sistema de emendas
- Publicação automática

### Prioridade Baixa (60-90 dias)
- Portal cidadão completo
- Analytics avançado
- IA para análise jurídica
- Integração com tribunais

## Considerações de Segurança

### Integridade Normativa
- Versionamento imutável
- Assinatura digital obrigatória
- Blockchain para historico
- Backup georredundante

### Controle de Acesso
- Permissões por etapa
- Aprovação hierárquica
- Logs de todas as ações
- Segregação de funções

### Publicação Segura
- Templates oficiais
- Validação de formato
- Prova de publicação
- Arquivo permanente

## Observações Finais

O módulo de Resoluções é crucial para a função normativa do CODEMA. Com base sólida implementada (85%), necessita principalmente de workflow completo de tramitação, sistema de consulta pública e integração com publicação oficial, garantindo transparência e participação social.

**Próximos Passos Recomendados:**
1. Implementar workflow completo de tramitação
2. Desenvolver sistema de consulta pública
3. Integrar com DOU municipal
4. Criar portal cidadão para acompanhamento