-- Enhanced Meetings System for CODEMA
-- Adds automated summoning, attendance tracking, and template system

-- Table for meeting summoning/convocations
CREATE TABLE convocacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  conselheiro_id UUID REFERENCES conselheiros(id) ON DELETE CASCADE,
  
  -- Sending details
  enviada_em TIMESTAMP WITH TIME ZONE,
  tipo_envio VARCHAR(20) NOT NULL CHECK (tipo_envio IN ('email', 'whatsapp', 'postal')),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'entregue', 'erro')),
  
  -- Response tracking
  confirmacao_presenca VARCHAR(20) DEFAULT 'pendente' CHECK (confirmacao_presenca IN ('confirmada', 'rejeitada', 'pendente')),
  data_confirmacao TIMESTAMP WITH TIME ZONE,
  token_confirmacao UUID DEFAULT gen_random_uuid(),
  
  -- Additional info
  observacoes TEXT,
  erro_envio TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(reuniao_id, conselheiro_id)
);

-- Table for attendance tracking
CREATE TABLE presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  conselheiro_id UUID REFERENCES conselheiros(id) ON DELETE CASCADE,
  
  -- Attendance details
  presente BOOLEAN DEFAULT false,
  horario_chegada TIMESTAMP WITH TIME ZONE,
  horario_saida TIMESTAMP WITH TIME ZONE,
  justificativa_ausencia TEXT,
  
  -- Metadata
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(reuniao_id, conselheiro_id)
);

-- Table for summoning templates
CREATE TABLE convocacao_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  tipo_reuniao VARCHAR(20) NOT NULL CHECK (tipo_reuniao IN ('ordinaria', 'extraordinaria', 'publica')),
  
  -- Email template
  assunto_email VARCHAR(500) NOT NULL,
  corpo_email TEXT NOT NULL,
  
  -- WhatsApp template
  corpo_whatsapp TEXT,
  
  -- Settings
  ativo BOOLEAN DEFAULT true,
  dias_antecedencia INTEGER DEFAULT 7, -- days before meeting to send
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for automated sending schedule
CREATE TABLE convocacao_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  template_id UUID REFERENCES convocacao_templates(id),
  
  -- Scheduling
  data_envio_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  data_envio_realizada TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  enviar_email BOOLEAN DEFAULT true,
  enviar_whatsapp BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'processando', 'concluido', 'erro')),
  erro_processamento TEXT,
  total_enviadas INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for meeting reminders
CREATE TABLE lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  
  -- Timing
  horas_antecedencia INTEGER NOT NULL DEFAULT 24,
  data_envio_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  data_envio_realizada TIMESTAMP WITH TIME ZONE,
  
  -- Content
  assunto VARCHAR(500) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo_envio VARCHAR(20) NOT NULL CHECK (tipo_envio IN ('email', 'whatsapp', 'ambos')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'enviado', 'erro')),
  total_enviados INTEGER DEFAULT 0,
  erro_envio TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indices for performance
CREATE INDEX idx_convocacoes_reuniao ON convocacoes(reuniao_id);
CREATE INDEX idx_convocacoes_conselheiro ON convocacoes(conselheiro_id);
CREATE INDEX idx_convocacoes_status ON convocacoes(status);
CREATE INDEX idx_convocacoes_token ON convocacoes(token_confirmacao);

CREATE INDEX idx_presencas_reuniao ON presencas(reuniao_id);
CREATE INDEX idx_presencas_conselheiro ON presencas(conselheiro_id);

CREATE INDEX idx_agendamentos_data_envio ON convocacao_agendamentos(data_envio_programada);
CREATE INDEX idx_agendamentos_status ON convocacao_agendamentos(status);

CREATE INDEX idx_lembretes_data_envio ON lembretes(data_envio_programada);
CREATE INDEX idx_lembretes_status ON lembretes(status);

-- Triggers for updated_at
CREATE TRIGGER update_convocacoes_updated_at BEFORE UPDATE ON convocacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presencas_updated_at BEFORE UPDATE ON presencas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_convocacao_templates_updated_at BEFORE UPDATE ON convocacao_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_convocacao_agendamentos_updated_at BEFORE UPDATE ON convocacao_agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO convocacao_templates (nome, tipo_reuniao, assunto_email, corpo_email, corpo_whatsapp, dias_antecedencia) VALUES 
(
  'Convocação Ordinária Padrão',
  'ordinaria',
  'Convocação para Reunião Ordinária do CODEMA - {{data_reuniao}}',
  'Prezado(a) Conselheiro(a) {{nome_conselheiro}},

Convocamos Vossa Senhoria para a Reunião Ordinária do Conselho Municipal de Defesa do Meio Ambiente - CODEMA, que se realizará no dia {{data_reuniao}}, às {{hora_reuniao}}, no {{local_reuniao}}.

PAUTA:
{{pauta_reuniao}}

Contamos com sua presença.

Atenciosamente,

{{nome_presidente}}
Presidente do CODEMA
Prefeitura Municipal de Itanhomi/MG

Para confirmar presença, clique aqui: {{link_confirmacao}}',
  'Olá {{nome_conselheiro}}! Convocação para Reunião Ordinária do CODEMA em {{data_reuniao}} às {{hora_reuniao}} no {{local_reuniao}}. Confirme presença: {{link_confirmacao}}',
  7
),
(
  'Convocação Extraordinária Padrão',
  'extraordinaria',
  'URGENTE - Convocação para Reunião Extraordinária do CODEMA - {{data_reuniao}}',
  'Prezado(a) Conselheiro(a) {{nome_conselheiro}},

Convocamos Vossa Senhoria, com caráter de URGÊNCIA, para a Reunião Extraordinária do Conselho Municipal de Defesa do Meio Ambiente - CODEMA, que se realizará no dia {{data_reuniao}}, às {{hora_reuniao}}, no {{local_reuniao}}.

PAUTA EXTRAORDINÁRIA:
{{pauta_reuniao}}

Dada a urgência do assunto, contamos imprescindivelmente com sua presença.

Atenciosamente,

{{nome_presidente}}
Presidente do CODEMA
Prefeitura Municipal de Itanhomi/MG

Para confirmar presença URGENTE, clique aqui: {{link_confirmacao}}',
  '=¨ URGENTE: Reunião Extraordinária CODEMA em {{data_reuniao}} às {{hora_reuniao}} no {{local_reuniao}}. Sua presença é fundamental! Confirme: {{link_confirmacao}}',
  2
),
(
  'Convocação Audiência Pública',
  'publica',
  'Convite para Audiência Pública do CODEMA - {{data_reuniao}}',
  'Prezado(a) Conselheiro(a) {{nome_conselheiro}},

Convidamos Vossa Senhoria para a Audiência Pública do Conselho Municipal de Defesa do Meio Ambiente - CODEMA, que se realizará no dia {{data_reuniao}}, às {{hora_reuniao}}, no {{local_reuniao}}.

TEMA DA AUDIÊNCIA:
{{pauta_reuniao}}

A participação da sociedade civil é fundamental para o processo democrático de decisão.

Atenciosamente,

{{nome_presidente}}
Presidente do CODEMA
Prefeitura Municipal de Itanhomi/MG

Para confirmar presença, clique aqui: {{link_confirmacao}}',
  'Audiência Pública CODEMA em {{data_reuniao}} às {{hora_reuniao}} no {{local_reuniao}}. Tema: {{pauta_reuniao}}. Confirme: {{link_confirmacao}}',
  10
);