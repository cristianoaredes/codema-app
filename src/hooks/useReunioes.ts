import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Reuniao, 
  ReuniaoCreateInput, 
  ReuniaoUpdateInput,
  Convocacao,
  Presenca,
  ConvocacaoTemplate,
  ConvocacaoCreateInput,
  ConfirmacaoPresencaInput
} from '@/types';
import { logAction } from '@/utils';
import { toast } from 'sonner';
import { ProtocoloGenerator } from '@/utils';
import { EmailService } from '@/services/emailService';

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
    throw new Error('Já existe um registro com essas informações. Verifique os dados únicos como protocolo.');
  }

  if (error?.code === '23503') {
    throw new Error('Erro de referência: verifique se todos os dados relacionados existem.');
  }

  // Generic error
  throw new Error(error?.message || `Erro desconhecido durante ${operation}`);
}

export function useReunioes() {
  return useQuery({
    queryKey: ['reunioes'],
    queryFn: async (): Promise<Reuniao[]> => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('*')
        .order('data_reuniao', { ascending: false });
      
      // If reunioes table doesn't exist, return empty array
      if (error?.code === '42P01') {
        console.warn('Reunioes table does not exist, returning empty array');
        return [];
      }
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useReuniao(id: string) {
  return useQuery({
    queryKey: ['reuniao', id],
    queryFn: async (): Promise<Reuniao> => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('*')
        .eq('id', id)
        .single();
      
      // If reunioes table doesn't exist, throw specific error
      if (error?.code === '42P01') {
        throw new Error('A tabela "reunioes" não existe. Verifique a estrutura do banco de dados.');
      }
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateReuniao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reuniao: ReuniaoCreateInput): Promise<Reuniao> => {
      // First, check if reunioes table exists
      const reunioesTableExists = await checkTableExists('reunioes');
      
      if (!reunioesTableExists) {
        console.warn('Reunioes table does not exist. Cannot create new reuniao.');
        throw new Error('A tabela "reunioes" não existe. Não é possível criar novas reuniões. Verifique a estrutura do banco de dados.');
      }

      try {
        // Gerar protocolo para a reunião
        const protocoloReuniao = await ProtocoloGenerator.gerarProtocolo('REU');
        
        const { data, error } = await supabase
          .from('reunioes')
          .insert({
            titulo: reuniao.titulo,
            tipo: reuniao.tipo,
            data_reuniao: reuniao.data_reuniao,
            local: reuniao.local,
            pauta: reuniao.pauta,
            secretario_id: reuniao.secretario_id,
            protocolo: protocoloReuniao,
            status: reuniao.status || 'agendada'
          })
          .select()
          .single();
        
        if (error) {
          handleDatabaseError(error, 'CREATE', 'reunioes');
        }
        
        return data;
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "reunioes" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['reunioes'] });
      try {
        await logAction('CREATE', 'reuniao', data.id, { 
          titulo: data.titulo, 
          protocolo: data.protocolo 
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      toast.success(`Reunião criada com sucesso! Protocolo: ${data.protocolo}`);
    },
    onError: (error: Error) => {
      console.error('Erro ao criar reunião:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('já existe')) {
        toast.error('Já existe uma reunião com essas informações');
      } else {
        toast.error('Erro ao criar reunião. Tente novamente.');
      }
    }
  });
}

export function useUpdateReuniao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ReuniaoUpdateInput }): Promise<Reuniao> => {
      // First, check if reunioes table exists
      const reunioesTableExists = await checkTableExists('reunioes');
      
      if (!reunioesTableExists) {
        console.warn('Reunioes table does not exist. Cannot update reuniao.');
        throw new Error('A tabela "reunioes" não existe. Não é possível atualizar reuniões. Verifique a estrutura do banco de dados.');
      }

      try {
        const { data, error } = await supabase
          .from('reunioes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          handleDatabaseError(error, 'UPDATE', 'reunioes');
        }
        
        return data;
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "reunioes" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['reunioes'] });
      queryClient.invalidateQueries({ queryKey: ['reuniao', data.id] });
      
      try {
        await logAction('UPDATE', 'reuniao', data.id, { titulo: data.titulo });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      
      toast.success('Reunião atualizada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar reunião:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('não encontrado')) {
        toast.error('Reunião não encontrada');
      } else if (error.message.includes('já existe')) {
        toast.error('Já existe uma reunião com essas informações');
      } else {
        toast.error('Erro ao atualizar reunião. Tente novamente.');
      }
    }
  });
}

