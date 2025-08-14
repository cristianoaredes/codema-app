-- Correção de bug na função consultar_proximo_protocolo
-- Fix: variável 'proximo_number' estava incorreta, deve ser 'proximo_numero'

CREATE OR REPLACE FUNCTION consultar_proximo_protocolo(tipo_protocolo VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
  ano_atual INTEGER;
  proximo_numero INTEGER;
  numero_formatado TEXT;
BEGIN
  ano_atual := EXTRACT(YEAR FROM now());
  
  -- Buscar último número ou criar entrada se não existir
  SELECT ultimo_numero + 1 INTO proximo_numero  -- FIX: variável corrigida
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

-- Função adicional para obter estatísticas de protocolos
CREATE OR REPLACE FUNCTION obter_estatisticas_protocolos(ano_filtro INTEGER DEFAULT NULL)
RETURNS TABLE(
  tipo VARCHAR(10),
  total_gerados INTEGER,
  ultimo_numero INTEGER,
  ano INTEGER
) AS $$
DECLARE
  ano_alvo INTEGER;
BEGIN
  ano_alvo := COALESCE(ano_filtro, EXTRACT(YEAR FROM now()));
  
  RETURN QUERY
  SELECT 
    ps.tipo,
    ps.ultimo_numero as total_gerados,
    ps.ultimo_numero,
    ps.ano
  FROM protocolos_sequencia ps
  WHERE ps.ano = ano_alvo
  ORDER BY ps.tipo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar formato de protocolo
CREATE OR REPLACE FUNCTION validar_formato_protocolo(numero_protocolo TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se o formato está correto: TIPO-NNN/AAAA
  RETURN numero_protocolo ~ '^[A-Z]+-[0-9]{3}/[0-9]{4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Adicionar comentários às tabelas e funções para documentação
COMMENT ON TABLE protocolos_sequencia IS 'Controle de sequência numérica para diferentes tipos de protocolos do CODEMA';
COMMENT ON FUNCTION gerar_proximo_protocolo(VARCHAR) IS 'Gera o próximo número de protocolo único para o tipo especificado';
COMMENT ON FUNCTION consultar_proximo_protocolo(VARCHAR) IS 'Consulta qual seria o próximo número sem efetivamente gerar';
COMMENT ON FUNCTION obter_estatisticas_protocolos(INTEGER) IS 'Retorna estatísticas de protocolos gerados por tipo e ano';
COMMENT ON FUNCTION validar_formato_protocolo(TEXT) IS 'Valida se um número de protocolo está no formato correto';
