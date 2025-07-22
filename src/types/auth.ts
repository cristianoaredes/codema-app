import { User, Session } from '@supabase/supabase-js';

export type UserRole = 
  | 'citizen' 
  | 'admin' 
  | 'moderator' 
  | 'conselheiro_titular' 
  | 'conselheiro_suplente' 
  | 'secretario' 
  | 'presidente';

// Tipos para Remember Me
export interface RememberMeSettings {
  enabled: boolean;
  expiresAt: string;
  deviceId: string;
  lastUsed: string;
}

export interface PersistentSession {
  userId: string;
  deviceId: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  lastUsed: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  deactivation_reason?: string | null;
  deactivated_at?: string | null;
  deactivated_by?: string | null;
}

export interface AuthContextType {
  // Estado básico
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Helpers de role
  isAdmin: boolean;
  isConselheiro: boolean;
  isSecretario: boolean;
  isPresidente: boolean;
  isModerator: boolean;
  isCitizen: boolean;
  isActive: boolean;
  
  // Helpers de permissão
  hasAdminAccess: boolean;
  hasCODEMAAccess: boolean;
  hasPermission: (permission: string) => boolean;
  
  // Ações
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: {
    fullName?: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
  }) => Promise<{ error: string | null }>;
  clearError: () => void;
  
  // Remember Me
  rememberMeEnabled: boolean;
  setRememberMe: (enabled: boolean) => void;
  getPersistentSessions: () => Promise<PersistentSession[]>;
  revokePersistentSessionById: (deviceId: string) => Promise<{ error: string | null }>;
  revokeAllUserSessions: () => Promise<{ error: string | null }>;
  checkPersistentLogin: () => Promise<boolean>;
}