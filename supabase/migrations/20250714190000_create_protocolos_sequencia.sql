-- Criar tabela para controle de sequência de protocolos
CREATE TABLE protocolos_sequencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(10) NOT NULL,
  ano INTEGER NOT NULL,
  ultimo_numero INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Garantir unicidade por tipo e ano
  UNIQUE(tipo, ano)
);

-- Criar índices para performance
CREATE INDEX idx_protocolos_sequencia_tipo_ano ON protocolos_sequencia(tipo, ano);
CREATE INDEX idx_protocolos_sequencia_tipo ON protocolos_sequencia(tipo);

-- Habilitar RLS
ALTER TABLE protocolos_sequencia ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas usuários autenticados podem acessar
CREATE POLICY "Usuários autenticados podem visualizar protocolos"
ON protocolos_sequencia FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Apenas admins, secretários e presidente podem inserir/atualizar
CREATE POLICY "Admins podem gerenciar protocolos"
ON protocolos_sequencia FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'secretario', 'presidente')
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_protocolos_sequencia_updated_at
  BEFORE UPDATE ON protocolos_sequencia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar próximo número de protocolo
CREATE OR REPLACE FUNCTION gerar_proximo_protocolo(tipo_protocolo VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
  ano_atual INTEGER;
  proximo_numero INTEGER;
  numero_formatado TEXT;
BEGIN
  ano_atual := EXTRACT(YEAR FROM now());
  
  -- Inserir ou atualizar sequência
  INSERT INTO protocolos_sequencia (tipo, ano, ultimo_numero)
  VALUES (tipo_protocolo, ano_atual, 1)
  ON CONFLICT (tipo, ano)
  DO UPDATE SET 
    ultimo_numero = protocolos_sequencia.ultimo_numero + 1,
    updated_at = now()
  RETURNING ultimo_numero INTO proximo_numero;
  
  -- Formatar número com zeros à esquerda
  numero_formatado := tipo_protocolo || '-' || LPAD(proximo_numero::TEXT, 3, '0') || '/' || ano_atual;
  
  RETURN numero_formatado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir tipos de protocolo padrão para o ano atual
INSERT INTO protocolos_sequencia (tipo, ano, ultimo_numero) VALUES
('PROC', EXTRACT(YEAR FROM now()), 0),
('RES', EXTRACT(YEAR FROM now()), 0),
('OUV', EXTRACT(YEAR FROM now()), 0),
('REU', EXTRACT(YEAR FROM now()), 0),
('ATA', EXTRACT(YEAR FROM now()), 0),
('CONV', EXTRACT(YEAR FROM now()), 0),
('DOC', EXTRACT(YEAR FROM now()), 0),
('PROJ', EXTRACT(YEAR FROM now()), 0),
('REL', EXTRACT(YEAR FROM now()), 0),
('NOT', EXTRACT(YEAR FROM now()), 0)
ON CONFLICT (tipo, ano) DO NOTHING;

-- Função para consultar próximo número sem gerar
CREATE OR REPLACE FUNCTION consultar_proximo_protocolo(tipo_protocolo VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
  ano_atual INTEGER;
  proximo_numero INTEGER;
  numero_formatado TEXT;
BEGIN
  ano_atual := EXTRACT(YEAR FROM now());
  
  -- Buscar último número ou criar entrada se não existir
  SELECT ultimo_numero + 1 INTO proximo_number
  FROM protocolos_sequencia
  WHERE tipo = tipo_protocolo AND ano = ano_atual;
  
  -- Se não encontrou, será o primeiro número
  IF proximo_numero IS NULL THEN
    proximo_numero := 1;
  END IF;
  
  -- Formatar número com zeros à esquerda
  numero_formatado := tipo_protocolo || '-' || LPAD(proximo_numero::TEXT, 3, '0') || '/' || ano_atual;
  
  RETURN numero_formatado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para resetar sequência de um tipo (útil para início de ano)
CREATE OR REPLACE FUNCTION resetar_sequencia_protocolo(tipo_protocolo VARCHAR(10), novo_ano INTEGER DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  ano_alvo INTEGER;
BEGIN
  ano_alvo := COALESCE(novo_ano, EXTRACT(YEAR FROM now()));
  
  INSERT INTO protocolos_sequencia (tipo, ano, ultimo_numero)
  VALUES (tipo_protocolo, ano_alvo, 0)
  ON CONFLICT (tipo, ano)
  DO UPDATE SET 
    ultimo_numero = 0,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de protocolos por tipo
CREATE OR REPLACE FUNCTION obter_estatisticas_protocolos(ano_filtro INTEGER DEFAULT NULL)
RETURNS TABLE(
  tipo VARCHAR(10),
  ano INTEGER,
  total_gerados INTEGER,
  ultimo_numero INTEGER,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  ano_alvo INTEGER;
BEGIN
  ano_alvo := COALESCE(ano_filtro, EXTRACT(YEAR FROM now()));
  
  RETURN QUERY
  SELECT 
    ps.tipo,
    ps.ano,
    ps.ultimo_numero as total_gerados,
    ps.ultimo_numero,
    ps.updated_at as ultima_atualizacao
  FROM protocolos_sequencia ps
  WHERE ps.ano = ano_alvo
  ORDER BY ps.tipo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;