import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

// Templates de Email (agora genéricos)
const emailTemplates = {
  invite: (fullName: string, role: string) => ({
    subject: `Convite para a plataforma MuniConnect`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá, ${fullName}!</h2>
        <p>Você foi convidado para acessar a plataforma <strong>MuniConnect</strong> com o perfil de <strong>${role}</strong>.</p>
        <p>MuniConnect é a plataforma para gestão de conselhos municipais.</p>
        <p>Para aceitar o convite e configurar sua senha, por favor, clique no botão abaixo.</p>
        <a href="{{ .ConfirmationURL }}" style="background-color: #1a5634; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Aceitar Convite</a>
        <p style="font-size: 0.9em; color: #888;">Se você não esperava este convite, por favor, ignore este email.</p>
        <hr/>
        <p style="font-size: 0.8em; color: #aaa;">Enviado por MuniConnect</p>
      </div>
    `,
  }),
  statusChange: (fullName: string, isActive: boolean, reason?: string) => ({
    subject: `Status da conta alterado - MuniConnect`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá, ${fullName}!</h2>
        <p>Sua conta na plataforma <strong>MuniConnect</strong> foi ${isActive ? 'reabilitada' : 'desabilitada'}.</p>
        ${!isActive && reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
        ${isActive ? '<p>Você pode acessar a plataforma normalmente.</p>' : '<p>Entre em contato com o administrador para mais informações.</p>'}
        <hr/>
        <p style="font-size: 0.8em; color: #aaa;">Enviado por MuniConnect</p>
      </div>
    `,
  }),
  passwordReset: (fullName: string, newPassword: string) => ({
    subject: `Senha redefinida - MuniConnect`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá, ${fullName}!</h2>
        <p>Sua senha na plataforma <strong>MuniConnect</strong> foi redefinida por um administrador.</p>
        <p><strong>Nova senha temporária:</strong> ${newPassword}</p>
        <p><strong>Importante:</strong> Recomendamos que você altere esta senha no seu primeiro acesso.</p>
        <a href="${window.location.origin}/auth" style="background-color: #1a5634; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Plataforma</a>
        <hr/>
        <p style="font-size: 0.8em; color: #aaa;">Enviado por MuniConnect</p>
      </div>
    `,
  }),
};

export class EmailService {
  /**
   * Envia um email de convite para um novo usuário se juntar à plataforma.
   */
  static async sendInvitation(
    email: string,
    fullName: string,
    role: UserRole,
    invitationToken: string,
    message?: string
  ) {
    try {
      const template = emailTemplates.invite(fullName, role);
      
      // Adicionar à fila de emails do sistema
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject: template.subject,
          html_content: template.html,
          text_content: `Olá ${fullName}! Você foi convidado para a plataforma MuniConnect. Token: ${invitationToken}`,
          email_type: 'invitation',
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      console.log('Convite adicionado à fila de emails para:', email);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      throw new Error(`Erro ao enviar convite: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Envia notificação de mudança de status do usuário
   */
  static async sendStatusChangeNotification(
    email: string,
    fullName: string,
    isActive: boolean,
    reason?: string
  ) {
    try {
      const template = emailTemplates.statusChange(fullName, isActive, reason);
      
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject: template.subject,
          html_content: template.html,
          text_content: `Olá ${fullName}! Sua conta foi ${isActive ? 'reabilitada' : 'desabilitada'}.`,
          email_type: 'status_change',
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      console.log('Notificação de status adicionada à fila de emails para:', email);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar notificação de status:', error);
      throw new Error(`Erro ao enviar notificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Envia notificação de redefinição de senha
   */
  static async sendPasswordResetNotification(
    email: string,
    fullName: string,
    newPassword: string
  ) {
    try {
      const template = emailTemplates.passwordReset(fullName, newPassword);
      
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject: template.subject,
          html_content: template.html,
          text_content: `Olá ${fullName}! Sua senha foi redefinida. Nova senha: ${newPassword}`,
          email_type: 'password_reset',
          scheduled_for: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      console.log('Notificação de redefinição de senha adicionada à fila para:', email);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar notificação de senha:', error);
      throw new Error(`Erro ao enviar notificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Envia um email de convite para um novo usuário (método legado)
   */
  static async sendInviteEmail(
    email: string,
    fullName: string,
    role: UserRole,
    invitedBy: string
  ) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: role,
        invited_by: invitedBy,
      },
    });

    if (error) {
      console.error('Erro ao enviar convite via Supabase:', error);
      throw new Error(`Erro ao enviar convite: ${error.message}`);
    }

    console.log('Convite enviado com sucesso para:', email);
    return data;
  }

  /**
   * Envia um email de redefinição de senha (método legado)
   */
  static async sendPasswordResetEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      throw new Error(`Erro ao solicitar redefinição de senha: ${error.message}`);
    }

    console.log('Email de redefinição de senha enviado para:', email);
    return data;
  }
}

// Exportação legada para compatibilidade
export const emailService = {
  sendInviteEmail: EmailService.sendInviteEmail,
  sendPasswordResetEmail: EmailService.sendPasswordResetEmail,
};