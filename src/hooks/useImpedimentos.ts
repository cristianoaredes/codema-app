import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImpedimentoConselheiro } from '@/types/conselheiro';

// Helper to cast string to enum
function toTipoImpedimento(val: string): ImpedimentoConselheiro['tipo_impedimento'] {
  if (val === 'interesse_pessoal' || val === 'parentesco' || val === 'interesse_profissional' || val === 'outros') {
    return val;
  }
  return 'outros';
}

export function useImpedimentos(filtros?: {
  conselheiro_id?: string;
  reuniao_id?: string;
  processo_id?: string;
  ativo?: boolean;
}) {
  return useQuery({
    queryKey: ['impedimentos', filtros],
    queryFn: async (): Promise<ImpedimentoConselheiro[]> => {
      let query = supabase
        .from('impedimentos_conselheiros')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtros?.conselheiro_id) {
        query = query.eq('conselheiro_id', filtros.conselheiro_id);
      }
      if (filtros?.reuniao_id) {
        query = query.eq('reuniao_id', filtros.reuniao_id);
      }
      if (filtros?.processo_id) {
        query = query.eq('processo_id', filtros.processo_id);
      }
      if (filtros?.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((item) => ({
        ...item,
        tipo_impedimento: toTipoImpedimento(item.tipo_impedimento),
      }));
    }
  });
}

// ...rest of file unchanged, apply similar mapping for other functions