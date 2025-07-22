import { AuthError, Session, User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole, PersistentSession } from '@/types';
import { canSendEmail, recordEmailAttempt, formatTimeRemaining } from '@/utils';
import {
  createPersistentSession,
  checkPersistentSession,
  getPersistentSessions,
  revokePersistentSession,
  revokeAllPersistentSessions,
  clearRememberMeSettings
} from '@/utils';
import { metricsCollector, measurePerformance } from '@/utils';
import { withAuthRetry, withResilientOperation, authCircuitBreaker } from '@/utils';
import { healthMonitor } from '@/utils';

/**
 * Mapeamento de erros do Supabase para mensagens em português
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos',
  'User already registered': 'Este email já está cadastrado',
  'Email not confirmed': 'Confirme seu email antes de fazer login',
  'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'Unable to validate email address: invalid format': 'Formato de email inválido',
  'User not found': 'Usuário não encontrado',
  'Token has expired or is invalid': 'Token expirado ou inválido',
  'Email rate limit exceeded': '⚠️ Limite de emails excedido! Supabase free tier permite apenas 3 emails por hora. Aguarde 1 hora ou use login com senha.',
  'over_email_send_rate_limit': '⚠️ Limite de emails excedido! Aguarde 1 hora antes de solicitar novos emails.',
};

/**
 * Interface para dados de registro
 */
interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  role?: UserRole;
}

/**
 * Interface para dados de login
 */
interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface para dados de reset de senha
 */
interface ResetPasswordData {
  email: string;
  redirectTo?: string;
}

/**
 * Interface para dados de atualização de perfil
 */
interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
}

/**
 * Interface para resposta de operações de auth
 */
interface AuthOperationResult {
  success: boolean;
  error: string | null;
  data?: User | Profile | Session | null;
}

/**
 * Interface para convite de usuário
 */
interface InviteUserData {
  email: string;
  role: UserRole;
  fullName: string;
  entidadeRepresentada?: string;
}

