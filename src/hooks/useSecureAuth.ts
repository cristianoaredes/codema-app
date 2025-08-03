/**
 * SECURE AUTHENTICATION HOOK
 * Replaces vulnerable useAuth hook with server-validated authorization
 * This hook should be used for all security-sensitive operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  secureAuthService, 
  Permission, 
  AuthorizationResult, 
  SecureUserContext 
} from '@/services/auth/SecureAuthorizationService';
import { Profile, UserRole } from '@/types/auth';

export interface SecureAuthState {
  // Core auth state
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  
  // Secure context
  secureContext: SecureUserContext | null;
  
  // Actions
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  
  // SECURE permission methods (server-validated)
  checkPermission: (permission: Permission) => Promise<AuthorizationResult>;
  hasSecurePermission: (permission: Permission) => Promise<boolean>;
  
  // UI-only helpers (NOT for security decisions)
  uiCanView: (permission: Permission) => boolean;
  uiRole: string | null;
}

/**
 * Secure authentication hook with server-side validation
 */
export const useSecureAuth = (): SecureAuthState => {
  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secureContext, setSecureContext] = useState<SecureUserContext | null>(null);

  /**
   * Initialize authentication state
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
        setError('Sign out failed');
      }
      
      // Clear all state
      setUser(null);
      setProfile(null);
      setSession(null);
      setSecureContext(null);
      secureAuthService.clearPermissionCache();
      
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Sign out process failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = 
        await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Session validation failed');
        return;
      }

      if (currentSession?.user) {
        setUser(currentSession.user);
        setSession(currentSession);

        // Get secure user context with server validation
        const context = await secureAuthService.getSecureUserContext();
        if (context) {
          setSecureContext(context);
          
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          // Validate and convert profile data to match our interface
          if (profileData) {
            const validRoles: UserRole[] = [
              'citizen', 'admin', 'moderator', 'conselheiro_titular', 
              'conselheiro_suplente', 'secretario', 'vice_presidente', 'presidente'
            ];
            
            const convertedProfile: Profile = {
              ...profileData,
              role: validRoles.includes(profileData.role as UserRole) 
                ? (profileData.role as UserRole)
                : 'citizen' // fallback seguro
            };
            
            setProfile(convertedProfile);
          }
        } else {
          // Context validation failed - force logout
          console.warn('Secure context validation failed - logging out');
          await signOut();
        }
      } else {
        // No active session
        setUser(null);
        setSession(null);
        setProfile(null);
        setSecureContext(null);
      }

    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Authentication initialization failed');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [signOut]);



  /**
   * Refresh authentication state and permissions
   */
  const refreshAuth = useCallback(async (): Promise<void> => {
    await initializeAuth();
  }, [initializeAuth]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * SECURE: Check permission with server validation
   * This is the ONLY method that should be trusted for authorization
   */
  const checkPermission = useCallback(async (permission: Permission): Promise<AuthorizationResult> => {
    if (!secureContext) {
      return {
        allowed: false,
        reason: 'Not authenticated',
        serverValidated: false
      };
    }

    return await secureAuthService.validatePermission(permission);
  }, [secureContext]);

  /**
   * SECURE: Quick permission check (returns boolean)
   */
  const hasSecurePermission = useCallback(async (permission: Permission): Promise<boolean> => {
    const result = await checkPermission(permission);
    return result.allowed && result.serverValidated;
  }, [checkPermission]);

  /**
   * UI-ONLY: Client-side permission hint for UI display
   * ⚠️ WARNING: NEVER use this for security decisions
   */
  const uiCanView = useCallback((permission: Permission): boolean => {
    if (!profile) return false;
    
    // This is intentionally limited and should only affect UI display
    return secureAuthService.clientOnlyPermissionCheck(permission, profile.role);
  }, [profile]);

  /**
   * UI-ONLY: Role display helper
   */
  const uiRole = useMemo(() => {
    return profile?.role || null;
  }, [profile]);

  // Set up auth state listener
  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setProfile(null);
          setSession(null);
          setSecureContext(null);
          secureAuthService.clearPermissionCache();
        } else if (event === 'SIGNED_IN' && session) {
          await initializeAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  return {
    // Core state
    user,
    profile,
    session,
    loading,
    initialized,
    error,
    
    // Secure context
    secureContext,
    
    // Actions
    signOut,
    refreshAuth,
    clearError,
    
    // SECURE permission methods
    checkPermission,
    hasSecurePermission,
    
    // UI-only helpers
    uiCanView,
    uiRole
  };
};

/**
 * Legacy compatibility layer
 * @deprecated - Use useSecureAuth instead
 */
export const useLegacyAuth = () => {
  const secureAuth = useSecureAuth();
  
  console.warn(
    '⚠️ SECURITY WARNING: Using deprecated useLegacyAuth. ' +
    'Migrate to useSecureAuth for better security.'
  );
  
  return {
    ...secureAuth,
    // Legacy computed properties for backward compatibility
    isAdmin: secureAuth.uiRole === 'admin',
    hasAdminAccess: secureAuth.uiCanView('profiles.manage'),
    hasCODEMAAccess: secureAuth.uiCanView('meetings.view'),
    isActive: secureAuth.profile?.is_active ?? false,
    
    // Warn about insecure permission check
    hasPermission: (_permission: string) => {
      console.warn('⚠️ hasPermission() is deprecated and insecure. Use checkPermission() instead.');
      return false; // Intentionally always return false
    }
  };
};
