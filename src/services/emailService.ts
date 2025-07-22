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
};


export const emailService = {
  /**
   * Envia um email de convite para um novo usuário se juntar à plataforma.
   * Utiliza o sistema de convites do Supabase Auth Admin.
   */
  sendInviteEmail: async (
    email: string,
    fullName: string,
    role: UserRole,
    invitedBy: string
  ) => {
    // A função admin.inviteUserByEmail já envia um email padrão do Supabase.
    // Para usar um template customizado, você precisaria de um serviço de email
    // como o SendGrid e chamar a API dele aqui, passando a URL de convite.
    // Por simplicidade, vamos confiar no email padrão do Supabase, que é configurável no dashboard deles.
    
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
  },

  /**
   * Envia um email de redefinição de senha.
   * Utiliza o sistema padrão do Supabase.
   */
  sendPasswordResetEmail: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      throw new Error(`Erro ao solicitar redefinição de senha: ${error.message}`);
    }

    console.log('Email de redefinição de senha enviado para:', email);
    return data;
  },
};