-- ===================================================================
-- CODEMA COMPLETE SYSTEM MIGRATION
-- Implementing all 12 modules required by legislation
-- ===================================================================

-- 1. UPDATE service_categories for CODEMA-specific categories
DELETE FROM service_categories WHERE id IN (
  SELECT id FROM service_categories WHERE name IN (
    'Licenciamento Ambiental', 'Fiscalização', 'Educação Ambiental', 
    'Audiências Públicas', 'Processos de Impacto', 'Gestão FMA'
  )
);

INSERT INTO service_categories (name, description, icon) VALUES
('Licenciamento Ambiental', 'Processos de licenciamento de atividades potencialmente poluidoras', 'shield-check'),
('Fiscalização', 'Denúncias e fiscalização de infrações ambientais', 'search'),
('Educação Ambiental', 'Programas e projetos de educação ambiental', 'book-open'),
('Audiências Públicas', 'Audiências públicas para discussão de projetos', 'users'),
('Processos de Impacto', 'Estudos de impacto ambiental e relatórios', 'clipboard-list'),
('Gestão FMA', 'Gestão do Fundo Municipal de Meio Ambiente', 'dollar-sign');

-- 2. CREATE NEW TABLES FOR CODEMA MODULES

-- Módulo 5: Protocolo e Tramitação de Processos
CREATE TABLE public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo TEXT NOT NULL UNIQUE, -- formato: PROC.001/2024
  tipo_processo TEXT NOT NULL CHECK (tipo_processo IN ('licenciamento', 'denuncia', 'audiencia_publica', 'estudo_impacto', 'outros')),
  requerente TEXT NOT NULL,
  cpf_cnpj TEXT,
  endereco_empreendimento TEXT,
  descricao_atividade TEXT NOT NULL,
  documentos_anexos TEXT[], -- URLs dos documentos
  status TEXT NOT NULL DEFAULT 'protocolado' CHECK (status IN ('protocolado', 'em_analise_tecnica', 'em_relatoria', 'em_votacao', 'aprovado', 'reprovado', 'arquivado')),
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  relator_id UUID REFERENCES profiles(id),
  parecer_tecnico TEXT,
  parecer_relator TEXT,
  data_protocolo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prazo_parecer TIMESTAMP WITH TIME ZONE, -- prazo máximo de 30 dias
  data_votacao TIMESTAMP WITH TIME ZONE,
  resultado_votacao TEXT CHECK (resultado_votacao IN ('aprovado', 'reprovado', 'diligencia')),
  votos_favoraveis INTEGER DEFAULT 0,
  votos_contrarios INTEGER DEFAULT 0,
  votos_abstencoes INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Módulo 6: Gestão do FMA (Fundo Municipal do Meio Ambiente)
