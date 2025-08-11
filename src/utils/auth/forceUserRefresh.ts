/**
 * Utilitário para forçar atualização dos dados do usuário
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Força refresh completo da sessão e dados do usuário
 */
export async function forceUserRefresh(): Promise<{ success: boolean; profile?: unknown; message: string }> {
  try {
    if (import.meta.env.DEV) {
      console.log('🔄 Forçando refresh da sessão do usuário...');
    }
    
    // 1. Refresh da sessão
    const { data: session, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError) {
      console.error('❌ Erro ao refresh da sessão:', sessionError);
      return { success: false, message: `Erro ao refresh da sessão: ${sessionError.message}` };
    }
    
    if (import.meta.env.DEV) {
      console.log('✅ Sessão refreshed:', session?.session?.user?.email);
    }
    
    // 2. Buscar dados atualizados do perfil
    if (session?.session?.user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        return { success: false, message: `Erro ao buscar perfil: ${profileError.message}` };
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ Perfil atualizado:', {
          email: profile?.email,
          role: profile?.role,
          name: profile?.full_name
        });
      }
      
      // 3. Perguntar se quer recarregar a página
      const shouldReload = confirm(`
🎯 Dados atualizados com sucesso!
📧 Email: ${profile?.email}
🎭 Role: ${profile?.role}
👤 Nome: ${profile?.full_name}

Deseja recarregar a página para aplicar as mudanças?
      `);
      
      if (shouldReload) {
        if (import.meta.env.DEV) {
          console.log('🔄 Recarregando página para aplicar mudanças...');
        }
        window.location.reload();
      } else {
        if (import.meta.env.DEV) {
          console.log('ℹ️ Página não foi recarregada. As mudanças podem não aparecer até o próximo refresh.');
        }
      }
      
      return { 
        success: true, 
        profile, 
        message: `Sessão atualizada com sucesso! Role: ${profile?.role}` 
      };
    } else {
      return { success: false, message: 'Usuário não encontrado na sessão' };
    }
    
  } catch (error) {
    console.error('💥 Erro ao forçar refresh:', error);
    return { success: false, message: `Erro inesperado: ${error}` };
  }
}

/**
 * Verifica se há discrepância entre dados locais e do servidor
 */
export async function checkUserDataConsistency(): Promise<{ consistent: boolean; sessionRole: string; dbRole: string; profile?: unknown }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      if (import.meta.env.DEV) {
        console.log('❌ Usuário não logado');
      }
      return { consistent: false, sessionRole: 'none', dbRole: 'none' };
    }
    
    if (import.meta.env.DEV) {
      console.log('🔍 Verificando consistência dos dados...');
      
      // Dados da sessão atual
      console.log('📱 Dados da sessão local:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        app_metadata: user.app_metadata
      });
    }
    
    // Dados do perfil no banco
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('❌ Erro ao buscar perfil do banco:', error);
      return { consistent: false, sessionRole: 'error', dbRole: 'error' };
    }
    
    if (import.meta.env.DEV) {
      console.log('🗄️ Dados do perfil no banco:', {
        id: profile?.id,
        email: profile?.email,
        role: profile?.role,
        name: profile?.full_name,
        updated_at: profile?.updated_at
      });
    }
    
    // Verificar discrepância
    const sessionRole = user.user_metadata?.role || user.app_metadata?.role || 'citizen';
    const dbRole = profile?.role || 'citizen';
    
    if (sessionRole !== dbRole) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ DISCREPÂNCIA DETECTADA!');
        console.warn(`   Sessão local: ${sessionRole}`);
        console.warn(`   Banco de dados: ${dbRole}`);
        console.warn('   🔧 Execute: await forceUserRefresh()');
      }
      
      return { 
        consistent: false, 
        sessionRole, 
        dbRole, 
        profile 
      };
    } else {
      if (import.meta.env.DEV) {
        console.log('✅ Dados consistentes');
        console.log(`   Role atual: ${dbRole}`);
      }
      
      return { 
        consistent: true, 
        sessionRole, 
        dbRole, 
        profile 
      };
    }
    
  } catch (error) {
    console.error('💥 Erro na verificação:', error);
    return { consistent: false, sessionRole: 'error', dbRole: 'error' };
  }
}

/**
 * Mostra status rápido do usuário atual
 */
export async function quickUserStatus(): Promise<void> {
  if (!import.meta.env.DEV) return;
  
  try {
    console.log('👤 STATUS RÁPIDO DO USUÁRIO:');
    console.log('━'.repeat(40));
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ Usuário não logado');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Role no banco: ${profile?.role || 'não encontrado'}`);
    console.log(`👤 Nome: ${profile?.full_name || 'não encontrado'}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Última atualização: ${profile?.updated_at || 'não encontrado'}`);
    console.log('━'.repeat(40));
    
    const sessionRole = user.user_metadata?.role || user.app_metadata?.role || 'citizen';
    if (sessionRole !== profile?.role) {
      console.log('⚠️ ATENÇÃO: Dados inconsistentes!');
      console.log(`   Execute: await forceUserRefresh()`);
    } else {
      console.log('✅ Dados consistentes');
    }
    
  } catch (error) {
    console.error('💥 Erro ao verificar status:', error);
  }
}

// Disponibilizar no console global
if (typeof window !== 'undefined') {
  (window as any).forceUserRefresh = forceUserRefresh;
  (window as any).checkUserDataConsistency = checkUserDataConsistency;
  (window as any).quickUserStatus = quickUserStatus;
}