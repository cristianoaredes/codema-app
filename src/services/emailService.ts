import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static readonly TEMPLATES = {
    USER_INVITATION: {
      subject: 'Convite para acessar o Sistema CODEMA - Itanhomi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Sistema CODEMA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Município de Itanhomi - MG</p>
          </header>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e40af; margin-top: 0;">Você foi convidado!</h2>
            <p>Olá <strong>{{fullName}}</strong>,</p>
            <p>Você foi convidado para acessar o Sistema CODEMA (Conselho de Defesa do Meio Ambiente) do município de Itanhomi-MG.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p><strong>Seu perfil:</strong> {{roleName}}</p>
              <p><strong>Email:</strong> {{email}}</p>
              {{#message}}
              <p><strong>Mensagem do administrador:</strong></p>
              <p style="font-style: italic;">{{message}}</p>
              {{/message}}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{inviteUrl}}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Importante:</strong> Este convite expira em 7 dias. Se você não conseguir acessar o link, entre em contato com o administrador do sistema.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">
            
            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>Este é um email automático do Sistema CODEMA - Itanhomi/MG</p>
              <p>Se você não solicitou este convite, pode ignorar este email.</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Sistema CODEMA - Município de Itanhomi/MG
        
        Você foi convidado!
        
        Olá {{fullName}},
        
        Você foi convidado para acessar o Sistema CODEMA (Conselho de Defesa do Meio Ambiente) do município de Itanhomi-MG.
        
        Seu perfil: {{roleName}}
        Email: {{email}}
        
        {{#message}}
        Mensagem do administrador:
        {{message}}
        {{/message}}
        
        Para aceitar o convite, acesse: {{inviteUrl}}
        
        ⚠️ Importante: Este convite expira em 7 dias.
        
        Este é um email automático do Sistema CODEMA - Itanhomi/MG
        Se você não solicitou este convite, pode ignorar este email.
      `
    },
    
    PASSWORD_RESET: {
      subject: 'Redefinição de Senha - Sistema CODEMA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Sistema CODEMA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Redefinição de Senha</p>
          </header>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #dc2626; margin-top: 0;">Sua senha foi redefinida</h2>
            <p>Olá <strong>{{fullName}}</strong>,</p>
            <p>Sua senha do Sistema CODEMA foi redefinida por um administrador.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p><strong>Nova senha temporária:</strong></p>
              <p style="font-family: monospace; font-size: 18px; background: #f3f4f6; padding: 10px; border-radius: 4px;">{{newPassword}}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Importante:</strong> Por motivos de segurança, altere esta senha assim que fizer login no sistema.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Fazer Login
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">
            
            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>Este é um email automático do Sistema CODEMA - Itanhomi/MG</p>
              <p>Se você não solicitou esta alteração, entre em contato com o administrador imediatamente.</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Sistema CODEMA - Município de Itanhomi/MG
        
        Sua senha foi redefinida
        
        Olá {{fullName}},
        
        Sua senha do Sistema CODEMA foi redefinida por um administrador.
        
        Nova senha temporária: {{newPassword}}
        
        ⚠️ Importante: Por motivos de segurança, altere esta senha assim que fizer login no sistema.
        
        Para fazer login, acesse: {{loginUrl}}
        
        Este é um email automático do Sistema CODEMA - Itanhomi/MG
        Se você não solicitou esta alteração, entre em contato com o administrador imediatamente.
      `
    },
    
    ACCOUNT_STATUS_CHANGED: {
      subject: 'Status da Conta Alterado - Sistema CODEMA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="background: {{statusColor}}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Sistema CODEMA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Status da Conta</p>
          </header>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: {{statusColor}}; margin-top: 0;">Conta {{statusText}}</h2>
            <p>Olá <strong>{{fullName}}</strong>,</p>
            <p>Sua conta no Sistema CODEMA foi <strong>{{statusText}}</strong>.</p>
            
            {{#reason}}
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid {{statusColor}};">
              <p><strong>Motivo:</strong></p>
              <p>{{reason}}</p>
            </div>
            {{/reason}}
            
            {{#isActive}}
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar Sistema
              </a>
            </div>
            {{/isActive}}
            
            <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">
            
            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>Este é um email automático do Sistema CODEMA - Itanhomi/MG</p>
              <p>Em caso de dúvidas, entre em contato com o administrador do sistema.</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Sistema CODEMA - Município de Itanhomi/MG
        
        Conta {{statusText}}
        
        Olá {{fullName}},
        
        Sua conta no Sistema CODEMA foi {{statusText}}.
        
        {{#reason}}
        Motivo: {{reason}}
        {{/reason}}
        
        {{#isActive}}
        Para acessar o sistema, acesse: {{loginUrl}}
        {{/isActive}}
        
        Este é um email automático do Sistema CODEMA - Itanhomi/MG
        Em caso de dúvidas, entre em contato com o administrador do sistema.
      `
    }
  };

  /**
   * Simple template renderer (replaces {{variable}} with values)
   */
  private static renderTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return String(data[key] || '');
    }).replace(/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs, (match, key, content) => {
      return data[key] ? content : '';
    });
  }

  /**
   * Send user invitation email
   */
  static async sendInvitation(
    email: string,
    fullName: string,
    role: string,
    invitationToken: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const roleNames = {
        'citizen': 'Cidadão',
        'conselheiro_titular': 'Conselheiro Titular',
        'conselheiro_suplente': 'Conselheiro Suplente',
        'secretario': 'Secretário Executivo',
        'presidente': 'Presidente',
        'admin': 'Administrador'
      };

      const templateData = {
        fullName,
        email,
        roleName: roleNames[role as keyof typeof roleNames] || 'Usuário',
        message,
        inviteUrl: `${window.location.origin}/auth/invite?token=${invitationToken}`
      };

      const emailData: EmailData = {
        to: email,
        subject: this.TEMPLATES.USER_INVITATION.subject,
        html: this.renderTemplate(this.TEMPLATES.USER_INVITATION.html, templateData),
        text: this.renderTemplate(this.TEMPLATES.USER_INVITATION.text, templateData)
      };

      // For now, we'll store the email in the database to be sent later
      // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: emailData.to,
          subject: emailData.subject,
          html_content: emailData.html,
          text_content: emailData.text,
          email_type: 'user_invitation',
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        console.error('Error queuing email:', error);
        return { success: false, error: 'Erro ao enviar email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending invitation:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Send password reset notification
   */
  static async sendPasswordResetNotification(
    email: string,
    fullName: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        fullName,
        newPassword,
        loginUrl: `${window.location.origin}/auth`
      };

      const emailData: EmailData = {
        to: email,
        subject: this.TEMPLATES.PASSWORD_RESET.subject,
        html: this.renderTemplate(this.TEMPLATES.PASSWORD_RESET.html, templateData),
        text: this.renderTemplate(this.TEMPLATES.PASSWORD_RESET.text, templateData)
      };

      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: emailData.to,
          subject: emailData.subject,
          html_content: emailData.html,
          text_content: emailData.text,
          email_type: 'password_reset',
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        console.error('Error queuing password reset email:', error);
        return { success: false, error: 'Erro ao enviar email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending password reset notification:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Send account status change notification
   */
  static async sendStatusChangeNotification(
    email: string,
    fullName: string,
    isActive: boolean,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        fullName,
        statusText: isActive ? 'ativada' : 'desativada',
        statusColor: isActive ? '#16a34a' : '#dc2626',
        reason,
        isActive,
        loginUrl: `${window.location.origin}/auth`
      };

      const emailData: EmailData = {
        to: email,
        subject: this.TEMPLATES.ACCOUNT_STATUS_CHANGED.subject,
        html: this.renderTemplate(this.TEMPLATES.ACCOUNT_STATUS_CHANGED.html, templateData),
        text: this.renderTemplate(this.TEMPLATES.ACCOUNT_STATUS_CHANGED.text, templateData)
      };

      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: emailData.to,
          subject: emailData.subject,
          html_content: emailData.html,
          text_content: emailData.text,
          email_type: 'status_change',
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        console.error('Error queuing status change email:', error);
        return { success: false, error: 'Erro ao enviar email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending status change notification:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Send custom notification
   */
  static async sendCustomNotification(
    email: string,
    subject: string,
    message: string,
    emailType: string = 'custom'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Sistema CODEMA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Município de Itanhomi - MG</p>
          </header>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="white-space: pre-wrap;">${message}</div>
            
            <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">
            
            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>Este é um email automático do Sistema CODEMA - Itanhomi/MG</p>
            </div>
          </div>
        </div>
      `;

      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject,
          html_content: htmlContent,
          text_content: message,
          email_type: emailType,
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        console.error('Error queuing custom email:', error);
        return { success: false, error: 'Erro ao enviar email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }
}