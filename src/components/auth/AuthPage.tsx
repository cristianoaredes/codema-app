import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Mail, Lock, Phone, Home, Send, Shield, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    neighborhood: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos"
            : error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Sistema Municipal de Itanhemi"
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
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        toast({
          title: "Erro ao enviar link",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Link mágico enviado!",
          description: "Verifique seu email e clique no link para entrar."
        });
        setMagicLinkEmail("");
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar link",
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
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: registerData.fullName,
            phone: registerData.phone,
            address: registerData.address,
            neighborhood: registerData.neighborhood
          }
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message === "User already registered" 
            ? "Este email já está cadastrado"
            : error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta."
        });
        // Reset form
        setRegisterData({
          fullName: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          neighborhood: ""
        });
      }
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background to-secondary/8 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sistema Municipal</h1>
          <p className="text-muted-foreground text-lg">Itanhemi - MG | CODEMA</p>
          <p className="text-sm text-muted-foreground/80 mt-1">Conselho de Defesa do Meio Ambiente</p>
        </div>

        <Card className="shadow-xl border border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-card-foreground">Acesse sua conta</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Entre ou cadastre-se para acessar o sistema municipal
            </CardDescription>
            
            {/* User roles info */}
            <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl text-left border border-border/30">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Tipos de Usuário
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <User className="w-3 h-3 mr-1" />
                    Cidadão
                  </Badge>
                  <span className="text-muted-foreground">Reportar problemas e acompanhar</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs px-2 py-1 border-primary/30">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Conselheiro
                  </Badge>
                  <span className="text-muted-foreground">Participar das reuniões e votações</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="text-xs px-2 py-1 bg-primary">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                  <span className="text-muted-foreground">Gestão completa do sistema</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 h-11 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 h-11 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                  
                  <div className="relative my-6">
                    <Separator className="bg-border" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-background px-3 text-muted-foreground text-sm font-medium">ou</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowMagicLink(!showMagicLink)}
                    className="w-full h-11 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Entrar sem senha
                  </Button>
                  
                  {showMagicLink && (
                    <div className="space-y-4 p-5 border border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5">
                      <div className="space-y-2">
                        <Label htmlFor="magicEmail" className="text-sm font-medium text-foreground">Email para link mágico</Label>
                        <div className="relative">
                          <Input
                            id="magicEmail"
                            type="email"
                            placeholder="seu@email.com"
                            value={magicLinkEmail}
                            onChange={(e) => setMagicLinkEmail(e.target.value)}
                            className="pl-10 h-11 border-border/50"
                            required
                          />
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleMagicLink} 
                        className="w-full h-11 bg-secondary hover:bg-secondary-hover text-secondary-foreground font-medium" 
                        disabled={isLoading}
                      >
                        {isLoading ? "Enviando..." : "Enviar link mágico"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        Enviaremos um link seguro para seu email. Clique no link para entrar automaticamente.
                      </p>
                    </div>
                  )}
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        placeholder="Seu nome completo"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <div className="relative">
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Senha</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Crie uma senha"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        placeholder="(xx) xxxx-xxxx"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                      />
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="relative">
                      <Input
                        id="address"
                        placeholder="Rua, número"
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10"
                      />
                      <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Seu bairro"
                      value={registerData.neighborhood}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;