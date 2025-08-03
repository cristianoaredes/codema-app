/**
 * SECURE AUTHORIZATION SERVICE
 * Replaces client-side-only authorization with server-validated permissions
 * Addresses critical security vulnerabilities in the frontend
 */

import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export type Permission = 
  | 'profiles.manage'
  | 'profiles.view'
  | 'meetings.manage'
  | 'meetings.view'
  | 'documents.manage'
  | 'documents.view'
  | 'resolutions.manage'
  | 'resolutions.view'
  | 'audit.view'
  | 'users.invite'
  | 'delegation.manage';

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  serverValidated: boolean;
}

export interface SecureUserContext {
  user_id: string;
  role: string;
  is_active: boolean;
  is_acting_president?: boolean;
  permissions: Permission[];
}

// Interface para o retorno de funções RPC do Supabase
interface RPCResponse {
  success: boolean;
  error?: string;
}

// Type guard para validar RPCResponse
function isRPCResponse(data: unknown): data is RPCResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as Record<string, unknown>).success === 'boolean'
  );
}

class SecureAuthorizationService {
  private permissionCache = new Map<string, { result: AuthorizationResult; expires: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * CRITICAL: Server-side permission validation
   * This is the ONLY method that should be trusted for authorization decisions
   */
  async validatePermission(permission: Permission): Promise<AuthorizationResult> {
    try {
      // Check cache first (short TTL for security)
      const cacheKey = `${permission}_${Date.now()}`;
      const cached = this.permissionCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.result;
      }

      // Call server-side RPC function for validation
      const { data, error } = await supabase.rpc('has_permission', {
        permission_name: permission
      });

      if (error) {
        console.error('Permission validation error:', error);
        return {
          allowed: false,
          reason: 'Server validation failed',
          serverValidated: false
        };
      }

      const result: AuthorizationResult = {
        allowed: Boolean(data),
        serverValidated: true
      };

      // Cache the result with short TTL
      this.permissionCache.set(cacheKey, {
        result,
        expires: Date.now() + this.CACHE_TTL
      });

      return result;

    } catch (error) {
      console.error('Critical: Permission validation failed:', error);
      return {
        allowed: false,
        reason: 'Validation system error',
        serverValidated: false
      };
    }
  }

