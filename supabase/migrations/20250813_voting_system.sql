-- ================================================
-- MIGRAÇÃO: Sistema de Votação Eletrônica em Tempo Real
-- Data: 2025-08-13
-- Descrição: Implementa sistema completo de votação eletrônica com segurança e auditoria
-- ================================================

-- Criar tabela para sessões de votação
CREATE TABLE IF NOT EXISTS voting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reuniao_id UUID NOT NULL REFERENCES reunioes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo_votacao TEXT NOT NULL CHECK (tipo_votacao IN ('simples', 'qualificada', 'unanime', 'secreta')),
    status TEXT NOT NULL CHECK (status IN ('preparando', 'aberta', 'encerrada', 'cancelada')) DEFAULT 'preparando',
    
    -- Configurações da votação
    permite_abstencao BOOLEAN NOT NULL DEFAULT TRUE,
    voto_secreto BOOLEAN NOT NULL DEFAULT FALSE,
    quorum_minimo INTEGER NOT NULL DEFAULT 5,
    maioria_requerida TEXT NOT NULL CHECK (maioria_requerida IN ('simples', 'absoluta', 'qualificada', 'unanime')) DEFAULT 'simples',
    percentual_qualificada INTEGER DEFAULT 75 CHECK (percentual_qualificada BETWEEN 50 AND 100),
    
    -- Controle temporal
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    timeout_minutes INTEGER DEFAULT 30,
    
    -- Criador da votação
    created_by UUID NOT NULL REFERENCES profiles(id),
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Controle de integridade
    hash_inicial TEXT, -- Hash da sessão no momento da criação
    hash_final TEXT,   -- Hash da sessão após encerramento
    
    CONSTRAINT voting_sessions_timeline_check CHECK (
        (started_at IS NULL OR started_at >= created_at) AND
        (ended_at IS NULL OR ended_at >= started_at)
    )
);

-- Comentários para documentação
COMMENT ON TABLE voting_sessions IS 'Sessões de votação eletrônica nas reuniões';
COMMENT ON COLUMN voting_sessions.tipo_votacao IS 'Tipo de votação: simples, qualificada, unanime, secreta';
COMMENT ON COLUMN voting_sessions.maioria_requerida IS 'Tipo de maioria necessária para aprovação';
COMMENT ON COLUMN voting_sessions.percentual_qualificada IS 'Percentual necessário para maioria qualificada (50-100%)';
COMMENT ON COLUMN voting_sessions.hash_inicial IS 'Hash SHA-256 da sessão para verificação de integridade';

-- Criar tabela para opções de voto
CREATE TABLE IF NOT EXISTS voting_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 1,
    cor TEXT DEFAULT '#6B7280', -- Cor para visualização
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(session_id, ordem)
);

-- Comentários para documentação
COMMENT ON TABLE voting_options IS 'Opções disponíveis em cada sessão de votação';
COMMENT ON COLUMN voting_options.ordem IS 'Ordem de exibição das opções (1, 2, 3...)';
COMMENT ON COLUMN voting_options.cor IS 'Cor hexadecimal para visualização da opção';

-- Criar tabela para votos
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    option_id UUID REFERENCES voting_options(id) ON DELETE SET NULL, -- NULL para abstenção
    
    -- Controle temporal
    voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Informações do dispositivo para auditoria
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Hash do voto para verificação de integridade
    vote_hash TEXT NOT NULL,
    
    -- Garantir um voto por pessoa por sessão
    UNIQUE(session_id, voter_id)
);

-- Comentários para documentação
COMMENT ON TABLE votes IS 'Votos registrados nas sessões de votação';
COMMENT ON COLUMN votes.option_id IS 'Opção escolhida. NULL indica abstenção';
COMMENT ON COLUMN votes.vote_hash IS 'Hash SHA-256 do voto para verificação de integridade';
COMMENT ON COLUMN votes.device_info IS 'Informações do dispositivo usado para votar';

