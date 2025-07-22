import { supabase } from '@/integrations/supabase/client';
import { UserRole, Profile } from '@/types';
import { logAction } from '@/utils';
import { EmailService } from './emailService';

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  neighborhood?: string;
  send_invitation?: boolean;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  message?: string;
}

export interface UserManagementResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export class UserManagementService {
  
  /**
   * Create a new user account (admin only)
   */
  static async createUser(request: CreateUserRequest): Promise<UserManagementResponse> {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            full_name: request.full_name,
            phone: request.phone,
            address: request.address,
            neighborhood: request.neighborhood
          }
        }
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Falha ao criar usuário'
        };
      }

      // Update user profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: request.role,
          full_name: request.full_name,
          phone: request.phone,
          address: request.address,
          neighborhood: request.neighborhood,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (profileError) {
        return {
          success: false,
          error: 'Erro ao atualizar perfil do usuário'
        };
      }

      // Log action
      await logAction('CREATE_USER', 'user', authData.user.id, {
        email: request.email,
        role: request.role,
        full_name: request.full_name
      });

      return {
        success: true,
        data: {
          user: authData.user,
          profile: {
            id: authData.user.id,
            email: request.email,
            full_name: request.full_name,
            role: request.role,
            phone: request.phone,
            address: request.address,
            neighborhood: request.neighborhood
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Invite a new user via email
   */
  static async inviteUser(request: InviteUserRequest): Promise<UserManagementResponse> {
    try {
      // Generate a secure invitation token
      const invitationToken = crypto.randomUUID();
      
      // Store invitation in database
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: request.email,
          role: request.role,
          full_name: request.full_name,
          phone: request.phone,
          address: request.address,
          neighborhood: request.neighborhood,
          invitation_token: invitationToken,
          message: request.message,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (inviteError) {
        return {
          success: false,
          error: 'Erro ao criar convite'
        };
      }

      // Send invitation email
      await EmailService.sendInvitation(
        request.email,
        request.full_name,
        request.role,
        invitationToken,
        request.message
      );

      // Log action
      await logAction('INVITE_USER', 'invitation', invitationToken, {
        email: request.email,
        role: request.role,
        full_name: request.full_name
      });

      return {
        success: true,
        data: {
          invitation_token: invitationToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Activate or deactivate a user account
   */
  static async toggleUserStatus(
    userId: string, 
    isActive: boolean, 
    reason?: string
  ): Promise<UserManagementResponse> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: isActive,
          deactivation_reason: isActive ? null : reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: 'Erro ao atualizar status do usuário'
        };
      }

      // Get user profile for email notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      // Send email notification
      if (profile?.email) {
        await EmailService.sendStatusChangeNotification(
          profile.email,
          profile.full_name || 'Usuário',
          isActive,
          reason
        );
      }

      // Log action
      await logAction(
        isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        'user',
        userId,
        { reason }
      );

      return {
        success: true,
        data: { userId, isActive, reason }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Reset user password (admin only)
   */
  static async resetUserPassword(
    userId: string, 
    newPassword: string
  ): Promise<UserManagementResponse> {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (!profile?.email) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Update password using Supabase Admin API
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          error: 'Erro ao redefinir senha'
        };
      }

      // Send email notification
      await EmailService.sendPasswordResetNotification(
        profile.email,
        profile.full_name || 'Usuário',
        newPassword
      );

      // Log action
      await logAction('RESET_PASSWORD', 'user', userId, {
        email: profile.email
      });

      return {
        success: true,
        data: { userId }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserManagementResponse> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role, is_active, created_at');

      if (error) {
        return {
          success: false,
          error: 'Erro ao buscar estatísticas'
        };
      }

      const stats = {
        total: profiles.length,
        active: profiles.filter(p => p.is_active !== false).length,
        inactive: profiles.filter(p => p.is_active === false).length,
        by_role: profiles.reduce((acc, profile) => {
          acc[profile.role] = (acc[profile.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recent_registrations: profiles.filter(p => 
          new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }
}