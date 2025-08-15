-- Módulo 4: Controle de Resoluções
-- Sistema completo para criação, votação e gestão de resoluções do CODEMA

-- Tabela para templates de resoluções
CREATE TABLE resolucoes_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'normativa', 'deliberativa', 'administrativa'
  conteudo_template TEXT NOT NULL, -- Template em formato JSON/HTML
  campos_obrigatorios JSONB NOT NULL DEFAULT '[]',
  base_legal TEXT, -- Referência legal padrão
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela principal de resoluções
CREATE TABLE resolucoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE, -- RES-001/2024
  template_id UUID REFERENCES resolucoes_templates(id),
  reuniao_id UUID REFERENCES reunioes(id), -- Reunião onde foi discutida
  ata_id UUID REFERENCES atas(id), -- Ata que registra a aprovação
  
  -- Identificação
  titulo VARCHAR(500) NOT NULL,
  ementa TEXT NOT NULL, -- Resumo do que dispõe
  tipo VARCHAR(50) NOT NULL, -- 'normativa', 'deliberativa', 'administrativa'
  
  -- Conteúdo
  considerandos JSONB NOT NULL DEFAULT '[]', -- Lista de "considerando que..."
  artigos JSONB NOT NULL DEFAULT '[]', -- Artigos da resolução
  disposicoes_finais TEXT, -- Disposições transitórias e finais
  
  -- Referencias legais
  base_legal TEXT NOT NULL, -- Lei que fundamenta
  referencias_legais JSONB DEFAULT '[]', -- Outras leis/normas citadas
  
  -- Controle de fluxo
  status VARCHAR(50) DEFAULT 'minuta', -- 'minuta', 'em_votacao', 'aprovada', 'rejeitada', 'publicada', 'revogada'
  data_discussao DATE, -- Data da discussão
  data_votacao DATE, -- Data da votação
  data_aprovacao DATE, -- Data da aprovação
  data_publicacao DATE, -- Data da publicação
  data_vigencia DATE, -- Data de início da vigência
  data_revogacao DATE, -- Data da revogação (se aplicável)
  
  -- Votação
  total_conselheiros INTEGER DEFAULT 0,
  votos_favor INTEGER DEFAULT 0,
  votos_contra INTEGER DEFAULT 0,
  abstencoes INTEGER DEFAULT 0,
  quorum_presente INTEGER DEFAULT 0,
  resultado_votacao VARCHAR(50), -- 'aprovada', 'rejeitada', 'empate'
  
  -- Assinaturas
  assinatura_presidente UUID REFERENCES auth.users(id),
  assinatura_secretario UUID REFERENCES auth.users(id),
  data_assinatura_presidente TIMESTAMP WITH TIME ZONE,
  data_assinatura_secretario TIMESTAMP WITH TIME ZONE,
  
  -- Revogação
  revogada_por UUID REFERENCES resolucoes(id), -- ID da resolução que revoga esta
  motivo_revogacao TEXT,
  
  -- Arquivos
  pdf_gerado BOOLEAN DEFAULT false,
  pdf_url TEXT,
  hash_integridade VARCHAR(255),
  
  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para votação nominal
CREATE TABLE resolucoes_votos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id) ON DELETE CASCADE,
  conselheiro_id UUID REFERENCES conselheiros(id) NOT NULL,
  
  -- Dados do voto
  voto VARCHAR(20) NOT NULL, -- 'favor', 'contra', 'abstencao', 'ausente'
  justificativa TEXT, -- Justificativa do voto (opcional)
  impedimento BOOLEAN DEFAULT false, -- Se declarou impedimento
  motivo_impedimento TEXT,
  
  -- Metadados
  data_voto TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET, -- Para auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para acompanhar tramitação
CREATE TABLE resolucoes_tramitacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id) ON DELETE CASCADE,
  
  -- Tramitação
  etapa VARCHAR(100) NOT NULL, -- 'minuta_criada', 'discussao_agendada', 'votacao_iniciada', 'aprovada', 'publicada'
  descricao TEXT NOT NULL,
  observacoes TEXT,
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Dados temporais
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  prazo_estimado INTEGER, -- Dias estimados para conclusão
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para controle de publicação
CREATE TABLE resolucoes_publicacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resolucao_id UUID REFERENCES resolucoes(id) ON DELETE CASCADE,
  
  -- Dados de publicação
  veiculo_publicacao VARCHAR(100) NOT NULL, -- 'portal_oficial', 'diario_oficial', 'jornal_local'
  data_publicacao DATE NOT NULL,
  pagina VARCHAR(20), -- Página do diário oficial
  edicao VARCHAR(50), -- Edição do jornal
  url_publicacao TEXT,
  
  -- Metadados
  publicado_por UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para controle de revogações
