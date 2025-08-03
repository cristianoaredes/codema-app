import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conselheiro } from '@/types/codema';
import { logAction } from '@/utils';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Função auxiliar para mapear Profile para Conselheiro
const mapProfileToConselheiro = (profile: Database['public']['Tables']['profiles']['Row']): Conselheiro => ({
  id: profile.id,
  profile_id: profile.id,
  nome_completo: profile.full_name || '',
  email: profile.email || undefined,
  telefone: profile.phone || undefined,
  endereco: profile.address || undefined,
  // Campos padrão pois não existem na tabela profiles
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

export function useConselheiro(id: string) {
  return useQuery({
    queryKey: ['conselheiro', id],
    queryFn: async (): Promise<Conselheiro> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
        .single();
      
      if (error) throw error;
      return mapProfileToConselheiro(data);
    },
    enabled: !!id
  });
}

export function useCreateConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conselheiroData: Partial<Conselheiro> & { nome_completo: string; entidade_representada: string; mandato_inicio: string; mandato_fim: string; segmento: string }): Promise<Conselheiro> => {
      // Se profile_id foi fornecido, vincula a um usuário existente
      if (conselheiroData.profile_id) {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            role: conselheiroData.titular ? 'conselheiro_titular' : 'conselheiro_suplente',
            full_name: conselheiroData.nome_completo,
            email: conselheiroData.email || undefined,
            phone: conselheiroData.telefone || undefined,
            address: conselheiroData.endereco || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conselheiroData.profile_id)
          .select()
          .single();

        if (error) throw error;
        return mapProfileToConselheiro(data);
      }

      // Se email foi fornecido, cria um novo usuário
      if (conselheiroData.email) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: conselheiroData.email,
          email_confirm: true,
          user_metadata: {
            full_name: conselheiroData.nome_completo,
            role: conselheiroData.titular ? 'conselheiro_titular' : 'conselheiro_suplente',
          }
        });

        if (authError) throw authError;

        // Atualizar o perfil com os dados completos do conselheiro
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: conselheiroData.nome_completo,
            role: conselheiroData.titular ? 'conselheiro_titular' : 'conselheiro_suplente',
            phone: conselheiroData.telefone || undefined,
            address: conselheiroData.endereco || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id)
          .select()
          .single();

        if (profileError) throw profileError;
        return mapProfileToConselheiro(profileData);
      }

      throw new Error('É necessário fornecer um profile_id ou email para criar um conselheiro');
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Conselheiro> }): Promise<Conselheiro> => {
      // Atualizar perfil do usuário/conselheiro
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
        .select()
        .single();
      
      if (error) throw error;
      return mapProfileToConselheiro(data);
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
    mutationFn: async (_id: string): Promise<void> => {
      // Para deletar um conselheiro, precisamos desativar o usuário
      // Esta função deve ser chamada após a desativação do usuário via AuthService
      // Aqui apenas atualizamos o perfil para remover a role de conselheiro
      throw new Error('Remoção de conselheiros deve ser feita via desativação de usuário');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
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
      // Como os dados de mandato não estão na tabela profiles,
      // esta funcionalidade precisa ser implementada de outra forma
      // Por enquanto, retornamos uma lista vazia
      return [];
    }
  });
}