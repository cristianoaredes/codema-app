-- ========================================
-- COMPREHENSIVE SECURITY FIXES
-- Addresses all critical vulnerabilities identified in security audit
-- ========================================

-- 1. CRITICAL: Fix profile table security and role management
-- ==========================================================

-- Drop existing weak policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Secure profile access policies
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own basic info" ON profiles
FOR UPDATE USING (
  auth.uid() = id AND
  -- Prevent users from changing their own role, is_active, or critical fields
  (OLD.role = NEW.role) AND
  (OLD.is_active = NEW.is_active) AND
  (OLD.is_acting_president = NEW.is_acting_president)
);

-- CRITICAL: Only admins can change roles and critical fields
CREATE POLICY "Only admins can change user roles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

-- Admins can view all profiles for management
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

-- CODEMA members can view other CODEMA member profiles
CREATE POLICY "CODEMA members can view member profiles" ON profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  role IN ('conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'vice_presidente') AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND 
    role IN ('admin', 'conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'vice_presidente')
  )
);

-- 2. DELEGATION SECURITY: Fix acting president vulnerabilities
-- ============================================================

-- Create delegation tracking table with expiration
CREATE TABLE IF NOT EXISTS presidency_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  president_id UUID NOT NULL REFERENCES profiles(id),
  vice_president_id UUID NOT NULL REFERENCES profiles(id),
  delegated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_delegation_period CHECK (expires_at > delegated_at),
  CONSTRAINT no_self_delegation CHECK (president_id != vice_president_id)
);

-- Enable RLS on delegations
ALTER TABLE presidency_delegations ENABLE ROW LEVEL SECURITY;

-- Only presidents can create delegations to vice presidents
CREATE POLICY "Only presidents can delegate" ON presidency_delegations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'presidente' AND is_active = true
  ) AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = vice_president_id AND role = 'vice_presidente' AND is_active = true
  ) AND
  president_id = auth.uid()
);

-- Presidents and admins can view delegations
CREATE POLICY "Presidents and admins can view delegations" ON presidency_delegations
FOR SELECT USING (
  president_id = auth.uid() OR
  vice_president_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

-- Only presidents can revoke their own delegations
CREATE POLICY "Only presidents can revoke delegations" ON presidency_delegations
FOR UPDATE USING (
  president_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'presidente' AND is_active = true
  )
);

-- 3. SECURE AUTHORIZATION FUNCTIONS
-- ==================================

-- Replace existing weak authorization functions with secure ones
DROP FUNCTION IF EXISTS is_admin_or_role(TEXT[]);
DROP FUNCTION IF EXISTS has_codema_access();