/**
 * Serviço unificado de autenticação do CODEMA
 * Centraliza todas as operações de autenticação seguindo as melhores práticas do Supabase
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  /**
   * Retorna a instância singleton do AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Converte erro do Supabase em mensagem amigável
   */
  private formatError(error: AuthError): string {
    return AUTH_ERROR_MESSAGES[error.message] || error.message;
  }

  /**
   * Registra evento de auditoria
   */
  private async logAuthEvent(
    action: string,
    userId?: string,
    data?: Record<string, string | number | boolean | null>
  ): Promise<void> {
    try {
      await (supabase as any).from('audit_logs').insert({
        user_id: userId || null,
        action: action,
        entity: 'auth',
        entity_id: userId || 'system',
        details: data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao registrar evento de auditoria:', error);
    }
  }

  /**
   * Verifica a saúde do sistema antes de operações críticas
   */
  private async checkSystemHealth(): Promise<boolean> {
    try {
      const health = await healthMonitor.performFullHealthCheck();
      return health.overall === 'healthy' || health.overall === 'degraded';
    } catch (error) {
      console.warn('⚠️ Health check failed:', error);
      return false; // Assumir sistema não saudável em caso de erro
    }
  }

  /**
   * Faz login com email e senha
   * Integrado com sistema de monitoramento, métricas e retry
   */
  public async signIn(data: LoginData): Promise<{ user: User | null; session: Session | null; error: string | null }> {
    const startTime = Date.now();
    
    // Registrar tentativa de login
    metricsCollector.recordAuthEvent('login.attempt', undefined, {
      email: data.email,
      timestamp: new Date().toISOString()
    });

    try {
      // Verificar saúde do sistema antes de prosseguir
      const systemHealthy = await this.checkSystemHealth();
      if (!systemHealthy) {
        metricsCollector.recordError(
          'System health check failed before login attempt',
          'auth',
          'high',
          { email: data.email }
        );
      }

      // Executar login com retry e circuit breaker
      const result = await withResilientOperation(
        async () => {
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (error) {
            throw new Error(error.message);
          }

          return authData;
        },
        authCircuitBreaker,
        'signIn'
      );

      const responseTime = Date.now() - startTime;
      
      // Registrar sucesso
      metricsCollector.recordAuthEvent('login.success', result.user?.id, {
        email: data.email,
        method: 'email_password',
        responseTime
      });

      // Log de auditoria
      await this.logAuthEvent('login_success', result.user?.id, {
        email: data.email,
        method: 'email_password',
        responseTime
      });

      // Registrar métricas de performance
      metricsCollector.recordMetric('auth.login.response_time', responseTime, {
        status: 'success',
        email: data.email
      }, 'ms');

      return {
        user: result.user,
        session: result.session,
        error: null,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const formattedError = error instanceof Error && error.message in AUTH_ERROR_MESSAGES 
        ? this.formatError(error as AuthError)
        : 'Erro inesperado. Tente novamente.';

      // Registrar falha
      metricsCollector.recordAuthEvent('login.failure', undefined, {
        email: data.email,
        error: errorMessage,
        responseTime
      });

      // Registrar erro no sistema de métricas
      metricsCollector.recordError(
        error instanceof Error ? error : new Error(errorMessage),
        'auth',
        'medium',
        {
          email: data.email,
          operation: 'signIn',
          responseTime
        }
      );

      // Log de auditoria
      await this.logAuthEvent('login_failed', undefined, {
        email: data.email,
        error: errorMessage,
        responseTime
      });

      // Registrar métricas de performance para falhas
      metricsCollector.recordMetric('auth.login.response_time', responseTime, {
        status: 'failure',
        email: data.email,
        error: errorMessage
      }, 'ms');

      console.error('🔐 Login failed:', {
        email: data.email,
        error: errorMessage,
        responseTime
      });

      return {
        user: null,
        session: null,
        error: formattedError,
      };
    }
  }

  /**
   * Registra novo usuário
   */
  public async signUp(data: RegisterData): Promise<{ user: User | null; session: Session | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            address: data.address,
            neighborhood: data.neighborhood,
            role: data.role || 'citizen',
          },
        },
      });

      if (error) {
        await this.logAuthEvent('signup_failed', undefined, {
          email: data.email,
          error: error.message,
        });
        return {
          user: null,
          session: null,
          error: this.formatError(error),
        };
      }

      await this.logAuthEvent('signup_success', authData.user?.id, {
        email: data.email,
        role: data.role || 'citizen',
      });

      return {
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      console.error('Erro inesperado no registro:', error);
      return {
        user: null,
        session: null,
        error: 'Erro inesperado. Tente novamente.',
      };
    }
  }

  /**
   * Envia magic link para email
   */
  public async signInWithMagicLink(email: string): Promise<{ error: string | null }> {
    try {
      // Verificar rate limiting antes de tentar enviar
      const rateLimitStatus = canSendEmail();
      if (!rateLimitStatus.canSend) {
        const timeRemaining = rateLimitStatus.nextAvailableIn 
          ? formatTimeRemaining(rateLimitStatus.nextAvailableIn)
          : '1 hora';
        
        console.warn('⚠️ AuthService: Rate limit atingido');
        console.warn(`📊 Tentativas: ${rateLimitStatus.attemptsUsed}/${rateLimitStatus.maxAttempts}`);
        console.warn(`⏰ Próximo disponível em: ${timeRemaining}`);
        
        return { 
          error: `⚠️ Limite de emails atingido! (${rateLimitStatus.attemptsUsed}/${rateLimitStatus.maxAttempts}) Aguarde ${timeRemaining} ou use login com senha.` 
        };
      }
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('🔗 AuthService: Enviando magic link para:', email);
      console.log('🌐 AuthService: URL de redirecionamento:', redirectUrl);
      console.log(`📊 Rate limit: ${rateLimitStatus.attemptsUsed + 1}/${rateLimitStatus.maxAttempts} tentativas`);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      console.log('📬 AuthService: Resposta do Supabase:', { error });

      if (error) {
        console.error('❌ AuthService: Erro no magic link:', error.message);
        
        // Detecção específica de rate limiting
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          console.warn('⚠️ AuthService: Rate limit detectado - Supabase free tier');
          await this.logAuthEvent('magic_link_rate_limited', undefined, {
            email,
            error: error.message,
          });
          return { 
            error: '⚠️ Limite de emails atingido! O Supabase free tier permite apenas 3 emails por hora. Aguarde 1 hora ou faça login com senha.' 
          };
        }
        
        await this.logAuthEvent('magic_link_failed', undefined, {
          email,
          error: error.message,
        });
        return { error: this.formatError(error) };
      }

      console.log('✅ AuthService: Magic link enviado com sucesso');
      
      // Registrar tentativa para controle de rate limiting
      recordEmailAttempt('magic_link', email);
      
      await this.logAuthEvent('magic_link_sent', undefined, { email });
      return { error: null };
    } catch (error) {
      console.error('💥 AuthService: Erro ao enviar magic link:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  }

  /**
   * Solicita reset de senha
   */
  public async resetPassword(data: ResetPasswordData): Promise<{ error: string | null }> {
    try {
      // Verificar rate limiting antes de tentar enviar
      const rateLimitStatus = canSendEmail();
      if (!rateLimitStatus.canSend) {
        const timeRemaining = rateLimitStatus.nextAvailableIn 
          ? formatTimeRemaining(rateLimitStatus.nextAvailableIn)
          : '1 hora';
        
        console.warn('⚠️ AuthService: Rate limit atingido para password reset');
        return { 
          error: `⚠️ Limite de emails atingido! (${rateLimitStatus.attemptsUsed}/${rateLimitStatus.maxAttempts}) Aguarde ${timeRemaining}.` 
        };
      }
      
      console.log(`📊 Password Reset - Rate limit: ${rateLimitStatus.attemptsUsed + 1}/${rateLimitStatus.maxAttempts} tentativas`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: data.redirectTo || `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        await this.logAuthEvent('password_reset_failed', undefined, {
          email: data.email,
          error: error.message,
        });
        return { error: this.formatError(error) };
      }

      // Registrar tentativa para controle de rate limiting
      recordEmailAttempt('password_reset', data.email);
      
      await this.logAuthEvent('password_reset_sent', undefined, {
        email: data.email,
      });
      return { error: null };
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  }

  /**
   * Atualiza senha do usuário
   */
  public async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        await this.logAuthEvent('password_update_failed', undefined, {
          error: error.message,
        });
        return { error: this.formatError(error) };
      }

      const { data: { user } } = await supabase.auth.getUser();
      await this.logAuthEvent('password_updated', user?.id);
      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  }

  /**
   * Faz logout do usuário com limpeza completa
   */
  public async signOut(): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Logout do Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Mesmo com erro, fazemos limpeza local
        this.performLocalCleanup();
        return { error: this.formatError(error) };
      }

      // 2. Log do evento de logout
      await this.logAuthEvent('logout', user?.id);
      
      // 3. Limpeza completa local
      this.performLocalCleanup();
      
      return { error: null };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, fazemos limpeza local
      this.performLocalCleanup();
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  }

  /**
   * Realiza limpeza completa de dados locais
   */
  private performLocalCleanup(): void {
    try {
      // 1. Limpar localStorage
      const keysToRemove = [
        'supabase.auth.token',
        'supabase.auth.refreshToken',
        'sb-auth-token',
        'user-profile',
        'user-preferences',
        'codema-session',
        'demo-mode'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Erro ao remover localStorage key: ${key}`, e);
        }
      });

      // 2. Limpar sessionStorage
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Erro ao limpar sessionStorage:', e);
      }

      // 3. Limpar cookies relacionados ao auth
      this.clearAuthCookies();

      console.log('✅ Limpeza local completa realizada');
    } catch (error) {
      console.error('Erro durante limpeza local:', error);
    }
  }

  /**
   * Limpa cookies relacionados à autenticação
   */
  private clearAuthCookies(): void {
    try {
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'auth-token',
        'session-id',
        'user-session'
      ];

      cookiesToClear.forEach(cookieName => {
        // Limpar para o domínio atual
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Limpar para subdomínios
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        // Limpar para domínio pai
        const domain = window.location.hostname.split('.').slice(-2).join('.');
        if (domain !== window.location.hostname) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        }
      });

      console.log('🍪 Cookies de autenticação limpos');
    } catch (error) {
      console.error('Erro ao limpar cookies:', error);
    }
  }

  /**
   * Obtém usuário atual
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Obtém sessão atual
   */
  public async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Erro ao obter sessão atual:', error);
      return null;
    }
  }

  /**
   * Obtém perfil do usuário
   */
  public async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }



  /**
   * Atualiza perfil do usuário
   */
  public async updateProfile(userId: string, data: UpdateProfileData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          address: data.address,
          neighborhood: data.neighborhood,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        await this.logAuthEvent('profile_update_failed', userId, {
          error: error.message,
        });
        return { error: 'Erro ao atualizar perfil' };
      }

      await this.logAuthEvent('profile_updated', userId, data as Record<string, string | number | boolean | null>);
      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  }

  /**
   * Convida usuário (apenas para admins)
   */
  public async inviteUser(data: InviteUserData): Promise<{ error: string | null }> {
    try {
      // Verificar se o usuário atual tem permissão para convidar
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }

      const profile = await this.getProfile(user.id);
      if (!profile || !['admin', 'presidente', 'secretario'].includes(profile.role)) {
        return { error: 'Você não tem permissão para convidar usuários' };
      }

      // Implementar lógica de convite via Edge Function
      const { data: response, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: data.email,
          role: data.role,
          fullName: data.fullName,
          entidadeRepresentada: data.entidadeRepresentada,
        },
      });

      if (error) {
        await this.logAuthEvent('invite_failed', user.id, {
          email: data.email,
          role: data.role,
          error: error.message,
        });
        return { error: 'Erro ao enviar convite' };
      }

      await this.logAuthEvent('invite_sent', user.id, {
        email: data.email,
        role: data.role,
      });
      return { error: null };
    } catch (error) {
      console.error('Erro ao convidar usuário:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  public async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      // Mapeamento de permissões por role
      const permissions: Record<UserRole, string[]> = {
        citizen: ['view_public_reports', 'create_report'],
        moderator: ['view_public_reports', 'create_report', 'manage_reports'],
        conselheiro_suplente: ['view_codema_content', 'participate_meetings'],
        conselheiro_titular: ['view_codema_content', 'participate_meetings', 'vote'],
        secretario: ['view_codema_content', 'participate_meetings', 'vote', 'manage_processes', 'manage_fma'],
        vice_presidente: ['view_codema_content', 'participate_meetings', 'vote'],
        presidente: ['view_codema_content', 'participate_meetings', 'vote', 'manage_processes', 'manage_fma', 'manage_users'],
        admin: ['*'], // Todas as permissões
      };

      const userPermissions = permissions[profile.role] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Escuta mudanças no estado de autenticação
   */
  public onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Cria uma sessão persistente (Remember Me)
   */
  public async createPersistentSession(
    userId: string,
    refreshToken: string,
    rememberMe: boolean = false
  ): Promise<{ error: string | null }> {
    return createPersistentSession(userId, refreshToken, rememberMe);
  }

  /**
   * Verifica se existe uma sessão persistente válida
   */
  public async checkPersistentSession(): Promise<{
    isValid: boolean;
    session?: PersistentSession;
    error?: string;
  }> {
    return checkPersistentSession();
  }

  /**
   * Lista todas as sessões persistentes do usuário
   */
  public async getPersistentSessions(userId: string): Promise<{
    sessions: PersistentSession[];
    error: string | null;
  }> {
    return getPersistentSessions(userId);
  }

  /**
   * Revoga uma sessão persistente específica
   */
  public async revokePersistentSession(deviceId: string): Promise<{
    error: string | null;
  }> {
    return revokePersistentSession(deviceId);
  }

  /**
   * Revoga todas as sessões persistentes do usuário
   */
  public async revokeAllPersistentSessions(userId: string): Promise<{
    error: string | null;
  }> {
    return revokeAllPersistentSessions(userId);
  }

  /**
   * Valida se email está em formato correto
   * @deprecated Use validateEmailForRole from @/utils/email instead
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se senha atende aos critérios mínimos
   */
  public validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Exportar instância singleton
export const authService = AuthService.getInstance(); 