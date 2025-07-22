// Common types used across the application

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Database audit fields
export interface AuditFields {
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  size: number;
  mimetype: string;
  url: string;
  uploaded_at: string;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | string[] | undefined;
}

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: FormErrors;
  isLoading: boolean;
  isValid: boolean;
}