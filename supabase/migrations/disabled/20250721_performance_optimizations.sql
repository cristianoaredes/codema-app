-- Otimizações de performance para o banco CODEMA
-- Adiciona índices compostos e melhorias de consulta

-- Índices compostos para audit_logs (consultas frequentes por usuário + data)
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario_timestamp 
ON audit_logs(usuario_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela_timestamp 
ON audit_logs(tabela, timestamp DESC);

-- Índices para documentos (consultas por tipo + status)
CREATE INDEX IF NOT EXISTS idx_documentos_tipo_status 
ON documentos(tipo, status);

CREATE INDEX IF NOT EXISTS idx_documentos_autor_created 
ON documentos(autor_id, created_at DESC);

-- Índices para email_queue (processamento de fila)
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled 
ON email_queue(status, scheduled_for) 
WHERE status IN ('pending', 'failed');

-- Índices para reunioes (consultas por data e status)
CREATE INDEX IF NOT EXISTS idx_reunioes_data_status 
ON reunioes(data_reuniao DESC, status);

CREATE INDEX IF NOT EXISTS idx_reunioes_tipo_data 
ON reunioes(tipo, data_reuniao DESC);

-- Índices para resolucoes (consultas por status e tipo)
CREATE INDEX IF NOT EXISTS idx_resolucoes_status_created 
ON resolucoes(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resolucoes_tipo_numero 
ON resolucoes(tipo, numero);

-- Índices para conselheiros (consultas por segmento e status)
CREATE INDEX IF NOT EXISTS idx_conselheiros_segmento_status 
ON conselheiros(segmento, status);

CREATE INDEX IF NOT EXISTS idx_conselheiros_cargo_status 
ON conselheiros(cargo, status);

-- View materializada para estatísticas do dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  'reports' as tipo,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'open') as abertos,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolvidos,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as mes_atual
FROM reports
UNION ALL
SELECT 
  'reunioes' as tipo,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'agendada') as abertos,
  COUNT(*) FILTER (WHERE status = 'concluida') as resolvidos,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as mes_atual
FROM reunioes
UNION ALL
SELECT 
  'resolucoes' as tipo,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status IN ('rascunho', 'em_votacao')) as abertos,
  COUNT(*) FILTER (WHERE status = 'aprovada') as resolvidos,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as mes_atual
FROM resolucoes;

-- Índice na view materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_tipo ON dashboard_stats(tipo);

-- Função para refresh automático da view materializada
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para refresh automático (executar a cada hora)
-- Nota: Isso seria melhor implementado via cron job no Supabase
COMMENT ON FUNCTION refresh_dashboard_stats() IS 'Atualiza estatísticas do dashboard - executar via cron job a cada hora';

-- Política RLS para a view materializada
ALTER MATERIALIZED VIEW dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver estatísticas"
ON dashboard_stats FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Função para limpeza automática de logs antigos (manter apenas 1 ano)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < CURRENT_DATE - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Remove logs de auditoria com mais de 1 ano - executar mensalmente via cron';

-- Função para limpeza de emails processados antigos (manter apenas 3 meses)
CREATE OR REPLACE FUNCTION cleanup_old_emails()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_queue 
  WHERE status IN ('sent', 'failed') 
  AND created_at < CURRENT_DATE - INTERVAL '3 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_emails() IS 'Remove emails processados com mais de 3 meses - executar mensalmente via cron';