CREATE TABLE resolucoes_revogacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resolucao_original_id UUID REFERENCES resolucoes(id) NOT NULL,
  resolucao_revogadora_id UUID REFERENCES resolucoes(id) NOT NULL,
  
  -- Dados da revogação
  tipo_revogacao VARCHAR(50) NOT NULL, -- 'total', 'parcial'
  artigos_revogados JSONB, -- Se revogação parcial
  motivo TEXT NOT NULL,
  data_revogacao DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  
  UNIQUE(resolucao_original_id, resolucao_revogadora_id)
);

-- Índices para performance
CREATE INDEX idx_resolucoes_numero ON resolucoes(numero);
CREATE INDEX idx_resolucoes_status ON resolucoes(status);
CREATE INDEX idx_resolucoes_tipo ON resolucoes(tipo);
CREATE INDEX idx_resolucoes_data_publicacao ON resolucoes(data_publicacao);
CREATE INDEX idx_resolucoes_vigencia ON resolucoes(data_vigencia);
CREATE INDEX idx_resolucoes_votos_resolucao ON resolucoes_votos(resolucao_id);
CREATE INDEX idx_resolucoes_votos_conselheiro ON resolucoes_votos(conselheiro_id);
CREATE INDEX idx_resolucoes_tramitacao_resolucao ON resolucoes_tramitacao(resolucao_id);
CREATE INDEX idx_resolucoes_publicacao_resolucao ON resolucoes_publicacao(resolucao_id);

-- Triggers para auditoria
CREATE TRIGGER audit_resolucoes_templates 
  AFTER INSERT OR UPDATE OR DELETE ON resolucoes_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_resolucoes 
  AFTER INSERT OR UPDATE OR DELETE ON resolucoes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_resolucoes_votos 
  AFTER INSERT OR UPDATE OR DELETE ON resolucoes_votos
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_resolucoes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resolucoes_timestamp 
  BEFORE UPDATE ON resolucoes
  FOR EACH ROW EXECUTE FUNCTION update_resolucoes_timestamp();

-- Trigger para criar tramitação automática
CREATE OR REPLACE FUNCTION create_resolucao_tramitacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir tramitação inicial para nova resolução
  IF TG_OP = 'INSERT' THEN
    INSERT INTO resolucoes_tramitacao (resolucao_id, etapa, descricao, usuario_id)
    VALUES (
      NEW.id,
      'minuta_criada',
      'Minuta de resolução criada',
      NEW.created_by
    );
  END IF;
  
  -- Inserir tramitação para mudanças de status
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO resolucoes_tramitacao (resolucao_id, etapa, descricao, usuario_id)
    VALUES (
      NEW.id,
      CASE NEW.status
        WHEN 'em_votacao' THEN 'votacao_iniciada'
        WHEN 'aprovada' THEN 'resolucao_aprovada'
        WHEN 'rejeitada' THEN 'resolucao_rejeitada'
        WHEN 'publicada' THEN 'resolucao_publicada'
        WHEN 'revogada' THEN 'resolucao_revogada'
        ELSE 'status_alterado'
      END,
      'Status alterado para: ' || NEW.status,
      COALESCE(NEW.updated_by, NEW.created_by)
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_resolucao_tramitacao_trigger 
  AFTER INSERT OR UPDATE ON resolucoes
  FOR EACH ROW EXECUTE FUNCTION create_resolucao_tramitacao();

-- Function para gerar próximo número de resolução
CREATE OR REPLACE FUNCTION gerar_proximo_numero_resolucao()
RETURNS TEXT AS $$
DECLARE
  ano INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  proximo_numero INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 2) AS INTEGER)), 0) + 1
  INTO proximo_numero
  FROM resolucoes
  WHERE numero LIKE 'RES-%/' || ano::TEXT;
  
  RETURN 'RES-' || LPAD(proximo_numero::TEXT, 3, '0') || '/' || ano::TEXT;
END;
$$ language 'plpgsql';

