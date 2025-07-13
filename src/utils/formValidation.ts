import { ValidationRule, FieldError, FormValue } from '@/types/forms';

// Default validation messages
export const defaultValidationMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um email válido',
  url: 'Digite uma URL válida',
  minLength: 'Deve ter pelo menos {min} caracteres',
  maxLength: 'Deve ter no máximo {max} caracteres',
  min: 'O valor deve ser pelo menos {min}',
  max: 'O valor deve ser no máximo {max}',
  pattern: 'Formato inválido',
  numeric: 'Digite apenas números',
  custom: 'Valor inválido',
};

// Validation utility functions
export class FormValidator {
  private messages: Record<string, string>;

  constructor(customMessages?: Partial<Record<string, string>>) {
    this.messages = { ...defaultValidationMessages, ...customMessages };
  }

  /**
   * Validate a single field value against validation rules
   */
  validateField(value: FormValue, rules: ValidationRule): FieldError | null {
    // Skip validation for undefined/null values unless required
    if (value === null || value === undefined || value === '') {
      if (rules.required) {
        const message = typeof rules.required === 'string' 
          ? rules.required 
          : this.messages.required;
        return { type: 'required', message };
      }
      return null;
    }

    // Convert value to string for most validations
    const stringValue = String(value);

    // Required validation
    if (rules.required && (!value || stringValue.trim() === '')) {
      const message = typeof rules.required === 'string' 
        ? rules.required 
        : this.messages.required;
      return { type: 'required', message };
    }

    // Email validation
    if (rules.email && stringValue) {
      if (!this.isValidEmail(stringValue)) {
        const message = typeof rules.email === 'string' 
          ? rules.email 
          : this.messages.email;
        return { type: 'email', message };
      }
    }

    // URL validation
    if (rules.url && stringValue) {
      if (!this.isValidUrl(stringValue)) {
        const message = typeof rules.url === 'string' 
          ? rules.url 
          : this.messages.url;
        return { type: 'url', message };
      }
    }

    // Numeric validation
    if (rules.numeric && stringValue) {
      if (!this.isNumeric(stringValue)) {
        const message = typeof rules.numeric === 'string' 
          ? rules.numeric 
          : this.messages.numeric;
        return { type: 'numeric', message };
      }
    }

    // String length validations
    if (typeof value === 'string') {
      // Min length
      if (rules.minLength) {
        const minLength = typeof rules.minLength === 'number' 
          ? rules.minLength 
          : rules.minLength.value;
        if (value.length < minLength) {
          const message = typeof rules.minLength === 'object' && rules.minLength.message
            ? rules.minLength.message
            : this.messages.minLength.replace('{min}', String(minLength));
          return { type: 'minLength', message };
        }
      }

      // Max length
      if (rules.maxLength) {
        const maxLength = typeof rules.maxLength === 'number' 
          ? rules.maxLength 
          : rules.maxLength.value;
        if (value.length > maxLength) {
          const message = typeof rules.maxLength === 'object' && rules.maxLength.message
            ? rules.maxLength.message
            : this.messages.maxLength.replace('{max}', String(maxLength));
          return { type: 'maxLength', message };
        }
      }

      // Pattern validation
      if (rules.pattern) {
        const pattern = rules.pattern instanceof RegExp
          ? rules.pattern
          : rules.pattern.value;
        if (!pattern.test(value)) {
          const message = rules.pattern instanceof RegExp
            ? this.messages.pattern
            : rules.pattern.message || this.messages.pattern;
          return { type: 'pattern', message };
        }
      }
    }

    // Numeric value validations
    if (typeof value === 'number' || this.isNumeric(stringValue)) {
      const numValue = typeof value === 'number' ? value : parseFloat(stringValue);

      // Min value
      if (rules.min !== undefined) {
        const minValue = typeof rules.min === 'number' 
          ? rules.min 
          : rules.min.value;
        if (numValue < minValue) {
          const message = typeof rules.min === 'object' && rules.min.message
            ? rules.min.message
            : this.messages.min.replace('{min}', String(minValue));
          return { type: 'min', message };
        }
      }

      // Max value
      if (rules.max !== undefined) {
        const maxValue = typeof rules.max === 'number' 
          ? rules.max 
          : rules.max.value;
        if (numValue > maxValue) {
          const message = typeof rules.max === 'object' && rules.max.message
            ? rules.max.message
            : this.messages.max.replace('{max}', String(maxValue));
          return { type: 'max', message };
        }
      }
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (result !== true) {
        const message = typeof result === 'string' ? result : this.messages.custom;
        return { type: 'custom', message };
      }
    }

    return null;
  }

