import { supabase } from "@/integrations/supabase/client";

interface TestAccount {
  email: string;
  password: string;
  full_name: string;
  role: 'citizen' | 'conselheiro_titular' | 'conselheiro_suplente' | 'secretario' | 'presidente' | 'admin';
  description: string;
}

const testAccounts: TestAccount[] = [
  {
    email: "cidadao@test.com",
    password: "123456",
    full_name: "João Silva",
    role: "citizen",
    description: "Conta de teste para cidadão comum"
  },
  {
    email: "conselheiro@test.com",
    password: "123456",
    full_name: "Maria Santos",
    role: "conselheiro_titular",
    description: "Conta de teste para conselheiro titular"
  },
  {
    email: "suplente@test.com",
    password: "123456",
    full_name: "Carlos Oliveira",
    role: "conselheiro_suplente",
    description: "Conta de teste para conselheiro suplente"
  },
  {
    email: "secretario@test.com",
    password: "123456",
    full_name: "Ana Costa",
    role: "secretario",
    description: "Conta de teste para secretário executivo"
  },
  {
    email: "presidente@test.com",
    password: "123456",
    full_name: "Roberto Lima",
    role: "presidente",
    description: "Conta de teste para presidente do CODEMA"
  },
  {
    email: "admin@test.com",
    password: "123456",
    full_name: "Administrador Sistema",
    role: "admin",
    description: "Conta de teste para administrador do sistema"
  }
];

export class TestAccountManager {
  static async createTestAccounts() {
    console.log('👥 Criando contas de teste...');
    
    const results = [];
    
    for (const account of testAccounts) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', account.email)
          .single();

        if (existingUser) {
          console.log(`⚠️  Conta ${account.email} já existe`);
          results.push({
            email: account.email,
            status: 'exists',
            role: account.role
          });
          continue;
        }

        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              full_name: account.full_name,
              role: account.role
            }
          }
        });

        if (authError) {
          console.error(`❌ Erro ao criar conta ${account.email}:`, authError);
          results.push({
            email: account.email,
            status: 'error',
            error: authError.message
          });
          continue;
        }

        // Update profile with role
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              full_name: account.full_name,
              role: account.role
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error(`❌ Erro ao atualizar perfil ${account.email}:`, profileError);
          }
        }

        console.log(`✅ Conta criada: ${account.email} (${account.role})`);
        results.push({
          email: account.email,
          status: 'created',
          role: account.role
        });

      } catch (error) {
        console.error(`❌ Erro inesperado para ${account.email}:`, error);
        results.push({
          email: account.email,
          status: 'error',
          error: 'Erro inesperado'
        });
      }
    }

    console.log('📋 Resumo das contas de teste:');
    results.forEach(result => {
      const statusIcon = result.status === 'created' ? '✅' : 
                        result.status === 'exists' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${result.email} (${result.role})`);
    });

    return results;
  }

  static getTestAccountsInfo() {
    return testAccounts.map(account => ({
      email: account.email,
      password: account.password,
      role: account.role,
      description: account.description
    }));
  }

  static async deleteTestAccounts() {
    console.log('🗑️  Removendo contas de teste...');

    for (const account of testAccounts) {
      try {
        // Note: We can't delete auth users directly from client
        // We can only delete the profile data
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('email', account.email);

        if (error) {
          console.error(`❌ Erro ao remover perfil ${account.email}:`, error);
        } else {
          console.log(`✅ Perfil removido: ${account.email}`);
        }
      } catch (error) {
        console.error(`❌ Erro inesperado para ${account.email}:`, error);
      }
    }
  }
}