import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { createPersistentSession } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Mail, 
  Key, 
  UserPlus,
  ArrowRight,
  CheckCircle2,
  TreePine,
  Users,
  FileText,
  Lock
} from "lucide-react";
import { authService } from "@/services/auth/AuthService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const magicLinkSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().default(true),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'magic' | 'password' | 'signup'>('magic');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });
  
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const { toast } = useToast();
  const { setRememberMe } = useAuth();
  const navigate = useNavigate();

  const handleMagicLink = async (data: MagicLinkFormData) => {
    setIsLoading(true);
    const result = await authService.signInWithMagicLink(data.email);
    
    if (result.error) {
      toast({ 
        title: "Erro ao enviar link", 
        description: result.error, 
        variant: "destructive" 
      });
    } else {
      setMagicLinkSent(true);
      toast({ 
        title: "E-mail enviado!", 
        description: "Abra sua caixa de entrada e clique no link para acessar a plataforma.", 
        variant: "default" 
      });
    }
    setIsLoading(false);
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ 
      email: data.email, 
      password: data.password 
    });

    if (error) {
      toast({ title: "Erro no Login", description: error.message, variant: "destructive" });
    } else if (authData.user && authData.session) {
      if (data.rememberMe) {
        await createPersistentSession(authData.user.id, authData.session.refresh_token, data.rememberMe);
      }
      setRememberMe(data.rememberMe);
      toast({ title: "Login realizado com sucesso!", description: "Bem-vindo à plataforma MuniConnect." });
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });

    if (error) {
      toast({ title: 'Erro no Cadastro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar sua conta.' });
      setActiveTab('magic');
      signupForm.reset();
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async () => {
    const email = loginForm.getValues('email');
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

  if (magicLinkSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full">
                  <Mail className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Verifique seu e-mail
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enviamos um link de acesso para <strong className="text-gray-800">{magicLinkForm.getValues('email')}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Verifique sua caixa de entrada</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Clique no link para fazer login automaticamente</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>O link expira em 1 hora</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-emerald-200 hover:bg-emerald-50" 
                onClick={() => setMagicLinkSent(false)}
              >
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Mobile Header - Shown only on mobile */}
      <div className="lg:hidden bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl">
            <TreePine className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MuniConnect</h1>
            <p className="text-emerald-100 text-xs">CODEMA Digital</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Sistema de Gestão Ambiental
        </h2>
        <p className="text-sm text-emerald-100 opacity-90">
          Tecnologia moderna para digitalizar seu CODEMA
        </p>
      </div>

      {/* Left Column - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          {/* Logo and Title */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
                <TreePine className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">MuniConnect</h1>
                <p className="text-emerald-100 text-sm">CODEMA Digital</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Transforme a gestão do seu Conselho Municipal de Meio Ambiente
            </h2>
            <p className="text-lg text-emerald-100 leading-relaxed">
              Tecnologia moderna e transparente para digitalizar completamente seu CODEMA.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4"
            >
              <div className="p-2 bg-white/10 backdrop-blur rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gestão Digital Completa</h3>
                <p className="text-sm text-emerald-100">
                  Organize reuniões, atas e resoluções de forma digital e segura.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-4"
            >
              <div className="p-2 bg-white/10 backdrop-blur rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Transparência Automática</h3>
                <p className="text-sm text-emerald-100">
                  Portal público com prestação de contas clara e acessível.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="p-2 bg-white/10 backdrop-blur rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Novas Oportunidades</h3>
                <p className="text-sm text-emerald-100">
                  Destrave recursos federais através da modernização.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-emerald-200 text-sm">
            © 2024 MuniConnect. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col lg:flex lg:items-center lg:justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <Card className="shadow-xl lg:shadow-2xl border-0 bg-white">
            <CardHeader className="text-center space-y-4 pb-2">
              {/* Mobile Logo (shown only on mobile) */}
              <div className="lg:hidden flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                  <TreePine className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Bem-vindo!
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Acesse a plataforma CODEMA Digital
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 lg:pt-6 px-4 sm:px-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'magic' | 'password' | 'signup')} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-6 h-auto p-1">
                  <TabsTrigger value="magic" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 flex-col sm:flex-row gap-1 py-2 sm:py-1.5">
                    <Mail className="w-4 h-4 sm:mr-1.5" />
                    <span className="text-xs sm:text-sm">E-mail</span>
                  </TabsTrigger>
                  <TabsTrigger value="password" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 flex-col sm:flex-row gap-1 py-2 sm:py-1.5">
                    <Key className="w-4 h-4 sm:mr-1.5" />
                    <span className="text-xs sm:text-sm">Senha</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 flex-col sm:flex-row gap-1 py-2 sm:py-1.5">
                    <UserPlus className="w-4 h-4 sm:mr-1.5" />
                    <span className="text-xs sm:text-sm">Cadastro</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="magic" className="space-y-4">
                  <form onSubmit={magicLinkForm.handleSubmit(handleMagicLink)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-magic">Email</Label>
                      <Input
                        id="email-magic"
                        type="email"
                        {...magicLinkForm.register('email')}
                        placeholder="seu.email@exemplo.com"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {magicLinkForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{magicLinkForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 sm:h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-base sm:text-sm rounded-lg transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Link por E-mail
                        </>
                      )}
                    </Button>
                    <p className="text-xs sm:text-xs text-center text-gray-600 mt-2">
                      Prefere usar senha?{' '}
                      <button
                        type="button"
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={() => setActiveTab('password')}
                      >
                        Entrar com senha
                      </button>
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        {...loginForm.register('email')}
                        placeholder="seu.email@exemplo.com"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login">Senha</Label>
                      <Input
                        id="password-login"
                        type="password"
                        {...loginForm.register('password')}
                        placeholder="••••••••"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          {...loginForm.register('rememberMe')}
                        />
                        <label htmlFor="remember-me" className="text-sm text-gray-600">
                          Lembrar-me
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        disabled={isLoading}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 sm:h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-base sm:text-sm rounded-lg transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Entrar
                        </>
                      )}
                    </Button>
                    <p className="text-xs sm:text-xs text-center text-gray-600 mt-2">
                      Não tem conta?{' '}
                      <button
                        type="button"
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={() => setActiveTab('signup')}
                      >
                        Criar conta grátis
                      </button>
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        {...signupForm.register('fullName')}
                        placeholder="João Silva"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {signupForm.formState.errors.fullName && (
                        <p className="text-sm text-red-600">{signupForm.formState.errors.fullName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        {...signupForm.register('email')}
                        placeholder="seu.email@exemplo.com"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {signupForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Senha</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        {...signupForm.register('password')}
                        placeholder="Mínimo 6 caracteres"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {signupForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 sm:h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-base sm:text-sm rounded-lg transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Criar Conta Grátis
                        </>
                      )}
                    </Button>
                    <p className="text-xs sm:text-xs text-center text-gray-600 mt-2">
                      Já tem conta?{' '}
                      <button
                        type="button"
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={() => setActiveTab('magic')}
                      >
                        Fazer login
                      </button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-emerald-500" />
              <span>LGPD Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}