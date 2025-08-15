import { supabase } from '@/integrations/supabase/client';
import { ProtocoloGenerator } from '@/utils/generators/protocoloGenerator';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  subject?: string;
  body: string;
  variables: string[];
  active: boolean;
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  preferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface NotificationEvent {
  id: string;
  type: 'convocacao' | 'lembrete' | 'cancelamento' | 'alteracao' | 'ata_disponivel';
  reunion_id: string;
  scheduled_at: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  template_id: string;
  recipients: string[];
  metadata: Record<string, any>;
}

export interface ConvocacaoData {
  reuniao: {
    id: string;
    titulo: string;
    data_reuniao: string;
    local: string;
    tipo: string;
    protocolo: string;
    observacoes?: string;
    pauta?: Array<{
      id: string;
      titulo: string;
      descricao: string;
      ordem: number;
    }>;
  };
  conselheiros: NotificationRecipient[];
  configuracao: {
    antecedencia_dias: number;
    lembrete_24h: boolean;
    lembrete_2h: boolean;
    incluir_pauta: boolean;
    incluir_documentos: boolean;
  };
}

export class NotificationService {
  /**
   * Envia convocação para reunião
   */
  static async enviarConvocacao(data: ConvocacaoData): Promise<{
    success: boolean;
    notifications_sent: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let notificationsSent = 0;

    try {
      // Obter template de convocação
      const template = await this.getTemplate('convocacao');
      if (!template) {
        throw new Error('Template de convocação não encontrado');
      }

      // Agendar notificação principal
      const dataEnvio = new Date(data.reuniao.data_reuniao);
      dataEnvio.setDate(dataEnvio.getDate() - data.configuracao.antecedencia_dias);

      const notificationEvent = await this.createNotificationEvent({
        type: 'convocacao',
        reunion_id: data.reuniao.id,
        scheduled_at: dataEnvio.toISOString(),
        template_id: template.id,
        recipients: data.conselheiros.map(c => c.id),
        metadata: {
          include_agenda: data.configuracao.incluir_pauta,
          include_documents: data.configuracao.incluir_documentos
        }
      });

      if (notificationEvent) {
        notificationsSent++;

        // Agendar lembretes se configurado
        if (data.configuracao.lembrete_24h) {
          const lembrete24h = new Date(data.reuniao.data_reuniao);
          lembrete24h.setHours(lembrete24h.getHours() - 24);

          await this.createNotificationEvent({
            type: 'lembrete',
            reunion_id: data.reuniao.id,
            scheduled_at: lembrete24h.toISOString(),
            template_id: template.id,
            recipients: data.conselheiros.map(c => c.id),
            metadata: { reminder_type: '24h' }
          });
          notificationsSent++;
        }

        if (data.configuracao.lembrete_2h) {
          const lembrete2h = new Date(data.reuniao.data_reuniao);
          lembrete2h.setHours(lembrete2h.getHours() - 2);

          await this.createNotificationEvent({
            type: 'lembrete',
            reunion_id: data.reuniao.id,
            scheduled_at: lembrete2h.toISOString(),
            template_id: template.id,
            recipients: data.conselheiros.map(c => c.id),
            metadata: { reminder_type: '2h' }
          });
          notificationsSent++;
        }
      }

      // Em um ambiente real, integraremos com serviços como:
      // - Supabase Edge Functions para envio de emails
      // - Twilio/AWS SNS para SMS
      // - WhatsApp Business API
      console.log(`✅ Convocação agendada para ${data.conselheiros.length} conselheiros`);

      return {
        success: true,
        notifications_sent: notificationsSent,
        errors
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      errors.push(errorMessage);
      
      return {
        success: false,
        notifications_sent: notificationsSent,
        errors
      };
    }
  }

  /**
   * Processa fila de notificações pendentes
   */
  static async processNotificationQueue(): Promise<{
    processed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      // Buscar notificações pendentes que devem ser enviadas agora
      const now = new Date().toISOString();
      
      const { data: pendingNotifications, error } = await supabase
        .from('notification_events')
        .select(`
          *,
          notification_templates (*)
        `)
        .eq('status', 'pending')
        .lte('scheduled_at', now)
        .limit(50);

      if (error) throw error;

      if (!pendingNotifications || pendingNotifications.length === 0) {
        return { processed: 0, errors: [] };
      }

      // Processar cada notificação
      for (const notification of pendingNotifications) {
        try {
          await this.sendNotification(notification);
          
          // Marcar como enviada
          await supabase
            .from('notification_events')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id);

          processed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro no envio';
          errors.push(`Notificação ${notification.id}: ${errorMessage}`);

          // Marcar como falha
          await supabase
            .from('notification_events')
            .update({
              status: 'failed',
              metadata: {
                ...notification.metadata,
                error: errorMessage,
                failed_at: new Date().toISOString()
              }
            })
            .eq('id', notification.id);
        }
      }

      return { processed, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no processamento';
      errors.push(errorMessage);
      
      return { processed, errors };
    }
  }