  /**
   * Secure user context retrieval with server validation
   */
  async getSecureUserContext(): Promise<SecureUserContext | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }

      // Get fresh profile data from server
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError);
        return null;
      }

      // Validate user is active
      if (!profile.is_active) {
        console.warn('User account is inactive');
        return null;
      }

      // Get server-validated permissions
      const permissions = await this.getUserPermissions(profile.role, user.id);

      return {
        user_id: user.id,
        role: profile.role,
        is_active: profile.is_active,
        is_acting_president: profile.is_acting_president,
        permissions
      };

    } catch (error) {
      console.error('Failed to get secure user context:', error);
      return null;
    }
  }

  /**
   * Get user permissions based on role with server validation
   */
  private async getUserPermissions(role: string, _userId: string): Promise<Permission[]> {
    const permissions: Permission[] = [];
    
    // Define permission sets by role
    const rolePermissions: Record<string, Permission[]> = {
      admin: [
        'profiles.manage', 'profiles.view', 'meetings.manage', 'meetings.view',
        'documents.manage', 'documents.view', 'resolutions.manage', 'resolutions.view',
        'audit.view', 'users.invite', 'delegation.manage'
      ],
      presidente: [
        'meetings.manage', 'meetings.view', 'documents.manage', 'documents.view',
        'resolutions.manage', 'resolutions.view', 'users.invite', 'delegation.manage'
      ],
      secretario: [
        'meetings.manage', 'meetings.view', 'documents.manage', 'documents.view',
        'resolutions.manage', 'resolutions.view'
      ],
      vice_presidente: [
        'meetings.view', 'documents.view', 'resolutions.view'
      ],
      conselheiro_titular: [
        'meetings.view', 'documents.view', 'resolutions.view'
      ],
      conselheiro_suplente: [
        'meetings.view', 'documents.view', 'resolutions.view'
      ],
      moderator: [
        'documents.view', 'profiles.view'
      ],
      citizen: [
        'documents.view'
      ]
    };

    const basePermissions = rolePermissions[role] || [];

    // Server-validate each permission
    for (const permission of basePermissions) {
      const result = await this.validatePermission(permission);
      if (result.allowed && result.serverValidated) {
        permissions.push(permission);
      }
    }

    return permissions;
  }

  /**
   * Secure role update with server-side validation and audit logging
   */
  async secureUpdateUserRole(
    targetUserId: string,
    newRole: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First validate current user has permission
      const adminCheck = await this.validatePermission('profiles.manage');
      if (!adminCheck.allowed) {
        return {
          success: false,
          error: 'Unauthorized: You do not have permission to change user roles'
        };
      }

      // Use secure RPC function that validates permissions server-side
      const { data, error } = await supabase.rpc('secure_update_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
        reason: reason || 'Admin role change'
      });

      if (error) {
        console.error('Secure role update failed:', error);
        return {
          success: false,
          error: error.message || 'Failed to update user role'
        };
      }

      // Validate and convert RPC response safely
      if (!isRPCResponse(data) || !data.success) {
        return {
          success: false,
          error: isRPCResponse(data) ? data.error || 'Server rejected role update' : 'Invalid server response'
        };
      }

      // Clear permission cache to force refresh
      this.clearPermissionCache();

      return { success: true };

    } catch (error) {
      console.error('Critical error in secure role update:', error);
      return {
        success: false,
        error: 'System error during role update'
      };
    }
  }

  /**
   * Secure delegation management
   */
  async delegatePresidency(
    vicePresidentId: string,
    expiresAt: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const delegationCheck = await this.validatePermission('delegation.manage');
      if (!delegationCheck.allowed) {
        return {
          success: false,
          error: 'Unauthorized: Only presidents can delegate authority'
        };
      }

      // Get current user (president) ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: 'Unable to identify current user'
        };
      }

      const { data: _data, error } = await supabase
        .from('presidency_delegations')
        .insert({
          president_id: user.id,              // Campo obrigatório: quem está delegando
          vice_president_id: vicePresidentId, // Para quem está delegando
          expires_at: expiresAt.toISOString(),
          delegated_at: new Date().toISOString() // Quando foi delegado
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Delegation error:', error);
      return {
        success: false,
        error: 'Failed to create delegation'
      };
    }
  }

  /**
   * Revoke delegation
   */
  async revokeDelegation(delegationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const delegationCheck = await this.validatePermission('delegation.manage');
      if (!delegationCheck.allowed) {
        return {
          success: false,
          error: 'Unauthorized: Only presidents can revoke delegations'
        };
      }

      const { error } = await supabase
        .from('presidency_delegations')
        .update({
          revoked_at: new Date().toISOString()
        })
        .eq('id', delegationId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Revocation error:', error);
      return {
        success: false,
        error: 'Failed to revoke delegation'
      };
    }
  }

  /**
   * Clear permission cache (call after role changes)
   */
  clearPermissionCache(): void {
    this.permissionCache.clear();
  }

  /**
   * DEPRECATED: Client-side permission check
   * Only use for UI display - NEVER for security decisions
   * @deprecated Use validatePermission instead
   */
  clientOnlyPermissionCheck(permission: Permission, userRole?: UserRole): boolean {
    console.warn(
      '⚠️ SECURITY WARNING: Using deprecated client-side permission check. ' +
      'This should only be used for UI display, not security decisions.'
    );
    
    // This is intentionally limited and should not be trusted
    if (!userRole) return false;
    
    // Basic UI hints only - server validation is required
    const uiHints: Record<UserRole, Permission[]> = {
      admin: ['profiles.manage', 'audit.view'],
      presidente: ['meetings.manage', 'delegation.manage'],
      secretario: ['meetings.manage', 'documents.manage'],
      vice_presidente: ['meetings.view'],
      conselheiro_titular: ['meetings.view'],
      conselheiro_suplente: ['meetings.view'],
      moderator: ['documents.view'],
      citizen: ['documents.view']
    };

    return uiHints[userRole]?.includes(permission) || false;
  }
}

export const secureAuthService = new SecureAuthorizationService();