-- Criar tabela para auditoria de votação
CREATE TABLE IF NOT EXISTS voting_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('session_created', 'session_started', 'session_ended', 'vote_cast', 'vote_changed', 'session_cancelled')),
    
    -- Dados da ação
    old_data JSONB,
    new_data JSONB,
    
    -- Contexto da ação
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Hash para integridade
    action_hash TEXT NOT NULL
);

-- Comentários para documentação
COMMENT ON TABLE voting_audit_logs IS 'Log de auditoria para todas as ações do sistema de votação';
COMMENT ON COLUMN voting_audit_logs.action IS 'Tipo de ação executada no sistema';
COMMENT ON COLUMN voting_audit_logs.old_data IS 'Estado anterior dos dados (para alterações)';
COMMENT ON COLUMN voting_audit_logs.new_data IS 'Novo estado dos dados';
COMMENT ON COLUMN voting_audit_logs.action_hash IS 'Hash SHA-256 da ação para auditoria';

-- Criar tabela para presença na votação
CREATE TABLE IF NOT EXISTS voting_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    conselheiro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    presente BOOLEAN NOT NULL DEFAULT TRUE,
    justificativa TEXT,
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    UNIQUE(session_id, conselheiro_id)
);

-- Comentários para documentação
COMMENT ON TABLE voting_presence IS 'Controle de presença para cada sessão de votação';
COMMENT ON COLUMN voting_presence.justificativa IS 'Justificativa para ausência (se aplicável)';
COMMENT ON COLUMN voting_presence.marked_by IS 'Quem marcou a presença/ausência';

-- Criar tabela para resultados calculados
CREATE TABLE IF NOT EXISTS voting_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE UNIQUE,
    
    -- Estatísticas de participação
    total_eligible INTEGER NOT NULL, -- Total de conselheiros elegíveis
    total_present INTEGER NOT NULL,  -- Total de presentes
    total_votes INTEGER NOT NULL,    -- Total de votos válidos
    total_abstentions INTEGER NOT NULL DEFAULT 0,
    
    -- Resultados por opção
    results_data JSONB NOT NULL DEFAULT '{}', -- {"option_id": {"votes": N, "percentage": X}}
    
    -- Status do resultado
    quorum_reached BOOLEAN NOT NULL,
    approved BOOLEAN,
    winning_option_id UUID REFERENCES voting_options(id),
    
    -- Metadados do cálculo
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculation_method TEXT NOT NULL DEFAULT 'real_time',
    
    -- Hash para verificação de integridade
    result_hash TEXT NOT NULL
);

-- Comentários para documentação
COMMENT ON TABLE voting_results IS 'Resultados calculados das sessões de votação';
COMMENT ON COLUMN voting_results.results_data IS 'Resultados detalhados por opção em formato JSON';
COMMENT ON COLUMN voting_results.quorum_reached IS 'Se o quórum mínimo foi atingido';
COMMENT ON COLUMN voting_results.approved IS 'Se a votação foi aprovada (baseado na maioria requerida)';
COMMENT ON COLUMN voting_results.result_hash IS 'Hash SHA-256 dos resultados para verificação';

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_voting_sessions_reuniao_id ON voting_sessions(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_status ON voting_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_created_at ON voting_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_voting_options_session_id ON voting_options(session_id);
CREATE INDEX IF NOT EXISTS idx_voting_options_ordem ON voting_options(session_id, ordem);

CREATE INDEX IF NOT EXISTS idx_votes_session_id ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at);

CREATE INDEX IF NOT EXISTS idx_voting_audit_logs_session_id ON voting_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_voting_audit_logs_action ON voting_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_voting_audit_logs_timestamp ON voting_audit_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_voting_presence_session_id ON voting_presence(session_id);
CREATE INDEX IF NOT EXISTS idx_voting_presence_conselheiro_id ON voting_presence(conselheiro_id);

-- Configurar RLS (Row Level Security)
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para voting_sessions
CREATE POLICY "Conselheiros podem ver sessões de suas reuniões" ON voting_sessions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM reunioes r
            JOIN presencas p ON p.reuniao_id = r.id
            WHERE r.id = reuniao_id 
            AND p.conselheiro_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

