# PROTOCOLOS - Sistema de Geração e Gestão de Protocolos do CODEMA

## Status Atual da Implementação

### ✅ Implementado (100%)
- Geração de 10 tipos diferentes de protocolos
- Formato padronizado (TIPO-XXX/AAAA)
- Numeração sequencial por tipo e ano
- Interface completa com 4 abas funcionais
- Sistema de consulta e validação
- Estatísticas por tipo e período
- Configurações do sistema visíveis
- Exportação de estatísticas
- Fallback local quando DB indisponível
- Preview do próximo número

### Tipos de Protocolo Disponíveis
- **PROC** - Processo Administrativo
- **ATA** - Ata de Reunião
- **RES** - Resolução
- **CONV** - Convocação
- **NOT** - Notificação
- **PAR** - Parecer Técnico
- **REL** - Relatório
- **CERT** - Certidão
- **DEC** - Declaração
- **AUT** - Autorização

### ⚠️ Parcialmente Implementado
- Integração com banco de dados (funções RPC preparadas)
- QR Code nos protocolos

### ❌ Não Implementado
- Assinatura digital no protocolo
- Blockchain para garantir sequência
- API pública de validação

## Requisitos Legais e Conformidade

### Base Legal Principal
- **Lei 9.784/1999** - Processo administrativo federal (referência)
- **Decreto Municipal** - Numeração de documentos oficiais
- **Portaria TCE-MG** - Padrões de protocolo
- **ISO 15489** - Gestão de documentos
- **e-ARQ Brasil** - Requisitos para sistemas informatizados

### Requisitos de Conformidade

#### 1. Unicidade e Sequencialidade
- **Número Único**: Não repetição em todo o sistema
- **Sequencial**: Sem lacunas na numeração
- **Anual**: Reinício a cada ano fiscal
- **Rastreável**: Identificação completa do documento

#### 2. Formato Obrigatório
- **Estrutura**: TIPO-NÚMERO/ANO
- **Número**: 3 dígitos com zeros à esquerda
- **Ano**: 4 dígitos
- **Tipo**: Sigla padronizada

#### 3. Registro e Auditoria
- **Data/Hora**: Momento exato da geração
- **Responsável**: Usuário que gerou
- **Finalidade**: Documento vinculado
- **Imutabilidade**: Não pode ser alterado

#### 4. Disponibilização
- **Consulta Pública**: Validação online
- **Comprovante**: Emissão de certificado
- **Integração**: APIs para outros sistemas
- **Transparência**: Estatísticas públicas

## Plano de Implementação

### Fase 1: Robustez e Confiabilidade (Sprint 1-2)

#### 1.1 Garantia de Sequencialidade
```sql
-- Implementar sequências no banco
CREATE SEQUENCE protocolo_proc_2024 START 1;
CREATE SEQUENCE protocolo_ata_2024 START 1;
-- etc para cada tipo

-- Função atômica de geração
CREATE OR REPLACE FUNCTION gerar_protocolo_atomico(
  tipo_protocolo VARCHAR,
  ano INTEGER
) RETURNS VARCHAR AS $$
DECLARE
  numero INTEGER;
  protocolo VARCHAR;
BEGIN
  -- Lock exclusivo na tabela
  LOCK TABLE protocolos IN EXCLUSIVE MODE;
  
  -- Obtém próximo número
  SELECT COALESCE(MAX(numero), 0) + 1
  INTO numero
  FROM protocolos
  WHERE tipo = tipo_protocolo
    AND ano_protocolo = ano;
  
  -- Gera protocolo
  protocolo := tipo_protocolo || '-' || 
               LPAD(numero::TEXT, 3, '0') || '/' || ano;
  
  -- Registra
  INSERT INTO protocolos (tipo, numero, ano_protocolo, protocolo_completo)
  VALUES (tipo_protocolo, numero, ano, protocolo);
  
  RETURN protocolo;
END;
$$ LANGUAGE plpgsql;
```

#### 1.2 Sistema de Recuperação
- Detecção de gaps na numeração
- Alerta de protocolos faltantes
- Reconciliação automática
- Backup de emergência

#### 1.3 QR Code e Validação
- QR Code com URL de validação
- Página pública de verificação
- API REST para validação
- Certificado de autenticidade

### Fase 2: Segurança e Rastreabilidade (Sprint 3-4)

