import { supabase } from '@/integrations/supabase/client';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: PushNotificationAction[];
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: 'meeting' | 'voting' | 'document' | 'system' | 'reminder';
}

export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  categories: {
    meeting: boolean;
    voting: boolean;
    document: boolean;
    system: boolean;
    reminder: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  frequency: 'immediate' | 'batched' | 'daily_digest';
}

export class PushNotificationService {
  private static vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BMxY8nTZrQzGQwKgw8YmE5ZGQq1Z2J3X4KjUv7nW9eR8fN3Q2pL5mH1kJ6sA9cX7bT4mR2vW5uY8gF3hK9jM6nP';

  /**
   * Verificar se o navegador suporta notificações push
   */
  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Verificar status de permissão para notificações
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Solicitar permissão para notificações
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notificações push não são suportadas neste navegador');
    }

    const permission = await Notification.requestPermission();
    
    // Registrar evento de permissão
    await this.logPermissionEvent(permission);
    
    return permission;
  }

  /**
   * Registrar service worker e obter subscription
   */
  static async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      if (!this.isSupported()) {
        throw new Error('Notificações push não são suportadas');
      }

      // Verificar permissão
      if (Notification.permission !== 'granted') {
        const permission = await this.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permissão para notificações negada');
        }
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Obter subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      // Salvar subscription no banco
      await this.savePushSubscription(userId, pushSubscription);

      return pushSubscription;

    } catch (error) {
      console.error('Erro ao registrar push subscription:', error);
      throw error;
    }
  }

  /**
   * Cancelar subscription de notificações
   */
  static async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remover do banco
      await this.removePushSubscription(userId);

      return true;

    } catch (error) {
      console.error('Erro ao cancelar push subscription:', error);
      return false;
    }
  }

  /**
   * Verificar se o usuário está inscrito
   */
  static async isSubscribed(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;

    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
      return false;
    }
  }

  /**
   * Mostrar notificação local (fallback)
   */
  static async showLocalNotification(notification: PushNotification): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      console.warn('Notificações não disponíveis');
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      image: notification.image,
      data: notification.data,
      tag: notification.id,
      timestamp: new Date(notification.timestamp).getTime(),
      requireInteraction: notification.priority === 'critical',
      actions: notification.actions?.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon
      })),
      silent: notification.priority === 'low'
    };

    const localNotification = new Notification(notification.title, options);

    // Auto-close depois de 5 segundos (exceto críticas)
    if (notification.priority !== 'critical') {
      setTimeout(() => localNotification.close(), 5000);
    }

    // Lidar com cliques na notificação
    localNotification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      localNotification.close();
      
      // Navegar para a página relevante se houver dados
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
    };
  }

  /**
   * Enviar notificação para um usuário específico
   */
  static async sendToUser(
    userId: string, 
    notification: Omit<PushNotification, 'id' | 'timestamp'>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          notification: {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      return data.success;

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  }

  /**
   * Enviar notificação para múltiplos usuários
   */
  static async sendToUsers(
    userIds: string[], 
    notification: Omit<PushNotification, 'id' | 'timestamp'>
  ): Promise<{success: number; failed: number}> {
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-push-notification', {
        body: {
          user_ids: userIds,
          notification: {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      return {
        success: data.success_count,
        failed: data.failed_count
      };

    } catch (error) {
      console.error('Erro ao enviar notificações em massa:', error);
      return { success: 0, failed: userIds.length };
    }
  }

  /**
   * Obter preferências de notificação do usuário
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('push_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.preferences || {
        enabled: true,
        categories: {
          meeting: true,
          voting: true,
          document: true,
          system: true,
          reminder: true
        },
        quiet_hours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        frequency: 'immediate'
      };

    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      throw error;
    }
  }

  /**
   * Atualizar preferências de notificação
   */
  static async updateNotificationPreferences(
    userId: string, 
    preferences: NotificationPreferences
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_preferences')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return true;

    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  }

  /**
   * Criar notificação para reunião
   */
  static createMeetingNotification(
    reuniao: any, 
    type: 'convocacao' | 'lembrete' | 'inicio' | 'cancelamento'
  ): Omit<PushNotification, 'id' | 'timestamp'> {
    const baseData = {
      reuniao_id: reuniao.id,
      url: `/reunioes/${reuniao.id}`
    };

    switch (type) {
      case 'convocacao':
        return {
          title: 'Nova Convocação - CODEMA',
          body: `Você foi convocado para: ${reuniao.titulo}`,
          icon: '/icon-meeting.png',
          category: 'meeting',
          priority: 'normal',
          data: baseData,
          actions: [
            { action: 'view', title: 'Ver Detalhes' },
            { action: 'confirm', title: 'Confirmar Presença' }
          ]
        };

      case 'lembrete':
        return {
          title: 'Lembrete de Reunião',
          body: `${reuniao.titulo} começará em breve`,
          icon: '/icon-reminder.png',
          category: 'reminder',
          priority: 'high',
          data: baseData,
          actions: [
            { action: 'checkin', title: 'Fazer Check-in' },
            { action: 'view', title: 'Ver Detalhes' }
          ]
        };

      case 'inicio':
        return {
          title: 'Reunião Iniciada',
          body: `${reuniao.titulo} está começando agora`,
          icon: '/icon-live.png',
          category: 'meeting',
          priority: 'high',
          data: baseData,
          actions: [
            { action: 'join', title: 'Participar' },
            { action: 'checkin', title: 'Check-in' }
          ]
        };

      case 'cancelamento':
        return {
          title: 'Reunião Cancelada',
          body: `${reuniao.titulo} foi cancelada`,
          icon: '/icon-cancel.png',
          category: 'meeting',
          priority: 'high',
          data: baseData
        };

      default:
        throw new Error('Tipo de notificação de reunião inválido');
    }
  }

  /**
   * Criar notificação para votação
   */
  static createVotingNotification(
    votacao: any
  ): Omit<PushNotification, 'id' | 'timestamp'> {
    return {
      title: 'Nova Votação Disponível',
      body: `Votação aberta: ${votacao.titulo}`,
      icon: '/icon-vote.png',
      category: 'voting',
      priority: 'high',
      data: {
        votacao_id: votacao.id,
        url: `/votacoes/${votacao.id}`
      },
      actions: [
        { action: 'vote', title: 'Votar' },
        { action: 'view', title: 'Ver Detalhes' }
      ]
    };
  }

  /**
   * Utilitários privados
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private static async savePushSubscription(
    userId: string, 
    subscription: PushSubscription
  ): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        created_at: new Date().toISOString(),
        active: true
      });

    if (error) throw error;
  }

  private static async removePushSubscription(userId: string): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ active: false })
      .eq('user_id', userId);

    if (error) throw error;
  }

  private static async logPermissionEvent(permission: NotificationPermission): Promise<void> {
    try {
      await supabase
        .from('push_permission_logs')
        .insert({
          permission_status: permission,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.warn('Erro ao registrar evento de permissão:', error);
    }
  }
}

// Service Worker Registration for Push Notifications
export const registerPushServiceWorker = async (): Promise<void> => {
  if (!PushNotificationService.isSupported()) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Lidar com mensagens do service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { notification, action } = event.data;
        
        // Lidar com diferentes ações de notificação
        switch (action) {
          case 'checkin':
            window.location.href = `/reunioes/${notification.data.reuniao_id}?action=checkin`;
            break;
          case 'vote':
            window.location.href = `/votacoes/${notification.data.votacao_id}`;
            break;
          case 'view':
          default:
            if (notification.data.url) {
              window.location.href = notification.data.url;
            }
            break;
        }
      }
    });

    console.log('Service Worker registrado com sucesso');

  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
  }
};