-- ========================================
-- FIX PROFILES RLS RECURSION
-- Resolve infinite recursion in profiles table policies
-- ========================================

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own basic info" ON profiles;
DROP POLICY IF EXISTS "Only admins can change user roles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "CODEMA members can view member profiles" ON profiles;

-- Create safe policies that don't reference profiles table in the condition
-- Users can always view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- For admin functions, we'll use a different approach
-- Create a secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    WHERE u.id = user_id
    AND u.raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Admin policies using the secure function
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can insert profiles" ON profiles
FOR INSERT WITH CHECK (is_admin_user());

CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE USING (is_admin_user());

CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (is_admin_user());

-- Public profiles policy for CODEMA members
-- Allow authenticated users to view profiles of active CODEMA members
CREATE POLICY "Authenticated users can view active CODEMA member profiles" ON profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  is_active = true AND
  role IN ('conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'vice_presidente')
);

-- Update the is_admin_user function to also check the profiles table safely
-- using a non-recursive approach
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- First check auth.users metadata
  SELECT COALESCE(
    (SELECT u.raw_user_meta_data->>'role' = 'admin' 
     FROM auth.users u 
     WHERE u.id = user_id),
    -- Fallback: direct check without RLS (security definer allows this)
    (SELECT role = 'admin' AND is_active = true
     FROM profiles 
     WHERE id = user_id)
  );
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated, anon;

-- Comments for documentation
COMMENT ON FUNCTION is_admin_user IS 'Safely checks if user is admin without causing RLS recursion';
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Non-recursive policy for users to view their own profile';
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Uses secure function to avoid RLS recursion';
