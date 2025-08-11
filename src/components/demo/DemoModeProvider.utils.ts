import * as React from "react";
import { useAuth } from "@/hooks/useAuth";

export interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
  simulateRole: (role: string) => void;
  simulatedRole: string | null;
}

export const DemoModeContext = React.createContext<DemoModeContextType | undefined>(undefined);

export const availableRoles = [
  { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
  { value: 'presidente', label: 'Presidente', description: 'Preside reuniões e tem voto de qualidade' },
  { value: 'secretario', label: 'Secretário', description: 'Gerencia documentação e atas' },
  { value: 'conselheiro_titular', label: 'Conselheiro Titular', description: 'Participa e vota nas reuniões' },
  { value: 'conselheiro_suplente', label: 'Conselheiro Suplente', description: 'Substitui titulares quando necessário' },
  { value: 'citizen', label: 'Cidadão', description: 'Acesso público básico' },
];

// Hook to use demo mode context
export function useDemoMode() {
  const context = React.useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

// Hook to get effective role (considering demo mode)
export function useEffectiveRole() {
  const { simulatedRole } = useDemoMode();
  const { profile } = useAuth();
  
  return simulatedRole || profile?.role || 'citizen';
}

// Hook to check if user has access in demo mode
export function useEffectivePermissions() {
  const effectiveRole = useEffectiveRole();
  const { isDemoMode } = useDemoMode();
  
  const hasAdminAccess = effectiveRole === 'admin' || (isDemoMode && effectiveRole === 'admin');
  const hasCODEMAAccess = ['conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'admin'].includes(effectiveRole);
  
  return {
    hasAdminAccess,
    hasCODEMAAccess,
    effectiveRole
  };
}