#### 2.1 Assinatura Digital
- Hash SHA-256 do protocolo
- Assinatura com chave privada
- Verificação com chave pública
- Timestamp certificado

#### 2.2 Blockchain
- Registro em blockchain pública
- Smart contract de protocolos
- Prova de existência
- Auditoria independente

#### 2.3 Integração com Documentos
- Vínculo obrigatório com documento
- Metadados do documento
- Preview do documento
- Download autorizado

### Fase 3: Integrações e APIs (Sprint 5-6)

#### 3.1 API Pública
- Endpoint de validação
- Consulta de estatísticas
- Webhook de novos protocolos
- Rate limiting e autenticação

#### 3.2 Integração com Sistemas
- SEI - Sistema Eletrônico de Informações
- Portal da Transparência
- Sistema de Processo Digital
- e-Protocolo do Estado

#### 3.3 Mobile e Offline
- App para geração offline
- Sincronização posterior
- QR Code scanner
- Push notifications

## Requisitos Técnicos

### Modelo de Dados Completo
```sql
-- Tabela principal de protocolos
CREATE TABLE protocolos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(10) NOT NULL,
  numero INTEGER NOT NULL,
  ano_protocolo INTEGER NOT NULL,
  protocolo_completo VARCHAR(20) NOT NULL,
  
  -- Vinculação
  documento_tipo VARCHAR(50),
  documento_id UUID,
  documento_url TEXT,
  
  -- Segurança
  hash_protocolo VARCHAR(64),
  assinatura_digital TEXT,
  blockchain_tx VARCHAR(100),
  qrcode_url TEXT,
  
  -- Auditoria
  gerado_por UUID REFERENCES profiles(id),
  gerado_em TIMESTAMP DEFAULT NOW(),
  ip_geracao INET,
  
  -- Metadados
  observacoes TEXT,
  tags TEXT[],
  valido BOOLEAN DEFAULT true,
  
  UNIQUE(tipo, numero, ano_protocolo),
  UNIQUE(protocolo_completo)
);

-- Tabela de configurações
CREATE TABLE protocolos_config (
  id UUID PRIMARY KEY,
  tipo VARCHAR(10) UNIQUE NOT NULL,
  descricao VARCHAR(100),
  prefixo VARCHAR(10),
  ativo BOOLEAN DEFAULT true,
  reinicio_anual BOOLEAN DEFAULT true,
  proximo_numero INTEGER DEFAULT 1,
  formato_numero VARCHAR(20) DEFAULT '000',
  validacao_regex VARCHAR(100),
  cor_interface VARCHAR(7),
  icone VARCHAR(10),
  ordem_exibicao INTEGER
);

-- Tabela de validações
CREATE TABLE protocolos_validacoes (
  id UUID PRIMARY KEY,
  protocolo VARCHAR(20) NOT NULL,
  validado_em TIMESTAMP DEFAULT NOW(),
  validado_por VARCHAR(255),
  ip_validacao INET,
  resultado VARCHAR(20),
  certificado_url TEXT
);

-- Tabela de gaps (lacunas)
CREATE TABLE protocolos_gaps (
  id UUID PRIMARY KEY,
  tipo VARCHAR(10),
  numero_faltante INTEGER,
  ano INTEGER,
  detectado_em TIMESTAMP DEFAULT NOW(),
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMP,
  motivo TEXT
);

-- Índices otimizados
CREATE INDEX idx_protocolos_tipo_ano ON protocolos(tipo, ano_protocolo);
CREATE INDEX idx_protocolos_documento ON protocolos(documento_tipo, documento_id);
CREATE INDEX idx_protocolos_gerado_em ON protocolos(gerado_em DESC);
CREATE INDEX idx_protocolos_busca ON protocolos USING gin(to_tsvector('portuguese', protocolo_completo || ' ' || COALESCE(observacoes, '')));
```

### APIs e Endpoints
- `POST /api/protocolos/gerar` - Gerar novo protocolo
- `GET /api/protocolos/proximo/:tipo` - Consultar próximo número
- `GET /api/protocolos/validar/:protocolo` - Validar protocolo
- `GET /api/protocolos/estatisticas` - Estatísticas gerais
- `GET /api/protocolos/:protocolo` - Detalhes do protocolo
- `GET /api/protocolos/:protocolo/qrcode` - Gerar QR Code
- `GET /api/protocolos/:protocolo/certificado` - Certificado de validação
- `POST /api/protocolos/reconciliar` - Reconciliar gaps
- `GET /api/protocolos/exportar` - Exportar registros
- `POST /api/protocolos/configurar` - Configurar tipos
- `GET /api/protocolos/blockchain/:tx` - Verificar na blockchain
- `POST /api/protocolos/assinar` - Assinar digitalmente

