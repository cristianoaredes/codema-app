import { UserRole } from '@/types';

export const EMAIL_VALIDATION_PATTERNS = {
  GENERAL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  GOV_BR: /^[^\s@]+@[^\s@]*\.gov\.br$/,
  INSTITUTIONAL: /^[^\s@]+@(itanhomi\.sp\.gov\.br|codema\.itanhomi\.sp\.gov\.br)$/
};

export const ROLES_REQUIRING_GOV_EMAIL: UserRole[] = [
  // Temporarily disabled - accept all domains
];

export const ROLES_REQUIRING_INSTITUTIONAL_EMAIL: UserRole[] = [
  // Temporarily disabled - accept all domains
];

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export function validateEmailForRole(email: string, role: UserRole): EmailValidationResult {
  // Basic email format validation
  if (!EMAIL_VALIDATION_PATTERNS.GENERAL.test(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido'
    };
  }

  // Domain-specific validation temporarily disabled
  // All roles can use any valid email domain
  
  // Check institutional email requirement (disabled)
  // if (ROLES_REQUIRING_INSTITUTIONAL_EMAIL.includes(role)) {
  //   if (!EMAIL_VALIDATION_PATTERNS.INSTITUTIONAL.test(email)) {
  //     return {
  //       isValid: false,
  //       error: 'Administradores devem usar email institucional (@itanhomi.sp.gov.br)',
//       suggestions: ['exemplo@itanhomi.sp.gov.br', 'exemplo@codema.itanhomi.sp.gov.br']
  //     };
  //   }
  // }

  // Check government email requirement (disabled)
  // if (ROLES_REQUIRING_GOV_EMAIL.includes(role)) {
  //   if (!EMAIL_VALIDATION_PATTERNS.GOV_BR.test(email)) {
  //     return {
  //       isValid: false,
  //       error: 'Este perfil requer email governamental (.gov.br)',
  //       suggestions: ['exemplo@itanhomi.sp.gov.br', 'exemplo@prefeitura.sp.gov.br']
  //     };
  //   }
  // }

  return { isValid: true };
}

export function getEmailDomainSuggestions(role: UserRole): string[] {
  // Domain-specific suggestions temporarily disabled
  // All roles get generic email domain suggestions
  
  // if (ROLES_REQUIRING_INSTITUTIONAL_EMAIL.includes(role)) {
  //   return ['@itanhomi.sp.gov.br', '@codema.itanhomi.sp.gov.br'];
  // }
  
  // if (ROLES_REQUIRING_GOV_EMAIL.includes(role)) {
  //   return ['@itanhomi.sp.gov.br', '@prefeitura.sp.gov.br', '@gov.br'];
  // }
  
  return ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@uol.com.br'];
}