-- Módulo 3: Lavratura Eletrônica de Atas
-- Sistema completo para criação, edição e gestão de atas eletrônicas

-- Tabela para templates de atas
CREATE TABLE atas_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'ordinaria', 'extraordinaria', 'publica'
  conteudo_template TEXT NOT NULL, -- Template em formato JSON/HTML
  campos_obrigatorios JSONB NOT NULL DEFAULT '[]', -- Lista de campos obrigatórios
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela principal de atas
CREATE TABLE atas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE, -- ATA-001/2024
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  template_id UUID REFERENCES atas_templates(id),
  
  -- Dados da reunião
  data_reuniao DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  local_reuniao TEXT NOT NULL,
  tipo_reuniao VARCHAR(50) NOT NULL, -- 'ordinaria', 'extraordinaria', 'publica'
  
  -- Conteúdo da ata
  pauta JSONB NOT NULL DEFAULT '[]', -- Lista de itens da pauta
  presentes JSONB NOT NULL DEFAULT '[]', -- Lista de presentes com detalhes
  ausentes JSONB NOT NULL DEFAULT '[]', -- Lista de ausentes
  deliberacoes JSONB NOT NULL DEFAULT '[]', -- Deliberações tomadas
  observacoes TEXT,
  
  -- Controle de versão
  versao INTEGER DEFAULT 1,
  rascunho BOOLEAN DEFAULT true,
  
  -- Status da ata
  status VARCHAR(50) DEFAULT 'rascunho', -- 'rascunho', 'em_revisao', 'aprovada', 'assinada'
  
  -- Assinaturas digitais
  assinatura_presidente UUID REFERENCES auth.users(id),
  assinatura_secretario UUID REFERENCES auth.users(id),
  data_assinatura_presidente TIMESTAMP WITH TIME ZONE,
  data_assinatura_secretario TIMESTAMP WITH TIME ZONE,
  
  -- Controle de arquivo
  pdf_gerado BOOLEAN DEFAULT false,
  pdf_url TEXT,
  hash_integridade VARCHAR(255), -- SHA-256 do PDF para verificação
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para versionamento de atas
CREATE TABLE atas_versoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  conteudo JSONB NOT NULL, -- Snapshot completo da ata nesta versão
  modificacoes TEXT, -- Descrição das modificações
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  
  UNIQUE(ata_id, versao)
);

-- Tabela para revisões colaborativas
CREATE TABLE atas_revisoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  revisor_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Dados da revisão
  secao VARCHAR(100) NOT NULL, -- 'pauta', 'deliberacoes', 'observacoes', etc.
  comentario TEXT NOT NULL,
  sugestao_alteracao TEXT,
  linha_referencia INTEGER, -- Linha ou item específico comentado
  
  -- Status
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'aceita', 'rejeitada'
  resposta TEXT, -- Resposta do autor às sugestões
  respondido_por UUID REFERENCES auth.users(id),
  respondido_em TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para controle de notificações de atas
CREATE TABLE atas_notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
  destinatario_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'nova_ata', 'revisao_pendente', 'aprovacao_necessaria', 'ata_finalizada'
  enviado BOOLEAN DEFAULT false,
  data_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_atas_reuniao_id ON atas(reuniao_id);
CREATE INDEX idx_atas_status ON atas(status);
CREATE INDEX idx_atas_data_reuniao ON atas(data_reuniao);
CREATE INDEX idx_atas_numero ON atas(numero);
CREATE INDEX idx_atas_versoes_ata_id ON atas_versoes(ata_id);
CREATE INDEX idx_atas_revisoes_ata_id ON atas_revisoes(ata_id);
CREATE INDEX idx_atas_revisoes_revisor ON atas_revisoes(revisor_id);
CREATE INDEX idx_atas_notificacoes_destinatario ON atas_notificacoes(destinatario_id);

-- Triggers para auditoria
CREATE TRIGGER audit_atas_templates 
  AFTER INSERT OR UPDATE OR DELETE ON atas_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_atas 
  AFTER INSERT OR UPDATE OR DELETE ON atas
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_atas_versoes 
  AFTER INSERT OR UPDATE OR DELETE ON atas_versoes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_atas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_atas_timestamp 
  BEFORE UPDATE ON atas
  FOR EACH ROW EXECUTE FUNCTION update_atas_timestamp();

