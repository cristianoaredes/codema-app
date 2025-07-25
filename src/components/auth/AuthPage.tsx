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
import { Loader2, ShieldCheck, BarChart3, Zap, Mail, Key } from "lucide-react";
import { authService } from "@/services/auth/AuthService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'magic' | 'password' | 'signup'>('magic');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMeChecked, setRememberMeChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const carouselSlides = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-300" />,
      title: "Gestão Digital Completa",
      description: "Organize reuniões, atas e resoluções de forma digital e segura, eliminando papelada e burocracias desnecessárias."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-300" />,
      title: "Transparência Automática", 
      description: "Portal público automatizado que garante prestação de contas clara e acessível para toda a população."
    },
    {
      icon: <Zap className="w-8 h-8 text-green-300" />,
      title: "Novas Oportunidades",
      description: "Destrave recursos federais e estaduais através da modernização e boa governança do seu CODEMA."
    }
  ];

  const { toast } = useToast();
  const { setRememberMe } = useAuth();
  const navigate = useNavigate();

  const handleMagicLink = async () => {
    if (!email) {
      toast({ 
        title: "Email necessário", 
        description: "Por favor, insira seu email para receber o link de acesso.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    const result = await authService.signInWithMagicLink(email);
    
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
      setActiveTab('magic'); // Go back to magic link tab after successful signup
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

  if (magicLinkSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-800">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Verifique seu e-mail</CardTitle>
            <CardDescription className="text-gray-600">
              Enviamos um link de acesso para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>• Verifique sua caixa de entrada</p>
              <p>• Clique no link para fazer login automaticamente</p>
              <p>• O link expira em 1 hora</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setMagicLinkSent(false)}
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2">
      {/* Coluna de Branding (Esquerda) */}
      <div className="hidden md:flex flex-col bg-gradient-to-br from-green-700 to-emerald-800 text-white p-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">MuniConnect</h1>
          <p className="text-lg text-green-100">CODEMA Digital</p>
        </div>
        <p className="text-2xl text-green-100 leading-relaxed">
          Transforme a gestão do seu Conselho Municipal de Meio Ambiente com tecnologia moderna e transparente.
        </p>
        <div className="my-auto">
          <Carousel 
            className="w-full max-w-md mx-auto"
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {carouselSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="text-center space-y-4 p-6">
                    <div className="bg-green-600 p-4 rounded-full w-fit mx-auto">
                      {slide.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {slide.title}
                    </h3>
                    <p className="text-green-100 text-lg leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
            <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
          </Carousel>
        </div>
        <div className="mt-auto text-green-200 text-sm">&copy; 2024 MuniConnect. Todos os direitos reservados.</div>
      </div>

      {/* Coluna de Formulário (Direita) */}
      <div className="bg-gray-50 flex flex-col justify-center p-8 md:p-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-10">
            <img src={logo} alt="MuniConnect Logo" className="h-32 w-auto mx-auto" />
          </div>
          
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Bem-vindo!</CardTitle>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
                  <TabsTrigger value="magic" className="flex items-center justify-center gap-1">
                    <Mail className="w-4 h-4" /> E-mail (sem senha)
                  </TabsTrigger>
                  <TabsTrigger value="password" className="flex items-center justify-center gap-1">
                    <Key className="w-4 h-4" /> Senha
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center justify-center gap-1">
                    ✨ Cadastro
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} className="mt-4">
                <TabsContent value="magic">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-magic">Email</Label>
                      <Input
                        id="email-magic"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        required
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleMagicLink}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Enviar Link por E-mail
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Prefere senha?{' '}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setActiveTab('password')}
                      >
                        Entrar com senha
                      </button>
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="password">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login">Senha</Label>
                      <Input
                        id="password-login"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMeChecked}
                          onCheckedChange={(c) => setRememberMeChecked(Boolean(c))}
                        />
                        <label htmlFor="remember-me">Lembrar-me</label>
                      </div>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="font-semibold text-green-700 hover:underline"
                        disabled={isLoading}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Key className="mr-2 h-4 w-4" />
                      )}
                      Entrar
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Novo por aqui?{' '}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setActiveTab('signup')}
                      >
                        Criar conta
                      </button>
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Senha</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Já possui conta?{' '}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setActiveTab('magic')}
                      >
                        Entrar
                      </button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}