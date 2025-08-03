import { UserRole } from '@/types';

// Regex para validação de formato de email genérico
const GENERIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida um email com base no formato e, opcionalmente, em regras de domínio por perfil.
 * 
 * @param email - O email a ser validado.
 * @param role - O perfil do usuário, para aplicar regras específicas (opcional).
 * @returns Um objeto com { isValid: boolean, error?: string, suggestions?: string[] }
 */
export const validateEmailForRole = (email: string, role?: UserRole): { 
  isValid: boolean; 
  error?: string; 
  suggestions?: string[]; 
} => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  // 1. Validação de formato básico
  if (!GENERIC_EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // 2. Regras específicas por perfil (exemplo futuro)
  // Aqui poderiam entrar lógicas como:
  // - Verificar se o domínio do email corresponde a um domínio institucional esperado para admins.
  // - Bloquear domínios de email temporários.
  
  if (role === 'admin' || role === 'presidente' || role === 'secretario') {
    // Exemplo: poderia exigir um domínio @gov.br, mas por enquanto vamos manter genérico.
    // if (!email.endsWith('.gov.br')) {
    //   return { isValid: false, error: 'Perfis de gestão devem usar um email institucional.' };
    // }
  }

  // Se todas as validações passaram
  return { isValid: true };
};

/**
 * Sugere domínios de email com base no perfil (exemplo futuro).
 */
export const getSuggestedDomainsForRole = (_role: UserRole): string[] => {
  // Lógica de sugestão pode ser implementada aqui.
  // Por enquanto, retorna um array vazio.
  return [];
};