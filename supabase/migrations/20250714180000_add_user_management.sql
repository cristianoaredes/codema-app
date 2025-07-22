-- Add user status and deactivation fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES profiles(id);

-- Create user invitations table
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'admin', 'moderator', 'conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente')),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  neighborhood VARCHAR(255),
  message TEXT,
  invitation_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user sessions table for activity tracking
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  session_token VARCHAR(255),
  login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logout_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  device_info JSONB,
  location_info JSONB
);

-- Create password reset requests table
CREATE TABLE password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reset_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id), -- null for user-initiated, filled for admin-initiated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user activity logs table
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_expires ON user_invitations(expires_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_password_reset_token ON password_reset_requests(reset_token);
CREATE INDEX idx_password_reset_expires ON password_reset_requests(expires_at);
CREATE INDEX idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- RLS Policies

-- User invitations - only admins can manage
CREATE POLICY "Admins can manage user invitations"
ON user_invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin')
  )
);

-- User sessions - users can see their own sessions, admins can see all
CREATE POLICY "Users can view their own sessions"
ON user_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
ON user_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin')
  )
);

CREATE POLICY "System can insert sessions"
ON user_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update sessions"
ON user_sessions FOR UPDATE
USING (true);

-- Password reset requests - users can create their own, admins can manage all
CREATE POLICY "Users can create password reset requests"
ON password_reset_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage password reset requests"
ON password_reset_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin')
  )
);

-- User activity logs - users can see their own, admins can see all
CREATE POLICY "Users can view their own activity"
ON user_activity_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity"
ON user_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin')
  )
);

CREATE POLICY "System can insert activity logs"
ON user_activity_logs FOR INSERT
WITH CHECK (true);

-- Update trigger for user_invitations
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track user login
CREATE OR REPLACE FUNCTION track_user_login(
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL,
  p_location_info JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- End any existing active sessions for this user
  UPDATE user_sessions 
  SET is_active = false, logout_at = now()
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Create new session
  INSERT INTO user_sessions (
    user_id, ip_address, user_agent, device_info, location_info
  ) VALUES (
    p_user_id, p_ip_address, p_user_agent, p_device_info, p_location_info
  ) RETURNING id INTO session_id;
  
  -- Log the login activity
  INSERT INTO user_activity_logs (
    user_id, action, details, ip_address, user_agent
  ) VALUES (
    p_user_id, 'LOGIN', 
    jsonb_build_object('session_id', session_id),
    p_ip_address, p_user_agent
  );
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track user logout
CREATE OR REPLACE FUNCTION track_user_logout(
  p_user_id UUID,
  p_session_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- End session(s)
  IF p_session_id IS NOT NULL THEN
    UPDATE user_sessions 
    SET is_active = false, logout_at = now()
    WHERE id = p_session_id AND user_id = p_user_id;
  ELSE
    UPDATE user_sessions 
    SET is_active = false, logout_at = now()
    WHERE user_id = p_user_id AND is_active = true;
  END IF;
  
  -- Log the logout activity
  INSERT INTO user_activity_logs (
    user_id, action, details
  ) VALUES (
    p_user_id, 'LOGOUT',
    jsonb_build_object('session_id', p_session_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;