  /**
   * Validate multiple fields at once
   */
  validateFields(
    values: Record<string, FormValue>, 
    rules: Record<string, ValidationRule>
  ): Record<string, FieldError> {
    const errors: Record<string, FieldError> = {};

    Object.keys(rules).forEach(fieldName => {
      const fieldError = this.validateField(values[fieldName], rules[fieldName]);
      if (fieldError) {
        errors[fieldName] = fieldError;
      }
    });

    return errors;
  }

  /**
   * Check if all fields are valid
   */
  isFormValid(
    values: Record<string, FormValue>, 
    rules: Record<string, ValidationRule>
  ): boolean {
    const errors = this.validateFields(values, rules);
    return Object.keys(errors).length === 0;
  }

  // Private validation helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
  }
}

// Predefined validation rules for common use cases
export const commonValidationRules = {
  // Text validations
  required: { required: true },
  email: { required: true, email: true },
  password: { 
    required: true, 
    minLength: 8,
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    }
  },
  phone: {
    required: true,
    pattern: {
      value: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      message: 'Digite um telefone válido no formato (XX) XXXXX-XXXX'
    }
  },
  cpf: {
    required: true,
    pattern: {
      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      message: 'Digite um CPF válido no formato XXX.XXX.XXX-XX'
    },
    custom: (value: FormValue) => {
      if (typeof value !== 'string') return false;
      return validateCPF(value);
    }
  },
  cnpj: {
    required: true,
    pattern: {
      value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      message: 'Digite um CNPJ válido no formato XX.XXX.XXX/XXXX-XX'
    },
    custom: (value: FormValue) => {
      if (typeof value !== 'string') return false;
      return validateCNPJ(value);
    }
  },
  cep: {
    required: true,
    pattern: {
      value: /^\d{5}-\d{3}$/,
      message: 'Digite um CEP válido no formato XXXXX-XXX'
    }
  },

  // Numeric validations
  positiveNumber: { required: true, numeric: true, min: 0 },
  percentage: { required: true, numeric: true, min: 0, max: 100 },
  currency: { required: true, numeric: true, min: 0 },

  // Optional validations
  optionalEmail: { email: true },
  optionalUrl: { url: true },
  optionalPhone: {
    pattern: {
      value: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      message: 'Digite um telefone válido no formato (XX) XXXXX-XXXX'
    }
  },
};

// CPF validation algorithm
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let digit1 = 11 - (sum % 11);
  if (digit1 === 10 || digit1 === 11) digit1 = 0;
  
  if (digit1 !== parseInt(cpf.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  let digit2 = 11 - (sum % 11);
  if (digit2 === 10 || digit2 === 11) digit2 = 0;
  
  return digit2 === parseInt(cpf.charAt(10));
}

// CNPJ validation algorithm
function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  
  let digit1 = 11 - (sum % 11);
  if (digit1 < 2) digit1 = 0;
  
  if (digit1 !== parseInt(cnpj.charAt(12))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  
  let digit2 = 11 - (sum % 11);
  if (digit2 < 2) digit2 = 0;
  
  return digit2 === parseInt(cnpj.charAt(13));
}

// Export singleton instance
export const formValidator = new FormValidator();

// Export utility functions
export { validateCPF, validateCNPJ };