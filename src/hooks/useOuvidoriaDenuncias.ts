import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interface para Denuncia
export interface Denuncia {
  id: string;
  protocolo: string;
  tipo_denuncia: string;
  descricao: string;
  local_ocorrencia: string;
  latitude: number | null;
  longitude: number | null;
  data_ocorrencia: string | null;
  denunciante_nome: string | null;
  denunciante_telefone: string | null;
  denunciante_email: string | null;
  anonima: boolean;
  status: string;
  prioridade: string;
  fiscal_responsavel_id?: string | null;
  fiscal_responsavel?: {
    full_name: string;
  } | null;
  relatorio_fiscalizacao: string | null;
  data_fiscalizacao: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DenunciaCreateInput {
  protocolo?: string;
  tipo_denuncia: string;
  descricao: string;
  local_ocorrencia: string;
  latitude?: number | null;
  longitude?: number | null;
  data_ocorrencia?: string | null;
  denunciante_nome?: string | null;
  denunciante_cpf?: string | null;
  denunciante_telefone?: string | null;
  denunciante_email?: string | null;
  anonima: boolean;
  prioridade: string;
}

// Helper functions
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    return error?.code !== '42P01';
  } catch (error) {
    console.warn(`Verificação de tabela falhou para ${tableName}:`, error);
    return false;
  }
}

function handleDatabaseError(error: any, operation: string): void {
  console.error(`Erro na operação ${operation}:`, error);
  
  let message = `Erro ao ${operation} denúncia`;
  
  if (error?.code === '42P01') {
    message = 'Tabela de denúncias não encontrada. Entre em contato com o administrador.';
  } else if (error?.code === '42501') {
    message = 'Sem permissão para acessar denúncias. Entre em contato com o administrador.';
  } else if (error?.code === '23505') {
    message = 'Já existe uma denúncia com este protocolo.';
  } else if (error?.code === '23503') {
    message = 'Dados relacionados não encontrados.';
  } else if (error?.message) {
    message = error.message;
  }
  
  toast.error(message);
}

// Hook para listar denúncias
export function useOuvidoriaDenuncias() {
  return useQuery({
    queryKey: ['ouvidoria_denuncias'],
    queryFn: async (): Promise<Denuncia[]> => {
      // Verificar se a tabela existe
      const tableExists = await checkTableExists('ouvidoria_denuncias');
      if (!tableExists) {
        console.warn('Tabela "ouvidoria_denuncias" não existe. Retornando array vazio.');
        return [];
      }

      try {
        // Primeira tentativa: buscar denúncias sem join problemático
        const { data: denuncias, error } = await supabase
          .from('ouvidoria_denuncias')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          // Se houver erro de permissão, retornar array vazio
          if (error.code === '42501' || error.code === '403') {
            console.warn('Sem permissão para acessar denúncias:', error);
            return [];
          }
          throw error;
        }

        // Se conseguiu buscar denúncias, tentar buscar nomes dos fiscais separadamente
        if (denuncias && denuncias.length > 0) {
          const fiscalIds = [...new Set(denuncias
            .filter(d => d.fiscal_responsavel_id)
            .map(d => d.fiscal_responsavel_id))];

          if (fiscalIds.length > 0) {
            try {
              const { data: fiscais } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', fiscalIds);

              if (fiscais) {
                const fiscalMap = new Map(fiscais.map(f => [f.id, f.full_name]));
                
                // Adicionar nomes dos fiscais às denúncias
                denuncias.forEach(denuncia => {
                  if (denuncia.fiscal_responsavel_id) {
                    const fiscalName = fiscalMap.get(denuncia.fiscal_responsavel_id);
                    if (fiscalName) {
                      denuncia.fiscal_responsavel = { full_name: fiscalName };
                    }
                  }
                });
              }
            } catch (profileError) {
              // Se não conseguir buscar profiles, continuar sem os nomes
              console.warn('Não foi possível buscar nomes dos fiscais:', profileError);
            }
          }
        }

        return denuncias || [];
      } catch (error) {
        console.error('Erro ao buscar denúncias:', error);
        return [];
      }
    },
    // Retry com backoff para erros temporários
    retry: (failureCount, error: any) => {
      if (error?.code === '42P01' || error?.code === '42501') {
        return false; // Não tentar novamente para tabela inexistente ou sem permissão
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

// Hook para buscar uma denúncia específica
export function useOuvidoriaDenuncia(id: string) {
  return useQuery({
    queryKey: ['ouvidoria_denuncia', id],
    queryFn: async (): Promise<Denuncia | null> => {
      if (!id) return null;

      const tableExists = await checkTableExists('ouvidoria_denuncias');
      if (!tableExists) {
        console.warn('Tabela "ouvidoria_denuncias" não existe.');
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('ouvidoria_denuncias')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === '42501' || error.code === '403') {
            console.warn('Sem permissão para acessar denúncia:', error);
            return null;
          }
          throw error;
        }

        // Buscar nome do fiscal se houver
        if (data?.fiscal_responsavel_id) {
          try {
            const { data: fiscal } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', data.fiscal_responsavel_id)
              .single();

            if (fiscal) {
              data.fiscal_responsavel = fiscal;
            }
          } catch {
            // Ignorar erro ao buscar fiscal
          }
        }

        return data;
      } catch (error) {
        console.error('Erro ao buscar denúncia:', error);
        return null;
      }
    },
    enabled: !!id
  });
}

// Hook para criar denúncia
export function useCreateOuvidoriaDenuncia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DenunciaCreateInput): Promise<Denuncia | null> => {
      const tableExists = await checkTableExists('ouvidoria_denuncias');
      if (!tableExists) {
        throw new Error('Sistema de denúncias não está disponível no momento.');
      }

      try {
        // Gerar protocolo se não fornecido
        let protocolo = input.protocolo;
        if (!protocolo) {
          try {
            const { data: protocolData } = await supabase
              .rpc('generate_document_number', { doc_type: 'ouvidoria' });
            protocolo = protocolData;
          } catch {
            // Se não conseguir gerar, criar um protocolo local
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 1000);
            protocolo = `DEN-${year}${month}${day}-${String(random).padStart(3, '0')}`;
          }
        }

        const denunciaData = {
          ...input,
          protocolo,
          status: 'recebida'
        };

        // Remover campos vazios para denúncias anônimas
        if (input.anonima) {
          delete denunciaData.denunciante_nome;
          delete denunciaData.denunciante_cpf;
          delete denunciaData.denunciante_telefone;
          delete denunciaData.denunciante_email;
        }

        const { data, error } = await supabase
          .from('ouvidoria_denuncias')
          .insert([denunciaData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Erro ao criar denúncia:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['ouvidoria_denuncias'] });
        toast.success(`Denúncia registrada com protocolo ${data.protocolo}`);
      }
    },
    onError: (error) => {
      handleDatabaseError(error, 'registrar');
    }
  });
}

// Hook para buscar fiscais
export function useFiscais() {
  return useQuery({
    queryKey: ['fiscais'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('role', ['admin', 'fiscal'])
          .order('full_name');

        if (error) {
          console.warn('Erro ao buscar fiscais:', error);
          return [];
        }

        return (data || []).map(item => ({
          id: item.id,
          nome: item.full_name,
          email: item.email || ''
        }));
      } catch (error) {
        console.error('Erro ao buscar fiscais:', error);
        return [];
      }
    }
  });
}