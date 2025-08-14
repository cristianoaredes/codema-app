import { PushNotificationService, PushNotification } from './pushNotificationService';
import { VotingService, VotingSession, VotingResults } from './votingService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para integração entre o sistema de votação e notificações push
 * Gerencia notificações automáticas para eventos de votação
 */
export class VotingNotificationService {
  
  /**
   * Enviar notificação quando uma sessão de votação é criada
   */
  static async notifySessionCreated(
    session: VotingSession,
    targetUsers: string[]
  ): Promise<void> {
    try {
      const notification = this.createSessionNotification(session, 'created');
      
      // Enviar para todos os usuários especificados
      const promises = targetUsers.map(userId => 
        PushNotificationService.sendNotification(userId, notification)
      );

      await Promise.allSettled(promises);
      
      console.log(`Notificação de criação enviada para ${targetUsers.length} usuários`);
    } catch (error) {
      console.error('Erro ao enviar notificação de criação de sessão:', error);
    }
  }

  /**
   * Enviar notificação quando uma sessão de votação é iniciada
   */
  static async notifySessionStarted(
    session: VotingSession,
    targetUsers: string[]
  ): Promise<void> {
    try {
      const notification = this.createSessionNotification(session, 'started');
      
      // Enviar para todos os usuários presentes
      const promises = targetUsers.map(userId => 
        PushNotificationService.sendNotification(userId, notification)
      );

      await Promise.allSettled(promises);
      
      console.log(`Notificação de início enviada para ${targetUsers.length} usuários`);
    } catch (error) {
      console.error('Erro ao enviar notificação de início de sessão:', error);
    }
  }

  /**
   * Enviar notificação quando uma sessão de votação é encerrada
   */
  static async notifySessionEnded(
    session: VotingSession,
    results: VotingResults,
    targetUsers: string[]
  ): Promise<void> {
    try {
      const notification = this.createSessionEndedNotification(session, results);
      
      // Enviar para todos os participantes
      const promises = targetUsers.map(userId => 
        PushNotificationService.sendNotification(userId, notification)
      );

      await Promise.allSettled(promises);
      
      console.log(`Notificação de encerramento enviada para ${targetUsers.length} usuários`);
    } catch (error) {
      console.error('Erro ao enviar notificação de encerramento de sessão:', error);
    }
  }

  /**
   * Enviar lembrete de votação para usuários que ainda não votaram
   */
  static async sendVotingReminder(
    session: VotingSession,
    nonVoters: string[],
    timeRemaining: number
  ): Promise<void> {
    try {
      const notification = this.createVotingReminderNotification(session, timeRemaining);
      
      // Enviar apenas para quem não votou
      const promises = nonVoters.map(userId => 
        PushNotificationService.sendNotification(userId, notification)
      );

      await Promise.allSettled(promises);
      
      console.log(`Lembrete de votação enviado para ${nonVoters.length} usuários`);
    } catch (error) {
      console.error('Erro ao enviar lembrete de votação:', error);
    }
  }

  /**
   * Enviar notificação de quórum crítico
   */
  static async notifyQuorumAlert(
    session: VotingSession,
    currentVotes: number,
    requiredQuorum: number,
    targetUsers: string[]
  ): Promise<void> {
    try {
      const notification = this.createQuorumAlertNotification(
        session,
        currentVotes,
        requiredQuorum
      );
      
      const promises = targetUsers.map(userId => 
        PushNotificationService.sendNotification(userId, notification)
      );

      await Promise.allSettled(promises);
      
      console.log(`Alerta de quórum enviado para ${targetUsers.length} usuários`);
    } catch (error) {
      console.error('Erro ao enviar alerta de quórum:', error);
    }
  }

