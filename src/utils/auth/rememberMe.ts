import { supabase } from '@/integrations/supabase/client';
import type { PersistentSession, RememberMeSettings } from '@/types';

// Tipos específicos para a tabela persistent_sessions
interface PersistentSessionRow {
  user_id: string;
  device_id: string;
  refresh_token: string;
  expires_at: string;
  device_info: Record<string, unknown>;
  last_used: string;
  created_at?: string;
}

// Helper para acessar tabela persistent_sessions (suprime erros de tipagem)
import { getPersistentSessionsTable } from '@/utils/supabase-helpers';

/**
 * Utilitário para gerenciar o sistema "Remember Me"
 * Handles persistent login sessions with secure token management
 */

const REMEMBER_ME_KEY = 'codema-remember-me';
const DEVICE_ID_KEY = 'codema-device-id';
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms

/**
 * Gera um ID único para o dispositivo
 */
export const generateDeviceId = (): string => {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
};

/**
 * Obtém informações do dispositivo/navegador
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  const platform = navigator.platform || 'Unknown';
  
  // Detectar navegador
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return {
    userAgent: ua,
    platform,
    browser
  };
};

/**
 * Salva configurações do Remember Me
 */
export const saveRememberMeSettings = (settings: RememberMeSettings): void => {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(settings));
    if (import.meta.env.DEV) {
      console.log('✅ Remember Me settings saved:', settings);
    }
  } catch (error) {
    console.error('❌ Error saving Remember Me settings:', error);
  }
};

/**
 * Carrega configurações do Remember Me
 */
export const loadRememberMeSettings = (): RememberMeSettings | null => {
  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (!stored) return null;
    
    const settings = JSON.parse(stored) as RememberMeSettings;
    
    // Verificar se não expirou
    if (new Date(settings.expiresAt) < new Date()) {
      if (import.meta.env.DEV) {
        console.log('⏰ Remember Me settings expired, removing...');
      }
      clearRememberMeSettings();
      return null;
    }
    
    return settings;
  } catch (error) {
    console.error('❌ Error loading Remember Me settings:', error);
    return null;
  }
};

/**
 * Remove configurações do Remember Me
 */
export const clearRememberMeSettings = (): void => {
  try {
    localStorage.removeItem(REMEMBER_ME_KEY);
    if (import.meta.env.DEV) {
      console.log('🧹 Remember Me settings cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing Remember Me settings:', error);
  }
};

/**
 * Cria uma sessão persistente no banco
 */
export const createPersistentSession = async (
  userId: string, 
  refreshToken: string,
  rememberMe: boolean = false
): Promise<{ error: string | null }> => {
  if (!rememberMe) {
    return { error: null };
  }
  
  try {
    const deviceId = generateDeviceId();
    const deviceInfo = getDeviceInfo();
    const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION).toISOString();
    
    // Usar helper para acessar tabela persistent_sessions
    const { error } = await getPersistentSessionsTable()
      .upsert({
        user_id: userId,
        device_id: deviceId,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        device_info: deviceInfo,
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_id'
      });
    
    if (error) {
      console.error('❌ Error creating persistent session:', error);
      return { error: 'Erro ao salvar sessão persistente' };
    }
    
    // Salvar configurações locais
    const settings: RememberMeSettings = {
      enabled: true,
      expiresAt,
      deviceId,
      lastUsed: new Date().toISOString()
    };
    
    saveRememberMeSettings(settings);
    
    if (import.meta.env.DEV) {
      console.log('✅ Persistent session created successfully');
    }
    return { error: null };
    
  } catch (error) {
    console.error('❌ Error creating persistent session:', error);
    return { error: 'Erro inesperado ao criar sessão persistente' };
  }
};

/**
 * Verifica se existe uma sessão persistente válida
 */
