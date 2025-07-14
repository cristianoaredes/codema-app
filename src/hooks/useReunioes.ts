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
} from '@/types/reuniao';
import { logAction } from '@/utils/auditLogger';
import { toast } from 'sonner';

export function useReunioes() {
  return useQuery({
    queryKey: ['reunioes'],
    queryFn: async (): Promise<Reuniao[]> => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('*')
        .order('data_reuniao', { ascending: false });
      
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
      const { data, error } = await supabase
        .from('reunioes')
        .insert({
          ...reuniao,
          status: 'agendada'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['reunioes'] });
      await logAction('CREATE', 'reuniao', data.id, { titulo: data.titulo });
      toast.success('Reunião criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar reunião:', error);
      toast.error('Erro ao criar reunião');
    }
  });
}

export function useUpdateReuniao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ReuniaoUpdateInput }): Promise<Reuniao> => {
      const { data, error } = await supabase
        .from('reunioes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['reunioes'] });
      queryClient.invalidateQueries({ queryKey: ['reuniao', data.id] });
      await logAction('UPDATE', 'reuniao', data.id, { titulo: data.titulo });
      toast.success('Reunião atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar reunião:', error);
      toast.error('Erro ao atualizar reunião');
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
          conselheiros(nome_completo, email, telefone)
        `)
        .order('created_at', { ascending: false });
      
      if (reuniao_id) {
        query = query.eq('reuniao_id', reuniao_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
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
          conselheiros(nome_completo, entidade_representada)
        `)
        .eq('reuniao_id', reuniao_id)
        .order('created_at', { ascending: true });
      
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
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useEnviarConvocacoes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: ConvocacaoCreateInput): Promise<void> => {
      // Create convocações for each conselheiro
      const convocacoes = params.conselheiros_ids.map(conselheiro_id => ({
        reuniao_id: params.reuniao_id,
        conselheiro_id,
        tipo_envio: params.tipo_envio === 'ambos' ? 'email' : params.tipo_envio,
        status: 'pendente'
      }));
      
      const { error } = await supabase
        .from('convocacoes')
        .upsert(convocacoes, { 
          onConflict: 'reuniao_id,conselheiro_id',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
      
      // TODO: Integrate with actual email/whatsapp sending service
      // For now, just mark as sent immediately
      const { error: updateError } = await supabase
        .from('convocacoes')
        .update({ 
          status: 'enviada',
          enviada_em: new Date().toISOString()
        })
        .eq('reuniao_id', params.reuniao_id)
        .in('conselheiro_id', params.conselheiros_ids);
      
      if (updateError) throw updateError;
    },
    onSuccess: async (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['convocacoes', params.reuniao_id] });
      await logAction('CREATE', 'convocacao', params.reuniao_id, { 
        total_conselheiros: params.conselheiros_ids.length 
      });
      toast.success('Convocações enviadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao enviar convocações:', error);
      toast.error('Erro ao enviar convocações');
    }
  });
}

export function useConfirmarPresenca() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: ConfirmacaoPresencaInput): Promise<void> => {
      const { error } = await supabase
        .from('convocacoes')
        .update({
          confirmacao_presenca: params.confirmacao,
          data_confirmacao: new Date().toISOString(),
          observacoes: params.observacoes
        })
        .eq('id', params.convocacao_id);
      
      if (error) throw error;
    },
    onSuccess: async (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['convocacoes'] });
      await logAction('UPDATE', 'convocacao', params.convocacao_id, { 
        confirmacao: params.confirmacao 
      });
      toast.success('Presença confirmada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao confirmar presença:', error);
      toast.error('Erro ao confirmar presença');
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
      
      if (error) throw error;
    },
    onSuccess: async (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['presencas', params.reuniao_id] });
      queryClient.invalidateQueries({ queryKey: ['reuniao', params.reuniao_id] });
      await logAction('UPDATE', 'presenca', `${params.reuniao_id}-${params.conselheiro_id}`, { 
        presente: params.presente 
      });
      toast.success(params.presente ? 'Presença registrada' : 'Ausência registrada');
    },
    onError: (error) => {
      console.error('Erro ao registrar presença:', error);
      toast.error('Erro ao registrar presença');
    }
  });
}