import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conselheiro, ConselheiroCreateInput, ConselheiroUpdateInput } from '@/types/conselheiro';
import { logAction } from '@/utils/auditLogger';
import { toast } from 'sonner';

export function useConselheiros() {
  return useQuery({
    queryKey: ['conselheiros'],
    queryFn: async (): Promise<Conselheiro[]> => {
      const { data, error } = await supabase
        .from('conselheiros')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useConselheiro(id: string) {
  return useQuery({
    queryKey: ['conselheiro', id],
    queryFn: async (): Promise<Conselheiro> => {
      const { data, error } = await supabase
        .from('conselheiros')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conselheiro: ConselheiroCreateInput): Promise<Conselheiro> => {
      const { data, error } = await supabase
        .from('conselheiros')
        .insert(conselheiro)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('conselheiros')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
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
    queryKey: ['conselheiros-mandato-expirando', diasAntecedencia],
    queryFn: async (): Promise<Conselheiro[]> => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);
      
      const { data, error } = await supabase
        .from('conselheiros')
        .select('*')
        .lte('mandato_fim', dataLimite.toISOString().split('T')[0])
        .eq('status', 'ativo')
        .order('mandato_fim', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
}