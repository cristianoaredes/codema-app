import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/auth/AuthService';
import type { Profile, AuthContextType, PersistentSession } from '@/types';
import {
  isRememberMeEnabled,
  setRememberMeEnabled,
  checkPersistentSession,
  revokePersistentSession,
  revokeAllPersistentSessions
} from '@/utils';

// Contexto de autenticação
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook principal para usar autenticação
 * Centraliza toda a lógica de auth em um só lugar
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook que implementa toda a lógica de estado de autenticação
 * Versão melhorada com melhor tratamento de erros e sincronização
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [rememberMeEnabled, setRememberMeEnabledState] = useState(false);

  // Permission helpers baseados no perfil
  const isAdmin = profile?.role === 'admin';
  const isConselheiro = profile?.role === 'conselheiro_titular' || profile?.role === 'conselheiro_suplente';
  const isSecretario = profile?.role === 'secretario';
  const isVicePresidente = profile?.role === 'vice_presidente';
  const isActingPresident = profile?.role === 'vice_presidente' && profile?.is_acting_president === true;
  const isPresidente = profile?.role === 'presidente';
  const isModerator = profile?.role === 'moderator';
  const isCitizen = profile?.role === 'citizen';
  
  // Combined permissions
  const hasAdminAccess = isAdmin || isSecretario || isActingPresident || isPresidente;
  const hasCODEMAAccess = hasAdminAccess || isConselheiro || isVicePresidente || isModerator;
  const isActive = profile?.is_active ?? true;

  /**
   * Busca perfil do usuário com cache e tratamento de erro
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      setError(null);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Erro ao carregar perfil do usuário');
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Erro inesperado ao carregar perfil');
      return null;
    }
  }, []);

  /**
   * Recarrega perfil do usuário atual
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn('Tentativa de refresh profile sem usuário logado');
      return;
    }

    try {
      setLoading(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile]);

  /**
   * Faz logout com limpeza completa do estado
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar AuthService para logout consistente
      const { error: signOutError } = await authService.signOut();
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        setError(signOutError);
        return;
      }

      // Limpar estado local
      setUser(null);
      setProfile(null);
      setSession(null);
      setError(null);
      
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifica se usuário tem permissão específica
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!profile || !isActive) return false;

    // Mapeamento de permissões por role
    const permissions: Record<string, string[]> = {
      admin: ['*'], // Todas as permissões
      presidente: ['codema.*', 'reunioes.*', 'atas.*', 'resolucoes.*', 'conselheiros.*'],
      secretario: ['codema.*', 'reunioes.*', 'atas.*', 'resolucoes.*', 'conselheiros.*'],
      vice_presidente: ['codema.*', 'reunioes.*', 'atas.*', 'resolucoes.*', 'conselheiros.*'],
      conselheiro_titular: ['codema.read', 'reunioes.read', 'atas.read', 'resolucoes.read'],
      conselheiro_suplente: ['codema.read', 'reunioes.read', 'atas.read', 'resolucoes.read'],
      moderator: ['reports.*', 'users.read'],
      citizen: ['reports.create', 'reports.read.own', 'profile.*']
    };
    
    const userPermissions = permissions[profile.role] || [];
    return userPermissions.includes('*') || 
           userPermissions.includes(permission) ||
           userPermissions.some(p => p.endsWith('*') && permission.startsWith(p.slice(0, -1)));
  }, [profile, isActive]);

  /**
   * Atualiza perfil do usuário
   */
  const updateProfile = useCallback(async (data: {
    fullName?: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
  }): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.updateProfile(user.id, {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        neighborhood: data.neighborhood
      });

      if (result.error) {
        setError(result.error);
        return result;
      }

      // Recarregar perfil após atualização
      await refreshProfile();
      return { error: null };
      
    } catch (error) {
      const errorMsg = 'Erro inesperado ao atualizar perfil';
      console.error('Error updating profile:', error);
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user, refreshProfile]);

  /**
   * Limpa erro atual
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Define se o Remember Me está habilitado
   */
  const setRememberMe = useCallback((enabled: boolean): void => {
    setRememberMeEnabledState(enabled);
    setRememberMeEnabled(enabled);
    if (import.meta.env.DEV) {
      console.log(`🔐 Remember Me ${enabled ? 'habilitado' : 'desabilitado'}`);
    }
  }, []);

  /**
   * Lista sessões persistentes do usuário
   */
  const getPersistentSessions = useCallback(async (): Promise<PersistentSession[]> => {
    if (!user) {
      console.warn('Tentativa de buscar sessões sem usuário logado');
      return [];
    }

    try {
      // Buscar sessões persistentes do usuário no banco
      const { data, error } = await supabase
        .from('persistent_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_used', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sessões persistentes:', error);
        return [];
      }

      // Mapear dados do banco para o formato PersistentSession
      return (data || []).map((session: any) => ({
        userId: session.user_id,
        deviceId: session.device_id,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        createdAt: session.created_at,
        lastUsed: session.last_used,
        deviceInfo: {
          userAgent: session.device_info?.userAgent || '',
          platform: session.device_info?.platform || '',
          browser: session.device_info?.browser || ''
        }
      }));
    } catch (error) {
      console.error('Erro inesperado ao buscar sessões persistentes:', error);
      return [];
    }
  }, [user]);

  /**
   * Revoga uma sessão persistente específica
   */
  const revokePersistentSessionById = useCallback(async (deviceId: string): Promise<{ error: string | null }> => {
    try {
      const result = await revokePersistentSession(deviceId);
      if (import.meta.env.DEV) {
        console.log('✅ Sessão persistente revogada');
      }
      return result;
    } catch (error) {
      console.error('Erro ao revogar sessão:', error);
      return { error: 'Erro ao revogar sessão' };
    }
  }, []);

  /**
   * Revoga todas as sessões persistentes do usuário
   */
  const revokeAllUserSessions = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      // Para revogar todas as sessões, precisamos do userId
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }
      
      await revokeAllPersistentSessions(user.id);
      setRememberMeEnabledState(false);
      if (import.meta.env.DEV) {
        console.log('✅ Todas as sessões persistentes revogadas');
      }
      return { error: null };
    } catch (error) {
      console.error('Erro ao revogar todas as sessões:', error);
      return { error: 'Erro ao revogar sessões' };
    }
  }, [user]);

  /**
   * Verifica se existe login persistente válido
   */
  const checkPersistentLogin = useCallback(async (): Promise<boolean> => {
    try {
      const result = await checkPersistentSession();
      return result.isValid;
    } catch (error) {
      console.error('Erro ao verificar login persistente:', error);
      return false;
    }
  }, []);

  /**
   * Maneja mudanças no estado de autenticação
   */
  const handleAuthStateChange = useCallback(async (event: string, newSession: Session | null) => {
    if (import.meta.env.DEV) {
      console.log('🔄 Auth state changed:', event, newSession?.user?.email || 'No user');
    }
    
    try {
      setError(null);
      
      // Atualizar estado básico
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Buscar perfil se usuário logado
      if (newSession?.user) {
        const profileData = await fetchProfile(newSession.user.id);
        setProfile(profileData);
        
        // Verificar se conta está ativa
        if (profileData && !profileData.is_active) {
          setError('Sua conta foi desativada. Entre em contato com o administrador.');
        }
      } else {
        setProfile(null);
      }
      
    } catch (error) {
      console.error('Error handling auth state change:', error);
      setError('Erro ao processar mudança de autenticação');
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  /**
   * Inicialização do hook
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Inicializa o estado do Remember Me
        const rememberMeState = isRememberMeEnabled();
        setRememberMeEnabledState(rememberMeState);
        if (import.meta.env.DEV) {
          console.log(`🔐 Remember Me inicializado: ${rememberMeState ? 'habilitado' : 'desabilitado'}`);
        }

        // Verifica se existe sessão persistente válida
        if (rememberMeState) {
          try {
            const result = await checkPersistentSession();
            if (result.isValid) {
              console.log('✅ Sessão persistente válida encontrada');
            }
          } catch (error) {
            console.error('Erro ao verificar sessão persistente:', error);
          }
        }

        // Obtém a sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Buscar perfil do usuário
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (!profileError && profileData) {
              setProfile(profileData as Profile);
            }
          } catch (error) {
            console.error('Erro ao buscar perfil:', error);
          }
        } else {
          // Importante: definir explicitamente como null quando não há sessão
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setError('Erro ao inicializar autenticação');
      } finally {
        // SEMPRE definir loading como false, independente do resultado
        setLoading(false);
        setInitialized(true);
      }
    };

    // Chamar initializeAuth apenas uma vez
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized]); // Dependência mínima apenas para controle

  // Escutar mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (initialized) {
          await handleAuthStateChange(event, session);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, initialized]);

  return {
    // Estado básico
    user,
    profile,
    session,
    loading,
    error,
    initialized,
    
    // Helpers de role
    isAdmin,
    isConselheiro,
    isSecretario,
    isVicePresidente,
    isActingPresident,
    isPresidente,
    isModerator,
    isCitizen,
    isActive,
    
    // Helpers de permissão
    hasAdminAccess,
    hasCODEMAAccess,
    hasPermission,
    
    // Ações
    signOut,
    refreshProfile,
    updateProfile,
    clearError,
    
    // Remember Me
    rememberMeEnabled,
    setRememberMe,
    getPersistentSessions,
    revokePersistentSessionById,
    revokeAllUserSessions,
    checkPersistentLogin,
  };
};