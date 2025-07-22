-- Adiciona a role vice_presidente ao sistema

-- 1. Atualizar constraint da tabela profiles para incluir vice_presidente
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('citizen', 'admin', 'moderator', 'conselheiro_titular', 'conselheiro_suplente', 'secretario', 'vice_presidente', 'presidente'));

-- 2. Atualizar constraint da tabela user_invitations para incluir vice_presidente
ALTER TABLE user_invitations DROP CONSTRAINT IF EXISTS user_invitations_role_check;
ALTER TABLE user_invitations ADD CONSTRAINT user_invitations_role_check 
  CHECK (role IN ('citizen', 'admin', 'moderator', 'conselheiro_titular', 'conselheiro_suplente', 'secretario', 'vice_presidente', 'presidente'));

-- 3. Atualizar função is_admin_or_role para incluir vice_presidente nas funções administrativas
CREATE OR REPLACE FUNCTION is_admin_or_role(allowed_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Busca a role do usuário atual
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Admin sempre tem acesso
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Vice-presidente tem os mesmos privilégios que presidente
  IF user_role = 'vice_presidente' AND 'presidente' = ANY(allowed_roles) THEN
    RETURN true;
  END IF;
  
  -- Verifica se a role está na lista permitida
  RETURN user_role = ANY(allowed_roles);
END;
$$;

-- 4. Comentários para documentação
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 
  'Permite roles: citizen, admin, moderator, conselheiro_titular, conselheiro_suplente, secretario, vice_presidente, presidente';

COMMENT ON CONSTRAINT user_invitations_role_check ON user_invitations IS 
  'Permite roles: citizen, admin, moderator, conselheiro_titular, conselheiro_suplente, secretario, vice_presidente, presidente';

COMMENT ON FUNCTION is_admin_or_role(text[]) IS 
  'Verifica se o usuário atual tem uma das roles permitidas. Admin sempre retorna true. Vice-presidente tem privilégios de presidente.'; 