-- ================================================
-- MIGRAÇÃO: Sistema Mobile API para Conselheiros
-- Data: 2025-08-13
-- Descrição: Implementa infraestrutura completa para API mobile
-- ================================================

-- Criar tabela para tokens de autenticação QR
CREATE TABLE IF NOT EXISTS mobile_auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    device_info JSONB NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE mobile_auth_tokens IS 'Tokens temporários para autenticação QR Code mobile';
COMMENT ON COLUMN mobile_auth_tokens.token IS 'Token único gerado para o QR Code';
COMMENT ON COLUMN mobile_auth_tokens.device_info IS 'Informações do dispositivo em formato JSON';
COMMENT ON COLUMN mobile_auth_tokens.expires_at IS 'Data/hora de expiração do token (5 minutos)';
COMMENT ON COLUMN mobile_auth_tokens.used IS 'Flag indicando se o token já foi utilizado';

-- Criar tabela para sessões mobile
CREATE TABLE IF NOT EXISTS mobile_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    device_info JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address INET,
    user_agent TEXT
);

-- Comentários para documentação
COMMENT ON TABLE mobile_sessions IS 'Sessões ativas de dispositivos mobile';
COMMENT ON COLUMN mobile_sessions.session_token IS 'Token único da sessão mobile';
COMMENT ON COLUMN mobile_sessions.device_info IS 'Informações detalhadas do dispositivo';
COMMENT ON COLUMN mobile_sessions.last_activity IS 'Última atividade registrada na sessão';

-- Criar tabela para subscriptions de push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    device_info JSONB DEFAULT '{}',
    
    -- Evitar subscriptions duplicadas por usuário/endpoint
    UNIQUE(user_id, endpoint)
);

-- Comentários para documentação
COMMENT ON TABLE push_subscriptions IS 'Subscriptions para notificações push';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Endpoint do service worker para push notifications';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Chave pública P256DH para criptografia';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Chave de autenticação para push notifications';

-- Criar tabela para preferências de notificação
CREATE TABLE IF NOT EXISTS push_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB NOT NULL DEFAULT '{
        "enabled": true,
        "categories": {
            "meeting": true,
            "voting": true,
            "document": true,
            "system": true,
            "reminder": true
        },
        "quiet_hours": {
            "enabled": false,
            "start": "22:00",
            "end": "08:00"
        },
        "frequency": "immediate"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE push_preferences IS 'Preferências de notificação push por usuário';
COMMENT ON COLUMN push_preferences.preferences IS 'Configurações de notificação em formato JSON';

-- Criar tabela para logs de permissões de notificação
CREATE TABLE IF NOT EXISTS push_permission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    permission_status TEXT NOT NULL CHECK (permission_status IN ('granted', 'denied', 'default')),
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE push_permission_logs IS 'Log de eventos de permissão para notificações';
COMMENT ON COLUMN push_permission_logs.permission_status IS 'Status da permissão concedida pelo usuário';

-- Criar tabela para notificações enviadas
CREATE TABLE IF NOT EXISTS push_notifications_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT,
    category TEXT CHECK (category IN ('meeting', 'voting', 'document', 'system', 'reminder')),
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    data JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered BOOLEAN DEFAULT NULL,
    clicked BOOLEAN DEFAULT FALSE,
    dismissed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Comentários para documentação
COMMENT ON TABLE push_notifications_sent IS 'Histórico de notificações push enviadas';
COMMENT ON COLUMN push_notifications_sent.delivered IS 'NULL = pendente, TRUE = entregue, FALSE = falhou';
COMMENT ON COLUMN push_notifications_sent.clicked IS 'Flag indicando se o usuário clicou na notificação';

-- Criar tabela para configurações mobile dos usuários
CREATE TABLE IF NOT EXISTS mobile_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB NOT NULL DEFAULT '{
        "theme": "system",
        "language": "pt-BR",
        "auto_checkin": false,
        "location_services": false,
        "offline_mode": true,
        "data_sync": "wifi_only"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE mobile_preferences IS 'Preferências gerais do aplicativo mobile por usuário';
COMMENT ON COLUMN mobile_preferences.preferences IS 'Configurações do app mobile em formato JSON';

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_mobile_auth_tokens_token ON mobile_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_mobile_auth_tokens_user_id ON mobile_auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_auth_tokens_expires_at ON mobile_auth_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_mobile_sessions_user_id ON mobile_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_session_token ON mobile_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_active ON mobile_sessions(active);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_expires_at ON mobile_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);

CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_user_id ON push_notifications_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_category ON push_notifications_sent(category);
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_sent_at ON push_notifications_sent(sent_at);

-- Criar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mobile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_updated_at();

CREATE TRIGGER trigger_push_preferences_updated_at
    BEFORE UPDATE ON push_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_updated_at();

CREATE TRIGGER trigger_mobile_preferences_updated_at
    BEFORE UPDATE ON mobile_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_updated_at();

-- Configurar RLS (Row Level Security)
ALTER TABLE mobile_auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mobile_auth_tokens
CREATE POLICY "Usuários podem gerenciar seus próprios tokens QR" ON mobile_auth_tokens
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Políticas RLS para mobile_sessions
CREATE POLICY "Usuários podem ver suas próprias sessões" ON mobile_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode gerenciar sessões" ON mobile_sessions
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'sistema')
        )
    );

