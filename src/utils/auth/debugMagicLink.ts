/**
 * Utilitário para debuggar problemas com Magic Link
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Testa diferentes configurações de Magic Link
 */
export async function debugMagicLink(email: string): Promise<void> {
  console.log('🔗 DEBUGGING MAGIC LINK');
  console.log('━'.repeat(50));
  console.log(`📧 Testando para: ${email}`);
  console.log(`🌐 Origin atual: ${window.location.origin}`);
  console.log(`📍 URL completa: ${window.location.href}`);
  
  // Teste 1: Magic Link básico (configuração atual)
  console.log('\n🧪 TESTE 1: Magic Link com configuração atual');
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    
    console.log('📤 Resultado Teste 1:', { data, error });
    if (error) {
      console.error('❌ Erro Teste 1:', error.message);
    } else {
      console.log('✅ Teste 1: Enviado com sucesso');
    }
  } catch (error) {
    console.error('💥 Exceção Teste 1:', error);
  }
  
  // Aguardar um pouco entre testes
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 2: Magic Link com URL completa de callback
  console.log('\n🧪 TESTE 2: Magic Link com URL completa de callback');
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    console.log('📤 Resultado Teste 2:', { data, error });
    if (error) {
      console.error('❌ Erro Teste 2:', error.message);
    } else {
      console.log('✅ Teste 2: Enviado com sucesso');
    }
  } catch (error) {
    console.error('💥 Exceção Teste 2:', error);
  }
  
  // Aguardar um pouco entre testes
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 3: Magic Link sem redirecionamento
  console.log('\n🧪 TESTE 3: Magic Link sem redirecionamento');
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });
    
    console.log('📤 Resultado Teste 3:', { data, error });
    if (error) {
      console.error('❌ Erro Teste 3:', error.message);
    } else {
      console.log('✅ Teste 3: Enviado com sucesso');
    }
  } catch (error) {
    console.error('💥 Exceção Teste 3:', error);
  }
  
  console.log('\n📊 ANÁLISE DOS TESTES:');
  console.log('━'.repeat(50));
  console.log('⏰ Verifique seu email nos próximos 2-3 minutos');
  console.log('📂 Verifique também a pasta SPAM/Lixo eletrônico');
  console.log('⚠️ Supabase free tier: máximo 3 emails por hora');
  console.log('🔄 Se não receber nenhum, pode ser rate limiting');
}

/**
 * Verifica configurações do Supabase Auth
 */
export async function checkSupabaseAuthConfig(): Promise<void> {
  console.log('⚙️ VERIFICANDO CONFIGURAÇÕES SUPABASE');
  console.log('━'.repeat(50));
  
  try {
    // Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Sessão atual:', session ? 'Ativa' : 'Não ativa');
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError);
    }
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Usuário atual:', user ? user.email : 'Não logado');
    if (userError) {
      console.error('❌ Erro no usuário:', userError);
    }
    
    // Tentar obter configurações
    console.log('🌐 URL do Supabase:', supabase.supabaseUrl);
    console.log('🔑 Usando chave anon válida:', !!supabase.supabaseKey);
    
    // Verificar conectividade
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Erro de conectividade:', error.message);
    } else {
      console.log('✅ Conectividade com banco: OK');
    }
    
  } catch (error) {
    console.error('💥 Erro na verificação:', error);
  }
}

/**
 * Testa Password Reset para comparação
 */
export async function testPasswordReset(email: string): Promise<void> {
  console.log('🔑 TESTANDO PASSWORD RESET (para comparação)');
  console.log('━'.repeat(50));
  console.log(`📧 Testando para: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    console.log('📤 Resultado Password Reset:', { data, error });
    if (error) {
      console.error('❌ Erro Password Reset:', error.message);
    } else {
      console.log('✅ Password Reset: Enviado com sucesso');
      console.log('📧 Se este chegou mas magic link não, o problema é específico do Magic Link');
    }
  } catch (error) {
    console.error('💥 Exceção Password Reset:', error);
  }
}

/**
 * Verifica se SMTP customizado está configurado
 */
export async function checkSMTPConfiguration(): Promise<void> {
  console.log('📧 VERIFICANDO CONFIGURAÇÃO SMTP');
  console.log('━'.repeat(50));
  
  try {
    const response = await fetch(`${supabase.supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': supabase.supabaseKey,
        'Authorization': `Bearer ${supabase.supabaseKey}`
      }
    });
    
    if (response.ok) {
      const settings = await response.json();
      console.log('⚙️ Configurações obtidas:', settings);
      
      if (settings.smtp && Object.keys(settings.smtp).length > 0) {
        console.log('✅ SMTP CUSTOMIZADO CONFIGURADO:');
        console.log(`   📧 Host: ${settings.smtp.host || 'N/A'}`);
        console.log(`   🔌 Port: ${settings.smtp.port || 'N/A'}`);
        console.log(`   📬 Sender: ${settings.smtp.sender_email || 'N/A'}`);
        console.log('   🎯 Rate limiting customizado pode estar ativo');
      } else {
        console.log('❌ SMTP CUSTOMIZADO NÃO CONFIGURADO');
        console.log('🔧 Configure em: Dashboard → Authentication → Settings → SMTP');
        console.log('⚠️ Usando SMTP padrão com rate limit: 3 emails/hora');
      }
    } else {
      console.error('❌ Erro ao obter configurações:', response.status);
    }
    
  } catch (error) {
    console.error('💥 Erro na verificação SMTP:', error);
  }
  
  console.log('━'.repeat(50));
}

// Disponibilizar no console global
if (typeof window !== 'undefined') {
  (window as any).debugMagicLink = debugMagicLink;
  (window as any).checkSupabaseAuthConfig = checkSupabaseAuthConfig;
  (window as any).testPasswordReset = testPasswordReset;
  (window as any).checkSMTPConfiguration = checkSMTPConfiguration;
}