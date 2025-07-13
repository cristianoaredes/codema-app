// Form validation and component types for CODEMA application

// Generic form value types
export type FormValue = string | number | boolean | Date | File | File[] | string[] | number[] | null | undefined;

export interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | string;
  url?: boolean | string;
  numeric?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  custom?: (value: FormValue) => boolean | string;
}

export interface FieldError {
  type: string;
  message: string;
}

export interface FormFieldState {
  value: FormValue;
  error?: FieldError;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

export interface FormState {
  fields: Record<string, FormFieldState>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  submitCount: number;
  errors: Record<string, FieldError>;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  
  // Validation
  rules?: ValidationRule;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  
  // Event handlers
  onChange?: (value: FormValue) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onValidate?: (isValid: boolean, error?: FieldError) => void;
}

export interface TextInputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
  maxLength?: number;
  minLength?: number;
  spellCheck?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export interface NumberInputProps extends FormFieldProps {
  type?: 'number';
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  format?: 'decimal' | 'currency' | 'percentage';
  allowNegative?: boolean;
}

export interface TextareaProps extends FormFieldProps {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  minLength?: number;
  spellCheck?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  group?: string;
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  maxSelection?: number;
  groupBy?: string;
}

export interface CheckboxProps extends FormFieldProps {
  checked?: boolean;
  indeterminate?: boolean;
  value?: string;
}

export interface RadioProps extends FormFieldProps {
  value: string;
  checked?: boolean;
  groupName?: string;
}

export interface RadioGroupProps extends FormFieldProps {
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export interface SwitchProps extends FormFieldProps {
  checked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface FileInputProps extends FormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  allowedTypes?: string[];
  preview?: boolean;
  dragAndDrop?: boolean;
}

export interface DateInputProps extends FormFieldProps {
  type?: 'date' | 'datetime-local' | 'time' | 'month' | 'week';
  min?: string;
  max?: string;
  step?: number;
  format?: string;
  locale?: string;
  showTimeZone?: boolean;
}

export interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, FormValue>) => void | Promise<void>;
  onChange?: (data: Record<string, FormValue>, isValid: boolean) => void;
  initialValues?: Record<string, FormValue>;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  resetOnSubmit?: boolean;
  className?: string;
  
  // Accessibility
  'aria-label'?: string;
  noValidate?: boolean;
  
  // Form state management
  disabled?: boolean;
  readOnly?: boolean;
}

export interface FieldsetProps {
  children: React.ReactNode;
  legend?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  
  // Accessibility
  'aria-describedby'?: string;
}

export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

// Validation message types
export interface ValidationMessages {
  required: string;
  email: string;
  url: string;
  minLength: string;
  maxLength: string;
  min: string;
  max: string;
  pattern: string;
  numeric: string;
  custom: string;
}

// Form context types
export interface FormContextValue {
  formState: FormState;
  updateField: (name: string, value: FormValue) => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  resetField: (name: string) => void;
  setFieldError: (name: string, error: FieldError) => void;
  clearFieldError: (name: string) => void;
  getFieldState: (name: string) => FormFieldState;
  isFieldValid: (name: string) => boolean;
  isFieldTouched: (name: string) => boolean;
  isFieldDirty: (name: string) => boolean;
  submitForm: () => Promise<void>;
  
  // Configuration
  validationMode: 'onChange' | 'onBlur' | 'onSubmit';
  validationMessages: ValidationMessages;
}

// Form submission types
export interface FormSubmissionResult {
  success: boolean;
  data?: Record<string, FormValue>;
  errors?: Record<string, FieldError>;
  message?: string;
}

// Form analytics types
export interface FormAnalytics {
  fieldInteractions: Record<string, number>;
  validationErrors: Record<string, number>;
  submissionAttempts: number;
  successfulSubmissions: number;
  abandonmentRate: number;
  averageCompletionTime: number;
  mostProblematicFields: string[];
}

// Export utility types
export type FormFieldComponent<T extends FormFieldProps = FormFieldProps> = React.ForwardRefExoticComponent<
  T & React.RefAttributes<HTMLElement>
>;

export type FormValidator = (value: FormValue, rules: ValidationRule) => FieldError | null;

export type FormSubmitHandler = (
  data: Record<string, FormValue>,
  formState: FormState
) => void | Promise<FormSubmissionResult>;