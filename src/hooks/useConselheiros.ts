import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conselheiro, ConselheiroCreateInput, ConselheiroUpdateInput } from '@/types/conselheiro';
import { toast } from 'sonner';
import { logAction } from '@/utils';

export function useConselheiros() {
  return useQuery({
    queryKey: ['conselheiros'],
    queryFn: async (): Promise<Conselheiro[]> => {
      // First, check if conselheiros table exists
      const { data: conselheiros, error: conselheirosError } = await supabase
        .from('conselheiros')
        .select(`
          *,
          profiles:profile_id(
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      // If conselheiros table doesn't exist, fallback to profiles
      if (conselheirosError?.code === '42P01') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
          .order('created_at', { ascending: false });
        
        if (profilesError) throw profilesError;
        
        // Map profiles to conselheiros format for compatibility
        return (profiles || []).map(profile => ({
          id: profile.id,
          profile_id: profile.id,
          nome_completo: profile.full_name || '',
          email: profile.email || undefined,
          telefone: profile.phone || undefined,
          endereco: profile.address || undefined,
          mandato_inicio: new Date().toISOString(),
          mandato_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 years default
          entidade_representada: 'A definir',
          segmento: 'sociedade_civil' as const,
          titular: profile.role === 'conselheiro_titular',
          status: profile.is_active ? 'ativo' as const : 'inativo' as const,
          faltas_consecutivas: 0,
          total_faltas: 0,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        }));
      }
      
      if (conselheirosError) throw conselheirosError;
      return conselheiros || [];
    }
  });
}

export function useConselheiro(id: string) {
  return useQuery({
    queryKey: ['conselheiro', id],
    queryFn: async (): Promise<Conselheiro> => {
      const { data, error } = await supabase
        .from('conselheiros')
        .select(`
          *,
          profiles:profile_id(
            full_name,
            email,
            phone
          )
        `)
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
        .insert([{
          ...conselheiro,
          status: 'ativo',
          faltas_consecutivas: 0,
          total_faltas: 0,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      await logAction('CREATE', 'conselheiro', data.id, { 
        nome: data.nome_completo
      });
      toast.success('Conselheiro cadastrado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar conselheiro:', error);
      toast.error('Erro ao cadastrar conselheiro');
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
      await logAction('UPDATE', 'conselheiro', data.id, { 
        nome: data.nome_completo
      });
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

// ...rest of file unchanged