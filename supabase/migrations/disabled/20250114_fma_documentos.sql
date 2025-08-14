-- Criar tabela para documentos do FMA
CREATE TABLE IF NOT EXISTS fma_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES fma_projetos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN (
    'proposta', 'contrato', 'nota_fiscal', 'recibo', 'relatorio',
    'comprovante', 'licenca', 'parecer', 'ata', 'outros'
  )),
  tipo_arquivo TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  hash_arquivo TEXT,
  versao INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'excluido')),
  confidencial BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  validated_by UUID REFERENCES auth.users(id),
  validation_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_fma_documentos_projeto ON fma_documentos(projeto_id);
CREATE INDEX idx_fma_documentos_categoria ON fma_documentos(categoria);
CREATE INDEX idx_fma_documentos_status ON fma_documentos(status);
CREATE INDEX idx_fma_documentos_uploaded_by ON fma_documentos(uploaded_by);
CREATE INDEX idx_fma_documentos_created_at ON fma_documentos(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE fma_documentos ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem visualizar documentos não confidenciais
CREATE POLICY "Documentos públicos visíveis"
  ON fma_documentos FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    (confidencial = FALSE OR uploaded_by = auth.uid() OR validated_by = auth.uid())
  );

-- Política: Apenas admin e secretário podem inserir documentos
CREATE POLICY "Admin e secretário podem inserir documentos"
  ON fma_documentos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

-- Política: Apenas admin e quem fez upload pode atualizar
CREATE POLICY "Admin e uploader podem atualizar documentos"
  ON fma_documentos FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    (uploaded_by = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'secretario')
    ))
  );

-- Política: Apenas admin pode deletar
CREATE POLICY "Apenas admin pode deletar documentos"
  ON fma_documentos FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_fma_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_fma_documentos_updated_at
  BEFORE UPDATE ON fma_documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_fma_documentos_updated_at();

-- Criar bucket no Storage para documentos do FMA
INSERT INTO storage.buckets (id, name, public)
VALUES ('fma-documentos', 'fma-documentos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Documentos FMA visíveis publicamente"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fma-documentos');

CREATE POLICY "Admin e secretário podem fazer upload de documentos FMA"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fma-documentos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'secretario', 'presidente')
    )
  );

CREATE POLICY "Admin pode atualizar documentos FMA"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'fma-documentos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'secretario')
    )
  );

CREATE POLICY "Admin pode deletar documentos FMA"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fma-documentos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Comentário na tabela
COMMENT ON TABLE fma_documentos IS 'Tabela para armazenar documentos e anexos dos projetos do FMA';
COMMENT ON COLUMN fma_documentos.categoria IS 'Categoria do documento (proposta, contrato, nota_fiscal, etc.)';
COMMENT ON COLUMN fma_documentos.confidencial IS 'Indica se o documento é confidencial';
COMMENT ON COLUMN fma_documentos.validated_by IS 'Usuário que validou o documento';
COMMENT ON COLUMN fma_documentos.validation_date IS 'Data de validação do documento';