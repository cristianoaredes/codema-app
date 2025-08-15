# CONSELHEIROS - Sistema de Gestão de Membros do CODEMA

## Status Atual da Implementação

### ✅ Implementado (95%)
- Cadastro completo de conselheiros com todos os campos obrigatórios
- Gestão de mandatos com controle de vigência e renovação
- Sistema de controle de faltas (consecutivas e totais)
- Diferenciação entre titulares e suplentes
- Segmentação por categoria (governo, sociedade civil, setor produtivo)
- Interface de cards responsiva e otimizada para mobile
- Filtros avançados por status, segmento e busca textual
- Exportação de dados em CSV
- Validação de CPF e dados pessoais
- Dashboard com estatísticas em tempo real

### ⚠️ Parcialmente Implementado
- Importação de dados via CSV (processamento preparado, falta integração)
- Sistema de notificações de vencimento de mandato (backend pronto)
- Histórico de alterações de status

### ❌ Não Implementado
- Integração com sistema de votação
- Geração automática de certificados
- Portal do conselheiro (área restrita)
- Sistema de substituição automática titular/suplente

## Requisitos Legais e Conformidade

### Base Legal Principal
- **Lei Municipal de criação do CODEMA**
- **Decreto Municipal de nomeação dos conselheiros**
- **Regimento Interno do CODEMA**
- **Lei Federal 6.938/1981** - Política Nacional do Meio Ambiente
- **Resolução CONAMA 237/1997** - Regulamenta aspectos do licenciamento ambiental

### Requisitos de Conformidade

#### 1. Composição Paritária
- **Exigência**: Representação equilibrada entre poder público e sociedade civil
- **Implementação**: Sistema de segmentação por categoria com validação de proporções
- **Prazo Legal**: Verificação a cada renovação de mandato

#### 2. Publicidade dos Atos
- **Exigência**: Publicação da composição do conselho e alterações
- **Implementação**: Exportação de dados e integração com portal da transparência
- **Prazo**: 5 dias úteis após nomeação/alteração

#### 3. Controle de Assiduidade
- **Exigência**: Perda de mandato após 3 faltas consecutivas ou 5 alternadas
- **Implementação**: Sistema automático de contagem e alertas
- **Notificação**: Após 2 faltas consecutivas

#### 4. Documentação Obrigatória
- **CPF e RG**: Validação em tempo real
- **Comprovante de representação**: Upload de documentos
- **Termo de posse**: Geração automática com assinatura digital

## Plano de Implementação

### Fase 1: Melhorias Imediatas (Sprint 1-2)
1. **Completar importação CSV**
   - Parser robusto com validação de dados
   - Detecção de duplicatas
   - Relatório de importação

2. **Sistema de Notificações**
   - Alertas de vencimento de mandato (30, 15, 7 dias)
   - Notificação de faltas consecutivas
   - Lembrete de reuniões

3. **Histórico e Auditoria**
   - Log de todas as alterações
   - Rastreamento de responsável pela mudança
   - Exportação de histórico

### Fase 2: Portal do Conselheiro (Sprint 3-4)
1. **Área Restrita**
   - Login com autenticação forte
   - Perfil editável pelo conselheiro
   - Visualização de próprias presenças

2. **Documentos Pessoais**
   - Upload de documentação
   - Validação de documentos
   - Alertas de documentos vencidos

3. **Comunicação**
   - Recebimento de convocações
   - Confirmação de presença
   - Justificativa de ausências

### Fase 3: Integrações Avançadas (Sprint 5-6)
1. **Sistema de Votação**
   - Integração com módulo de reuniões
   - Registro de votos por conselheiro
   - Impedimentos e abstenções

2. **Geração de Certificados**
   - Templates personalizáveis
   - Assinatura digital
   - QR Code de validação

3. **BI e Analytics**
   - Dashboard gerencial
   - Relatórios de participação
   - Análise de quórum

## Requisitos Técnicos

