-- Base schema for CODEMA system

-- Profiles table (for auth.users extension)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome_completo VARCHAR(255),
  role VARCHAR(20) DEFAULT 'citizen' CHECK (role IN ('admin', 'presidente', 'secretario', 'conselheiro', 'citizen')),
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reunioes table  
CREATE TABLE IF NOT EXISTS reunioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ordinaria', 'extraordinaria', 'publica')),
  titulo VARCHAR(255) NOT NULL,
  data_reuniao DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  local_reuniao VARCHAR(255) NOT NULL,
  pauta TEXT,
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'finalizada', 'cancelada')),
  quorum_minimo INTEGER DEFAULT 6,
  total_presentes INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conselheiros table
CREATE TABLE IF NOT EXISTS conselheiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  mandato_inicio DATE NOT NULL,
  mandato_fim DATE NOT NULL,
  mandato_numero INTEGER,
  entidade_representada VARCHAR(255) NOT NULL,
  segmento VARCHAR(50) NOT NULL CHECK (segmento IN ('governo', 'sociedade_civil', 'setor_produtivo')),
  titular BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'licenciado', 'afastado')),
  faltas_consecutivas INTEGER DEFAULT 0,
  total_faltas INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Presencas table
CREATE TABLE IF NOT EXISTS presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  conselheiro_id UUID REFERENCES conselheiros(id) ON DELETE CASCADE,
  presente BOOLEAN DEFAULT false,
  horario_chegada TIMESTAMP WITH TIME ZONE,
  horario_saida TIMESTAMP WITH TIME ZONE,
  justificativa_ausencia TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reuniao_id, conselheiro_id)
);

-- Atas table
CREATE TABLE IF NOT EXISTS atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  resumo_decisoes TEXT,
  status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aprovada', 'publicada')),
  redator_id UUID REFERENCES profiles(id),
  data_aprovacao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resolucoes table
CREATE TABLE IF NOT EXISTS resolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  numero_resolucao VARCHAR(20) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  ementa TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fundamentacao_legal TEXT,
  reuniao_origem_id UUID REFERENCES reunioes(id),
  ata_origem_id UUID REFERENCES atas(id),
  data_aprovacao DATE NOT NULL,
  data_publicacao DATE,
  status VARCHAR(20) DEFAULT 'aprovada' CHECK (status IN ('rascunho', 'aprovada', 'publicada', 'revogada')),
  tipo VARCHAR(30) DEFAULT 'resolucao' CHECK (tipo IN ('resolucao', 'deliberacao', 'recomendacao')),
  tags TEXT[],
  autor_id UUID REFERENCES profiles(id),
  aprovador_id UUID REFERENCES profiles(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela VARCHAR(50) NOT NULL,
  operacao VARCHAR(10) NOT NULL,
  registro_id UUID NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projetos FMA table
CREATE TABLE IF NOT EXISTS projetos_fma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  objetivo TEXT,
  proponente VARCHAR(255) NOT NULL,
  valor_solicitado DECIMAL(12,2),
  valor_aprovado DECIMAL(12,2),
  categoria VARCHAR(50),
  status VARCHAR(20) DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'aprovado', 'rejeitado', 'em_execucao', 'finalizado')),
  data_submissao DATE NOT NULL,
  data_aprovacao DATE,
  prazo_execucao DATE,
  parecer_tecnico TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Denuncias table for Ouvidoria
CREATE TABLE IF NOT EXISTS denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  denunciante_nome VARCHAR(255),
  denunciante_email VARCHAR(255),
  denunciante_telefone VARCHAR(20),
  anonima BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'resolvida', 'arquivada')),
  prioridade VARCHAR(10) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  responsavel_id UUID REFERENCES profiles(id),
  data_resolucao DATE,
  resposta TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Protocol sequence table
CREATE TABLE IF NOT EXISTS protocolos_sequencia (
  tipo VARCHAR(10) PRIMARY KEY,
  ano INTEGER NOT NULL,
  ultimo_numero INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tipo, ano)
);