-- Secure admin check with active status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure role check with active status
CREATE OR REPLACE FUNCTION has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = ANY(required_roles)
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure CODEMA access with acting president logic
CREATE OR REPLACE FUNCTION has_codema_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.is_active = true
    AND (
      p.role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente') OR
      (p.role = 'vice_presidente' AND is_currently_acting_president(p.id))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if vice president is currently acting president
CREATE OR REPLACE FUNCTION is_currently_acting_president(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM presidency_delegations pd
    JOIN profiles p ON p.id = user_id
    WHERE pd.vice_president_id = user_id
    AND p.role = 'vice_presidente'
    AND p.is_active = true
    AND pd.revoked_at IS NULL
    AND pd.expires_at > NOW()
    AND NOW() >= pd.delegated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure permission checker with granular controls
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_active BOOLEAN;
BEGIN
  -- Get user role and active status
  SELECT role, is_active INTO user_role, user_active
  FROM profiles WHERE id = auth.uid();
  
  -- User must be active
  IF NOT user_active THEN
    RETURN FALSE;
  END IF;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Permission-based checks
  CASE permission_name
    WHEN 'profiles.manage' THEN
      RETURN user_role = 'admin';
    
    WHEN 'meetings.manage' THEN
      RETURN user_role IN ('admin', 'presidente', 'secretario') OR
             is_currently_acting_president(auth.uid());
    
    WHEN 'meetings.view' THEN
      RETURN has_codema_access();
    
    WHEN 'documents.manage' THEN
      RETURN user_role IN ('admin', 'presidente', 'secretario') OR
             is_currently_acting_president(auth.uid());
    
    WHEN 'documents.view' THEN
      RETURN auth.uid() IS NOT NULL;
    
    WHEN 'resolutions.manage' THEN
      RETURN user_role IN ('admin', 'presidente', 'secretario') OR
             is_currently_acting_president(auth.uid());
    
    WHEN 'resolutions.view' THEN
      RETURN has_codema_access();
    
    WHEN 'audit.view' THEN
      RETURN user_role = 'admin';
      
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. COMPREHENSIVE RLS POLICIES FOR ALL SENSITIVE TABLES
-- =======================================================

-- Reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public reports" ON reports;
DROP POLICY IF EXISTS "Users can manage own reports" ON reports;

CREATE POLICY "Users can view public reports" ON reports
FOR SELECT USING (
  status = 'public' OR 
  user_id = auth.uid() OR
  has_role(ARRAY['admin', 'moderator'])
);

CREATE POLICY "Users can create reports" ON reports
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can update own reports" ON reports
FOR UPDATE USING (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Moderators can manage all reports" ON reports
FOR ALL USING (has_role(ARRAY['admin', 'moderator']));

-- Service categories
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view service categories" ON service_categories
FOR SELECT USING (true);
CREATE POLICY "Only admins can manage service categories" ON service_categories
FOR ALL USING (is_admin());

-- Conselheiros
ALTER TABLE conselheiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CODEMA members can view conselheiros" ON conselheiros
FOR SELECT USING (has_codema_access());
CREATE POLICY "Only secretario and admin can manage conselheiros" ON conselheiros
FOR ALL USING (has_role(ARRAY['admin', 'secretario']) OR is_currently_acting_president(auth.uid()));

-- 5. AUDIT LOGGING ENHANCEMENTS
-- =============================

-- Ensure audit_logs table has proper RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Enhanced audit logging function with more context
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  table_name TEXT DEFAULT NULL,
  record_id TEXT DEFAULT NULL,
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL,
  additional_context JSONB DEFAULT NULL
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
    user_agent,
    created_at
  ) VALUES (
    COALESCE(table_name, 'security_event'),
    event_type,
    record_id,
    auth.uid(),
    old_data,
    COALESCE(new_data, additional_context),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for critical security events
CREATE OR REPLACE FUNCTION trigger_security_audit()
RETURNS trigger AS $$
BEGIN
  -- Role changes
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' THEN
    IF OLD.role != NEW.role THEN
      PERFORM log_security_event(
        'ROLE_CHANGED',
        'profiles',
        NEW.id::TEXT,
        jsonb_build_object('old_role', OLD.role),
        jsonb_build_object('new_role', NEW.role, 'changed_by', auth.uid())
      );
    END IF;
    
    IF OLD.is_active != NEW.is_active THEN
      PERFORM log_security_event(
        CASE WHEN NEW.is_active THEN 'USER_ACTIVATED' ELSE 'USER_DEACTIVATED' END,
        'profiles',
        NEW.id::TEXT,
        jsonb_build_object('old_status', OLD.is_active),
        jsonb_build_object('new_status', NEW.is_active, 'changed_by', auth.uid())
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply security audit trigger to profiles
DROP TRIGGER IF EXISTS security_audit_profiles ON profiles;
CREATE TRIGGER security_audit_profiles
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_security_audit();

-- 6. CLEANUP AND SECURITY HARDENING
-- ==================================

-- Remove any potentially dangerous functions
DROP FUNCTION IF EXISTS update_user_role_unsafe CASCADE;

-- Create secure user management functions
CREATE OR REPLACE FUNCTION secure_update_user_role(
  target_user_id UUID,
  new_role TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  current_user_role TEXT;
  target_user_data JSONB;
  result JSONB;
BEGIN
  -- Verify caller is admin
  SELECT role INTO current_user_role
  FROM profiles WHERE id = auth.uid() AND is_active = true;
  
  IF current_user_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only admins can change user roles'
    );
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('citizen', 'moderator', 'conselheiro_suplente', 'conselheiro_titular', 'secretario', 'vice_presidente', 'presidente', 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role specified'
    );
  END IF;
  
  -- Update the role
  UPDATE profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id
  RETURNING to_jsonb(profiles.*) INTO target_user_data;
  
  -- Log the change
  PERFORM log_security_event(
    'ADMIN_ROLE_CHANGE',
    'profiles',
    target_user_id::TEXT,
    NULL,
    jsonb_build_object(
      'new_role', new_role,
      'changed_by', auth.uid(),
      'reason', reason,
      'timestamp', NOW()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'data', target_user_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION secure_update_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION has_codema_access TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION has_role TO authenticated;

-- Final security check: Ensure all sensitive tables have RLS enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'reports', 'documentos', 'reunioes', 'resolucoes', 'conselheiros', 'audit_logs', 'presidency_delegations', 'service_categories')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END;
$$;

COMMENT ON MIGRATION IS 'Comprehensive security fixes: RLS policies, secure role management, delegation tracking, audit logging, and privilege escalation prevention';