### Modelo de Dados
```sql
-- Tabela principal já implementada
CREATE TABLE conselheiros (
  id UUID PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  entidade_representada VARCHAR(255) NOT NULL,
  segmento VARCHAR(50) NOT NULL,
  titular BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'ativo',
  mandato_inicio DATE NOT NULL,
  mandato_fim DATE NOT NULL,
  mandato_numero VARCHAR(50),
  total_faltas INTEGER DEFAULT 0,
  faltas_consecutivas INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Nova tabela para histórico
CREATE TABLE conselheiros_historico (
  id UUID PRIMARY KEY,
  conselheiro_id UUID REFERENCES conselheiros(id),
  campo_alterado VARCHAR(50),
  valor_anterior TEXT,
  valor_novo TEXT,
  alterado_por UUID REFERENCES profiles(id),
  motivo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nova tabela para documentos
CREATE TABLE conselheiros_documentos (
  id UUID PRIMARY KEY,
  conselheiro_id UUID REFERENCES conselheiros(id),
  tipo_documento VARCHAR(50),
  nome_arquivo VARCHAR(255),
  url TEXT,
  data_validade DATE,
  verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### APIs e Endpoints
- `GET /api/conselheiros` - Lista com filtros e paginação
- `POST /api/conselheiros` - Criação com validação completa
- `PUT /api/conselheiros/:id` - Atualização com histórico
- `DELETE /api/conselheiros/:id` - Soft delete com justificativa
- `POST /api/conselheiros/import` - Importação em lote
- `GET /api/conselheiros/export` - Exportação com filtros
- `GET /api/conselheiros/:id/historico` - Histórico de alterações
- `POST /api/conselheiros/:id/documentos` - Upload de documentos

### Integrações Necessárias
- **CPF**: Validação via algoritmo (implementado)
- **Email**: Integração com serviço de envio (SendGrid/SES)
- **SMS**: Notificações urgentes (Twilio/Zenvia)
- **Assinatura Digital**: ICP-Brasil ou equivalente

## Recomendações UI/UX

### Desktop
- Manter visualização em cards para melhor escaneabilidade
- Adicionar visualização em tabela como alternativa
- Implementar drag-and-drop para reordenação
- Quick actions em hover dos cards

### Mobile
- Cards colapsáveis com informações essenciais visíveis
- Swipe actions para editar/deletar
- Filtros em modal bottom sheet
- Busca com sugestões automáticas

### Acessibilidade
- Labels descritivos em todos os campos
- Navegação completa por teclado
- Modo de alto contraste
- Leitura de tela otimizada

### Melhorias Sugeridas
1. **Foto do Conselheiro**: Avatar com fallback para iniciais
2. **Status Visual**: Cores e ícones para rápida identificação
3. **Timeline**: Visualização gráfica do período de mandato
4. **Comparação**: Seleção múltipla para comparar conselheiros

## Fluxo Operacional

### Cadastro de Novo Conselheiro
1. Verificação de CPF único
2. Validação de período de mandato
3. Verificação de proporção paritária
4. Upload de documentação obrigatória
5. Geração de protocolo de nomeação
6. Envio de credenciais de acesso
7. Agendamento de posse

### Renovação de Mandato
1. Alerta 30 dias antes do vencimento
2. Verificação de elegibilidade
3. Atualização de documentação
4. Novo termo de posse
5. Atualização automática de status

### Controle de Faltas
1. Registro automático via módulo de reuniões
2. Contabilização de consecutivas e totais
3. Alerta após 2 faltas consecutivas
4. Notificação formal em 3 faltas
5. Processo de substituição se necessário

## Métricas de Sucesso

### KPIs Operacionais
- Taxa de ocupação de vagas: >95%
- Tempo médio de cadastro: <5 minutos
- Taxa de documentação completa: >90%
- Índice de presença média: >75%

### KPIs de Conformidade
- Paridade governo/sociedade: 50/50 ±5%
- Mandatos dentro da vigência: 100%
- Notificações enviadas no prazo: 100%
- Documentação válida: 100%

### KPIs de Engajamento
- Conselheiros usando portal: >80%
- Confirmações de presença antecipadas: >70%
- Justificativas de ausência: 100%
- Satisfação com o sistema: >8/10

## Cronograma e Prioridades

### Prioridade Alta (Imediato)
- ✅ Sistema base de cadastro
- ✅ Controle de faltas
- ⏳ Notificações de vencimento
- ⏳ Importação de dados

### Prioridade Média (30-60 dias)
- Portal do conselheiro
- Histórico completo
- Upload de documentos
- Integração com reuniões

### Prioridade Baixa (60-90 dias)
- Geração de certificados
- Analytics avançado
- App mobile dedicado
- Integração com votação

## Considerações de Segurança

### Proteção de Dados Pessoais (LGPD)
- Consentimento explícito para uso de dados
- Anonimização em relatórios públicos
- Direito ao esquecimento implementado
- Logs de acesso e alterações

### Segurança da Aplicação
- Autenticação forte (2FA disponível)
- Criptografia de dados sensíveis
- Backup diário automático
- Auditoria de acessos

### Conformidade
- Retenção de dados por 5 anos
- Exportação em formatos abertos
- Integração com e-SIC
- Publicação no Portal da Transparência

## Observações Finais

O módulo de Conselheiros é fundamental para o funcionamento do CODEMA, sendo a base para todos os outros módulos que dependem da identificação e validação dos membros. A implementação atual está robusta, necessitando principalmente de melhorias na automação de processos e comunicação com os conselheiros.

**Próximos Passos Recomendados:**
1. Implementar sistema de notificações automáticas
2. Desenvolver portal do conselheiro
3. Integrar com módulo de votação
4. Criar dashboard gerencial para presidência