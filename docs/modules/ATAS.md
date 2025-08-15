# ATAS - Sistema de Gestão de Atas do CODEMA

## Status Atual da Implementação

### ✅ Implementado (85%)
- Criação e edição de atas com editor rico
- Versionamento automático de alterações
- Fluxo de aprovação (rascunho → revisão → aprovada → publicada)
- Geração de número de protocolo único
- Sistema de busca e filtros
- Controle de status com badges visuais
- Histórico de versões
- Integração com módulo de reuniões
- Exportação para PDF (interface preparada)
- Envio por email (interface preparada)

### ⚠️ Parcialmente Implementado
- Editor de texto rico (usando textarea simples)
- Geração real de PDF
- Assinatura digital de aprovadores

### ❌ Não Implementado
- Templates predefinidos de atas
- OCR para digitalização de atas antigas
- Blockchain para garantir imutabilidade
- Publicação automática no DOU

## Requisitos Legais e Conformidade

### Base Legal Principal
- **Lei 12.527/2011 (LAI)** - Acesso à informação pública
- **Decreto 7.724/2012** - Regulamenta a LAI
- **Regimento Interno CODEMA** - Prazos e procedimentos
- **Lei Municipal** - Publicação de atos oficiais
- **TCE-MG** - Normas de transparência

### Requisitos de Conformidade

#### 1. Elaboração e Conteúdo
- **Prazo**: Até 5 dias úteis após reunião
- **Conteúdo Mínimo**:
  - Data, hora e local
  - Conselheiros presentes e ausentes
  - Pauta tratada
  - Deliberações e votações
  - Encaminhamentos
- **Numeração**: Sequencial anual

#### 2. Aprovação
- **Responsável**: Presidente e Secretário
- **Prazo**: 48 horas após elaboração
- **Retificações**: Até próxima reunião
- **Validação**: Quórum da reunião seguinte

#### 3. Publicação
- **Prazo**: 10 dias após aprovação
- **Meios**: Site oficial e quadro de avisos
- **Formato**: PDF pesquisável
- **Acesso**: Livre e gratuito

#### 4. Arquivamento
- **Período**: Mínimo 5 anos
- **Formato**: Digital e físico
- **Indexação**: Por data e número
- **Backup**: Diário automático

## Plano de Implementação

### Fase 1: Editor e Templates (Sprint 1-2)

#### 1.1 Editor Rich Text
```typescript
interface EditorConfig {
  toolbar: [
    'heading', 'bold', 'italic', 'underline',
    'bulletList', 'orderedList', 'blockquote',
    'table', 'link', 'image', 'attachment'
  ];
  templates: TemplateAta[];
  autoSave: boolean;
  versionControl: boolean;
}
```

#### 1.2 Sistema de Templates
- Template reunião ordinária
- Template reunião extraordinária
- Template audiência pública
- Campos dinâmicos (data, presentes, etc.)
- Biblioteca de cláusulas padrão

#### 1.3 Importação de Atas Antigas
- Upload de PDFs digitalizados
- OCR automático
- Indexação para busca
- Conversão para formato editável

### Fase 2: Assinatura e Certificação (Sprint 3-4)

#### 2.1 Assinatura Digital
- Integração ICP-Brasil
- Assinatura em lote
- Verificação de validade
- Certificado de autenticidade

#### 2.2 Blockchain
- Hash de cada versão
- Registro em blockchain pública
- Prova de não-alteração
- Auditoria independente

#### 2.3 Geração de PDF/A
- Formato de preservação digital
- Metadados embarcados
- Assinaturas visíveis
- QR Code de verificação

### Fase 3: Publicação e Integração (Sprint 5-6)

#### 3.1 Publicação Automática
- Integração com DOU municipal
- API para portal transparência
- Feed RSS de atas
- Notificação aos interessados

#### 3.2 Integração com SEI
- Processo eletrônico
- Tramitação automática
- Número único SEI
- Acompanhamento processual

#### 3.3 Analytics e Busca
- Busca semântica em atas
- Nuvem de palavras
- Análise de tendências
- Relatórios de deliberações

## Requisitos Técnicos

### Modelo de Dados Aprimorado
```sql
-- Tabela de templates (nova)
CREATE TABLE atas_templates (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo_reuniao VARCHAR(50),
  estrutura JSONB NOT NULL,
  campos_dinamicos JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de assinaturas (nova)
CREATE TABLE atas_assinaturas (
  id UUID PRIMARY KEY,
  ata_id UUID REFERENCES atas(id),
  assinante_id UUID REFERENCES profiles(id),
  cargo VARCHAR(100),
  tipo_assinatura VARCHAR(50), -- digital, eletronica, manuscrita
  certificado_digital TEXT,
  hash_documento VARCHAR(255),
  assinado_em TIMESTAMP,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de publicações (nova)
CREATE TABLE atas_publicacoes (
  id UUID PRIMARY KEY,
  ata_id UUID REFERENCES atas(id),
  meio_publicacao VARCHAR(50), -- site, dou, mural
  url_publicacao TEXT,
  numero_publicacao VARCHAR(100),
  data_publicacao DATE,
  comprovante_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de blockchain (nova)
CREATE TABLE atas_blockchain (
  id UUID PRIMARY KEY,
  ata_id UUID REFERENCES atas(id),
  versao INTEGER,
  hash_anterior VARCHAR(255),
  hash_atual VARCHAR(255),
  blockchain_network VARCHAR(50),
  transaction_id VARCHAR(255),
  block_number BIGINT,
  timestamp_blockchain TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para busca textual
CREATE INDEX idx_atas_conteudo_fts ON atas USING gin(to_tsvector('portuguese', conteudo));
CREATE INDEX idx_atas_numero ON atas(numero_ata);
CREATE INDEX idx_atas_status ON atas(status);
CREATE INDEX idx_atas_data ON atas(created_at);
```