export function useConvocacoes(reuniao_id?: string) {
  return useQuery({
    queryKey: ['convocacoes', reuniao_id],
    queryFn: async (): Promise<Convocacao[]> => {
      let query = supabase
        .from('convocacoes')
        .select(`
          *,
          profiles!convocacoes_conselheiro_id_fkey(nome_completo, email, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (reuniao_id) {
        query = query.eq('reuniao_id', reuniao_id);
      }
      
      const { data, error } = await query;
      
      // If convocacoes table doesn't exist, return empty array
      if (error?.code === '42P01') {
        console.warn('Convocacoes table does not exist, returning empty array');
        return [];
      }
      
      if (error) throw error;
      
      // Validate and convert data to match our interface
      if (!data) return [];
      
      const validTipoEnvio = ['email', 'whatsapp', 'postal'] as const;
      const validStatus = ['pendente', 'enviada', 'entregue', 'erro'] as const;
      const validConfirmacao = ['confirmada', 'rejeitada', 'pendente'] as const;
      
      const convertedData: Convocacao[] = data.map(item => ({
        ...item,
        tipo_envio: validTipoEnvio.includes(item.tipo_envio as typeof validTipoEnvio[number]) 
          ? (item.tipo_envio as 'email' | 'whatsapp' | 'postal')
          : 'email', // fallback seguro
        status: validStatus.includes(item.status as typeof validStatus[number])
          ? (item.status as 'pendente' | 'enviada' | 'entregue' | 'erro')
          : 'pendente', // fallback seguro
        confirmacao_presenca: item.confirmacao_presenca && validConfirmacao.includes(item.confirmacao_presenca as typeof validConfirmacao[number])
          ? (item.confirmacao_presenca as 'confirmada' | 'rejeitada' | 'pendente')
          : undefined
      }));
      
      return convertedData;
    },
    enabled: !!reuniao_id
  });
}

export function usePresencas(reuniao_id: string) {
  return useQuery({
    queryKey: ['presencas', reuniao_id],
    queryFn: async (): Promise<Presenca[]> => {
      const { data, error } = await supabase
        .from('presencas')
        .select(`
          *,
          profiles!presencas_conselheiro_id_fkey(nome_completo, entidade_representada)
        `)
        .eq('reuniao_id', reuniao_id)
        .order('created_at', { ascending: true });
      
      // If presencas table doesn't exist, return empty array
      if (error?.code === '42P01') {
        console.warn('Presencas table does not exist, returning empty array');
        return [];
      }
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!reuniao_id
  });
}

export function useConvocacaoTemplates() {
  return useQuery({
    queryKey: ['convocacao-templates'],
    queryFn: async (): Promise<ConvocacaoTemplate[]> => {
      const { data, error } = await supabase
        .from('convocacao_templates')
        .select('*')
        .eq('ativo', true)
        .order('tipo_reuniao', { ascending: true });
      
      // If convocacao_templates table doesn't exist, return empty array
      if (error?.code === '42P01') {
        console.warn('Convocacao_templates table does not exist, returning empty array');
        return [];
      }
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useEnviarConvocacoes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: ConvocacaoCreateInput): Promise<void> => {
      // First, check if necessary tables exist
      const convocacoesTableExists = await checkTableExists('convocacoes');
      const conselheirosTableExists = await checkTableExists('conselheiros');
      
      if (!convocacoesTableExists) {
        throw new Error('A tabela "convocacoes" não existe. Não é possível enviar convocações. Verifique a estrutura do banco de dados.');
      }
      
      if (!conselheirosTableExists) {
        throw new Error('A tabela "conselheiros" não existe. Não é possível enviar convocações. Verifique a estrutura do banco de dados.');
      }

      try {
        // First, get conselheiro_ids from profile_ids
        // Since convocacoes table references conselheiros.id, not profiles.id
        const { data: conselheiros, error: conselheiroError } = await supabase
          .from('conselheiros')
          .select('id, profile_id')
          .in('profile_id', params.conselheiros_ids);
        
        if (conselheiroError) {
          handleDatabaseError(conselheiroError, 'READ', 'conselheiros');
        }
        
        if (!conselheiros || conselheiros.length === 0) {
          throw new Error('Nenhum conselheiro encontrado para os profiles selecionados');
        }
        
        // Create convocações using the correct conselheiro_ids
        const convocacoes = conselheiros.map(conselheiro => ({
          reuniao_id: params.reuniao_id,
          conselheiro_id: conselheiro.id,
          tipo_envio: params.tipo_envio === 'ambos' ? 'email' : params.tipo_envio,
          status: 'pendente'
        }));
        
        const { error } = await supabase
          .from('convocacoes')
          .upsert(convocacoes, { 
            onConflict: 'reuniao_id,conselheiro_id',
            ignoreDuplicates: false 
          });
        
        if (error) {
          handleDatabaseError(error, 'CREATE', 'convocacoes');
        }
        
        // Get reunion data for email template
        const { data: reuniao, error: reuniaoError } = await supabase
          .from('reunioes')
          .select('numero_reuniao, tipo, data_hora, local, pauta')
          .eq('id', params.reuniao_id)
          .single();
        
        if (reuniaoError) {
          handleDatabaseError(reuniaoError, 'READ', 'reunioes');
        }
        
        if (!reuniao) {
          throw new Error('Reunião não encontrada');
        }

        // Get conselheiros with profiles for email sending
        const { data: conselheirosComPerfis, error: perfilError } = await supabase
          .from('conselheiros')
          .select(`
            id,
            profile_id,
            profiles:profile_id (
              id,
              full_name,
              email
            )
          `)
          .in('profile_id', params.conselheiros_ids);
        
        if (perfilError) {
          handleDatabaseError(perfilError, 'READ', 'conselheiros');
        }
        
        if (!conselheirosComPerfis || conselheirosComPerfis.length === 0) {
          throw new Error('Nenhum conselheiro encontrado para os profiles selecionados');
        }

        // Send emails to conselheiros
        const emailPromises = conselheirosComPerfis
          .filter(c => c.profiles?.email) // Only send to those with email
          .map(async (conselheiro) => {
            try {
              if (!conselheiro.profiles?.email) return;
              
              await EmailService.sendConvocacao(
                conselheiro.profiles.email,
                conselheiro.profiles.full_name || 'Conselheiro(a)',
                {
                  numero_reuniao: reuniao.numero_reuniao,
                  tipo: reuniao.tipo,
                  data_hora: reuniao.data_hora,
                  local: reuniao.local,
                  pauta: reuniao.pauta || undefined
                },
                params.envio_agendado ? new Date(params.envio_agendado) : undefined
              );
              
              console.log(`Convocação enviada para: ${conselheiro.profiles.email}`);
            } catch (emailError) {
              console.error(`Erro ao enviar email para ${conselheiro.profiles?.email}:`, emailError);
              // Don't throw - continue with other emails
            }
          });

        // Wait for all emails to be processed
        await Promise.allSettled(emailPromises);
        
        // Update convocation status to sent
        const conselheiroIds = conselheiros.map(c => c.id);
        const { error: updateError } = await supabase
          .from('convocacoes')
          .update({ 
            status: 'enviada',
            enviada_em: new Date().toISOString()
          })
          .eq('reuniao_id', params.reuniao_id)
          .in('conselheiro_id', conselheiroIds);
        
        if (updateError) {
          handleDatabaseError(updateError, 'UPDATE', 'convocacoes');
        }
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('Tabelas necessárias não foram encontradas. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['convocacoes', params.reuniao_id] });
      try {
        await logAction('CREATE', 'convocacao', params.reuniao_id, { 
          total_conselheiros: params.conselheiros_ids.length 
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      toast.success('Convocações enviadas com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao enviar convocações:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('Nenhum conselheiro')) {
        toast.error('Nenhum conselheiro válido encontrado');
      } else {
        toast.error('Erro ao enviar convocações. Tente novamente.');
      }
    }
  });
}

export function useConfirmarPresenca() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: ConfirmacaoPresencaInput): Promise<void> => {
      // First, check if convocacoes table exists
      const convocacoesTableExists = await checkTableExists('convocacoes');
      
      if (!convocacoesTableExists) {
        throw new Error('A tabela "convocacoes" não existe. Não é possível confirmar presença. Verifique a estrutura do banco de dados.');
      }

      try {
        const { error } = await supabase
          .from('convocacoes')
          .update({
            confirmacao_presenca: params.confirmacao,
            data_confirmacao: new Date().toISOString(),
            observacoes: params.observacoes
          })
          .eq('id', params.convocacao_id);
        
        if (error) {
          handleDatabaseError(error, 'UPDATE', 'convocacoes');
        }
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "convocacoes" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['convocacoes'] });
      try {
        await logAction('UPDATE', 'convocacao', params.convocacao_id, { 
          confirmacao: params.confirmacao 
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      toast.success('Presença confirmada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao confirmar presença:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('não encontrado')) {
        toast.error('Convocação não encontrada');
      } else {
        toast.error('Erro ao confirmar presença. Tente novamente.');
      }
    }
  });
}

export function useMarcarPresenca() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { 
      reuniao_id: string; 
      conselheiro_id: string; 
      presente: boolean;
      horario_chegada?: string;
      justificativa_ausencia?: string;
    }): Promise<void> => {
      // First, check if presencas table exists
      const presencasTableExists = await checkTableExists('presencas');
      
      if (!presencasTableExists) {
        throw new Error('A tabela "presencas" não existe. Não é possível registrar presença. Verifique a estrutura do banco de dados.');
      }

      try {
        const { error } = await supabase
          .from('presencas')
          .upsert({
            reuniao_id: params.reuniao_id,
            conselheiro_id: params.conselheiro_id,
            presente: params.presente,
            horario_chegada: params.presente ? (params.horario_chegada || new Date().toISOString()) : null,
            justificativa_ausencia: !params.presente ? params.justificativa_ausencia : null
          }, {
            onConflict: 'reuniao_id,conselheiro_id'
          });
        
        if (error) {
          handleDatabaseError(error, 'UPSERT', 'presencas');
        }
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "presencas" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['presencas', params.reuniao_id] });
      queryClient.invalidateQueries({ queryKey: ['reuniao', params.reuniao_id] });
      
      try {
        await logAction('UPDATE', 'presenca', `${params.reuniao_id}-${params.conselheiro_id}`, { 
          presente: params.presente 
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      
      toast.success(params.presente ? 'Presença registrada' : 'Ausência registrada');
    },
    onError: (error: Error) => {
      console.error('Erro ao registrar presença:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('referência')) {
        toast.error('Erro de referência: verifique se a reunião e conselheiro existem');
      } else {
        toast.error('Erro ao registrar presença. Tente novamente.');
      }
    }
  });
}

export function useGerarProtocoloAta() {
  return useMutation({
    mutationFn: async (reuniao_id: string): Promise<string> => {
      // First, check if reunioes table exists
      const reunioesTableExists = await checkTableExists('reunioes');
      
      if (!reunioesTableExists) {
        throw new Error('A tabela "reunioes" não existe. Não é possível gerar protocolo da ata. Verifique a estrutura do banco de dados.');
      }

      try {
        // Gerar protocolo para a ata
        const protocoloAta = await ProtocoloGenerator.gerarProtocolo('ATA');
        
        // Atualizar a reunião com o protocolo da ata
        const { error } = await supabase
          .from('reunioes')
          .update({ protocolo_ata: protocoloAta })
          .eq('id', reuniao_id);
        
        if (error) {
          handleDatabaseError(error, 'UPDATE', 'reunioes');
        }
        
        return protocoloAta;
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "reunioes" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (protocoloAta, reuniao_id) => {
      try {
        await logAction('CREATE', 'protocolo_ata', reuniao_id, { 
          protocolo: protocoloAta 
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      toast.success(`Protocolo da ata gerado: ${protocoloAta}`);
    },
    onError: (error: Error) => {
      console.error('Erro ao gerar protocolo da ata:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('não encontrado')) {
        toast.error('Reunião não encontrada');
      } else {
        toast.error('Erro ao gerar protocolo da ata. Tente novamente.');
      }
    }
  });
}

export function useGerarProtocoloConvocacao() {
  return useMutation({
    mutationFn: async (reuniao_id: string): Promise<string> => {
      // First, check if reunioes table exists
      const reunioesTableExists = await checkTableExists('reunioes');
      
      if (!reunioesTableExists) {
        throw new Error('A tabela "reunioes" não existe. Não é possível gerar protocolo da convocação. Verifique a estrutura do banco de dados.');
      }

      try {
        // Gerar protocolo para a convocação
        const protocoloConvocacao = await ProtocoloGenerator.gerarProtocolo('CONV');
        
        // Atualizar a reunião com o protocolo da convocação
        const { error } = await supabase
          .from('reunioes')
          .update({ protocolo_convocacao: protocoloConvocacao })
          .eq('id', reuniao_id);
        
        if (error) {
          handleDatabaseError(error, 'UPDATE', 'reunioes');
        }
        
        return protocoloConvocacao;
      } catch (error: any) {
        if (error?.code === '42P01') {
          throw new Error('A tabela "reunioes" não foi encontrada. Verifique a estrutura do banco de dados.');
        }
        throw error;
      }
    },
    onSuccess: async (protocoloConvocacao, reuniao_id) => {
      try {
        await logAction('CREATE', 'protocolo_convocacao', reuniao_id, { 
          protocolo: protocoloConvocacao 
        });
      } catch (logError) {
        console.warn('Failed to log action:', logError);
        // Don't fail the entire operation for logging issues
      }
      toast.success(`Protocolo da convocação gerado: ${protocoloConvocacao}`);
    },
    onError: (error: Error) => {
      console.error('Erro ao gerar protocolo da convocação:', error);
      
      // Show user-friendly error message
      if (error.message.includes('tabela')) {
        toast.error(error.message);
      } else if (error.message.includes('não encontrado')) {
        toast.error('Reunião não encontrada');
      } else {
        toast.error('Erro ao gerar protocolo da convocação. Tente novamente.');
      }
    }
  });
}