-- Function para calcular resultado da votação
CREATE OR REPLACE FUNCTION calcular_resultado_votacao(resolucao_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  total_votos INTEGER;
  votos_favor INTEGER;
  votos_contra INTEGER;
  quorum_minimo INTEGER;
  resultado TEXT;
BEGIN
  -- Contar votos
  SELECT 
    COUNT(*) FILTER (WHERE voto IN ('favor', 'contra', 'abstencao')),
    COUNT(*) FILTER (WHERE voto = 'favor'),
    COUNT(*) FILTER (WHERE voto = 'contra')
  INTO total_votos, votos_favor, votos_contra
  FROM resolucoes_votos 
  WHERE resolucao_id = resolucao_uuid;
  
  -- Calcular quorum mínimo (maioria simples)
  SELECT COUNT(*) / 2 + 1 INTO quorum_minimo FROM conselheiros WHERE ativo = true;
  
  -- Determinar resultado
  IF total_votos < quorum_minimo THEN
    resultado := 'sem_quorum';
  ELSIF votos_favor > votos_contra THEN
    resultado := 'aprovada';
  ELSIF votos_contra > votos_favor THEN
    resultado := 'rejeitada';
  ELSE
    resultado := 'empate';
  END IF;
  
  -- Atualizar resolução
  UPDATE resolucoes SET
    total_conselheiros = (SELECT COUNT(*) FROM conselheiros WHERE ativo = true),
    votos_favor = calcular_resultado_votacao.votos_favor,
    votos_contra = calcular_resultado_votacao.votos_contra,
    abstencoes = total_votos - votos_favor - votos_contra,
    quorum_presente = total_votos,
    resultado_votacao = resultado,
    status = CASE 
      WHEN resultado = 'aprovada' THEN 'aprovada'
      WHEN resultado = 'rejeitada' THEN 'rejeitada'
      ELSE status
    END,
    data_votacao = CASE WHEN status = 'em_votacao' THEN CURRENT_DATE ELSE data_votacao END,
    data_aprovacao = CASE WHEN resultado = 'aprovada' THEN CURRENT_DATE ELSE data_aprovacao END
  WHERE id = resolucao_uuid;
  
  RETURN resultado;
END;
$$ language 'plpgsql';

-- RLS Policies
ALTER TABLE resolucoes_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolucoes_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolucoes_tramitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolucoes_publicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolucoes_revogacoes ENABLE ROW LEVEL SECURITY;

-- Templates: Admin e secretários podem gerenciar, outros podem visualizar
CREATE POLICY "Templates resoluções visíveis para autenticados" ON resolucoes_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Templates resoluções editáveis por admin/secretário" ON resolucoes_templates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario')
    )
  );

-- Resoluções: Públicas para leitura, editáveis por roles específicos
CREATE POLICY "Resoluções visíveis para todos" ON resolucoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Resoluções editáveis por secretário/presidente" ON resolucoes
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Votos: Conselheiros podem votar, todos podem ver resultados
CREATE POLICY "Votos por conselheiros" ON resolucoes_votos
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN conselheiros c ON c.user_id = p.id
      WHERE p.id = auth.uid()
      AND c.ativo = true
      AND conselheiro_id = c.id
    )
  );

CREATE POLICY "Ver votos de resoluções públicas" ON resolucoes_votos
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM resolucoes r
      WHERE r.id = resolucao_id
      AND r.status IN ('aprovada', 'rejeitada', 'publicada')
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Tramitação: Visível para todos autenticados
CREATE POLICY "Tramitação visível para autenticados" ON resolucoes_tramitacao
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tramitação editável por admin/secretário" ON resolucoes_tramitacao
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Publicação: Visível para todos, editável por admin/secretário
CREATE POLICY "Publicação visível para todos" ON resolucoes_publicacao
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Publicação editável por admin/secretário" ON resolucoes_publicacao
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario')
    )
  );

-- Revogações: Visível para todos, editável por admin/secretário
CREATE POLICY "Revogações visíveis para todos" ON resolucoes_revogacoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Revogações editáveis por admin/secretário" ON resolucoes_revogacoes
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Inserir templates padrão
INSERT INTO resolucoes_templates (nome, tipo, conteudo_template, campos_obrigatorios, base_legal, created_by) VALUES
(
  'Resolução Normativa',
  'normativa',
  '{"estrutura": ["cabecalho", "considerandos", "resolve", "artigos", "disposicoes_finais"], "secoes_obrigatorias": ["ementa", "base_legal", "artigos"]}',
  '["titulo", "ementa", "base_legal", "considerandos", "artigos"]',
  'Lei Federal nº 6.938/81 e Lei Municipal de criação do CODEMA',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Resolução Deliberativa',
  'deliberativa',
  '{"estrutura": ["cabecalho", "considerandos", "delibera", "artigos", "disposicoes_finais"], "secoes_obrigatorias": ["ementa", "base_legal", "deliberacao"]}',
  '["titulo", "ementa", "base_legal", "considerandos", "artigos"]',
  'Lei Federal nº 6.938/81 e Lei Municipal de criação do CODEMA',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Resolução Administrativa',
  'administrativa',
  '{"estrutura": ["cabecalho", "considerandos", "resolve", "artigos"], "secoes_obrigatorias": ["ementa", "base_legal"]}',
  '["titulo", "ementa", "base_legal", "artigos"]',
  'Lei Municipal de criação do CODEMA e Regimento Interno',
  (SELECT id FROM auth.users LIMIT 1)
);

-- Comentários nas tabelas
COMMENT ON TABLE resolucoes_templates IS 'Templates padrão para criação de resoluções conforme legislação';
COMMENT ON TABLE resolucoes IS 'Resoluções do CODEMA com controle completo de fluxo';
COMMENT ON TABLE resolucoes_votos IS 'Registro de votação nominal de resoluções';
COMMENT ON TABLE resolucoes_tramitacao IS 'Histórico de tramitação das resoluções';
COMMENT ON TABLE resolucoes_publicacao IS 'Controle de publicação oficial das resoluções';
COMMENT ON TABLE resolucoes_revogacoes IS 'Controle de revogações de resoluções';