-- Trigger para criar versão automática ao salvar
CREATE OR REPLACE FUNCTION create_ata_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Só cria versão se não for a primeira inserção
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO atas_versoes (ata_id, versao, conteudo, created_by)
    VALUES (
      NEW.id,
      NEW.versao,
      jsonb_build_object(
        'pauta', NEW.pauta,
        'presentes', NEW.presentes,
        'ausentes', NEW.ausentes,
        'deliberacoes', NEW.deliberacoes,
        'observacoes', NEW.observacoes,
        'status', NEW.status
      ),
      NEW.updated_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_ata_version_trigger 
  AFTER UPDATE ON atas
  FOR EACH ROW EXECUTE FUNCTION create_ata_version();

-- Function para gerar próximo número de ata
CREATE OR REPLACE FUNCTION gerar_proximo_numero_ata()
RETURNS TEXT AS $$
DECLARE
  ano INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  proximo_numero INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 2) AS INTEGER)), 0) + 1
  INTO proximo_numero
  FROM atas
  WHERE numero LIKE 'ATA-%/' || ano::TEXT;
  
  RETURN 'ATA-' || LPAD(proximo_numero::TEXT, 3, '0') || '/' || ano::TEXT;
END;
$$ language 'plpgsql';

-- RLS Policies
ALTER TABLE atas_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas_revisoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas_notificacoes ENABLE ROW LEVEL SECURITY;

-- Templates: Admin e secretários podem gerenciar, outros podem visualizar
CREATE POLICY "Templates visíveis para autenticados" ON atas_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Templates editáveis por admin/secretário" ON atas_templates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario')
    )
  );

-- Atas: Acesso baseado na reunião correspondente
CREATE POLICY "Atas visíveis conforme reunião" ON atas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM reunioes r
      WHERE r.id = reuniao_id
      AND (
        r.publica = true
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
        )
      )
    )
  );

CREATE POLICY "Atas editáveis por secretário/presidente" ON atas
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Versões: Mesmo acesso que a ata principal
CREATE POLICY "Versões visíveis conforme ata" ON atas_versoes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM atas a
      WHERE a.id = ata_id
    )
  );

-- Revisões: Conselheiros podem criar, todos podem ver as próprias
CREATE POLICY "Revisões por conselheiros" ON atas_revisoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('conselheiro_titular', 'conselheiro_suplente', 'presidente')
    )
    AND revisor_id = auth.uid()
  );

CREATE POLICY "Ver próprias revisões e respostas" ON atas_revisoes
  FOR SELECT TO authenticated USING (
    revisor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Notificações: Cada usuário vê apenas as suas
CREATE POLICY "Notificações próprias" ON atas_notificacoes
  FOR ALL TO authenticated USING (destinatario_id = auth.uid());

-- Inserir templates padrão
INSERT INTO atas_templates (nome, tipo, conteudo_template, campos_obrigatorios, created_by) VALUES
(
  'Ata de Reunião Ordinária',
  'ordinaria',
  '{"cabecalho": "CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE - CODEMA", "estrutura": ["abertura", "verificacao_quorum", "leitura_ata_anterior", "pauta_do_dia", "deliberacoes", "proxima_reuniao", "encerramento"]}',
  '["data_reuniao", "hora_inicio", "local_reuniao", "presentes", "pauta", "deliberacoes"]',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Ata de Reunião Extraordinária',
  'extraordinaria', 
  '{"cabecalho": "CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE - CODEMA", "estrutura": ["abertura", "verificacao_quorum", "motivo_convocacao", "pauta_especifica", "deliberacoes", "encerramento"]}',
  '["data_reuniao", "hora_inicio", "local_reuniao", "presentes", "pauta", "deliberacoes", "motivo_convocacao"]',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Ata de Audiência Pública',
  'publica',
  '{"cabecalho": "CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE - CODEMA", "estrutura": ["abertura", "apresentacao_tema", "manifestacoes_publico", "posicionamento_conselho", "deliberacoes", "encerramento"]}',
  '["data_reuniao", "hora_inicio", "local_reuniao", "presentes", "tema_audiencia", "manifestacoes", "deliberacoes"]',
  (SELECT id FROM auth.users LIMIT 1)
);

-- Comentários nas tabelas
COMMENT ON TABLE atas_templates IS 'Templates padrão para geração de atas conforme legislação';
COMMENT ON TABLE atas IS 'Atas eletrônicas das reuniões do CODEMA';
COMMENT ON TABLE atas_versoes IS 'Controle de versões das atas para auditoria';
COMMENT ON TABLE atas_revisoes IS 'Sistema de revisão colaborativa das atas';
COMMENT ON TABLE atas_notificacoes IS 'Controle de notificações relacionadas às atas';