### Integrações Necessárias
- **QR Code**: qrcode.js ou similar
- **Blockchain**: Ethereum, Polygon ou BSC
- **Assinatura**: Certificado Digital ICP-Brasil
- **PDF**: Para certificados de validação
- **Cache**: Redis para consultas frequentes

## Recomendações UI/UX

### Interface Principal

#### Dashboard de Protocolos
- Cards com estatísticas em tempo real
- Gráfico de uso por tipo
- Timeline de gerações recentes
- Alertas de anomalias
- Quick actions para tipos frequentes

#### Geração Rápida
- Seletor de tipo com ícones
- Preview do protocolo em tempo real
- Vinculação opcional com documento
- Cópia com um clique
- Download de comprovante

#### Consulta e Validação
- Busca inteligente (parcial, fuzzy)
- Scanner de QR Code
- Resultado visual (válido/inválido)
- Detalhes completos
- Histórico de validações

### Mobile Experience
- PWA para acesso offline
- Camera para QR Code
- Geração simplificada
- Sincronização automática
- Compartilhamento nativo

### Acessibilidade
- Anúncio sonoro do protocolo gerado
- Alto contraste para QR Code
- Tamanho de fonte ajustável
- Navegação por teclado completa
- Screen reader otimizado

## Fluxo Operacional

### Geração de Protocolo

1. **Solicitação**
   - Seleção do tipo
   - Vinculação opcional
   - Confirmação de dados

2. **Geração**
   - Obtenção de lock
   - Cálculo do número
   - Criação do protocolo
   - Registro no banco

3. **Finalização**
   - QR Code gerado
   - Notificação visual
   - Cópia automática
   - Log de auditoria

### Validação de Protocolo

1. **Entrada**
   - Digite o protocolo
   - Ou escaneie QR Code
   - Ou use a API

2. **Verificação**
   - Busca no banco
   - Validação de formato
   - Verificação blockchain
   - Checagem de revogação

3. **Resultado**
   - Status válido/inválido
   - Detalhes do documento
   - Certificado digital
   - QR Code para compartilhar

## Métricas de Sucesso

### KPIs Operacionais
- Tempo de geração: <500ms
- Disponibilidade: 99.99%
- Protocolos/dia: ilimitado
- Validações/segundo: >100

### KPIs de Integridade
- Gaps detectados: 0
- Duplicatas: 0
- Falhas de geração: <0.01%
- Reconciliações necessárias: 0

### KPIs de Uso
- Taxa de validação: >30%
- Uso de QR Code: crescente
- APIs consumidas: crescente
- Satisfação: >9/10

## Cronograma e Prioridades

### Prioridade Alta (Imediato)
- ✅ Sistema base funcional
- ✅ 10 tipos de protocolo
- ⏳ Integração DB robusta
- ⏳ QR Code

### Prioridade Média (30-60 dias)
- Assinatura digital
- API pública
- Detecção de gaps
- Certificados

### Prioridade Baixa (60-90 dias)
- Blockchain
- App mobile
- Integrações externas
- ML para detecção de fraude

## Considerações de Segurança

### Integridade
- Sequência sem gaps
- Impossível alterar
- Backup redundante
- Logs imutáveis

### Autenticidade
- Assinatura digital
- Verificação pública
- Prova criptográfica
- Não repúdio

### Disponibilidade
- Multi-region
- Cache distribuído
- Fallback local
- Zero downtime deploy

## Observações Finais

O módulo de Protocolos é a espinha dorsal da formalização documental do CODEMA. Com implementação 100% funcional, garante rastreabilidade e conformidade legal. As próximas evoluções devem focar em segurança adicional (blockchain, assinatura digital) e integrações com sistemas externos.

**Próximos Passos Recomendados:**
1. Implementar QR Code em todos os protocolos
2. Adicionar assinatura digital
3. Criar API pública de validação
4. Integrar com blockchain para imutabilidade