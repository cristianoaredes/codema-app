import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Conselheiro, ConselheiroCreateInput, ConselheiroUpdateInput } from '@/types/conselheiro';
import { toast } from 'sonner';
import { logAction } from '@/utils';

/**
 * Checks if a table exists in the current database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    return error?.code !== '42P01';
  } catch (error) {
    console.warn(`Table existence check failed for ${tableName}:`, error);
    return false;
  }
}

/**
 * Enhanced error handler for database operations
 */
function handleDatabaseError(error: any, operation: string, tableName: string): never {
  console.error(`Database error during ${operation} on ${tableName}:`, {
    error,
    code: error?.code,
    message: error?.message,
    details: error?.details
  });

  if (error?.code === '42P01') {
    throw new Error(`A tabela '${tableName}' não existe no banco de dados. Verifique a estrutura do banco.`);
  }

  if (error?.code === '23505') {
    throw new Error('Já existe um registro com essas informações. Verifique os dados únicos como email.');
  }

  if (error?.code === '23503') {
    throw new Error('Erro de referência: verifique se todos os dados relacionados existem.');
  }

  // Generic error
  throw new Error(error?.message || `Erro desconhecido durante ${operation}`);
}

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
      // First, try to get from conselheiros table
      const { data: conselheiro, error: conselheirosError } = await supabase
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
      
      // If conselheiros table doesn't exist, fallback to profiles
      if (conselheirosError?.code === '42P01') {
        const { data: profile, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (profilesError) throw profilesError;
        
        // Map profile to conselheiro format for compatibility
        return {
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
        };
      }
      
      if (conselheirosError) throw conselheirosError;
      return conselheiro;
    },
    enabled: !!id
  });
}

export function useCreateConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conselheiro: ConselheiroCreateInput): Promise<Conselheiro> => {
      // First, check if conselheiros table exists
      const conselheirosTableExists = await checkTableExists('conselheiros');
      
      if (!conselheirosTableExists) {
        console.warn('Conselheiros table does not exist. Cannot create new conselheiro.');
        throw new Error('A tabela "conselheiros" não existe. Não é possível criar novos conselheiros. Verifique a estrutura do banco de dados.');
      }

      try {
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
        
        if (error) {
          handleDatabaseError(error, 'CREATE', 'conselheiros');
        }
        
        return data;
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "conselheiros" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      try {
        await logAction('CREATE', 'conselheiro', data.id, { 
          nome: data.nome_completo
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      toast.success('Conselheiro cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar conselheiro:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('já existe')) {
        toast.error('Já existe um conselheiro com essas informações');
      } else {
        toast.error('Erro ao cadastrar conselheiro. Tente novamente.');
      }
    }
  });
}

export function useUpdateConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ConselheiroUpdateInput }): Promise<Conselheiro> => {
      // First, check if conselheiros table exists
      const conselheirosTableExists = await checkTableExists('conselheiros');
      
      if (!conselheirosTableExists) {
        console.warn('Conselheiros table does not exist. Cannot update conselheiro.');
        throw new Error('A tabela "conselheiros" não existe. Não é possível atualizar conselheiros. Verifique a estrutura do banco de dados.');
      }

      try {
        const { data, error } = await supabase
          .from('conselheiros')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          handleDatabaseError(error, 'UPDATE', 'conselheiros');
        }
        
        return data;
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "conselheiros" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      queryClient.invalidateQueries({ queryKey: ['conselheiro', data.id] });
      
      try {
        await logAction('UPDATE', 'conselheiro', data.id, { 
          nome: data.nome_completo
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      
      toast.success('Conselheiro atualizado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar conselheiro:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('não encontrado')) {
        toast.error('Conselheiro não encontrado');
      } else if (error.message.includes('já existe')) {
        toast.error('Já existe um conselheiro com essas informações');
      } else {
        toast.error('Erro ao atualizar conselheiro. Tente novamente.');
      }
    }
  });
}

export function useDeleteConselheiro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // First, check if conselheiros table exists
      const conselheirosTableExists = await checkTableExists('conselheiros');
      
      if (!conselheirosTableExists) {
        console.warn('Conselheiros table does not exist. Cannot delete conselheiro.');
        throw new Error('A tabela "conselheiros" não existe. Não é possível remover conselheiros. Verifique a estrutura do banco de dados.');
      }

      try {
        const { error } = await supabase
          .from('conselheiros')
          .delete()
          .eq('id', id);
        
        if (error) {
          handleDatabaseError(error, 'DELETE', 'conselheiros');
        }
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "conselheiros" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conselheiros'] });
      queryClient.invalidateQueries({ queryKey: ['conselheiro', id] });
      
      try {
        await logAction('DELETE', 'conselheiro', id);
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      
      toast.success('Conselheiro removido com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao remover conselheiro:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('não encontrado')) {
        toast.error('Conselheiro não encontrado');
      } else if (error.message.includes('referência')) {
        toast.error('Não é possível remover este conselheiro pois ele possui dados relacionados');
      } else {
        toast.error('Erro ao remover conselheiro. Tente novamente.');
      }
    }
  });
}

// ...rest of file unchanged