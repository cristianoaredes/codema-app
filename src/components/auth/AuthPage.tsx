import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo_municonnect_vert.png";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { createPersistentSession } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, BarChart3, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import GoogleIcon from "@/components/icons/GoogleIcon";

export function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMeChecked, setRememberMeChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { setRememberMe } = useAuth();
  const navigate = useNavigate();

  const handleOAuthLogin = async (provider: 'google') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast({ title: 'Erro no Login com Google', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Erro no Login", description: error.message, variant: "destructive" });
    } else if (data.user && data.session) {
      if (rememberMeChecked) {
        await createPersistentSession(data.user.id, data.session.refresh_token, rememberMeChecked);
      }
      setRememberMe(rememberMeChecked);
      toast({ title: "Login realizado com sucesso!", description: "Bem-vindo à plataforma MuniConnect." });
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast({ title: 'Erro no Cadastro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar sua conta.' });
      setIsLoginView(true);
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({ title: 'Email necessário', description: 'Por favor, insira seu email para recuperar a senha.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email de recuperação enviado', description: 'Verifique sua caixa de entrada.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2">
      {/* Coluna de Branding (Esquerda) */}
      <div className="hidden md:flex flex-col bg-gradient-to-br from-green-700 to-emerald-800 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao MuniConnect</h1>
        <p className="text-lg text-green-100 mb-8">A plataforma completa para gestão e transparência de conselhos municipais.</p>
        <ul className="space-y-4 text-green-50">
          <li className="flex items-start gap-3"><ShieldCheck className="w-6 h-6 mt-1 text-green-300" /><span>Organize reuniões, atas e resoluções de forma digital e segura.</span></li>
          <li className="flex items-start gap-3"><BarChart3 className="w-6 h-6 mt-1 text-green-300" /><span>Aumente a transparência com um portal público automatizado.</span></li>
          <li className="flex items-start gap-3"><Zap className="w-6 h-6 mt-1 text-green-300" /><span>Destrave novas receitas para seu município através da boa governança.</span></li>
        </ul>
        <div className="mt-auto text-green-200 text-sm">&copy; 2024 MuniConnect. Todos os direitos reservados.</div>
      </div>

      {/* Coluna de Formulário (Direita) */}
      <div className="bg-gray-50 flex flex-col justify-center p-8 md:p-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <img src={logo} alt="MuniConnect Logo" className="h-24 w-auto mx-auto" />
          </div>
          
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">{isLoginView ? 'Acesse sua Plataforma' : 'Crie sua Conta'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoginView ? (
                <div className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('google')} disabled={isLoading}>
                    <GoogleIcon className="mr-2 h-5 w-5" /> Continuar com Google
                  </Button>
                  <Separator>OU</Separator>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div><Label htmlFor="password">Senha</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2"><Checkbox id="remember-me" checked={rememberMeChecked} onCheckedChange={(c) => setRememberMeChecked(Boolean(c))} /><label htmlFor="remember-me">Lembrar-me</label></div>
                      <button type="button" onClick={handlePasswordReset} className="font-semibold text-green-700 hover:underline" disabled={isLoading}>Esqueceu a senha?</button>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Entrar com Senha'}</Button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div><Label htmlFor="fullName">Nome Completo</Label><Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                  <div><Label htmlFor="email-signup">Email</Label><Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div><Label htmlFor="password-signup">Senha</Label><Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}</Button>
                </form>
              )}
              <div className="mt-6 text-center text-sm">
                {isLoginView ? (
                  <span>Não tem uma conta? <button onClick={() => setIsLoginView(false)} className="font-semibold text-green-700 hover:underline">Cadastre-se</button></span>
                ) : (
                  <span>Já tem uma conta? <button onClick={() => setIsLoginView(true)} className="font-semibold text-green-700 hover:underline">Faça login</button></span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}