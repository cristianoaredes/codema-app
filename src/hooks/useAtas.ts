import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logAction } from '@/utils';

// Interface para Ata
export interface Ata {
  id: string;
  reuniao_id: string;
  numero: string;
  conteudo: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  aprovada_por?: string;
  data_aprovacao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relações
  reuniao?: {
    id: string;
    data: string;
    tipo: string;
    status: string;
  };
  aprovador?: {
    full_name: string;
  };
}

export interface AtaCreateInput {
  reuniao_id: string;
  numero: string;
  conteudo: string;
  observacoes?: string;
}

export interface AtaUpdateInput {
  numero?: string;
  conteudo?: string;
  status?: 'pendente' | 'aprovada' | 'rejeitada';
  observacoes?: string;
  aprovada_por?: string;
  data_aprovacao?: string;
}

// Helper functions
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    await supabase.from(tableName).select('id').limit(1);
    return true;
  } catch (error: any) {
    if (error?.code === '42P01') {
      return false;
    }
    throw error;
  }
}

function handleDatabaseError(error: any, operation: string): void {
  console.error(`Erro na operação ${operation}:`, error);
  
  let message = `Erro ao ${operation} ata`;
  
  if (error?.code === '42P01') {
    message = 'Tabela de atas não encontrada. Verifique a configuração do banco de dados.';
  } else if (error?.code === '23505') {
    message = 'Já existe uma ata com essas informações.';
  } else if (error?.code === '23503') {
    message = 'Dados relacionados não encontrados. Verifique se a reunião existe.';
  }
  
  toast.error(message);
}

export function useAtas() {
  return useQuery({
    queryKey: ['atas'],
    queryFn: async (): Promise<Ata[]> => {
      try {
        // First, check if atas table exists
        const tableExists = await checkTableExists('atas');
        if (!tableExists) {
          console.warn('Tabela "atas" não existe. Retornando array vazio.');
          return [];
        }

        // Buscar atas sem foreign key problemática - query simplificada
        const { data: atas, error: atasError } = await supabase
          .from('atas')
          .select('*, reuniao:reunioes(*)')
          .order('created_at', { ascending: false });
        
        if (atasError) {
          // Se a tabela não existir, retornar array vazio
          if (atasError.code === '42P01') {
            console.warn('Tabela "atas" não existe. Retornando array vazio.');
            return [];
          }
          // Para outros erros, apenas logar e retornar array vazio
          console.error('Erro ao buscar atas:', atasError);
          return [];
        }

        // Se temos atas e algumas têm aprovada_por, buscar os nomes separadamente
        if (atas && atas.length > 0) {
          const aprovadorIds = [...new Set(atas
            .filter(a => a.aprovada_por)
            .map(a => a.aprovada_por))];

          if (aprovadorIds.length > 0) {
            try {
              const { data: aprovadores } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', aprovadorIds);

              if (aprovadores) {
                const aprovadorMap = new Map(aprovadores.map(a => [a.id, a.full_name]));
                
                // Adicionar nomes dos aprovadores às atas
                atas.forEach(ata => {
                  if (ata.aprovada_por) {
                    const aprovadorName = aprovadorMap.get(ata.aprovada_por);
                    if (aprovadorName) {
                      ata.aprovador = { full_name: aprovadorName };
                    }
                  }
                });
              }
            } catch (profileError) {
              // Se não conseguir buscar profiles, continuar sem os nomes
              console.warn('Não foi possível buscar nomes dos aprovadores:', profileError);
            }
          }
        }

        return atas || [];
      } catch (error) {
        console.error('Erro ao buscar atas:', error);
        return [];
      }
    }
  });
}

export function useAta(id: string) {
  return useQuery({
    queryKey: ['ata', id],
    queryFn: async (): Promise<Ata | null> => {
      try {
        const tableExists = await checkTableExists('atas');
        if (!tableExists) {
          console.warn('Tabela "atas" não existe.');
          return null;
        }

        const { data, error } = await supabase
          .from('atas')
          .select(`
            *,
            reuniao:reunioes(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar ata:', error);
          return null;
        }

        // Buscar nome do aprovador se houver
        if (data?.aprovada_por) {
          try {
            const { data: aprovador } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', data.aprovada_por)
              .single();

            if (aprovador) {
              data.aprovador = aprovador;
            }
          } catch {
            // Ignorar erro ao buscar aprovador
          }
        }

        return data;
      } catch (error) {
        console.error('Erro ao buscar ata:', error);
        return null;
      }
    },
    enabled: !!id
  });
}

export function useCreateAta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ata: AtaCreateInput): Promise<Ata> => {
      // Check if table exists before attempting to create
      const tableExists = await checkTableExists('atas');
      if (!tableExists) {
        throw new Error('Tabela "atas" não existe no banco de dados');
      }

      const { data, error } = await supabase
        .from('atas')
        .insert([{
          ...ata,
          status: 'pendente',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      
      // Log action (non-blocking)
      try {
        await logAction('CREATE', 'ata', data.id, { 
          numero: data.numero,
          reuniao_id: data.reuniao_id
        });
      } catch (logError) {
        console.warn('Falha ao registrar log:', logError);
      }
      
      toast.success('Ata criada com sucesso!');
    },
    onError: (error) => {
      handleDatabaseError(error, 'criar');
    }
  });
}

export function useUpdateAta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AtaUpdateInput }): Promise<Ata> => {
      // Check if table exists before attempting to update
      const tableExists = await checkTableExists('atas');
      if (!tableExists) {
        throw new Error('Tabela "atas" não existe no banco de dados');
      }

      const { data, error } = await supabase
        .from('atas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      queryClient.invalidateQueries({ queryKey: ['ata', data.id] });
      
      // Log action (non-blocking)
      try {
        await logAction('UPDATE', 'ata', data.id, { 
          numero: data.numero,
          status: data.status
        });
      } catch (logError) {
        console.warn('Falha ao registrar log:', logError);
      }
      
      toast.success('Ata atualizada com sucesso!');
    },
    onError: (error) => {
      handleDatabaseError(error, 'atualizar');
    }
  });
}

export function useDeleteAta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Check if table exists before attempting to delete
      const tableExists = await checkTableExists('atas');
      if (!tableExists) {
        throw new Error('Tabela "atas" não existe no banco de dados');
      }

      const { error } = await supabase
        .from('atas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      
      // Log action (non-blocking)
      try {
        await logAction('DELETE', 'ata', id);
      } catch (logError) {
        console.warn('Falha ao registrar log:', logError);
      }
      
      toast.success('Ata removida com sucesso!');
    },
    onError: (error) => {
      handleDatabaseError(error, 'remover');
    }
  });
}

export function useAproveAta() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, aprovada_por }: { id: string; aprovada_por: string }): Promise<Ata> => {
      // Check if table exists before attempting to approve
      const tableExists = await checkTableExists('atas');
      if (!tableExists) {
        throw new Error('Tabela "atas" não existe no banco de dados');
      }

      const { data, error } = await supabase
        .from('atas')
        .update({
          status: 'aprovada',
          aprovada_por,
          data_aprovacao: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      queryClient.invalidateQueries({ queryKey: ['ata', data.id] });
      
      // Log action (non-blocking)
      try {
        await logAction('APPROVE', 'ata', data.id, { 
          numero: data.numero,
          aprovada_por: data.aprovada_por
        });
      } catch (logError) {
        console.warn('Falha ao registrar log:', logError);
      }
      
      toast.success('Ata aprovada com sucesso!');
    },
    onError: (error) => {
      handleDatabaseError(error, 'aprovar');
    }
  });
}