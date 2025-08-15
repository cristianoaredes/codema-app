import { supabase } from '@/integrations/supabase/client';
import { Conselheiro, ConselheiroCreateInput, ConselheiroUpdateInput } from '@/types/conselheiro';

export class ConselheiroService {
  /**
   * Verifica mandatos próximos ao vencimento
   */
  static checkMandateExpiration(conselheiro: Conselheiro): {
    isExpired: boolean;
    isNearExpiration: boolean;
    daysRemaining: number;
  } {
    const today = new Date();
    const mandatoFim = new Date(conselheiro.mandato_fim);
    const diffTime = mandatoFim.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: daysRemaining < 0,
      isNearExpiration: daysRemaining <= 90 && daysRemaining > 0,
      daysRemaining
    };
  }

  /**
   * Verifica faltas consecutivas e retorna alertas
   */
  static checkAbsenceAlerts(conselheiro: Conselheiro): {
    hasWarning: boolean;
    hasCritical: boolean;
    message?: string;
  } {
    const faltas = conselheiro.faltas_consecutivas || 0;
    
    if (faltas >= 3) {
      return {
        hasWarning: false,
        hasCritical: true,
        message: `${faltas} faltas consecutivas - Sujeito a perda de mandato`
      };
    }
    
    if (faltas >= 2) {
      return {
        hasWarning: true,
        hasCritical: false,
        message: `${faltas} faltas consecutivas - Atenção`
      };
    }
    
    return {
      hasWarning: false,
      hasCritical: false
    };
  }

  /**
   * Gera relatório de status dos conselheiros
   */
  static async generateStatusReport(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    mandatosVencendo: Conselheiro[];
    faltasExcessivas: Conselheiro[];
  }> {
    const { data: conselheiros, error } = await supabase
      .from('conselheiros')
      .select('*');
    
    if (error) throw error;
    
    const mandatosVencendo = (conselheiros || []).filter(c => {
      const check = this.checkMandateExpiration(c);
      return check.isNearExpiration || check.isExpired;
    });
    
    const faltasExcessivas = (conselheiros || []).filter(c => {
      const check = this.checkAbsenceAlerts(c);
      return check.hasWarning || check.hasCritical;
    });
    
    return {
      total: conselheiros?.length || 0,
      ativos: conselheiros?.filter(c => c.status === 'ativo').length || 0,
      inativos: conselheiros?.filter(c => c.status === 'inativo').length || 0,
      mandatosVencendo,
      faltasExcessivas
    };
  }

  /**
   * Envia notificações de alertas
   */
  static async sendAlerts(conselheiro: Conselheiro): Promise<void> {
    const mandateCheck = this.checkMandateExpiration(conselheiro);
    const absenceCheck = this.checkAbsenceAlerts(conselheiro);
    
    const alerts = [];
    
    if (mandateCheck.isExpired) {
      alerts.push({
        tipo: 'mandato_expirado',
        conselheiro_id: conselheiro.id,
        mensagem: 'Mandato expirado',
        severidade: 'critical'
      });
    } else if (mandateCheck.isNearExpiration) {
      alerts.push({
        tipo: 'mandato_vencendo',
        conselheiro_id: conselheiro.id,
        mensagem: `Mandato vence em ${mandateCheck.daysRemaining} dias`,
        severidade: 'warning'
      });
    }
    
    if (absenceCheck.hasCritical) {
      alerts.push({
        tipo: 'faltas_excessivas',
        conselheiro_id: conselheiro.id,
        mensagem: absenceCheck.message,
        severidade: 'critical'
      });
    } else if (absenceCheck.hasWarning) {
      alerts.push({
        tipo: 'faltas_warning',
        conselheiro_id: conselheiro.id,
        mensagem: absenceCheck.message,
        severidade: 'warning'
      });
    }
    
    // Integrate with notification system (email/whatsapp)
    if (alerts.length > 0) {
      const { error } = await supabase
        .from('alertas_conselheiros')
        .insert(alerts);
      
      if (error) {
        console.error('Erro ao salvar alertas:', error);
        return;
      }

      // Send email notifications for alerts
      try {
        // Buscar perfil do conselheiro para obter email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name, notification_preferences')
          .eq('id', conselheiro.profile_id)
          .single();

        if (!profileError && profile?.email) {
          // Send email notification for each alert
          for (const alert of alerts) {
            let subject = '';
            let htmlContent = '';

            // Customize email content based on alert type
            if (alert.tipo === 'mandato_expirado') {
              subject = 'Alerta: Mandato Expirado - CODEMA';
              htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #dc2626;">Alerta de Mandato - CODEMA</h2>
                  <p>Prezado(a) ${profile.full_name},</p>
                  <p><strong>Seu mandato como conselheiro do CODEMA expirou.</strong></p>
                  <p>Para continuar participando do conselho, é necessário renovar seu mandato.</p>
                  <p>Entre em contato com a secretaria do CODEMA para mais informações.</p>
                  <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                </div>
              `;
            } else if (alert.tipo === 'mandato_vencendo') {
              const daysText = mandateCheck.daysRemaining === 1 ? 'dia' : 'dias';
              subject = `Alerta: Mandato vence em ${mandateCheck.daysRemaining} ${daysText} - CODEMA`;
              htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #f59e0b;">Alerta de Mandato - CODEMA</h2>
                  <p>Prezado(a) ${profile.full_name},</p>
                  <p><strong>Seu mandato como conselheiro vence em ${mandateCheck.daysRemaining} ${daysText}.</strong></p>
                  <p>Recomendamos que providencie a renovação com antecedência para evitar interrupções.</p>
                  <p>Entre em contato com a secretaria do CODEMA para iniciar o processo de renovação.</p>
                  <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                </div>
              `;
            } else if (alert.tipo === 'faltas_excessivas') {
              subject = 'Alerta: Faltas Excessivas - CODEMA';
              htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #dc2626;">Alerta de Presença - CODEMA</h2>
                  <p>Prezado(a) ${profile.full_name},</p>
                  <p><strong>Registramos faltas excessivas em reuniões do CODEMA.</strong></p>
                  <p>${alert.mensagem}</p>
                  <p>A participação regular é fundamental para o bom funcionamento do conselho.</p>
                  <p>Em caso de dificuldades para participar, entre em contato conosco.</p>
                  <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                </div>
              `;
            } else if (alert.tipo === 'faltas_warning') {
              subject = 'Aviso: Faltas Consecutivas - CODEMA';
              htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #f59e0b;">Aviso de Presença - CODEMA</h2>
                  <p>Prezado(a) ${profile.full_name},</p>
                  <p><strong>Registramos faltas consecutivas em reuniões do CODEMA.</strong></p>
                  <p>${alert.mensagem}</p>
                  <p>Lembramos da importância de sua participação nas próximas reuniões.</p>
                  <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                </div>
              `;
            }

            // Queue email notification
            if (subject && htmlContent) {
              await supabase
                .from('email_queue')
                .insert({
                  to_email: profile.email,
                  subject,
                  html_content: htmlContent,
                  text_content: alert.mensagem,
                  email_type: 'alert',
                  scheduled_for: new Date().toISOString()
                });

              console.log(`Alerta enviado por email para: ${profile.email} - Tipo: ${alert.tipo}`);
            }
          }
        } else {
          console.warn('Perfil sem email encontrado para conselheiro:', conselheiro.id);
        }
      } catch (emailError) {
        console.error('Erro ao enviar notificação de alerta por email:', emailError);
        // Log but don't fail the main alert creation operation
      }
    }
  }

  /**
   * Valida dados do conselheiro antes de salvar
   */
  static validateConselheiroData(data: ConselheiroCreateInput | ConselheiroUpdateInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validação de datas
    if ('mandato_inicio' in data && 'mandato_fim' in data) {
      const inicio = new Date(data.mandato_inicio!);
      const fim = new Date(data.mandato_fim!);
      
      if (fim <= inicio) {
        errors.push('Data de fim do mandato deve ser posterior à data de início');
      }
      
      // Mandato máximo de 4 anos
      const diffYears = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears > 4) {
        errors.push('Mandato não pode exceder 4 anos');
      }
    }
    
    // Validação de CPF
    if ('cpf' in data && data.cpf) {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(data.cpf)) {
        errors.push('CPF deve estar no formato XXX.XXX.XXX-XX');
      }
    }
    
    // Validação de email
    if ('email' in data && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email inválido');
      }
    }
    
    // Validação de telefone
    if ('telefone' in data && data.telefone) {
      const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!telefoneRegex.test(data.telefone)) {
        errors.push('Telefone deve estar no formato (XX) XXXXX-XXXX');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula quórum baseado nos conselheiros ativos
   */
  static async calculateQuorum(): Promise<{
    totalAtivos: number;
    quorumMinimo: number;
    quorumQualificado: number;
  }> {
    const { data: conselheiros, error } = await supabase
      .from('conselheiros')
      .select('*')
      .eq('status', 'ativo')
      .eq('titular', true);
    
    if (error) throw error;
    
    const totalAtivos = conselheiros?.length || 0;
    const quorumMinimo = Math.floor(totalAtivos / 2) + 1; // Maioria simples
    const quorumQualificado = Math.ceil(totalAtivos * 2 / 3); // 2/3 dos membros
    
    return {
      totalAtivos,
      quorumMinimo,
      quorumQualificado
    };
  }

  /**
   * Registra histórico de mudanças do conselheiro
   */
  static async logConselheiroChange(
    conselheiroId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE',
    details: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabase
      .from('conselheiros_historico')
      .insert({
        conselheiro_id: conselheiroId,
        action,
        details,
        created_at: new Date().toISOString()
      });
    
    if (error) console.error('Erro ao registrar histórico:', error);
  }
}