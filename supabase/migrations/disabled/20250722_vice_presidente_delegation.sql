-- Adiciona campos para controle de delegação da presidência ao vice-presidente

-- 1. Adicionar campos na tabela profiles para controle de delegação
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_acting_president BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delegation_granted_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delegation_granted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delegation_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_acting_president ON profiles(is_acting_president);
CREATE INDEX IF NOT EXISTS idx_profiles_delegation_granted_by ON profiles(delegation_granted_by);

-- 3. Função para verificar se vice-presidente está atuando como presidente
CREATE OR REPLACE FUNCTION is_vice_acting_as_president(user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  is_acting boolean := false;
  delegation_valid boolean := false;
BEGIN
  -- Busca a role e status de delegação do usuário
  SELECT 
    role, 
    is_acting_president,
    CASE 
      WHEN delegation_expires_at IS NULL THEN true
      WHEN delegation_expires_at > NOW() THEN true
      ELSE false
    END
  INTO user_role, is_acting, delegation_valid
  FROM profiles
  WHERE id = user_id;
  
  -- Verifica se é vice-presidente atuando como presidente
  IF user_role = 'vice_presidente' AND is_acting AND delegation_valid THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 4. Atualizar função is_admin_or_role para considerar vice-presidente atuando
CREATE OR REPLACE FUNCTION is_admin_or_role(allowed_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  is_vice_acting boolean;
BEGIN
  -- Busca a role do usuário atual
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Admin sempre tem acesso
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Verifica se vice-presidente está atuando como presidente
  SELECT is_vice_acting_as_president() INTO is_vice_acting;
  
  -- Vice-presidente atuando tem privilégios de presidente
  IF user_role = 'vice_presidente' AND is_vice_acting AND 'presidente' = ANY(allowed_roles) THEN
    RETURN true;
  END IF;
  
  -- Vice-presidente normal tem privilégios de conselheiro titular
  IF user_role = 'vice_presidente' AND NOT is_vice_acting AND 'conselheiro_titular' = ANY(allowed_roles) THEN
    RETURN true;
  END IF;
  
  -- Verifica se a role está na lista permitida
  RETURN user_role = ANY(allowed_roles);
END;
$$;

-- 5. Função para delegar presidência (apenas presidente pode executar)
CREATE OR REPLACE FUNCTION delegate_presidency_to_vice(
  vice_president_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  vice_role text;
  result json;
BEGIN
  -- Verifica se o usuário atual é presidente
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'presidente' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas o presidente pode delegar a presidência'
    );
  END IF;
  
  -- Verifica se o alvo é vice-presidente
  SELECT role INTO vice_role
  FROM profiles
  WHERE id = vice_president_id;
  
  IF vice_role != 'vice_presidente' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas vice-presidentes podem receber delegação de presidência'
    );
  END IF;
  
  -- Remove delegação anterior de outros vice-presidentes
  UPDATE profiles 
  SET 
    is_acting_president = false,
    delegation_granted_by = NULL,
    delegation_granted_at = NULL,
    delegation_expires_at = NULL
  WHERE role = 'vice_presidente' AND is_acting_president = true;
  
  -- Aplica a nova delegação
  UPDATE profiles 
  SET 
    is_acting_president = true,
    delegation_granted_by = auth.uid(),
    delegation_granted_at = NOW(),
    delegation_expires_at = expires_at
  WHERE id = vice_president_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Presidência delegada com sucesso'
  );
END;
$$;

-- 6. Função para revogar delegação de presidência
CREATE OR REPLACE FUNCTION revoke_presidency_delegation(vice_president_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  vice_role text;
BEGIN
  -- Verifica se o usuário atual é presidente
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'presidente' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas o presidente pode revogar delegação de presidência'
    );
  END IF;
  
  -- Remove a delegação
  UPDATE profiles 
  SET 
    is_acting_president = false,
    delegation_granted_by = NULL,
    delegation_granted_at = NULL,
    delegation_expires_at = NULL
  WHERE id = vice_president_id AND role = 'vice_presidente';
  
  RETURN json_build_object(
    'success', true,
    'message', 'Delegação de presidência revogada com sucesso'
  );
END;
$$;

-- 7. Trigger para limpar delegações expiradas automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_delegations()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove delegações expiradas
  UPDATE profiles 
  SET 
    is_acting_president = false,
    delegation_granted_by = NULL,
    delegation_granted_at = NULL,
    delegation_expires_at = NULL
  WHERE 
    role = 'vice_presidente' 
    AND is_acting_president = true 
    AND delegation_expires_at IS NOT NULL 
    AND delegation_expires_at <= NOW();
  
  RETURN NULL;
END;
$$;

-- Criar trigger que executa a limpeza periodicamente
CREATE OR REPLACE FUNCTION schedule_delegation_cleanup()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM cleanup_expired_delegations();
END;
$$;

-- 8. Comentários para documentação
COMMENT ON COLUMN profiles.is_acting_president IS 
  'Indica se o vice-presidente está atuando como presidente (com delegação ativa)';

COMMENT ON COLUMN profiles.delegation_granted_by IS 
  'ID do presidente que concedeu a delegação';

COMMENT ON COLUMN profiles.delegation_granted_at IS 
  'Data e hora em que a delegação foi concedida';

COMMENT ON COLUMN profiles.delegation_expires_at IS 
  'Data e hora de expiração da delegação (NULL = sem expiração)';

COMMENT ON FUNCTION is_vice_acting_as_president(UUID) IS 
  'Verifica se um vice-presidente está atuando como presidente com delegação válida';

COMMENT ON FUNCTION delegate_presidency_to_vice(UUID, TIMESTAMP WITH TIME ZONE) IS 
  'Permite ao presidente delegar a presidência a um vice-presidente';

COMMENT ON FUNCTION revoke_presidency_delegation(UUID) IS 
  'Permite ao presidente revogar a delegação de presidência de um vice-presidente'; 