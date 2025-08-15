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
  convocacao: (fullName: string, reuniaoData: {
    numero_reuniao: string;
    tipo: string;
    data_hora: string;
    local: string;
    pauta?: string;
  }) => ({
    subject: `Convocação - Reunião ${reuniaoData.tipo} ${reuniaoData.numero_reuniao} - CODEMA Itanhomi`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a5634; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px;">CODEMA - Itanhomi/MG</h2>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #1a5634; margin-bottom: 20px;">CONVOCAÇÃO</h2>
          
          <p>Prezado(a) <strong>${fullName}</strong>,</p>
          
          <p>Você está sendo convocado(a) para participar da <strong>Reunião ${reuniaoData.tipo} ${reuniaoData.numero_reuniao}</strong> do Conselho Municipal de Defesa do Meio Ambiente de Itanhomi/MG.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a5634; margin-top: 0;">Informações da Reunião:</h3>
            <p style="margin: 5px 0;"><strong>Data e Hora:</strong> ${new Date(reuniaoData.data_hora).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p style="margin: 5px 0;"><strong>Local:</strong> ${reuniaoData.local}</p>
            <p style="margin: 5px 0;"><strong>Tipo:</strong> ${reuniaoData.tipo === 'ordinaria' ? 'Ordinária' : 'Extraordinária'}</p>
          </div>
          
          ${reuniaoData.pauta ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Pauta:</h4>
            <div style="white-space: pre-wrap; line-height: 1.6;">${reuniaoData.pauta}</div>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0; padding: 15px; background-color: #d1ecf1; border-radius: 8px; border-left: 4px solid #bee5eb;">
            <p style="margin: 0; font-weight: bold; color: #0c5460;">
              ⚠️ Sua presença é fundamental para garantir o quorum necessário e a legitimidade das deliberações do conselho.
            </p>
          </div>
          
          <p>Em caso de impossibilidade de comparecimento, solicitamos que comunique com antecedência através dos canais oficiais do CODEMA.</p>
          
          <p style="margin-top: 30px;">Atenciosamente,</p>
          <p style="font-weight: bold;">Secretaria do CODEMA<br/>Conselho Municipal de Defesa do Meio Ambiente<br/>Itanhomi/MG</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d; margin: 0;">
            Este é um email oficial do CODEMA Itanhomi/MG - Lei Municipal de criação do conselho
          </p>
          <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">
            Enviado em ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
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
    _message: string
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
   * Envia convocação para reunião do CODEMA
   */
  static async sendConvocacao(
    email: string,
    fullName: string,
    reuniaoData: {
      numero_reuniao: string;
      tipo: string;
      data_hora: string;
      local: string;
      pauta?: string;
    },
    scheduledFor?: Date
  ) {
    try {
      const template = emailTemplates.convocacao(fullName, reuniaoData);
      
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject: template.subject,
          html_content: template.html,
          text_content: `Convocação - Reunião ${reuniaoData.tipo} ${reuniaoData.numero_reuniao} em ${new Date(reuniaoData.data_hora).toLocaleString('pt-BR')} no local: ${reuniaoData.local}`,
          email_type: 'convocacao',
          scheduled_for: (scheduledFor || new Date()).toISOString(),
          metadata: {
            reuniao_numero: reuniaoData.numero_reuniao,
            reuniao_tipo: reuniaoData.tipo,
            reuniao_data: reuniaoData.data_hora
          }
        });

      if (error) {
        throw error;
      }

      console.log('Convocação adicionada à fila de emails para:', email);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar convocação:', error);
      throw new Error(`Erro ao enviar convocação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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