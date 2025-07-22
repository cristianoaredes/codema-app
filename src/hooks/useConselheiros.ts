import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conselheiro, ConselheiroCreateInput, ConselheiroUpdateInput } from '@/types';
import { logAction } from '@/utils';
import { toast } from 'sonner';

export function useConselheiros() {
  return useQuery({
    queryKey: ['conselheiros'],
    queryFn: async (): Promise<Conselheiro[]> => {
      const { data, error } = await (supabase as any)
        .from('conselheiros')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Garantir tipagem correta
      return (data || []) as Conselheiro[];
    }
  });
}

export function useConselheiro(id: string) {
  return useQuery({
    queryKey: ['conselheiro', id],
    queryFn: async (): Promise<Conselheiro> => {
      const { data, error } = await (supabase as any)
        .from('conselheiros')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Conselheiro;
    },
    enabled: !!id
  });
}

export function useCreateConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conselheiro: ConselheiroCreateInput): Promise<Conselheiro> => {
      const { data, error } = await (supabase as any)
        .from('conselheiros')
        .insert(conselheiro)
        .select()
        .single();
      
      if (error) throw error;
      return data as Conselheiro;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      await logAction('CREATE', 'conselheiro', data.id, { nome: data.nome_completo });
      toast.success('Conselheiro criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar conselheiro:', error);
      toast.error('Erro ao criar conselheiro');
    }
  });
}

export function useUpdateConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ConselheiroUpdateInput }): Promise<Conselheiro> => {
      const { data, error } = await (supabase as any)
        .from('conselheiros')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Conselheiro;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      queryClient.invalidateQueries({ queryKey: ['conselheiro', data.id] });
      await logAction('UPDATE', 'conselheiro', data.id, { nome: data.nome_completo });
      toast.success('Conselheiro atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar conselheiro:', error);
      toast.error('Erro ao atualizar conselheiro');
    }
  });
}

export function useDeleteConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await (supabase as any)
        .from('conselheiros')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      await logAction('DELETE', 'conselheiro', id);
      toast.success('Conselheiro removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover conselheiro:', error);
      toast.error('Erro ao remover conselheiro');
    }
  });
}

export function useConselheirosComMandatoExpirando(diasAntecedencia = 30) {
  return useQuery({
    queryKey: ['conselheiros-expirando', diasAntecedencia],
    queryFn: async (): Promise<Conselheiro[]> => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);
      
      const { data, error } = await (supabase as any)
        .from('conselheiros')
        .select('*')
        .and(`data_fim_mandato.lte.${dataLimite.toISOString()},data_fim_mandato.gte.${new Date().toISOString()}`)
        .order('data_fim_mandato', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Conselheiro[];
    }
  });
}