-- Políticas RLS para push_subscriptions
CREATE POLICY "Usuários podem gerenciar suas próprias subscriptions" ON push_subscriptions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Políticas RLS para push_preferences
CREATE POLICY "Usuários podem gerenciar suas próprias preferências push" ON push_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Políticas RLS para push_notifications_sent
CREATE POLICY "Usuários podem ver suas próprias notificações" ON push_notifications_sent
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir notificações" ON push_notifications_sent
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'sistema', 'presidente', 'secretario')
        )
    );

-- Políticas RLS para mobile_preferences
CREATE POLICY "Usuários podem gerenciar suas próprias preferências mobile" ON mobile_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Função para limpar tokens QR expirados
CREATE OR REPLACE FUNCTION cleanup_expired_qr_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM mobile_auth_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar sessões mobile inativas
CREATE OR REPLACE FUNCTION cleanup_inactive_mobile_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE mobile_sessions 
    SET active = FALSE 
    WHERE expires_at < NOW() 
    AND active = TRUE;
    
    -- Remover sessões antigas (mais de 90 dias inativas)
    DELETE FROM mobile_sessions 
    WHERE active = FALSE 
    AND last_activity < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas mobile
CREATE OR REPLACE FUNCTION get_mobile_stats()
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'total_sessions', COUNT(*) FILTER (WHERE active = TRUE),
        'devices_by_platform', json_object_agg(
            COALESCE(device_info->>'platform', 'unknown'), 
            COUNT(*)
        ),
        'push_subscriptions', (
            SELECT COUNT(*) FROM push_subscriptions WHERE active = TRUE
        ),
        'notifications_sent_today', (
            SELECT COUNT(*) FROM push_notifications_sent 
            WHERE sent_at >= CURRENT_DATE
        ),
        'avg_session_duration', AVG(
            EXTRACT(EPOCH FROM (COALESCE(last_activity, NOW()) - created_at)) / 3600
        ) FILTER (WHERE active = TRUE),
        'most_active_users', (
            SELECT json_agg(
                json_build_object(
                    'user_id', user_id,
                    'session_count', session_count,
                    'last_activity', last_activity
                )
                ORDER BY session_count DESC
            ) FROM (
                SELECT 
                    user_id,
                    COUNT(*) as session_count,
                    MAX(last_activity) as last_activity
                FROM mobile_sessions 
                WHERE active = TRUE
                GROUP BY user_id
                LIMIT 5
            ) top_users
        )
    ) INTO resultado
    FROM mobile_sessions;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para envio de notificação push (placeholder)
CREATE OR REPLACE FUNCTION send_push_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_body TEXT,
    notification_category TEXT DEFAULT 'system',
    notification_priority TEXT DEFAULT 'normal',
    notification_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
    subscription_count INTEGER;
    notification_id UUID;
BEGIN
    -- Verificar se o usuário tem subscriptions ativas
    SELECT COUNT(*) INTO subscription_count
    FROM push_subscriptions 
    WHERE user_id = target_user_id AND active = TRUE;
    
    IF subscription_count = 0 THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'Usuário não possui subscriptions ativas'
        );
    END IF;
    
    -- Registrar a notificação
    INSERT INTO push_notifications_sent (
        user_id, title, body, category, priority, data
    ) VALUES (
        target_user_id, notification_title, notification_body,
        notification_category, notification_priority, notification_data
    ) RETURNING id INTO notification_id;
    
    -- Em produção, aqui seria feita a chamada para o serviço de push
    -- Por enquanto, apenas simular sucesso
    
    RETURN json_build_object(
        'success', TRUE,
        'notification_id', notification_id,
        'subscriptions_count', subscription_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários finais
COMMENT ON FUNCTION cleanup_expired_qr_tokens IS 'Remove tokens QR expirados (executar via cron)';
COMMENT ON FUNCTION cleanup_inactive_mobile_sessions IS 'Remove sessões mobile inativas (executar via cron)';
COMMENT ON FUNCTION get_mobile_stats IS 'Retorna estatísticas de uso do sistema mobile';
COMMENT ON FUNCTION send_push_notification IS 'Função para envio de notificações push (placeholder)';

-- Inserir algumas configurações padrão para usuários existentes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Inserir preferências padrão para usuários que são conselheiros
    FOR user_record IN 
        SELECT p.id 
        FROM profiles p 
        JOIN conselheiros c ON c.user_id = p.id 
        WHERE c.status = 'ativo'
    LOOP
        INSERT INTO push_preferences (user_id, preferences)
        VALUES (user_record.id, '{
            "enabled": true,
            "categories": {
                "meeting": true,
                "voting": true,
                "document": true,
                "system": false,
                "reminder": true
            },
            "quiet_hours": {
                "enabled": true,
                "start": "22:00",
                "end": "07:00"
            },
            "frequency": "immediate"
        }'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;
        
        INSERT INTO mobile_preferences (user_id, preferences)
        VALUES (user_record.id, '{
            "theme": "system",
            "language": "pt-BR",
            "auto_checkin": false,
            "location_services": false,
            "offline_mode": true,
            "data_sync": "wifi_only"
        }'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;