CREATE TABLE public.fma_receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_receita TEXT NOT NULL CHECK (tipo_receita IN ('multa', 'tac', 'convenio', 'doacao', 'transferencia', 'outros')),
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL CHECK (valor > 0),
  data_entrada TIMESTAMP WITH TIME ZONE NOT NULL,
  origem TEXT NOT NULL, -- órgão ou pessoa de origem
  numero_documento TEXT, -- número da multa, TAC, etc.
  status TEXT DEFAULT 'recebido' CHECK (status IN ('previsto', 'recebido', 'cancelado')),
  observacoes TEXT,
  responsavel_cadastro_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.fma_projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  valor_solicitado DECIMAL(15,2) NOT NULL CHECK (valor_solicitado > 0),
  valor_aprovado DECIMAL(15,2) CHECK (valor_aprovado >= 0),
  proponente TEXT NOT NULL,
  cpf_cnpj_proponente TEXT,
  area_atuacao TEXT NOT NULL CHECK (area_atuacao IN ('educacao_ambiental', 'recuperacao_areas', 'conservacao_biodiversidade', 'saneamento', 'fiscalizacao', 'outros')),
  prazo_execucao INTEGER NOT NULL, -- em meses
  data_inicio_prevista TIMESTAMP WITH TIME ZONE,
  data_fim_prevista TIMESTAMP WITH TIME ZONE,
  data_inicio_real TIMESTAMP WITH TIME ZONE,
  data_fim_real TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'submetido' CHECK (status IN ('submetido', 'em_analise', 'aprovado', 'reprovado', 'em_execucao', 'concluido', 'cancelado')),
  percentual_execucao INTEGER DEFAULT 0 CHECK (percentual_execucao >= 0 AND percentual_execucao <= 100),
  documentos_projeto TEXT[], -- URLs dos documentos
  documentos_prestacao_contas TEXT[], -- URLs dos documentos
  reuniao_aprovacao_id UUID REFERENCES reunioes(id),
  responsavel_analise_id UUID REFERENCES profiles(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Módulo 9: Ouvidoria
CREATE TABLE public.ouvidoria_denuncias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL UNIQUE, -- formato: OUV.001/2024
  tipo_denuncia TEXT NOT NULL CHECK (tipo_denuncia IN ('queima_lixo', 'desmatamento', 'poluicao_agua', 'poluicao_sonora', 'construcao_irregular', 'outros')),
  descricao TEXT NOT NULL,
  local_ocorrencia TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  fotos TEXT[], -- URLs das fotos
  data_ocorrencia TIMESTAMP WITH TIME ZONE,
  denunciante_nome TEXT,
  denunciante_cpf TEXT,
  denunciante_telefone TEXT,
  denunciante_email TEXT,
  anonima BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'recebida' CHECK (status IN ('recebida', 'em_apuracao', 'fiscalizacao_agendada', 'fiscalizacao_realizada', 'procedente', 'improcedente', 'arquivada')),
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  fiscal_responsavel_id UUID REFERENCES profiles(id),
  relatorio_fiscalizacao TEXT,
  data_fiscalizacao TIMESTAMP WITH TIME ZONE,
  providencias_tomadas TEXT,
  data_resposta_denunciante TIMESTAMP WITH TIME ZONE,
  resposta_denunciante TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Módulo 11: Controle de Impedimentos/Conflitos
CREATE TABLE public.impedimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conselheiro_id UUID REFERENCES profiles(id) NOT NULL,
  processo_id UUID REFERENCES processos(id),
  reuniao_id UUID REFERENCES reunioes(id),
  tipo_impedimento TEXT NOT NULL CHECK (tipo_impedimento IN ('interesse_direto', 'interesse_familiar', 'interesse_profissional', 'outros')),
  descricao_impedimento TEXT NOT NULL,
  data_impedimento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Módulo 12: Logs de Auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id),
  acao TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'download'
  tabela TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. ADD ADDITIONAL FIELDS TO EXISTING TABLES

-- Expand reunioes table
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS numero_reuniao TEXT; -- formato: REU.001/2024
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS tipo_reuniao TEXT DEFAULT 'ordinaria' CHECK (tipo_reuniao IN ('ordinaria', 'extraordinaria', 'publica'));
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS quorum_presente INTEGER DEFAULT 0;
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS quorum_necessario INTEGER DEFAULT 0;
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS ata_aprovada BOOLEAN DEFAULT false;
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS data_aprovacao_ata TIMESTAMP WITH TIME ZONE;
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS resolucoes_geradas TEXT[]; -- IDs das resoluções geradas

-- Expand documentos table
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS numero_documento TEXT; -- formato: DOC.001/2024 ou RES.001/2024
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'documento' CHECK (categoria IN ('ata', 'resolucao', 'parecer', 'estudo', 'relatorio', 'documento'));
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS processo_id UUID REFERENCES processos(id);
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS assinatura_digital TEXT; -- hash da assinatura
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS data_assinatura TIMESTAMP WITH TIME ZONE;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS publicado BOOLEAN DEFAULT false;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS data_publicacao TIMESTAMP WITH TIME ZONE;

-- Expand profiles table for CODEMA users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS entidade_representada TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS inicio_mandato TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fim_mandato TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone_institucional TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS substituido_por UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS motivo_inativacao TEXT;

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_data_protocolo ON processos(data_protocolo);
CREATE INDEX IF NOT EXISTS idx_processos_prazo_parecer ON processos(prazo_parecer);

CREATE INDEX IF NOT EXISTS idx_fma_receitas_data ON fma_receitas(data_entrada);
CREATE INDEX IF NOT EXISTS idx_fma_receitas_tipo ON fma_receitas(tipo_receita);

CREATE INDEX IF NOT EXISTS idx_fma_projetos_status ON fma_projetos(status);
CREATE INDEX IF NOT EXISTS idx_fma_projetos_area ON fma_projetos(area_atuacao);

CREATE INDEX IF NOT EXISTS idx_ouvidoria_protocolo ON ouvidoria_denuncias(protocolo);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_status ON ouvidoria_denuncias(status);
CREATE INDEX IF NOT EXISTS idx_ouvidoria_tipo ON ouvidoria_denuncias(tipo_denuncia);

