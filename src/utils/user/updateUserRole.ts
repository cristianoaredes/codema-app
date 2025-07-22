import { supabase } from "@/integrations/supabase/client";

interface UserRoleUpdate {
  email: string;
  newRole: 'citizen' | 'conselheiro_titular' | 'conselheiro_suplente' | 'secretario' | 'presidente' | 'admin';
  fullName?: string;
}

export class UserRoleManager {
  /**
   * Verifica o role atual de um usuário
   */
  static async checkUserRole(email: string) {
    try {
      console.log(`🔍 Verificando role do usuário: ${email}`);
      
      // Buscar usuário na tabela profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return { error: error.message };
      }

      if (!profile) {
        console.error('❌ Usuário não encontrado');
        return { error: 'Usuário não encontrado' };
      }

      console.log('✅ Dados do usuário:', {
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        isActive: profile.is_active,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      });

      return { 
        profile,
        error: null 
      };

    } catch (error: unknown) {
      console.error('💥 Erro inesperado:', error);
      return { error: error.message };
    }
  }

  /**
   * Atualiza o role de um usuário
   */
  static async updateUserRole(updates: UserRoleUpdate) {
    try {
      console.log(`🔄 Atualizando role do usuário: ${updates.email} para ${updates.newRole}`);
      
      // Verificar se usuário existe
      const checkResult = await this.checkUserRole(updates.email);
      if (checkResult.error) {
        return checkResult;
      }

      // Atualizar role na tabela profiles
      const updateData: unknown = {
        role: updates.newRole,
        updated_at: new Date().toISOString()
      };

      if (updates.fullName) {
        updateData.full_name = updates.fullName;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('email', updates.email)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        return { error: error.message };
      }

      console.log('✅ Usuário atualizado com sucesso:', {
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        updatedAt: data.updated_at
      });

      // Também atualizar metadados do usuário no auth se necessário
      try {
        const { data: authData, error: authError } = await supabase.auth.updateUser({
          data: {
            role: updates.newRole,
            full_name: updates.fullName || data.full_name
          }
        });

        if (authError) {
          console.warn('⚠️ Aviso: Não foi possível atualizar metadados de auth:', authError.message);
        } else {
          console.log('✅ Metadados de auth atualizados');
        }
      } catch (authUpdateError) {
        console.warn('⚠️ Aviso: Erro ao atualizar metadados de auth:', authUpdateError);
      }

      return { 
        profile: data,
        error: null 
      };

    } catch (error: unknown) {
      console.error('💥 Erro inesperado:', error);
      return { error: error.message };
    }
  }

  /**
   * Configura usuário específico como admin
   */
  static async makeUserAdmin(email: string, fullName?: string) {
    console.log(`👑 Configurando ${email} como administrador...`);
    
    return await this.updateUserRole({
      email,
      newRole: 'admin',
      fullName: fullName || 'Administrador do Sistema'
    });
  }

  /**
   * Lista todos os administradores
   */
  static async listAdmins() {
    try {
      console.log('📋 Listando todos os administradores...');
      
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('email, full_name, role, is_active, created_at, updated_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao listar admins:', error);
        return { error: error.message };
      }

      console.log(`✅ Encontrados ${admins.length} administradores:`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email} - ${admin.full_name} (${admin.is_active ? 'Ativo' : 'Inativo'})`);
      });

      return { 
        admins,
        error: null 
      };

    } catch (error: unknown) {
      console.error('💥 Erro inesperado:', error);
      return { error: error.message };
    }
  }
}

// Função de conveniência para usar no console
export const updateUserToAdmin = async (email: string, fullName?: string) => {
  return await UserRoleManager.makeUserAdmin(email, fullName);
};

export const checkUser = async (email: string) => {
  return await UserRoleManager.checkUserRole(email);
};

export const listAllAdmins = async () => {
  return await UserRoleManager.listAdmins();
}; 