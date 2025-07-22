// Helpers tipados para acessar tabelas customizadas do Supabase
import { supabase } from '@/integrations/supabase/client';
import type { AtasTemplate, Conselheiro, ResolucaoTemplate, PersistentSession } from '@/types/custom-tables';

// Tipo para o builder do Supabase
type SupabaseQueryBuilder<T> = {
  select: (columns?: string) => Promise<{ data: T[] | null; error: unknown }>;
  insert: (values: Partial<T>) => Promise<{ data: T | null; error: unknown }>;
  update: (values: Partial<T>) => Promise<{ data: T | null; error: unknown }>;
  delete: () => Promise<{ data: T | null; error: unknown }>;
  eq: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  single: () => Promise<{ data: T | null; error: unknown }>;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryBuilder<T>;
  limit: (count: number) => SupabaseQueryBuilder<T>;
  lt: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  gt: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  gte: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  lte: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  like: (column: string, value: string) => SupabaseQueryBuilder<T>;
  ilike: (column: string, value: string) => SupabaseQueryBuilder<T>;
  in: (column: string, values: unknown[]) => SupabaseQueryBuilder<T>;
  not: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  is: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  or: (filters: string, values: unknown[]) => SupabaseQueryBuilder<T>;
  and: (filters: string, values: unknown[]) => SupabaseQueryBuilder<T>;
  upsert: (values: Partial<T>, options?: { onConflict?: string }) => Promise<{ data: T | null; error: unknown }>;
};

// Helper genérico para acessar tabelas customizadas
export const getCustomTable = <T>(tableName: string) => {
  return (supabase as any).from(tableName);
};

// Helpers específicos para cada tabela customizada
export const getAtasTemplatesTable = () => getCustomTable<AtasTemplate>('atas_templates');
export const getConselheirosTable = () => getCustomTable<Conselheiro>('conselheiros');
export const getResolucoesTemplatesTable = () => getCustomTable<ResolucaoTemplate>('resolucoes_templates');
export const getPersistentSessionsTable = () => getCustomTable<PersistentSession>('persistent_sessions');

// Helper para acessar tabela de audit_logs (já existe no schema)
export const getAuditLogsTable = () => supabase.from('audit_logs'); 