CREATE INDEX IF NOT EXISTS idx_impedimentos_conselheiro ON impedimentos(conselheiro_id);
CREATE INDEX IF NOT EXISTS idx_impedimentos_processo ON impedimentos(processo_id);
CREATE INDEX IF NOT EXISTS idx_impedimentos_reuniao ON impedimentos(reuniao_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON audit_logs(tabela);

-- 5. ENABLE RLS ON NEW TABLES
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fma_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fma_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ouvidoria_denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE impedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- Processos policies
CREATE POLICY "Secretários podem gerenciar processos" ON processos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

CREATE POLICY "Conselheiros podem ver processos" ON processos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
    )
  );

-- FMA Receitas policies
CREATE POLICY "Secretários podem gerenciar receitas FMA" ON fma_receitas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

CREATE POLICY "Conselheiros podem ver receitas FMA" ON fma_receitas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
    )
  );

-- FMA Projetos policies
CREATE POLICY "Secretários podem gerenciar projetos FMA" ON fma_projetos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

CREATE POLICY "Conselheiros podem ver projetos FMA" ON fma_projetos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
    )
  );

-- Ouvidoria policies
CREATE POLICY "Fiscais podem gerenciar denúncias" ON ouvidoria_denuncias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente', 'fiscal')
    )
  );

CREATE POLICY "Todos podem criar denúncias" ON ouvidoria_denuncias
  FOR INSERT WITH CHECK (true);

-- Impedimentos policies
CREATE POLICY "Secretários podem gerenciar impedimentos" ON impedimentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

CREATE POLICY "Conselheiros podem ver seus impedimentos" ON impedimentos
  FOR SELECT USING (
    conselheiro_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Audit logs policies
CREATE POLICY "Admins podem ver logs de auditoria" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 7. CREATE TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON processos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fma_receitas_updated_at
  BEFORE UPDATE ON fma_receitas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fma_projetos_updated_at
  BEFORE UPDATE ON fma_projetos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ouvidoria_denuncias_updated_at
  BEFORE UPDATE ON ouvidoria_denuncias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impedimentos_updated_at
  BEFORE UPDATE ON impedimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. CREATE FUNCTIONS FOR BUSINESS LOGIC

-- Function to generate sequential numbers for documents
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT, year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()))
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  prefix TEXT;
BEGIN
  -- Define prefix based on document type
  CASE doc_type
    WHEN 'processo' THEN prefix := 'PROC';
    WHEN 'resolucao' THEN prefix := 'RES';
    WHEN 'ata' THEN prefix := 'ATA';
    WHEN 'documento' THEN prefix := 'DOC';
    WHEN 'ouvidoria' THEN prefix := 'OUV';
    WHEN 'reuniao' THEN prefix := 'REU';
    ELSE prefix := 'DOC';
  END CASE;

  -- Get next sequential number for the year
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(
        CASE 
          WHEN doc_type = 'processo' THEN numero_processo
          WHEN doc_type = 'ouvidoria' THEN protocolo
          WHEN doc_type = 'reuniao' THEN numero_reuniao
          ELSE numero_documento
        END
        FROM prefix || '\.(\d+)/' || year::TEXT
      ) AS INTEGER
    )
  ), 0) + 1 INTO next_number
  FROM (
    SELECT numero_processo FROM processos WHERE numero_processo LIKE prefix || '.%/' || year::TEXT
    UNION ALL
    SELECT numero_documento FROM documentos WHERE numero_documento LIKE prefix || '.%/' || year::TEXT
    UNION ALL
    SELECT protocolo FROM ouvidoria_denuncias WHERE protocolo LIKE prefix || '.%/' || year::TEXT
    UNION ALL
    SELECT numero_reuniao FROM reunioes WHERE numero_reuniao LIKE prefix || '.%/' || year::TEXT
  ) all_numbers;

  RETURN prefix || '.' || LPAD(next_number::TEXT, 3, '0') || '/' || year::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to check quorum in meetings
CREATE OR REPLACE FUNCTION check_meeting_quorum(meeting_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  present_count INTEGER;
  required_quorum INTEGER;
BEGIN
  -- Count present members
  SELECT COUNT(*) INTO present_count
  FROM presencas 
  WHERE reuniao_id = meeting_id AND presente = true;

  -- Get required quorum from meeting
  SELECT quorum_necessario INTO required_quorum
  FROM reunioes 
  WHERE id = meeting_id;

  RETURN present_count >= COALESCE(required_quorum, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_acao TEXT,
  p_tabela TEXT,
  p_registro_id TEXT,
  p_dados_anteriores JSONB DEFAULT NULL,
  p_dados_novos JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    usuario_id,
    acao,
    tabela,
    registro_id,
    dados_anteriores,
    dados_novos,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_acao,
    p_tabela,
    p_registro_id,
    p_dados_anteriores,
    p_dados_novos,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;