  /**
   * Configurar monitoramento automático de uma sessão de votação
   */
  static async setupVotingSessionMonitoring(sessionId: string): Promise<() => void> {
    let reminderInterval: NodeJS.Timeout | null = null;
    let quorumCheckInterval: NodeJS.Timeout | null = null;

    try {
      // Carregar dados da sessão
      const details = await VotingService.getVotingSessionDetails(sessionId);
      const session = details.session;

      if (session.status !== 'aberta') {
        return () => {}; // Sessão não está ativa
      }

      // Configurar lembretes periódicos
      if (session.timeout_minutes && session.timeout_minutes > 5) {
        const reminderIntervals = [
          session.timeout_minutes * 0.5, // 50% do tempo
          session.timeout_minutes * 0.75, // 75% do tempo
          session.timeout_minutes * 0.9   // 90% do tempo
        ];

        reminderIntervals.forEach(intervalMinutes => {
          setTimeout(async () => {
            await this.checkAndSendReminders(sessionId);
          }, intervalMinutes * 60 * 1000);
        });
      }

      // Configurar verificação de quórum a cada 2 minutos
      quorumCheckInterval = setInterval(async () => {
        await this.checkQuorumStatus(sessionId);
      }, 2 * 60 * 1000);

      // Configurar escuta em tempo real para eventos de votação
      const unsubscribeRealtime = VotingService.subscribeToVotingSession(sessionId, {
        onVote: async () => {
          // Quando alguém vota, verificar se precisamos notificar sobre quórum
          await this.checkQuorumStatus(sessionId);
        },
        onSessionUpdate: async (updatedSession) => {
          if (updatedSession.status === 'encerrada') {
            // Sessão encerrada, enviar notificação final
            const results = await VotingService.calculateResults(sessionId);
            const participantIds = await this.getSessionParticipants(sessionId);
            await this.notifySessionEnded(updatedSession, results, participantIds);
            
            // Limpar intervalos
            if (reminderInterval) clearInterval(reminderInterval);
            if (quorumCheckInterval) clearInterval(quorumCheckInterval);
          }
        }
      });

      // Retornar função de cleanup
      return () => {
        if (reminderInterval) clearInterval(reminderInterval);
        if (quorumCheckInterval) clearInterval(quorumCheckInterval);
        unsubscribeRealtime();
      };

    } catch (error) {
      console.error('Erro ao configurar monitoramento da sessão:', error);
      return () => {};
    }
  }

