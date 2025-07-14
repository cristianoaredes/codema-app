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

export function useAuditLogs(filters: AuditLogsFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async (): Promise<AuditLog[]> => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.entity) {
        query = query.eq('entity', filters.entity);
      }
      
      if (filters.dateStart) {
        query = query.gte('created_at', `${filters.dateStart}T00:00:00`);
      }
      
      if (filters.dateEnd) {
        query = query.lte('created_at', `${filters.dateEnd}T23:59:59`);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100); // Default limit
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      let result = data || [];
      
      // Apply search filter on client side for better UX
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(log => 
          log.profiles?.full_name?.toLowerCase().includes(searchLower) ||
          log.profiles?.email?.toLowerCase().includes(searchLower) ||
          log.entity.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.details || {}).toLowerCase().includes(searchLower)
        );
      }
      
      return result;
    }
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ['audit-logs-stats'],
    queryFn: async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const [
        totalResult,
        todayResult,
        yesterdayResult,
        actionStatsResult
      ] = await Promise.all([
        supabase.from('audit_logs').select('id', { count: 'exact' }),
        supabase
          .from('audit_logs')
          .select('id', { count: 'exact' })
          .gte('created_at', today.toISOString().split('T')[0]),
        supabase
          .from('audit_logs')
          .select('id', { count: 'exact' })
          .gte('created_at', yesterday.toISOString().split('T')[0])
          .lt('created_at', today.toISOString().split('T')[0]),
        supabase
          .from('audit_logs')
          .select('action')
          .gte('created_at', yesterday.toISOString().split('T')[0])
      ]);

      // Count actions
      const actionCounts: Record<string, number> = {};
      actionStatsResult.data?.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      return {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        yesterday: yesterdayResult.count || 0,
        actionCounts
      };
    }
  });
}