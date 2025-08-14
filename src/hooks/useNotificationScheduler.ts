import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, ConvocacaoData, NotificationEvent } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledNotification {
  id: string;
  type: 'convocacao' | 'lembrete' | 'cancelamento';
  reunion_id: string;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  recipients_count: number;
  template_name: string;
}

export interface NotificationConfig {
  antecedencia_dias: number;
  lembrete_24h: boolean;
  lembrete_2h: boolean;
  incluir_pauta: boolean;
  incluir_documentos: boolean;
  canais: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export function useNotificationScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado local para configurações
  const [config, setConfig] = useState<NotificationConfig>({
    antecedencia_dias: 3,
    lembrete_24h: true,
    lembrete_2h: true,
    incluir_pauta: true,
    incluir_documentos: false,
    canais: {
      email: true,
      sms: true,
      whatsapp: false
    }
  });

  // Query para buscar notificações agendadas
  const {
    data: scheduledNotifications,
    isLoading: isLoadingScheduled,
    refetch: refetchScheduled
  } = useQuery({
    queryKey: ['scheduled-notifications'],
    queryFn: async () => {
      // Simular busca de notificações agendadas
      // Em produção, isso viria do Supabase
      return [
        {
          id: '1',
          type: 'convocacao' as const,
          reunion_id: 'reunion-1',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          status: 'pending' as const,
          recipients_count: 12,
          template_name: 'Convocação para Reunião'
        },
        {
          id: '2',
          type: 'lembrete' as const,
          reunion_id: 'reunion-1',
          scheduled_at: new Date(Date.now() + 3600000).toISOString(),
          status: 'pending' as const,
          recipients_count: 12,
          template_name: 'Lembrete 24h'
        }
      ] as ScheduledNotification[];
    },
    staleTime: 30000 // 30 segundos
  });

  // Query para relatórios de notificações
  const {
    data: notificationReport,
    isLoading: isLoadingReport
  } = useQuery({
    queryKey: ['notification-report'],
    queryFn: () => NotificationService.getNotificationReport(),
    staleTime: 60000 // 1 minuto
  });

  // Mutation para agendar convocação
  const scheduleConvocacaoMutation = useMutation({
    mutationFn: async (data: ConvocacaoData) => {
      return await NotificationService.enviarConvocacao(data);
    },
    onSuccess: (result) => {
      toast({
        title: "Convocação agendada",
        description: `${result.notifications_sent} notificações foram agendadas com sucesso.`,
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-report'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar convocação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Mutation para cancelar notificações
  const cancelNotificationsMutation = useMutation({
    mutationFn: async (reunionId: string) => {
      return await NotificationService.cancelNotifications(reunionId);
    },
    onSuccess: () => {
      toast({
        title: "Notificações canceladas",
        description: "Todas as notificações pendentes foram canceladas.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cancelar notificações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Mutation para processar fila de notificações
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      return await NotificationService.processNotificationQueue();
    },
    onSuccess: (result) => {
      if (result.processed > 0) {
        toast({
          title: "Fila processada",
          description: `${result.processed} notificações foram enviadas.`,
        });
      }
      
      if (result.errors.length > 0) {
        toast({
          title: "Alguns envios falharam",
          description: `${result.errors.length} erros encontrados.`,
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-report'] });
    },
    onError: (error) => {
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Função para agendar convocação
  const scheduleConvocacao = useCallback((data: ConvocacaoData) => {
    scheduleConvocacaoMutation.mutate(data);
  }, [scheduleConvocacaoMutation]);

  // Função para cancelar notificações
  const cancelNotifications = useCallback((reunionId: string) => {
    cancelNotificationsMutation.mutate(reunionId);
  }, [cancelNotificationsMutation]);

  // Função para processar fila manualmente
  const processQueue = useCallback(() => {
    processQueueMutation.mutate();
  }, [processQueueMutation]);

  // Função para atualizar configurações
  const updateConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Auto-processamento da fila (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      processQueueMutation.mutate();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [processQueueMutation]);

  // Função para calcular estatísticas rápidas
  const getQuickStats = useCallback(() => {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const pendingCount = scheduledNotifications?.filter(n => n.status === 'pending').length || 0;
    const next24hCount = scheduledNotifications?.filter(n => {
      const scheduledAt = new Date(n.scheduled_at);
      return n.status === 'pending' && scheduledAt >= now && scheduledAt <= next24h;
    }).length || 0;

    return {
      pendingTotal: pendingCount,
      pendingNext24h: next24hCount,
      totalRecipients: scheduledNotifications?.reduce((sum, n) => sum + n.recipients_count, 0) || 0
    };
  }, [scheduledNotifications]);

  // Função para verificar se uma reunião tem notificações agendadas
  const hasScheduledNotifications = useCallback((reunionId: string) => {
    return scheduledNotifications?.some(n => 
      n.reunion_id === reunionId && n.status === 'pending'
    ) || false;
  }, [scheduledNotifications]);

  // Função para obter notificações de uma reunião específica
  const getReunionNotifications = useCallback((reunionId: string) => {
    return scheduledNotifications?.filter(n => n.reunion_id === reunionId) || [];
  }, [scheduledNotifications]);

  // Função para testar serviços de notificação
  const testServices = useCallback(async () => {
    try {
      const result = await NotificationService.testNotificationServices();
      
      const workingServices = Object.entries(result)
        .filter(([key, value]) => key !== 'errors' && value)
        .map(([key]) => key);

      if (workingServices.length > 0) {
        toast({
          title: "Serviços testados",
          description: `Funcionando: ${workingServices.join(', ')}`,
        });
      }

      if (result.errors.length > 0) {
        toast({
          title: "Alguns serviços indisponíveis",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      toast({
        title: "Erro no teste de serviços",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  return {
    // Estado
    config,
    scheduledNotifications,
    notificationReport,
    
    // Loading states
    isLoadingScheduled,
    isLoadingReport,
    isScheduling: scheduleConvocacaoMutation.isPending,
    isCancelling: cancelNotificationsMutation.isPending,
    isProcessing: processQueueMutation.isPending,
    
    // Actions
    scheduleConvocacao,
    cancelNotifications,
    processQueue,
    updateConfig,
    testServices,
    refetchScheduled,
    
    // Utilities
    getQuickStats,
    hasScheduledNotifications,
    getReunionNotifications,
    
    // Computed values
    quickStats: getQuickStats()
  };
}

// Hook para configurações de usuário
export function useUserNotificationPreferences(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading
  } = useQuery({
    queryKey: ['user-notification-preferences', userId],
    queryFn: async () => {
      // Simular busca de preferências do usuário
      return {
        email: true,
        sms: true,
        whatsapp: false,
        antecedencia_convocacao: 3,
        receber_lembretes: true
      };
    },
    enabled: !!userId
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      if (!userId) throw new Error('User ID required');
      return await NotificationService.updateUserNotificationPreferences(userId, newPreferences);
    },
    onSuccess: () => {
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram salvas.",
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['user-notification-preferences', userId] 
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar preferências",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  });

  const updatePreferences = useCallback((newPreferences: any) => {
    updatePreferencesMutation.mutate(newPreferences);
  }, [updatePreferencesMutation]);

  return {
    preferences,
    isLoading,
    isUpdating: updatePreferencesMutation.isPending,
    updatePreferences
  };
}