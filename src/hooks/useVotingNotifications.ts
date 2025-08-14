import { useEffect, useRef } from 'react';
import { VotingNotificationService } from '@/services/votingNotificationService';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

/**
 * Hook para gerenciar notificações de votação
 * Configura automaticamente o monitoramento de notificações para reuniões
 */
export function useVotingNotifications(reuniaoId?: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const cleanupRef = useRef<(() => void) | null>(null);

  const isAdmin = ['admin', 'presidente', 'secretario'].includes(profile?.role || '');

  useEffect(() => {
    if (reuniaoId && isAdmin) {
      // Configurar monitoramento de notificações para a reunião
      VotingNotificationService.setupMeetingVotingNotifications(reuniaoId)
        .then(cleanup => {
          cleanupRef.current = cleanup;
        })
        .catch(error => {
          console.error('Erro ao configurar notificações de votação:', error);
          toast({
            title: "Erro nas notificações",
            description: "Não foi possível configurar as notificações de votação",
            variant: "destructive",
          });
        });
    }

    // Cleanup quando o componente for desmontado ou reuniaoId mudar
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [reuniaoId, isAdmin, toast]);

  /**
   * Enviar notificação personalizada para participantes da reunião
   */
  const sendCustomNotification = async (
    userIds: string[],
    title: string,
    body: string,
    sessionId?: string,
    action?: string
  ) => {
    try {
      await VotingNotificationService.sendCustomVotingNotification(
        userIds,
        title,
        body,
        sessionId,
        action
      );
      
      toast({
        title: "Notificação enviada",
        description: `Notificação enviada para ${userIds.length} usuários`,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação personalizada:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação",
        variant: "destructive",
      });
    }
  };

  /**
   * Buscar estatísticas de notificações de votação
   */
  const getNotificationStats = async (sessionId?: string) => {
    try {
      const stats = await VotingNotificationService.getVotingNotificationStats(sessionId);
      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de notificação:', error);
      return null;
    }
  };

  return {
    sendCustomNotification,
    getNotificationStats,
    isMonitoring: !!cleanupRef.current,
    canSendNotifications: isAdmin
  };
}