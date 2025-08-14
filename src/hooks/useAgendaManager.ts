import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgendaItem } from '@/components/reunioes/AgendaManager';
import { useToast } from '@/hooks/use-toast';

interface AgendaManagerState {
  items: AgendaItem[];
  currentItemIndex: number;
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
}

export function useAgendaManager(meetingId: string) {
  const { toast } = useToast();
  const [state, setState] = useState<AgendaManagerState>({
    items: [],
    currentItemIndex: -1,
    isLoading: true,
    error: null,
    hasChanges: false
  });

  /**
   * Carrega a pauta do banco de dados
   */
  const loadAgenda = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: reuniao, error: reuniaoError } = await supabase
        .from('reunioes')
        .select('pauta, pauta_atual_index')
        .eq('id', meetingId)
        .single();

      if (reuniaoError) {
        throw new Error(`Erro ao carregar reunião: ${reuniaoError.message}`);
      }

      let items: AgendaItem[] = [];
      
      if (reuniao?.pauta) {
        try {
          const pautaData = JSON.parse(reuniao.pauta);
          
          // Se a pauta tem formato antigo (apenas itens), converter para novo formato
          if (pautaData.itens && Array.isArray(pautaData.itens)) {
            items = pautaData.itens.map((item: any, index: number) => ({
              id: item.id || `item-${index}`,
              numero: item.numero || index + 1,
              titulo: item.titulo || '',
              descricao: item.descricao || '',
              responsavel: item.responsavel || '',
              status: item.status || 'pendente',
              tempoEstimado: item.tempoEstimado || 15,
              tempoDecorrido: item.tempoDecorrido || 0,
              observacoes: item.observacoes,
              decisao: item.decisao,
              votos: item.votos,
              inicioDiscussao: item.inicioDiscussao ? new Date(item.inicioDiscussao) : undefined
            }));
          }
          // Se já tem formato novo com gerenciamento de agenda
          else if (pautaData.agenda && Array.isArray(pautaData.agenda)) {
            items = pautaData.agenda;
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse da pauta:', parseError);
          items = [];
        }
      }

      setState(prev => ({
        ...prev,
        items,
        currentItemIndex: reuniao?.pauta_atual_index ?? -1,
        isLoading: false,
        hasChanges: false
      }));

    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      }));
    }
  }, [meetingId]);

  /**
   * Salva a agenda no banco de dados
   */
  const saveAgenda = useCallback(async (items: AgendaItem[]) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Buscar pauta atual para preservar outros dados
      const { data: reuniao, error: fetchError } = await supabase
        .from('reunioes')
        .select('pauta')
        .eq('id', meetingId)
        .single();

      if (fetchError) {
        throw new Error(`Erro ao buscar reunião: ${fetchError.message}`);
      }

      let pautaData: any = {};
      
      // Preservar dados existentes da pauta
      if (reuniao?.pauta) {
        try {
          pautaData = JSON.parse(reuniao.pauta);
        } catch (parseError) {
          console.warn('Erro ao fazer parse da pauta existente, criando nova:', parseError);
        }
      }

      // Atualizar com nova agenda
      pautaData.agenda = items;
      pautaData.lastUpdated = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('reunioes')
        .update({ 
          pauta: JSON.stringify(pautaData),
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);

      if (updateError) {
        throw new Error(`Erro ao salvar agenda: ${updateError.message}`);
      }

      setState(prev => ({
        ...prev,
        items,
        hasChanges: false
      }));

      toast({
        title: 'Agenda salva com sucesso',
        description: `${items.length} itens da pauta foram atualizados.`,
      });

    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));

      toast({
        title: 'Erro ao salvar agenda',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [meetingId, toast]);

  /**
   * Atualiza o índice do item atual
   */
  const setCurrentItem = useCallback(async (index: number) => {
    try {
      const { error } = await supabase
        .from('reunioes')
        .update({ 
          pauta_atual_index: index,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);

      if (error) {
        throw new Error(`Erro ao atualizar item atual: ${error.message}`);
      }

      setState(prev => ({
        ...prev,
        currentItemIndex: index
      }));

    } catch (error) {
      console.error('Erro ao definir item atual:', error);
      toast({
        title: 'Erro ao atualizar item atual',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [meetingId, toast]);

  /**
   * Marca que houve alterações na agenda
   */
  const setItemsWithChanges = useCallback((items: AgendaItem[]) => {
    setState(prev => ({
      ...prev,
      items,
      hasChanges: true
    }));
  }, []);

  /**
   * Avança para o próximo item da pauta
   */
  const nextItem = useCallback(async () => {
    const nextIndex = state.currentItemIndex + 1;
    if (nextIndex < state.items.length) {
      await setCurrentItem(nextIndex);
    }
  }, [state.currentItemIndex, state.items.length, setCurrentItem]);

  /**
   * Volta para o item anterior da pauta
   */
  const previousItem = useCallback(async () => {
    const prevIndex = state.currentItemIndex - 1;
    if (prevIndex >= 0) {
      await setCurrentItem(prevIndex);
    }
  }, [state.currentItemIndex, setCurrentItem]);

  /**
   * Registra uma decisão para um item
   */
  const recordDecision = useCallback(async (itemIndex: number, decision: string, votes?: AgendaItem['votos']) => {
    const updatedItems = [...state.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      decisao: decision,
      votos: votes,
      status: votes ? (votes.favoraveis > votes.contrarios ? 'aprovado' : 'rejeitado') : 'aprovado'
    };

    await saveAgenda(updatedItems);
  }, [state.items, saveAgenda]);

  /**
   * Obtém estatísticas da agenda
   */
  const getAgendaStats = useCallback(() => {
    const total = state.items.length;
    const pendentes = state.items.filter(item => item.status === 'pendente').length;
    const emAndamento = state.items.filter(item => item.status === 'em_discussao').length;
    const concluidos = state.items.filter(item => 
      ['aprovado', 'rejeitado', 'adiado'].includes(item.status)
    ).length;
    const tempoTotal = state.items.reduce((acc, item) => acc + (item.tempoEstimado || 0), 0);
    const tempoDecorrido = state.items.reduce((acc, item) => acc + (item.tempoDecorrido || 0), 0);

    return {
      total,
      pendentes,
      emAndamento,
      concluidos,
      tempoTotal,
      tempoDecorrido,
      progress: total > 0 ? (concluidos / total) * 100 : 0
    };
  }, [state.items]);

  // Carregar agenda na inicialização
  useEffect(() => {
    if (meetingId) {
      loadAgenda();
    }
  }, [meetingId, loadAgenda]);

  return {
    // Estado
    items: state.items,
    currentItemIndex: state.currentItemIndex,
    isLoading: state.isLoading,
    error: state.error,
    hasChanges: state.hasChanges,
    
    // Ações
    loadAgenda,
    saveAgenda,
    setCurrentItem,
    setItemsWithChanges,
    nextItem,
    previousItem,
    recordDecision,
    
    // Utilitários
    getAgendaStats,
    currentItem: state.currentItemIndex >= 0 ? state.items[state.currentItemIndex] : null,
  };
}

export default useAgendaManager;