CREATE POLICY "Presidente e secretário podem gerenciar sessões" ON voting_sessions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Políticas RLS para voting_options
CREATE POLICY "Usuários podem ver opções de votação de suas sessões" ON voting_options
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM voting_sessions vs
            JOIN reunioes r ON r.id = vs.reuniao_id
            JOIN presencas p ON p.reuniao_id = r.id
            WHERE vs.id = session_id 
            AND p.conselheiro_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

CREATE POLICY "Presidente e secretário podem gerenciar opções" ON voting_options
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Políticas RLS para votes (votos secretos protegidos)
CREATE POLICY "Usuários podem inserir seus próprios votos" ON votes
    FOR INSERT
    TO authenticated
    WITH CHECK (voter_id = auth.uid());

CREATE POLICY "Usuários podem ver apenas estatísticas de votos" ON votes
    FOR SELECT
    TO authenticated
    USING (
        -- Apenas admin pode ver votos individuais
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
        -- Ou o próprio votante pode ver seu voto
        OR voter_id = auth.uid()
    );

-- Políticas RLS para voting_presence
CREATE POLICY "Conselheiros podem ver presença de suas sessões" ON voting_presence
    FOR SELECT
    TO authenticated
    USING (
        conselheiro_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

CREATE POLICY "Presidente e secretário podem gerenciar presença" ON voting_presence
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Políticas RLS para voting_results
CREATE POLICY "Usuários podem ver resultados de votação" ON voting_results
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM voting_sessions vs
            JOIN reunioes r ON r.id = vs.reuniao_id
            JOIN presencas p ON p.reuniao_id = r.id
            WHERE vs.id = session_id 
            AND p.conselheiro_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Políticas RLS para voting_audit_logs
CREATE POLICY "Apenas admin pode ver logs de auditoria" ON voting_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Função para calcular hash de integridade
CREATE OR REPLACE FUNCTION calculate_vote_hash(
    p_session_id UUID,
    p_voter_id UUID,
    p_option_id UUID,
    p_timestamp TIMESTAMPTZ
)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        digest(
            CONCAT(p_session_id::text, p_voter_id::text, COALESCE(p_option_id::text, 'abstention'), p_timestamp::text),
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para calcular resultados da votação
CREATE OR REPLACE FUNCTION calculate_voting_results(p_session_id UUID)
RETURNS JSON AS $$
DECLARE
    session_record voting_sessions%ROWTYPE;
    total_eligible INTEGER := 0;
    total_present INTEGER := 0;
    total_votes INTEGER := 0;
    total_abstentions INTEGER := 0;
    quorum_reached BOOLEAN := FALSE;
    approved BOOLEAN := FALSE;
    winning_option_id UUID;
    results_data JSONB := '{}';
    option_record RECORD;
    result_hash TEXT;
BEGIN
    -- Buscar informações da sessão
    SELECT * INTO session_record FROM voting_sessions WHERE id = p_session_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Sessão não encontrada');
    END IF;
    
    -- Calcular presença elegível
    SELECT COUNT(*) INTO total_eligible
    FROM voting_presence vp
    WHERE vp.session_id = p_session_id;
    
    SELECT COUNT(*) INTO total_present
    FROM voting_presence vp
    WHERE vp.session_id = p_session_id AND vp.presente = TRUE;
    
    -- Verificar quórum
    quorum_reached := total_present >= session_record.quorum_minimo;
    
    -- Calcular votos
    SELECT COUNT(*) INTO total_votes
    FROM votes v
    WHERE v.session_id = p_session_id AND v.option_id IS NOT NULL;
    
    SELECT COUNT(*) INTO total_abstentions
    FROM votes v
    WHERE v.session_id = p_session_id AND v.option_id IS NULL;
    
    -- Calcular resultados por opção
    FOR option_record IN
        SELECT vo.id, vo.texto, COUNT(v.id) as vote_count
        FROM voting_options vo
        LEFT JOIN votes v ON v.option_id = vo.id AND v.session_id = p_session_id
        WHERE vo.session_id = p_session_id AND vo.ativa = TRUE
        GROUP BY vo.id, vo.texto
        ORDER BY COUNT(v.id) DESC
    LOOP
        results_data := results_data || jsonb_build_object(
            option_record.id::text,
            jsonb_build_object(
                'votes', option_record.vote_count,
                'percentage', CASE 
                    WHEN total_votes > 0 THEN ROUND((option_record.vote_count::numeric / total_votes * 100), 2)
                    ELSE 0
                END,
                'texto', option_record.texto
            )
        );
        
        -- Primeira iteração = opção vencedora
        IF winning_option_id IS NULL AND option_record.vote_count > 0 THEN
            winning_option_id := option_record.id;
        END IF;
    END LOOP;
    
    -- Determinar aprovação baseado na maioria requerida
    IF quorum_reached AND winning_option_id IS NOT NULL THEN
        DECLARE
            winning_votes INTEGER;
            required_votes INTEGER;
        BEGIN
            -- Buscar votos da opção vencedora
            SELECT COALESCE((results_data->winning_option_id::text->>'votes')::INTEGER, 0) INTO winning_votes;
            
            CASE session_record.maioria_requerida
                WHEN 'simples' THEN
                    approved := winning_votes > (total_votes - winning_votes);
                WHEN 'absoluta' THEN
                    approved := winning_votes > (total_present / 2);
                WHEN 'qualificada' THEN
                    required_votes := CEIL(total_present * session_record.percentual_qualificada / 100.0);
                    approved := winning_votes >= required_votes;
                WHEN 'unanime' THEN
                    approved := winning_votes = total_votes AND total_abstentions = 0;
            END CASE;
        END;
    END IF;
    
    -- Calcular hash dos resultados
    result_hash := encode(
        digest(
            CONCAT(
                p_session_id::text, 
                total_votes::text, 
                results_data::text, 
                approved::text,
                NOW()::text
            ),
            'sha256'
        ),
        'hex'
    );
    
    -- Inserir ou atualizar resultados
    INSERT INTO voting_results (
        session_id, total_eligible, total_present, total_votes, total_abstentions,
        results_data, quorum_reached, approved, winning_option_id, result_hash
    ) VALUES (
        p_session_id, total_eligible, total_present, total_votes, total_abstentions,
        results_data, quorum_reached, approved, winning_option_id, result_hash
    )
    ON CONFLICT (session_id) DO UPDATE SET
        total_eligible = EXCLUDED.total_eligible,
        total_present = EXCLUDED.total_present,
        total_votes = EXCLUDED.total_votes,
        total_abstentions = EXCLUDED.total_abstentions,
        results_data = EXCLUDED.results_data,
        quorum_reached = EXCLUDED.quorum_reached,
        approved = EXCLUDED.approved,
        winning_option_id = EXCLUDED.winning_option_id,
        result_hash = EXCLUDED.result_hash,
        calculated_at = NOW();
    
    -- Retornar resultados
    RETURN json_build_object(
        'session_id', p_session_id,
        'total_eligible', total_eligible,
        'total_present', total_present,
        'total_votes', total_votes,
        'total_abstentions', total_abstentions,
        'quorum_reached', quorum_reached,
        'approved', approved,
        'winning_option_id', winning_option_id,
        'results_data', results_data,
        'result_hash', result_hash
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar voto com auditoria
CREATE OR REPLACE FUNCTION cast_vote(
    p_session_id UUID,
    p_voter_id UUID,
    p_option_id UUID, -- NULL para abstenção
    p_device_info JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    session_status TEXT;
    existing_vote_id UUID;
    vote_hash TEXT;
    audit_action TEXT;
    old_option_id UUID;
BEGIN
    -- Verificar se a sessão está aberta
    SELECT status INTO session_status FROM voting_sessions WHERE id = p_session_id;
    
    IF session_status IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sessão não encontrada');
    END IF;
    
    IF session_status != 'aberta' THEN
        RETURN json_build_object('success', FALSE, 'error', 'Votação não está aberta');
    END IF;
    
    -- Verificar se o usuário está presente na sessão
    IF NOT EXISTS (
        SELECT 1 FROM voting_presence 
        WHERE session_id = p_session_id AND conselheiro_id = p_voter_id AND presente = TRUE
    ) THEN
        RETURN json_build_object('success', FALSE, 'error', 'Usuário não está presente na sessão');
    END IF;
    
    -- Calcular hash do voto
    vote_hash := calculate_vote_hash(p_session_id, p_voter_id, p_option_id, NOW());
    
    -- Verificar se já existe voto
    SELECT id, option_id INTO existing_vote_id, old_option_id
    FROM votes 
    WHERE session_id = p_session_id AND voter_id = p_voter_id;
    
    IF existing_vote_id IS NOT NULL THEN
        -- Atualizar voto existente
        UPDATE votes SET
            option_id = p_option_id,
            voted_at = NOW(),
            device_info = p_device_info,
            ip_address = p_ip_address,
            user_agent = p_user_agent,
            vote_hash = vote_hash
        WHERE id = existing_vote_id;
        
        audit_action := 'vote_changed';
    ELSE
        -- Inserir novo voto
        INSERT INTO votes (
            session_id, voter_id, option_id, device_info, ip_address, user_agent, vote_hash
        ) VALUES (
            p_session_id, p_voter_id, p_option_id, p_device_info, p_ip_address, p_user_agent, vote_hash
        );
        
        audit_action := 'vote_cast';
    END IF;
    
    -- Registrar auditoria
    INSERT INTO voting_audit_logs (
        session_id, user_id, action, old_data, new_data, ip_address, user_agent, action_hash
    ) VALUES (
        p_session_id, 
        p_voter_id, 
        audit_action,
        CASE WHEN existing_vote_id IS NOT NULL THEN 
            jsonb_build_object('option_id', old_option_id)
        ELSE NULL END,
        jsonb_build_object('option_id', p_option_id),
        p_ip_address,
        p_user_agent,
        encode(digest(CONCAT(audit_action, p_session_id::text, NOW()::text), 'sha256'), 'hex')
    );
    
    -- Recalcular resultados em tempo real
    PERFORM calculate_voting_results(p_session_id);
    
    RETURN json_build_object(
        'success', TRUE, 
        'vote_hash', vote_hash,
        'action', audit_action
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para iniciar uma sessão de votação
CREATE OR REPLACE FUNCTION start_voting_session(p_session_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    session_record voting_sessions%ROWTYPE;
    hash_inicial TEXT;
BEGIN
    -- Verificar permissões
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = p_user_id AND role IN ('admin', 'presidente', 'secretario')
    ) THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sem permissão para iniciar votação');
    END IF;
    
    -- Buscar sessão
    SELECT * INTO session_record FROM voting_sessions WHERE id = p_session_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sessão não encontrada');
    END IF;
    
    IF session_record.status != 'preparando' THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sessão não está em preparação');
    END IF;
    
    -- Calcular hash inicial
    hash_inicial := encode(
        digest(
            CONCAT(p_session_id::text, session_record.titulo, NOW()::text),
            'sha256'
        ),
        'hex'
    );
    
    -- Atualizar sessão
    UPDATE voting_sessions SET
        status = 'aberta',
        started_at = NOW(),
        hash_inicial = hash_inicial
    WHERE id = p_session_id;
    
    -- Registrar auditoria
    INSERT INTO voting_audit_logs (
        session_id, user_id, action, new_data, action_hash
    ) VALUES (
        p_session_id,
        p_user_id,
        'session_started',
        jsonb_build_object('started_at', NOW(), 'hash_inicial', hash_inicial),
        encode(digest(CONCAT('session_started', p_session_id::text, NOW()::text), 'sha256'), 'hex')
    );
    
    RETURN json_build_object('success', TRUE, 'hash_inicial', hash_inicial);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para encerrar uma sessão de votação
CREATE OR REPLACE FUNCTION end_voting_session(p_session_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    session_record voting_sessions%ROWTYPE;
    hash_final TEXT;
    final_results JSON;
BEGIN
    -- Verificar permissões
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = p_user_id AND role IN ('admin', 'presidente', 'secretario')
    ) THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sem permissão para encerrar votação');
    END IF;
    
    -- Buscar sessão
    SELECT * INTO session_record FROM voting_sessions WHERE id = p_session_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sessão não encontrada');
    END IF;
    
    IF session_record.status != 'aberta' THEN
        RETURN json_build_object('success', FALSE, 'error', 'Sessão não está aberta');
    END IF;
    
    -- Calcular resultados finais
    SELECT calculate_voting_results(p_session_id) INTO final_results;
    
    -- Calcular hash final
    hash_final := encode(
        digest(
            CONCAT(
                p_session_id::text, 
                session_record.hash_inicial, 
                final_results::text, 
                NOW()::text
            ),
            'sha256'
        ),
        'hex'
    );
    
    -- Atualizar sessão
    UPDATE voting_sessions SET
        status = 'encerrada',
        ended_at = NOW(),
        hash_final = hash_final
    WHERE id = p_session_id;
    
    -- Registrar auditoria
    INSERT INTO voting_audit_logs (
        session_id, user_id, action, new_data, action_hash
    ) VALUES (
        p_session_id,
        p_user_id,
        'session_ended',
        jsonb_build_object(
            'ended_at', NOW(), 
            'hash_final', hash_final,
            'final_results', final_results
        ),
        encode(digest(CONCAT('session_ended', p_session_id::text, NOW()::text), 'sha256'), 'hex')
    );
    
    RETURN json_build_object(
        'success', TRUE, 
        'hash_final', hash_final,
        'results', final_results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de votação
CREATE OR REPLACE FUNCTION get_voting_statistics()
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'total_sessions', COUNT(*),
        'sessions_by_status', json_object_agg(status, status_count),
        'total_votes_cast', (SELECT COUNT(*) FROM votes),
        'average_participation', AVG(
            CASE WHEN total_eligible > 0 THEN 
                (total_votes + total_abstentions)::numeric / total_eligible * 100
            ELSE 0 END
        ),
        'most_active_sessions', (
            SELECT json_agg(
                json_build_object(
                    'session_id', vs.id,
                    'titulo', vs.titulo,
                    'total_votes', vr.total_votes,
                    'participation_rate', 
                    CASE WHEN vr.total_eligible > 0 THEN 
                        ROUND((vr.total_votes + vr.total_abstentions)::numeric / vr.total_eligible * 100, 2)
                    ELSE 0 END
                )
                ORDER BY vr.total_votes DESC
            ) FROM voting_sessions vs
            JOIN voting_results vr ON vr.session_id = vs.id
            WHERE vs.status = 'encerrada'
            LIMIT 5
        ),
        'approval_rate', (
            SELECT ROUND(
                COUNT(*) FILTER (WHERE vr.approved = TRUE)::numeric / 
                NULLIF(COUNT(*), 0) * 100, 2
            )
            FROM voting_results vr
            JOIN voting_sessions vs ON vs.id = vr.session_id
            WHERE vs.status = 'encerrada'
        )
    ) INTO resultado
    FROM (
        SELECT status, COUNT(*) as status_count
        FROM voting_sessions
        GROUP BY status
    ) status_counts;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários finais para documentação
COMMENT ON FUNCTION calculate_vote_hash IS 'Calcula hash SHA-256 de um voto para verificação de integridade';
COMMENT ON FUNCTION calculate_voting_results IS 'Calcula resultados em tempo real de uma sessão de votação';
COMMENT ON FUNCTION cast_vote IS 'Registra ou atualiza um voto com auditoria completa';
COMMENT ON FUNCTION start_voting_session IS 'Inicia uma sessão de votação com hash de integridade';
COMMENT ON FUNCTION end_voting_session IS 'Encerra uma sessão de votação com resultados finais';
COMMENT ON FUNCTION get_voting_statistics IS 'Retorna estatísticas gerais do sistema de votação';

-- Inserir opções padrão para votações simples
DO $$
BEGIN
    -- Este bloco será executado quando a migração for aplicada
    -- Não há dados padrão específicos para inserir no momento
    NULL;
END $$;