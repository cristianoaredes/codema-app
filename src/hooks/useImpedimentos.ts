import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImpedimentoConselheiro, ImpedimentoCreateInput } from '@/types';
import { logAction } from '@/utils';
import { toast } from 'sonner';

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
        .select(`
          *,
          profiles!impedimentos_conselheiros_conselheiro_id_fkey(nome_completo),
          reunioes(titulo),
          processos(titulo)
        `)
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
      return data || [];
    }
  });
}

export function useImpedimento(id: string) {
  return useQuery({
    queryKey: ['impedimento', id],
    queryFn: async (): Promise<ImpedimentoConselheiro> => {
      const { data, error } = await supabase
        .from('impedimentos_conselheiros')
        .select(`
          *,
          profiles!impedimentos_conselheiros_conselheiro_id_fkey(nome_completo),
          reunioes(titulo),
          processos(titulo)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateImpedimento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (impedimento: ImpedimentoCreateInput): Promise<ImpedimentoConselheiro> => {
      const { data, error } = await supabase
        .from('impedimentos_conselheiros')
        .insert(impedimento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['impedimentos'] });
      await logAction('CREATE', 'impedimento', data.id, { 
        conselheiro_id: data.conselheiro_id,
        tipo: data.tipo_impedimento 
      });
      toast.success('Impedimento declarado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao declarar impedimento:', error);
      toast.error('Erro ao declarar impedimento');
    }
  });
}

export function useRevogarImpedimento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('impedimentos_conselheiros')
        .update({ ativo: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['impedimentos'] });
      queryClient.invalidateQueries({ queryKey: ['impedimento', id] });
      await logAction('UPDATE', 'impedimento', id, { acao: 'revogado' });
      toast.success('Impedimento revogado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao revogar impedimento:', error);
      toast.error('Erro ao revogar impedimento');
    }
  });
}

export function useVerificarImpedimentos(conselheiro_id: string, reuniao_id?: string, processo_id?: string) {
  return useQuery({
    queryKey: ['verificar-impedimentos', conselheiro_id, reuniao_id, processo_id],
    queryFn: async (): Promise<ImpedimentoConselheiro[]> => {
      let query = supabase
        .from('impedimentos_conselheiros')
        .select('*')
        .eq('conselheiro_id', conselheiro_id)
        .eq('ativo', true);

      if (reuniao_id) {
        query = query.eq('reuniao_id', reuniao_id);
      }
      if (processo_id) {
        query = query.eq('processo_id', processo_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!conselheiro_id
  });
}