  /**
   * Verificar e enviar lembretes para usuários que não votaram
   */
  private static async checkAndSendReminders(sessionId: string): Promise<void> {
    try {
      const details = await VotingService.getVotingSessionDetails(sessionId);
      const session = details.session;

      if (session.status !== 'aberta') return;

      // Buscar usuários presentes
      const presence = await VotingService.getVotingPresence(sessionId);
      const presentUsers = presence.filter(p => p.presente).map(p => p.conselheiro_id);

      // Buscar usuários que já votaram
      const { data: votes } = await supabase
        .from('votes')
        .select('voter_id')
        .eq('session_id', sessionId);

      const voterIds = votes?.map(v => v.voter_id) || [];
      
      // Usuários que ainda não votaram
      const nonVoters = presentUsers.filter(userId => !voterIds.includes(userId));

      if (nonVoters.length > 0) {
        // Calcular tempo restante
        const startTime = new Date(session.started_at!).getTime();
        const timeoutMs = session.timeout_minutes * 60 * 1000;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, timeoutMs - elapsed);

        await this.sendVotingReminder(session, nonVoters, remaining);
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error);
    }
  }

  /**
   * Verificar status do quórum e enviar alertas se necessário
   */
  private static async checkQuorumStatus(sessionId: string): Promise<void> {
    try {
      const details = await VotingService.getVotingSessionDetails(sessionId);
      const session = details.session;
      const results = details.results;

      if (!results || session.status !== 'aberta') return;

      const participationRate = results.total_present > 0 
        ? (results.total_votes + results.total_abstentions) / results.total_present 
        : 0;

      // Se a participação está baixa (menos de 60%) e ainda há tempo
      if (participationRate < 0.6) {
        const presentUsers = await this.getSessionParticipants(sessionId);
        await this.notifyQuorumAlert(
          session,
          results.total_votes + results.total_abstentions,
          session.quorum_minimo,
          presentUsers
        );
      }
    } catch (error) {
      console.error('Erro ao verificar status do quórum:', error);
    }
  }

  /**
   * Buscar IDs dos participantes da sessão
   */
  private static async getSessionParticipants(sessionId: string): Promise<string[]> {
    try {
      const presence = await VotingService.getVotingPresence(sessionId);
      return presence.filter(p => p.presente).map(p => p.conselheiro_id);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  }

  /**
   * Criar notificação para eventos de sessão
   */
  private static createSessionNotification(
    session: VotingSession,
    type: 'created' | 'started'
  ): PushNotification {
    const baseNotification = {
      id: `voting_${type}_${session.id}`,
      category: 'voting' as const,
      priority: 'high' as const,
      timestamp: new Date().toISOString(),
      data: {
        sessionId: session.id,
        reuniaoId: session.reuniao_id,
        type,
        action: 'open_voting'
      }
    };

    if (type === 'created') {
      return {
        ...baseNotification,
        title: '📋 Nova Votação Criada',
        body: `"${session.titulo}" foi criada e está aguardando início`,
        icon: '/icons/voting-ballot.png'
      };
    } else {
      return {
        ...baseNotification,
        title: '🗳️ Votação Iniciada!',
        body: `"${session.titulo}" está aberta para votação`,
        icon: '/icons/voting-active.png'
      };
    }
  }

  /**
   * Criar notificação para encerramento de sessão
   */
  private static createSessionEndedNotification(
    session: VotingSession,
    results: VotingResults
  ): PushNotification {
    const approved = results.approved;
    const title = approved ? '✅ Votação Aprovada' : '❌ Votação Rejeitada';
    const body = approved 
      ? `"${session.titulo}" foi aprovada com ${results.total_votes} votos`
      : `"${session.titulo}" foi rejeitada. Veja os resultados completos`;

    return {
      id: `voting_ended_${session.id}`,
      title,
      body,
      icon: approved ? '/icons/voting-approved.png' : '/icons/voting-rejected.png',
      category: 'voting',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: {
        sessionId: session.id,
        reuniaoId: session.reuniao_id,
        type: 'ended',
        approved,
        action: 'view_results'
      }
    };
  }

  /**
   * Criar notificação de lembrete de votação
   */
  private static createVotingReminderNotification(
    session: VotingSession,
    timeRemainingMs: number
  ): PushNotification {
    const minutesRemaining = Math.floor(timeRemainingMs / (60 * 1000));
    
    return {
      id: `voting_reminder_${session.id}_${Date.now()}`,
      title: '⏰ Lembrete de Votação',
      body: `Você ainda não votou em "${session.titulo}". ${minutesRemaining} minutos restantes`,
      icon: '/icons/voting-reminder.png',
      category: 'reminder',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: {
        sessionId: session.id,
        reuniaoId: session.reuniao_id,
        type: 'reminder',
        timeRemaining: timeRemainingMs,
        action: 'open_voting'
      }
    };
  }

  /**
   * Criar notificação de alerta de quórum
   */
  private static createQuorumAlertNotification(
    session: VotingSession,
    currentVotes: number,
    requiredQuorum: number
  ): PushNotification {
    const remaining = requiredQuorum - currentVotes;
    
    return {
      id: `quorum_alert_${session.id}_${Date.now()}`,
      title: '⚠️ Alerta de Quórum',
      body: `"${session.titulo}" precisa de mais ${remaining} votos para atingir o quórum`,
      icon: '/icons/voting-alert.png',
      category: 'voting',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: {
        sessionId: session.id,
        reuniaoId: session.reuniao_id,
        type: 'quorum_alert',
        currentVotes,
        requiredQuorum,
        action: 'open_voting'
      }
    };
  }

  /**
   * Configurar notificações automáticas para uma reunião
   * Monitora todas as sessões de votação da reunião
   */
  static async setupMeetingVotingNotifications(reuniaoId: string): Promise<() => void> {
    const cleanupFunctions: (() => void)[] = [];

    try {
      // Configurar escuta para novas sessões de votação
      const channel = supabase
        .channel(`meeting_voting_${reuniaoId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'voting_sessions',
            filter: `reuniao_id=eq.${reuniaoId}`
          },
          async (payload) => {
            const session = payload.new as VotingSession;
            const participantIds = await this.getSessionParticipants(session.id);
            await this.notifySessionCreated(session, participantIds);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'voting_sessions',
            filter: `reuniao_id=eq.${reuniaoId}`
          },
          async (payload) => {
            const session = payload.new as VotingSession;
            
            if (session.status === 'aberta' && payload.old.status === 'preparando') {
              // Sessão iniciada
              const participantIds = await this.getSessionParticipants(session.id);
              await this.notifySessionStarted(session, participantIds);
              
              // Configurar monitoramento da sessão
              const cleanup = await this.setupVotingSessionMonitoring(session.id);
              cleanupFunctions.push(cleanup);
            }
          }
        )
        .subscribe();

      cleanupFunctions.push(() => {
        supabase.removeChannel(channel);
      });

      // Configurar monitoramento para sessões já ativas
      const existingSessions = await VotingService.getVotingSessionsByReuniao(reuniaoId);
      const activeSessions = existingSessions.filter(s => s.status === 'aberta');
      
      for (const session of activeSessions) {
        const cleanup = await this.setupVotingSessionMonitoring(session.id);
        cleanupFunctions.push(cleanup);
      }

      // Retornar função de cleanup que remove todos os monitoramentos
      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
      };

    } catch (error) {
      console.error('Erro ao configurar notificações da reunião:', error);
      return () => {};
    }
  }

  /**
   * Enviar notificação personalizada para um grupo de usuários
   */
  static async sendCustomVotingNotification(
    userIds: string[],
    title: string,
    body: string,
    sessionId?: string,
    action?: string
  ): Promise<void> {
    try {
      const notification: PushNotification = {
        id: `custom_voting_${Date.now()}`,
        title,
        body,
        icon: '/icons/voting-custom.png',
        category: 'voting',
        priority: 'normal',
        timestamp: new Date().toISOString(),
        data: {
          sessionId,
          type: 'custom',
          action: action || 'open_app'
        }
      };

      const promises = userIds.map(userId => 
        PushNotificationService.sendNotification(userId, notification)
      );

      await Promise.allSettled(promises);
      
      console.log(`Notificação personalizada enviada para ${userIds.length} usuários`);
    } catch (error) {
      console.error('Erro ao enviar notificação personalizada:', error);
    }
  }

  /**
   * Obter estatísticas de notificações de votação
   */
  static async getVotingNotificationStats(sessionId?: string): Promise<{
    total_sent: number;
    delivery_rate: number;
    click_rate: number;
    categories: Record<string, number>;
  }> {
    try {
      const query = supabase
        .from('push_notifications_sent')
        .select('*')
        .eq('category', 'voting');

      if (sessionId) {
        query.contains('data', { sessionId });
      }

      const { data: notifications } = await query;

      if (!notifications) {
        return {
          total_sent: 0,
          delivery_rate: 0,
          click_rate: 0,
          categories: {}
        };
      }

      const totalSent = notifications.length;
      const delivered = notifications.filter(n => n.delivered === true).length;
      const clicked = notifications.filter(n => n.clicked === true).length;

      const categories = notifications.reduce((acc, notification) => {
        const type = notification.data?.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_sent: totalSent,
        delivery_rate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        click_rate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
        categories
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de notificação:', error);
      return {
        total_sent: 0,
        delivery_rate: 0,
        click_rate: 0,
        categories: {}
      };
    }
  }
}