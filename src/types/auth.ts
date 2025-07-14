import { User, Session } from '@supabase/supabase-js';

export type UserRole = 
  | 'citizen' 
  | 'admin' 
  | 'moderator' 
  | 'conselheiro_titular' 
  | 'conselheiro_suplente' 
  | 'secretario' 
  | 'presidente';

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
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isConselheiro: boolean;
  isSecretario: boolean;
  isPresidente: boolean;
  hasAdminAccess: boolean;
  hasCODEMAAccess: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}