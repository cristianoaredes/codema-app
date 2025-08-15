import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuorumData } from '@/components/reunioes/QuorumIndicator';
import { useQueryClient } from '@tanstack/react-query';

interface QuorumControlOptions {
  meetingId: string;
  enableRealTime?: boolean;
  updateInterval?: number; // em milissegundos
}

interface QuorumMember {
  id: string;
  nome_completo: string;
  presente: boolean;
  horario_chegada?: string;
  horario_saida?: string;
}

/**
 * Hook para controle de quórum em tempo real
 */
export function useQuorumControl({ 
  meetingId, 
  enableRealTime = true,
  updateInterval = 30000 // 30 segundos por padrão
}: QuorumControlOptions) {
  const [quorumData, setQuorumData] = useState<QuorumData | null>(null);
  const [members, setMembers] = useState<QuorumMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calcula o quórum necessário (maioria simples: 50% + 1)
   */
  const calculateQuorum = useCallback((totalMembers: number): number => {
    return Math.ceil(totalMembers / 2);
  }, []);

  /**
   * Busca os dados de presença da reunião
   */
  const fetchQuorumData = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      // Buscar presenças registradas
      const { data: presencas, error: presencasError } = await supabase
        .from('presencas')
        .select(`
          *,
          profiles!presencas_conselheiro_id_fkey(
            id,
            nome_completo
          )
        `)
        .eq('reuniao_id', meetingId)
        .order('created_at', { ascending: true });

      if (presencasError) {
        throw new Error(`Erro ao buscar presenças: ${presencasError.message}`);
      }

      let membersData: QuorumMember[] = [];
      
      if (presencas && presencas.length > 0) {
        // Se há presenças registradas, usar esses dados
        membersData = presencas.map((presenca) => ({
          id: presenca.conselheiro_id,
          nome_completo: presenca.profiles?.nome_completo || 'Nome não informado',
          presente: presenca.presente || false,
          horario_chegada: presenca.horario_chegada || undefined,
          horario_saida: presenca.horario_saida || undefined,
        }));
      } else {
        // Se não há presenças, buscar todos os conselheiros ativos
        const { data: conselheiros, error: conselheirosError } = await supabase
          .from('conselheiros')
          .select(`
            id,
            profiles!conselheiros_profile_id_fkey(
              id,
              nome_completo
            )
          `)
          .eq('status', 'ativo')
          .order('profiles(nome_completo)');

        if (conselheirosError) {
          throw new Error(`Erro ao buscar conselheiros: ${conselheirosError.message}`);
        }

        membersData = (conselheiros || []).map((conselheiro) => ({
          id: conselheiro.id,
          nome_completo: conselheiro.profiles?.nome_completo || 'Nome não informado',
          presente: false,
        }));
      }

      setMembers(membersData);

      // Calcular dados do quórum
      const totalMembers = membersData.length;
      const presentMembers = membersData.filter(m => m.presente).length;
      const requiredQuorum = calculateQuorum(totalMembers);
      const hasQuorum = presentMembers >= requiredQuorum;
      const percentage = totalMembers > 0 ? (presentMembers / totalMembers) * 100 : 0;

      const newQuorumData: QuorumData = {
        totalMembers,
        presentMembers,
        requiredQuorum,
        hasQuorum,
        percentage,
        lastUpdate: new Date(),
      };

      setQuorumData(newQuorumData);
      setIsLoading(false);

    } catch (err) {
      console.error('Erro ao buscar dados de quórum:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsLoading(false);
    }
  }, [meetingId, calculateQuorum]);

  /**
   * Configura o canal de tempo real para atualizações
   */
  const setupRealTimeChannel = useCallback(() => {
    if (!enableRealTime || !supabase) return;

    // Fechar canal anterior se existir
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Criar novo canal para presença em tempo real
    const channel = supabase
      .channel(`quorum_control_${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presencas',
          filter: `reuniao_id=eq.${meetingId}`
        },
        (payload) => {
          console.log('Mudança na presença detectada:', payload);
          
          // Invalidar queries relacionadas para forçar refetch
          queryClient.invalidateQueries({ queryKey: ['presencas', meetingId] });
          queryClient.invalidateQueries({ queryKey: ['reuniao', meetingId] });
          
          // Atualizar dados do quórum
          fetchQuorumData();
        }
      )
      .on('system', {}, (status, err) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Canal de quórum conectado para reunião:', meetingId);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log('Canal de quórum desconectado para reunião:', meetingId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Erro no canal de quórum:', err);
          setIsConnected(false);
        }
      })
      .subscribe();

    channelRef.current = channel;
  }, [enableRealTime, meetingId, fetchQuorumData, queryClient]);

  /**
   * Configura polling para atualizações periódicas
   */
  const setupPolling = useCallback(() => {
    if (!enableRealTime || updateInterval <= 0) return;

    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Configurar novo intervalo
    intervalRef.current = setInterval(() => {
      fetchQuorumData();
    }, updateInterval);
  }, [enableRealTime, updateInterval, fetchQuorumData]);

  /**
   * Força uma atualização manual dos dados
   */
  const refreshQuorum = useCallback(async () => {
    setIsLoading(true);
    await fetchQuorumData();
  }, [fetchQuorumData]);

  /**
   * Marca presença de um conselheiro
   */
  const markAttendance = useCallback(async (
    conselheiro_id: string, 
    presente: boolean,
    horario?: string
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('presencas')
        .upsert({
          reuniao_id: meetingId,
          conselheiro_id,
          presente,
          horario_chegada: presente ? (horario || new Date().toISOString()) : null,
          horario_saida: !presente ? (horario || new Date().toISOString()) : null,
        }, {
          onConflict: 'reuniao_id,conselheiro_id'
        });

      if (error) {
        throw new Error(`Erro ao marcar presença: ${error.message}`);
      }

      // Atualizar dados localmente para resposta rápida
      await fetchQuorumData();

    } catch (err) {
      console.error('Erro ao marcar presença:', err);
      throw err;
    }
  }, [meetingId, fetchQuorumData]);

  /**
   * Efeito para inicialização
   */
  useEffect(() => {
    if (meetingId) {
      fetchQuorumData();
      
      if (enableRealTime) {
        setupRealTimeChannel();
        setupPolling();
      }
    }

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [meetingId, enableRealTime]);

  return {
    quorumData,
    members,
    isLoading,
    error,
    isConnected,
    refreshQuorum,
    markAttendance,
  };
}

export type { QuorumData, QuorumMember };
export default useQuorumControl;