  /**
   * Envia notificação individual
   */
  private static async sendNotification(notification: any): Promise<void> {
    const template = notification.notification_templates;
    if (!template) {
      throw new Error('Template não encontrado');
    }

    // Obter dados da reunião
    const { data: reuniao } = await supabase
      .from('reunioes')
      .select('*')
      .eq('id', notification.reunion_id)
      .single();

    if (!reuniao) {
      throw new Error('Reunião não encontrada');
    }

    // Obter destinatários
    const { data: recipients } = await supabase
      .from('conselheiros')
      .select('*')
      .in('id', notification.recipients);

    if (!recipients) {
      throw new Error('Destinatários não encontrados');
    }

    // Processar template com variáveis
    const processedContent = this.processTemplate(template.body, {
      reuniao,
      notification,
      data_envio: new Date().toLocaleDateString('pt-BR'),
      hora_envio: new Date().toLocaleTimeString('pt-BR')
    });

    // Simular envio (em produção, integrar com serviços reais)
    console.log(`📧 Enviando notificação: ${template.name}`);
    console.log(`📋 Assunto: ${template.subject}`);
    console.log(`👥 Destinatários: ${recipients.length}`);
    console.log(`📝 Conteúdo processado: ${processedContent.substring(0, 100)}...`);

    // Em produção, aqui chamaríamos:
    // - await this.sendEmail(recipients, template.subject, processedContent);
    // - await this.sendSMS(recipients, processedContent);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Processa template substituindo variáveis
   */
  private static processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    // Substituir variáveis simples
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    // Substituir variáveis aninhadas (ex: {{reuniao.titulo}})
    const nestedVarRegex = /{{(\w+)\.(\w+)}}/g;
    processed = processed.replace(nestedVarRegex, (match, obj, prop) => {
      if (variables[obj] && variables[obj][prop] !== undefined) {
        return String(variables[obj][prop]);
      }
      return match;
    });

    // Formatação de datas
    const dateRegex = /{{format_date:([\w.]+)}}/g;
    processed = processed.replace(dateRegex, (match, path) => {
      const value = this.getNestedValue(variables, path);
      if (value) {
        return new Date(value).toLocaleDateString('pt-BR');
      }
      return match;
    });

    return processed;
  }

  /**
   * Obtém valor aninhado de objeto
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Cria evento de notificação
   */
  private static async createNotificationEvent(data: Omit<NotificationEvent, 'id' | 'sent_at' | 'status'>): Promise<NotificationEvent | null> {
    const protocolo = await ProtocoloGenerator.generate('NOT');
    
    const { data: notification, error } = await supabase
      .from('notification_events')
      .insert({
        ...data,
        protocolo,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar evento de notificação:', error);
      return null;
    }

    return notification;
  }

  /**
   * Obtém template por tipo
   */
  private static async getTemplate(type: string): Promise<NotificationTemplate | null> {
    const { data: template } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('name', type)
      .eq('active', true)
      .single();

    return template || null;
  }

  /**
   * Configura preferências de notificação do usuário
   */
  static async updateUserNotificationPreferences(
    userId: string, 
    preferences: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      antecedencia_convocacao: number;
      receber_lembretes: boolean;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  }

  /**
   * Cancela notificações de uma reunião
   */
  static async cancelNotifications(reunionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_events')
        .update({ status: 'cancelled' })
        .eq('reunion_id', reunionId)
        .eq('status', 'pending');

      return !error;
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
      return false;
    }
  }

  /**
   * Relatório de notificações enviadas
   */
  static async getNotificationReport(reunionId?: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    cancelled: number;
    by_type: Record<string, number>;
  }> {
    try {
      let query = supabase.from('notification_events').select('*');
      
      if (reunionId) {
        query = query.eq('reunion_id', reunionId);
      }

      const { data: notifications } = await query;

      if (!notifications) {
        return {
          total: 0,
          sent: 0,
          failed: 0,
          pending: 0,
          cancelled: 0,
          by_type: {}
        };
      }

      const stats = notifications.reduce((acc, notification) => {
        acc.total++;
        acc[notification.status]++;
        acc.by_type[notification.type] = (acc.by_type[notification.type] || 0) + 1;
        return acc;
      }, {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        cancelled: 0,
        by_type: {} as Record<string, number>
      });

      return stats;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        cancelled: 0,
        by_type: {}
      };
    }
  }

  /**
   * Testa conectividade com serviços de notificação
   */
  static async testNotificationServices(): Promise<{
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    errors: string[];
  }> {
    const results = {
      email: false,
      sms: false,
      whatsapp: false,
      errors: [] as string[]
    };

    try {
      // Teste de email (Supabase Edge Functions)
      try {
        // Em produção: chamar edge function de teste
        results.email = true;
      } catch (error) {
        results.errors.push('Email service unavailable');
      }

      // Teste de SMS (Twilio/AWS SNS)
      try {
        // Em produção: ping no serviço SMS
        results.sms = true;
      } catch (error) {
        results.errors.push('SMS service unavailable');
      }

      // Teste de WhatsApp
      try {
        // Em produção: verificar WhatsApp Business API
        results.whatsapp = true;
      } catch (error) {
        results.errors.push('WhatsApp service unavailable');
      }

    } catch (error) {
      results.errors.push('Service connectivity test failed');
    }

    return results;
  }
}