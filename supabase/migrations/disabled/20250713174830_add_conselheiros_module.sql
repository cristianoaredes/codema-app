-- Create table for CODEMA council members
CREATE TABLE conselheiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  
  -- Mandate information
  mandato_inicio DATE NOT NULL,
  mandato_fim DATE NOT NULL,
  mandato_numero INTEGER,
  
  -- Representation
  entidade_representada VARCHAR(255) NOT NULL,
  segmento VARCHAR(50) NOT NULL CHECK (segmento IN ('governo', 'sociedade_civil', 'setor_produtivo')),
  titular BOOLEAN DEFAULT true,
  
  -- Status and control
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'licenciado', 'afastado')),
  faltas_consecutivas INTEGER DEFAULT 0,
  total_faltas INTEGER DEFAULT 0,
  
  -- Metadata
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for impediments
CREATE TABLE impedimentos_conselheiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conselheiro_id UUID REFERENCES conselheiros(id) ON DELETE CASCADE,
  reuniao_id UUID REFERENCES reunioes(id) ON DELETE CASCADE,
  processo_id UUID REFERENCES processos(id),
  
  -- Impediment details
  tipo_impedimento VARCHAR(50) NOT NULL CHECK (tipo_impedimento IN ('interesse_pessoal', 'parentesco', 'interesse_profissional', 'outros')),
  motivo TEXT NOT NULL,
  declarado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indices for performance
CREATE INDEX idx_conselheiros_profile_id ON conselheiros(profile_id);
CREATE INDEX idx_conselheiros_mandato ON conselheiros(mandato_inicio, mandato_fim);
CREATE INDEX idx_conselheiros_status ON conselheiros(status);
CREATE INDEX idx_conselheiros_segmento ON conselheiros(segmento);

CREATE INDEX idx_impedimentos_conselheiro ON impedimentos_conselheiros(conselheiro_id);
CREATE INDEX idx_impedimentos_reuniao ON impedimentos_conselheiros(reuniao_id);
CREATE INDEX idx_impedimentos_processo ON impedimentos_conselheiros(processo_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conselheiros_updated_at BEFORE UPDATE ON conselheiros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();