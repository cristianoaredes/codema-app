-- Melhorias de segurança e políticas RLS para o projeto CODEMA
-- Adiciona políticas mais granulares e funções de segurança

-- Função helper para verificar se usuário é admin ou tem role específico
CREATE OR REPLACE FUNCTION is_admin_or_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = ANY(required_roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pode acessar módulo CODEMA
CREATE OR REPLACE FUNCTION has_codema_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política mais granular para documentos
DROP POLICY IF EXISTS "Usuários podem gerenciar documentos" ON documentos;

CREATE POLICY "Usuários podem visualizar documentos públicos"
ON documentos FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  (status = 'publicado' OR autor_id = auth.uid() OR has_codema_access())
);

CREATE POLICY "Autores podem gerenciar seus documentos"
ON documentos FOR ALL
USING (autor_id = auth.uid());

CREATE POLICY "Admins e secretários podem gerenciar todos documentos"
ON documentos FOR ALL
USING (is_admin_or_role(ARRAY['secretario']));

-- Políticas melhoradas para reunioes
DROP POLICY IF EXISTS "Usuários CODEMA podem gerenciar reuniões" ON reunioes;

CREATE POLICY "Usuários podem visualizar reuniões"
ON reunioes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas admins e secretários podem criar reuniões"
ON reunioes FOR INSERT
WITH CHECK (is_admin_or_role(ARRAY['secretario', 'presidente']));

CREATE POLICY "Apenas admins e secretários podem atualizar reuniões"
ON reunioes FOR UPDATE
USING (is_admin_or_role(ARRAY['secretario', 'presidente']));

-- Políticas para resolucoes com controle de votação
DROP POLICY IF EXISTS "Usuários CODEMA podem gerenciar resoluções" ON resolucoes;

CREATE POLICY "Usuários podem visualizar resoluções públicas"
ON resolucoes FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  (status IN ('aprovada', 'publicada') OR has_codema_access())
);

CREATE POLICY "Conselheiros podem criar resoluções"
ON resolucoes FOR INSERT
WITH CHECK (has_codema_access());

CREATE POLICY "Apenas presidente e secretário podem aprovar resoluções"
ON resolucoes FOR UPDATE
USING (
  has_codema_access() AND
  (is_admin_or_role(ARRAY['presidente', 'secretario']) OR 
   (status NOT IN ('aprovada', 'publicada') AND auth.uid() IN (
     SELECT autor_id FROM resolucoes WHERE id = resolucoes.id
   )))
);

-- Política de auditoria mais restritiva
DROP POLICY IF EXISTS "Usuários podem visualizar logs de auditoria" ON audit_logs;

CREATE POLICY "Apenas admins podem visualizar todos os logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Usuários podem ver seus próprios logs"
ON audit_logs FOR SELECT
USING (usuario_id = auth.uid());

-- Função para log de auditoria automático
CREATE OR REPLACE FUNCTION log_audit_action(
  p_tabela TEXT,
  p_acao TEXT,
  p_registro_id TEXT,
  p_dados_anteriores JSONB DEFAULT NULL,
  p_dados_novos JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    tabela,
    acao,
    registro_id,
    usuario_id,
    dados_anteriores,
    dados_novos,
    ip_address,
    user_agent
  ) VALUES (
    p_tabela,
    p_acao,
    p_registro_id,
    auth.uid(),
    p_dados_anteriores,
    p_dados_novos,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de auditoria automática para tabelas críticas
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM log_audit_action(TG_TABLE_NAME, 'DELETE', OLD.id::TEXT, row_to_json(OLD)::jsonb, NULL);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit_action(TG_TABLE_NAME, 'UPDATE', NEW.id::TEXT, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM log_audit_action(TG_TABLE_NAME, 'INSERT', NEW.id::TEXT, NULL, row_to_json(NEW)::jsonb);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoria nas tabelas principais
DROP TRIGGER IF EXISTS audit_resolucoes ON resolucoes;
CREATE TRIGGER audit_resolucoes
  AFTER INSERT OR UPDATE OR DELETE ON resolucoes
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

DROP TRIGGER IF EXISTS audit_reunioes ON reunioes;
CREATE TRIGGER audit_reunioes
  AFTER INSERT OR UPDATE OR DELETE ON reunioes
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

DROP TRIGGER IF EXISTS audit_conselheiros ON conselheiros;
CREATE TRIGGER audit_conselheiros
  AFTER INSERT OR UPDATE OR DELETE ON conselheiros
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Função para verificar integridade de dados
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(
  tabela TEXT,
  problema TEXT,
  count BIGINT
) AS $$
BEGIN
  -- Verificar reuniões sem atas após 30 dias
  RETURN QUERY
  SELECT 
    'reunioes'::TEXT,
    'Reuniões concluídas sem ata há mais de 30 dias'::TEXT,
    COUNT(*)
  FROM reunioes r
  WHERE r.status = 'concluida' 
    AND r.data_reuniao < CURRENT_DATE - INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM atas a WHERE a.reuniao_id = r.id
    );

  -- Verificar resoluções aprovadas não publicadas há mais de 15 dias
  RETURN QUERY
  SELECT 
    'resolucoes'::TEXT,
    'Resoluções aprovadas não publicadas há mais de 15 dias'::TEXT,
    COUNT(*)
  FROM resolucoes
  WHERE status = 'aprovada' 
    AND updated_at < CURRENT_DATE - INTERVAL '15 days';

  -- Verificar emails pendentes há mais de 24 horas
  RETURN QUERY
  SELECT 
    'email_queue'::TEXT,
    'Emails pendentes há mais de 24 horas'::TEXT,
    COUNT(*)
  FROM email_queue
  WHERE status = 'pending' 
    AND scheduled_for < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_data_integrity() IS 'Verifica integridade e consistência dos dados - executar diariamente';
