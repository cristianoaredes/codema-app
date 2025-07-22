import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useToast } from '@/hooks';
import { authService } from '@/services/auth/AuthService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validação de senha em tempo real
  const passwordValidation = authService.validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: "Por favor, atenda a todos os critérios de senha.",
        variant: "destructive"
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas devem ser idênticas.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔑 Atualizando senha do usuário...');
      
      const { error } = await authService.updatePassword(password);
      
      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        toast({
          title: "Erro ao atualizar senha",
          description: error,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Senha atualizada com sucesso!');
      
      toast({
        title: "✅ Senha redefinida com sucesso!",
        description: "Sua nova senha foi salva. Redirecionando para o dashboard...",
        variant: "default"
      });

      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se não há usuário autenticado (token inválido), redirecionar para login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Token Inválido</CardTitle>
            <CardDescription>
              O link de redefinição de senha expirou ou é inválido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Redefinir Senha
          </h1>
          <p className="text-gray-600">
            Olá, <strong>{user.user_metadata?.full_name || user.email}</strong>!<br />
            Defina sua nova senha abaixo.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center">
              Sua nova senha deve ser segura e fácil de lembrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Campo Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente sua nova senha"
                  disabled={isLoading}
                />
              </div>

              {/* Validação de Senha */}
              {password && (
                <div className="bg-gray-50 p-3 rounded border text-sm space-y-2">
                  <div className="font-medium text-gray-700">Critérios da senha:</div>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                      {password.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span className="text-xs">Pelo menos 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                      {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span className="text-xs">Uma letra maiúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                      {/[a-z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span className="text-xs">Uma letra minúscula</span>
                    </div>
                    <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                      {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span className="text-xs">Um número</span>
                    </div>
                  </div>
                  
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span className="text-xs">Senhas coincidem</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Atualizando senha...' : 'Redefinir Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 