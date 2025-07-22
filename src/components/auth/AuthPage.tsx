import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Phone, Home, Send, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDemoMode, demoAPI } from "@/lib/demo-mode";
import { validateEmailForRole } from "@/utils/email";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { createPersistentSession } from "@/utils/auth";
import logo from "@/assets/logo_with_text.png";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const { setRememberMe } = useAuth();

  const [rememberMeChecked, setRememberMeChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
    neighborhood: ""
  });

  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [emailValidation, setEmailValidation] = useState({ isValid: true, error: "" });

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para receber o link de recuperação",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para o link de recuperação",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (isDemoMode) {
        result = await demoAPI.signIn(loginData.email, loginData.password);
      } else {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password
          });
          result = { error };
        } catch (networkError) {
          console.warn('Problema de conectividade, usando modo demo:', networkError);
          result = await demoAPI.signIn(loginData.email, loginData.password);
          toast({
            title: "Modo Demonstração",
            description: "Sistema rodando em modo demo devido a problemas de conectividade",
            variant: "default"
          });
        }
      }

      if (result.error) {
        toast({
          title: "Erro no login",
          description: result.error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos"
            : result.error.message,
          variant: "destructive"
        });
      } else {
        if (rememberMeChecked) {
          try {
            setRememberMe(true);
            await createPersistentSession('user-id', 'refresh-token');
            console.log('🔐 Sessão persistente criada com sucesso');
          } catch (rememberMeError) {
            console.warn('⚠️ Erro ao criar sessão persistente:', rememberMeError);
          }
        } else {
          setRememberMe(false);
        }

        toast({
          title: "Login realizado com sucesso!",
          description: rememberMeChecked 
            ? "Bem-vindo! Você será lembrado neste dispositivo."
            : "Bem-vindo à plataforma MuniConnect"
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!magicLinkEmail) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para receber o link de acesso",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Link enviado",
          description: "Verifique sua caixa de entrada para o link de acesso",
        });
        setMagicLinkEmail("");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (registerData.password !== registerData.confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "As senhas digitadas não são iguais",
          variant: "destructive"
        });
        return;
      }

      const validation = validateEmailForRole(registerData.email, "citizen");
      if (!validation.isValid) {
        setEmailValidation({ isValid: validation.isValid, error: validation.error || "" });
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName,
            phone: registerData.phone,
            address: registerData.address,
            neighborhood: registerData.neighborhood,
            role: "citizen" as UserRole
          }
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar a conta",
        });
        setActiveTab("login");
        setRegisterData({
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          phone: "",
          address: "",
          neighborhood: ""
        });
        setEmailValidation({ isValid: true, error: "" });
      }
    } catch (error) {
      console.error('AuthPage: Register error:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="MuniConnect Logo" className="h-10 w-auto" />
              <div className="border-l border-gray-200 pl-4">
                <h1 className="text-xl font-semibold text-gray-900">MuniConnect</h1>
                <p className="text-sm text-gray-600">Gestão de Conselhos Municipais</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-6">
        <div className="w-full max-w-md">
          {/* Card Principal */}
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Acesse sua Plataforma</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Entre com suas credenciais para gerenciar seus conselhos.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                  <TabsTrigger value="magic">Magic Link</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMeChecked}
                          onCheckedChange={(checked) => setRememberMeChecked(checked as boolean)}
                        />
                        <Label htmlFor="remember-me" className="text-sm">Lembrar de mim</Label>
                      </div>
                      <Button 
                        type="button" 
                        variant="link"
                        className="text-sm"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={registerData.email}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, email: e.target.value });
                            const validation = validateEmailForRole(e.target.value, "citizen");
                            setEmailValidation({ isValid: validation.isValid, error: validation.error || "" });
                          }}
                          className="pl-10"
                          required
                        />
                      </div>
                      {!emailValidation.isValid && (
                        <p className="text-sm text-destructive">{emailValidation.error}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">Confirmar</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-address">Endereço</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-address"
                          type="text"
                          placeholder="Rua, número, bairro"
                          value={registerData.address}
                          onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        "Cadastrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Magic Link Tab */}
                <TabsContent value="magic" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Digite seu email para receber um link de acesso sem senha
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={magicLinkEmail}
                          onChange={(e) => setMagicLinkEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={handleMagicLink}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Magic Link
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              © 2024 MuniConnect - Gestão Inteligente para Municípios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;