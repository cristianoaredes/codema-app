import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const [_searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processando callback de autenticação...');
        console.log('🌐 URL atual:', window.location.href);
        
        // Verificar se há tokens na URL (hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('type'); // magic link, recovery, etc.
        
        console.log('🎫 Tokens encontrados:', { 
          accessToken: accessToken ? 'Presente' : 'Ausente',
          refreshToken: refreshToken ? 'Presente' : 'Ausente',
          type: tokenType
        });

        let data, error;
        
        if (accessToken && tokenType === 'recovery') {
          console.log('🔐 Token de RECOVERY detectado - redirecionando para reset de senha...');
          
          // Processar tokens de recovery
          const { data: _authData, error: authError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (authError) {
            throw authError;
          }
          
          console.log('✅ Sessão de recovery criada - redirecionando para página de nova senha');
          
          // Limpar a URL e redirecionar para página de reset
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/auth/reset-password', { replace: true });
          return;
          
        } else if (accessToken && tokenType === 'magiclink') {
          console.log('🔄 Processando tokens de MAGIC LINK...');
          
          // Processar tokens de magic link
          const { data: authData, error: authError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          data = authData;
          error = authError;
          
          console.log('📱 Resultado do processamento:', { data, error });
          
          // Limpar a URL após processar os tokens
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('🧹 URL limpa após processamento dos tokens');
        } else {
          // Verificar sessão existente se não há tokens na URL
          console.log('🔍 Verificando sessão existente...');
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          data = sessionData;
          error = sessionError;
        }

        if (error) {
          console.error('Erro no callback de autenticação:', error);
          setStatus('error');
          setMessage(error.message || 'Erro ao processar autenticação');
          
          toast({
            title: "Erro na autenticação",
            description: "Não foi possível completar o login. Tente novamente.",
            variant: "destructive"
          });
          
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Login realizado com sucesso! Redirecionando...');
          
          toast({
            title: "Login realizado!",
            description: "Bem-vindo ao sistema CODEMA.",
            variant: "default"
          });
          
          // Redirecionar para dashboard após 2 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Sessão não encontrada. Tente fazer login novamente.');
          
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        }
      } catch (error) {
        console.error('Erro inesperado no callback:', error);
        setStatus('error');
        setMessage('Erro inesperado. Tente novamente.');
        
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  const StatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <StatusIcon />
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Sucesso!'}
            {status === 'error' && 'Ops!'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {status === 'loading' && 'Aguarde enquanto verificamos suas credenciais...'}
          {status === 'success' && 'Você será redirecionado automaticamente.'}
          {status === 'error' && 'Você será redirecionado para a página de login.'}
        </CardContent>
      </Card>
    </div>
  );
} 