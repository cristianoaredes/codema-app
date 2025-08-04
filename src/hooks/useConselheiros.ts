import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conselheiro } from '@/types/conselheiro';
import { logAction } from '@/utils';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Map profile to Conselheiro, fallback for missing fields
const mapProfileToConselheiro = (profile: Database['public']['Tables']['profiles']['Row']): Conselheiro => ({
  id: profile.id,
  profile_id: profile.id,
  nome_completo: profile.full_name || '',
  email: profile.email || undefined,
  telefone: profile.phone || undefined,
  endereco: profile.address || undefined,
  mandato_inicio: new Date().toISOString(),
  mandato_fim: new Date().toISOString(),
  entidade_representada: '',
  segmento: 'sociedade_civil',
  titular: profile.role === 'conselheiro_titular',
  status: profile.is_active ? 'ativo' : 'inativo',
  faltas_consecutivas: 0,
  total_faltas: 0,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
});

export function useConselheiros() {
  return useQuery({
    queryKey: ['conselheiros'],
    queryFn: async (): Promise<Conselheiro[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapProfileToConselheiro);
    }
  });
}

// ...rest of file unchanged