-- Basic RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conselheiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_fma ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos_sequencia ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION has_codema_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_admin_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'presidente')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_role(roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Basic RLS policies
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "reunioes_read" ON reunioes
  FOR SELECT USING (has_codema_access());

CREATE POLICY "reunioes_write_admin_or_secretario" ON reunioes
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario']));

CREATE POLICY "conselheiros_read" ON conselheiros
  FOR SELECT USING (has_codema_access());

CREATE POLICY "conselheiros_write_admin_or_exec" ON conselheiros
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario','presidente']));

CREATE POLICY "presencas_read" ON presencas
  FOR SELECT USING (has_codema_access());

CREATE POLICY "presencas_write_admin_secretario" ON presencas
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario']));

CREATE POLICY "atas_read" ON atas
  FOR SELECT USING (has_codema_access());

CREATE POLICY "atas_write_admin_secretario_presidente" ON atas
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario','presidente']));

CREATE POLICY "resolucoes_read" ON resolucoes
  FOR SELECT USING (has_codema_access());

CREATE POLICY "resolucoes_write_admin_secretario_presidente" ON resolucoes
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario','presidente']));

CREATE POLICY "audit_logs_read_admin_only" ON audit_logs
  FOR SELECT USING (has_admin_access(auth.uid()));

CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "projetos_fma_read" ON projetos_fma
  FOR SELECT USING (has_codema_access());

CREATE POLICY "projetos_fma_write_admin_secretario" ON projetos_fma
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario']));

CREATE POLICY "denuncias_read" ON denuncias
  FOR SELECT USING (has_codema_access());

CREATE POLICY "denuncias_write_admin_secretario" ON denuncias
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario']));

CREATE POLICY "protocolos_sequencia_read" ON protocolos_sequencia
  FOR SELECT USING (has_codema_access());

CREATE POLICY "protocolos_sequencia_write_admin_secretario" ON protocolos_sequencia
  FOR ALL USING (has_admin_access(auth.uid()) OR has_role(ARRAY['admin','secretario']));

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reunioes_updated_at 
  BEFORE UPDATE ON reunioes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conselheiros_updated_at 
  BEFORE UPDATE ON conselheiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presencas_updated_at 
  BEFORE UPDATE ON presencas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atas_updated_at 
  BEFORE UPDATE ON atas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resolucoes_updated_at 
  BEFORE UPDATE ON resolucoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_fma_updated_at 
  BEFORE UPDATE ON projetos_fma
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_denuncias_updated_at 
  BEFORE UPDATE ON denuncias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocolos_sequencia_updated_at 
  BEFORE UPDATE ON protocolos_sequencia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON profiles(ativo);

CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data_reuniao);
CREATE INDEX IF NOT EXISTS idx_reunioes_status ON reunioes(status);
CREATE INDEX IF NOT EXISTS idx_reunioes_tipo ON reunioes(tipo);

CREATE INDEX IF NOT EXISTS idx_conselheiros_profile_id ON conselheiros(profile_id);
CREATE INDEX IF NOT EXISTS idx_conselheiros_mandato ON conselheiros(mandato_inicio, mandato_fim);
CREATE INDEX IF NOT EXISTS idx_conselheiros_status ON conselheiros(status);
CREATE INDEX IF NOT EXISTS idx_conselheiros_segmento ON conselheiros(segmento);

CREATE INDEX IF NOT EXISTS idx_presencas_reuniao ON presencas(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_presencas_conselheiro ON presencas(conselheiro_id);

CREATE INDEX IF NOT EXISTS idx_atas_reuniao ON atas(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_atas_status ON atas(status);

CREATE INDEX IF NOT EXISTS idx_resolucoes_reuniao ON resolucoes(reuniao_origem_id);
CREATE INDEX IF NOT EXISTS idx_resolucoes_status ON resolucoes(status);
CREATE INDEX IF NOT EXISTS idx_resolucoes_data_aprovacao ON resolucoes(data_aprovacao);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON audit_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_projetos_fma_status ON projetos_fma(status);
CREATE INDEX IF NOT EXISTS idx_projetos_fma_data_submissao ON projetos_fma(data_submissao);

CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_created_at ON denuncias(created_at);