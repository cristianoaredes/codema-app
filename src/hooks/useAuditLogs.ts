import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface AuditLogsFilters {
  search?: string;
  action?: string;
  entity?: string;
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
}

function ensureDetails(details: unknown): Record<string, unknown> | null {
  if (details && typeof details === 'object' && !Array.isArray(details)) return details as Record<string, unknown>;
  return null;
}

export function useAuditLogs(filters: AuditLogsFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async (): Promise<AuditLog[]> => {
      const query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      let result = data || [];
      // Fix details field
      result = result.map((log) => ({
        ...log,
        details: ensureDetails(log.details),
      }));
      return result;
    }
  });
}