### APIs e Endpoints
- `GET /api/atas` - Lista com filtros e busca textual
- `POST /api/atas` - Criar nova ata
- `PUT /api/atas/:id` - Atualizar ata
- `POST /api/atas/:id/versao` - Criar nova versão
- `GET /api/atas/:id/versoes` - Histórico de versões
- `POST /api/atas/:id/aprovar` - Aprovar ata
- `POST /api/atas/:id/assinar` - Assinar digitalmente
- `POST /api/atas/:id/publicar` - Publicar ata
- `GET /api/atas/:id/pdf` - Gerar PDF
- `POST /api/atas/:id/enviar` - Enviar por email
- `GET /api/atas/:id/verificar` - Verificar autenticidade
- `GET /api/atas/buscar` - Busca textual avançada
- `GET /api/atas/templates` - Lista templates
- `POST /api/atas/importar` - Importar PDF com OCR

### Integrações Necessárias
- **Editor**: TinyMCE, CKEditor ou Tiptap
- **PDF**: Puppeteer, jsPDF ou PDFKit
- **OCR**: Tesseract ou Google Vision
- **Assinatura**: Certificado Digital ICP-Brasil
- **Blockchain**: Ethereum, BSC ou Polygon
- **DOU**: API do diário oficial
- **SEI**: Sistema Eletrônico de Informações

## Recomendações UI/UX

### Editor de Atas

#### Interface Principal
- Editor WYSIWYG intuitivo
- Prévia em tempo real
- Salvamento automático
- Indicador de alterações não salvas
- Modo de comparação de versões

#### Funcionalidades do Editor
- Inserção de tabelas responsivas
- Upload de imagens otimizadas
- Anexação de documentos
- Citação de legislação com link
- Numeração automática de itens

#### Fluxo de Trabalho
- Wizard para criação guiada
- Checklist de requisitos
- Validação de campos obrigatórios
- Preview antes de aprovar

### Visualização e Busca

#### Lista de Atas
- Cards com preview
- Filtros avançados salvos
- Ordenação múltipla
- Exportação em lote
- Ações em massa

#### Página de Detalhes
- Leitura otimizada
- Índice navegável
- Compartilhamento social
- Download em múltiplos formatos
- Histórico de visualizações

#### Busca Avançada
- Busca por relevância
- Filtros por período
- Busca em anexos
- Operadores booleanos
- Sugestões de busca

### Mobile Experience
- Editor mobile simplificado
- Leitura offline
- Sincronização automática
- Assinatura por biometria
- Notificações push

## Fluxo Operacional

### Elaboração da Ata

1. **Criação** (Durante/Após Reunião)
   - Seleção de template
   - Preenchimento automático de dados
   - Transcrição de deliberações
   - Anexação de documentos

2. **Revisão** (D+1 a D+3)
   - Revisão pelo secretário
   - Correções necessárias
   - Validação de informações
   - Preparação para aprovação

3. **Aprovação** (D+3 a D+5)
   - Revisão pelo presidente
   - Solicitação de ajustes
   - Aprovação final
   - Liberação para assinatura

### Assinatura e Publicação

1. **Coleta de Assinaturas** (D+5 a D+7)
   - Notificação aos assinantes
   - Assinatura digital/eletrônica
   - Verificação de certificados
   - Registro em blockchain

2. **Publicação** (D+7 a D+10)
   - Geração de PDF/A final
   - Publicação no site
   - Envio para DOU
   - Notificação aos interessados

3. **Arquivamento** (D+10)
   - Indexação para busca
   - Backup em nuvem
   - Arquivo físico quando necessário
   - Registro no sistema de gestão

## Métricas de Sucesso

### KPIs Operacionais
- Tempo médio de elaboração: <3 dias
- Taxa de aprovação na primeira revisão: >80%
- Atas publicadas no prazo: 100%
- Disponibilidade do sistema: >99.9%

### KPIs de Qualidade
- Atas com todos os requisitos: 100%
- Erros por ata: <2
- Retificações necessárias: <5%
- Satisfação dos usuários: >9/10

### KPIs de Transparência
- Atas públicas disponíveis: 100%
- Tempo de resposta à busca: <2s
- Downloads mensais: crescente
- Acessos únicos: crescente

## Cronograma e Prioridades

### Prioridade Alta (Imediato)
- ✅ Sistema base de atas
- ⏳ Editor rich text completo
- ⏳ Geração real de PDF
- ⏳ Templates básicos

### Prioridade Média (30-60 dias)
- Sistema de assinatura digital
- OCR para importação
- Publicação automática
- Busca avançada

### Prioridade Baixa (60-90 dias)
- Blockchain
- Integração SEI
- Analytics avançado
- App mobile dedicado

## Considerações de Segurança

### Integridade do Documento
- Hash SHA-256 de cada versão
- Backup incremental
- Logs de todas as alterações
- Impossibilidade de deleção

### Controle de Acesso
- Edição restrita por papel
- Aprovação hierárquica
- Visualização pública/restrita
- Auditoria de acessos

### Conformidade LGPD
- Anonimização quando necessário
- Dados pessoais protegidos
- Consentimento para publicação
- Direito de retificação

## Observações Finais

O módulo de Atas é essencial para a transparência e legalidade das decisões do CODEMA. A implementação atual tem uma base sólida, mas precisa evoluir para incluir funcionalidades modernas como editor rico, assinatura digital e publicação automatizada, garantindo conformidade total com as exigências legais.

**Próximos Passos Recomendados:**
1. Implementar editor rich text completo
2. Desenvolver sistema de templates
3. Integrar assinatura digital
4. Automatizar publicação no DOU