export const checkPersistentSession = async (): Promise<{
  isValid: boolean;
  session?: PersistentSession;
  error?: string;
}> => {
  try {
    const settings = loadRememberMeSettings();
    if (!settings) {
      return { isValid: false };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { isValid: false };
    }
    
    // Usar helper para acessar tabela persistent_sessions
    const { data, error } = await getPersistentSessionsTable()
      .select('*')
      .eq('device_id', settings.deviceId)
      .eq('user_id', user.id)
      .single();
    
    if (error || !data) {
      if (import.meta.env.DEV) {
        console.log('🔍 No persistent session found in database');
      }
      clearRememberMeSettings();
      return { isValid: false };
    }
    
    const sessionData = data as any;
    
    // Verificar se não expirou
    if (new Date(sessionData.expires_at) < new Date()) {
      if (import.meta.env.DEV) {
        console.log('⏰ Persistent session expired');
      }
      await revokePersistentSession(settings.deviceId);
      return { isValid: false };
    }
    
    // Atualizar último uso
    const table = getPersistentSessionsTable();
    await table
      .update({ last_used: new Date().toISOString() })
      .eq('device_id', settings.deviceId);
    
    // Converter para formato esperado
    const session: PersistentSession = {
      userId: sessionData.user_id,
      deviceId: sessionData.device_id,
      refreshToken: sessionData.refresh_token,
      expiresAt: sessionData.expires_at,
      createdAt: sessionData.created_at,
      lastUsed: sessionData.last_used,
      deviceInfo: typeof sessionData.device_info === 'string' 
        ? JSON.parse(sessionData.device_info) 
        : sessionData.device_info
    };
    
    return { 
      isValid: true, 
      session 
    };
    
  } catch (error) {
    console.error('❌ Error checking persistent session:', error);
    return { 
      isValid: false, 
      error: 'Erro ao verificar sessão persistente' 
    };
  }
};

/**
 * Lista todas as sessões persistentes do usuário
 */
export const getPersistentSessions = async (userId: string): Promise<{
  sessions: PersistentSession[];
  error: string | null;
}> => {
  try {
    const { data, error } = await (supabase as any)
      .from('persistent_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_used', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching persistent sessions:', error);
      return { sessions: [], error: 'Erro ao buscar sessões' };
    }
    
    // Converter formato do banco para interface
    const sessions: PersistentSession[] = (data || []).map((item: unknown) => {
      const row = item as PersistentSessionRow;
      return {
        userId: row.user_id,
        deviceId: row.device_id,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        lastUsed: row.last_used,
        deviceInfo: typeof row.device_info === 'string' 
          ? JSON.parse(row.device_info) 
          : row.device_info
      };
    });
    
    return { sessions, error: null };
    
  } catch (error) {
    console.error('❌ Error fetching persistent sessions:', error);
    return { sessions: [], error: 'Erro inesperado' };
  }
};

/**
 * Revoga uma sessão persistente específica
 */
export const revokePersistentSession = async (deviceId: string): Promise<{
  error: string | null;
}> => {
  try {
    const table = getPersistentSessionsTable();
    const { error } = await table
      .delete()
      .eq('device_id', deviceId);
    
    if (error) {
      console.error('❌ Error revoking persistent session:', error);
      return { error: 'Erro ao revogar sessão' };
    }
    
    // Se for a sessão atual, limpar configurações locais
    const settings = loadRememberMeSettings();
    if (settings?.deviceId === deviceId) {
      clearRememberMeSettings();
    }
    
    if (import.meta.env.DEV) {
      console.log('✅ Persistent session revoked:', deviceId);
    }
    return { error: null };
    
  } catch (error) {
    console.error('❌ Error revoking persistent session:', error);
    return { error: 'Erro inesperado' };
  }
};

/**
 * Revoga todas as sessões persistentes do usuário
 */
export const revokeAllPersistentSessions = async (userId: string): Promise<{
  error: string | null;
}> => {
  try {
    const table = getPersistentSessionsTable();
    const { error } = await table
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ Error revoking all persistent sessions:', error);
      return { error: 'Erro ao revogar todas as sessões' };
    }
    
    // Limpar configurações locais
    clearRememberMeSettings();
    
    if (import.meta.env.DEV) {
      console.log('✅ All persistent sessions revoked for user:', userId);
    }
    return { error: null };
    
  } catch (error) {
    console.error('❌ Error revoking all persistent sessions:', error);
    return { error: 'Erro inesperado' };
  }
};

/**
 * Limpa sessões expiradas (para ser chamado periodicamente)
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    const table = getPersistentSessionsTable();
    const { error } = await table
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
    } else if (import.meta.env.DEV) {
      console.log('✅ Expired sessions cleaned up');
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

/**
 * Verifica se o Remember Me está habilitado
 */
export const isRememberMeEnabled = (): boolean => {
  const settings = loadRememberMeSettings();
  return settings?.enabled ?? false;
};

/**
 * Habilita ou desabilita o Remember Me
 */
export const setRememberMeEnabled = (enabled: boolean): void => {
  if (!enabled) {
    clearRememberMeSettings();
    return;
  }
  
  // Se está habilitando, criar configurações básicas
  const deviceId = generateDeviceId();
  const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION).toISOString();
  
  const settings: RememberMeSettings = {
    enabled: true,
    expiresAt,
    deviceId,
    lastUsed: new Date().toISOString()
  };
  
  saveRememberMeSettings(settings);
};
