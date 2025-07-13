import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, User, Mail, Lock, Phone, Home, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useScreenReaderSupport } from "@/components/accessibility/AccessibilityProvider";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { announceError, announceSuccess, announceLoading } = useScreenReaderSupport();

  // Refs for focus management
  const loginFormRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);
  const firstLoginFieldRef = useRef<HTMLInputElement>(null);
  const firstRegisterFieldRef = useRef<HTMLInputElement>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    neighborhood: ""
  });

  // Focus management when switching tabs
  useEffect(() => {
    const focusFirstField = () => {
      if (activeTab === "login" && firstLoginFieldRef.current) {
        firstLoginFieldRef.current.focus();
      } else if (activeTab === "register" && firstRegisterFieldRef.current) {
        firstRegisterFieldRef.current.focus();
      }
    };
    
    // Small delay to ensure tab content is rendered
    const timer = setTimeout(focusFirstField, 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Form validation
  const validateLoginForm = () => {
    const errors: Record<string, string> = {};
    
    if (!loginData.email) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      errors.email = "Email inválido";
    }
    
    if (!loginData.password) {
      errors.password = "Senha é obrigatória";
    } else if (loginData.password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    return errors;
  };

  const validateRegisterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!registerData.fullName.trim()) {
      errors.fullName = "Nome completo é obrigatório";
    } else if (registerData.fullName.trim().length < 2) {
      errors.fullName = "Nome deve ter pelo menos 2 caracteres";
    }
    
    if (!registerData.email) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = "Email inválido";
    }
    
    if (!registerData.password) {
      errors.password = "Senha é obrigatória";
    } else if (registerData.password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    return errors;
  };

  // Clear field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Announce first error to screen reader
      const firstError = Object.entries(errors)[0];
      announceError(`Campo ${firstError[0] === 'email' ? 'email' : 'senha'}: ${firstError[1]}`);
      
      // Focus on first field with error
      const firstErrorField = firstError[0] === 'email' ? firstLoginFieldRef.current :
                             loginFormRef.current?.querySelector('#password') as HTMLInputElement;
      firstErrorField?.focus();
      
      return;
    }
    
    setIsLoading(true);
    announceLoading(true, "Fazendo login...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        const errorMessage = error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : error.message;
          
        announceError(errorMessage);
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        announceSuccess("Login realizado com sucesso!");
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Sistema Municipal de Itanhomi"
        });
        navigate("/");
      }
    } catch (error) {
      const errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      announceError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      announceLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Announce first error to screen reader
      const firstError = Object.entries(errors)[0];
      const fieldNames: Record<string, string> = {
        fullName: 'nome completo',
        email: 'email',
        password: 'senha'
      };
      
      announceError(`Campo ${fieldNames[firstError[0]] || firstError[0]}: ${firstError[1]}`);
      
      // Focus on first field with error
      const firstErrorField = registerFormRef.current?.querySelector(`#${firstError[0] === 'fullName' ? 'fullName' : firstError[0]}`) as HTMLInputElement;
      firstErrorField?.focus();
      
      return;
    }
    
    setIsLoading(true);
    announceLoading(true, "Realizando cadastro...");

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
        const errorMessage = error.message === "User already registered"
          ? "Este email já está cadastrado"
          : error.message;
          
        announceError(errorMessage);
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        announceSuccess("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
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
        // Focus on first field after reset
        setTimeout(() => firstRegisterFieldRef.current?.focus(), 100);
      }
    } catch (error) {
      const errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      announceError(errorMessage);
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      announceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div
            className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4"
            role="img"
            aria-label="Ícone do Sistema Municipal de Itanhomi"
          >
            <MapPin className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sistema Municipal</h1>
          <p className="text-muted-foreground">Itanhomi - MG | CODEMA</p>
        </header>

        <main>
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle>Acesse sua conta</CardTitle>
              <CardDescription>
                Entre ou cadastre-se para reportar problemas municipais
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
                aria-label="Formulários de autenticação"
              >
                <TabsList className="grid w-full grid-cols-2" role="tablist">
                  <TabsTrigger
                    value="login"
                    role="tab"
                    aria-selected={activeTab === "login"}
                    aria-controls="login-panel"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    role="tab"
                    aria-selected={activeTab === "register"}
                    aria-controls="register-panel"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>
              
              <TabsContent
                value="login"
                id="login-panel"
                role="tabpanel"
                aria-labelledby="login-tab"
              >
                <form
                  ref={loginFormRef}
                  onSubmit={handleLogin}
                  className="space-y-4"
                  noValidate
                  aria-label="Formulário de login"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Input
                        ref={firstLoginFieldRef}
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData(prev => ({ ...prev, email: e.target.value }));
                          clearFieldError('email');
                        }}
                        onBlur={() => {
                          const errors = validateLoginForm();
                          if (errors.email) {
                            setFormErrors(prev => ({ ...prev, email: errors.email }));
                          }
                        }}
                        className={`pl-10 ${formErrors.email ? 'border-destructive focus:ring-destructive' : ''}`}
                        required
                        aria-invalid={!!formErrors.email}
                        aria-describedby={formErrors.email ? "email-error" : undefined}
                        autoComplete="email"
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    {formErrors.email && (
                      <div
                        id="email-error"
                        className="flex items-center text-sm text-destructive mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData(prev => ({ ...prev, password: e.target.value }));
                          clearFieldError('password');
                        }}
                        onBlur={() => {
                          const errors = validateLoginForm();
                          if (errors.password) {
                            setFormErrors(prev => ({ ...prev, password: errors.password }));
                          }
                        }}
                        className={`pl-10 ${formErrors.password ? 'border-destructive focus:ring-destructive' : ''}`}
                        required
                        aria-invalid={!!formErrors.password}
                        aria-describedby={formErrors.password ? "password-error" : undefined}
                        autoComplete="current-password"
                        minLength={6}
                      />
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    {formErrors.password && (
                      <div
                        id="password-error"
                        className="flex items-center text-sm text-destructive mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                        {formErrors.password}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    aria-describedby={isLoading ? "login-loading" : undefined}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                  {isLoading && (
                    <div id="login-loading" className="sr-only" aria-live="polite">
                      Processando login, aguarde...
                    </div>
                  )}
                </form>
              </TabsContent>
              
              <TabsContent
                value="register"
                id="register-panel"
                role="tabpanel"
                aria-labelledby="register-tab"
              >
                <form
                  ref={registerFormRef}
                  onSubmit={handleRegister}
                  className="space-y-4"
                  noValidate
                  aria-label="Formulário de cadastro"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <div className="relative">
                      <Input
                        ref={firstRegisterFieldRef}
                        id="fullName"
                        placeholder="Seu nome completo"
                        value={registerData.fullName}
                        onChange={(e) => {
                          setRegisterData(prev => ({ ...prev, fullName: e.target.value }));
                          clearFieldError('fullName');
                        }}
                        onBlur={() => {
                          const errors = validateRegisterForm();
                          if (errors.fullName) {
                            setFormErrors(prev => ({ ...prev, fullName: errors.fullName }));
                          }
                        }}
                        className={`pl-10 ${formErrors.fullName ? 'border-destructive focus:ring-destructive' : ''}`}
                        required
                        aria-invalid={!!formErrors.fullName}
                        aria-describedby={formErrors.fullName ? "fullName-error" : undefined}
                        autoComplete="name"
                      />
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    {formErrors.fullName && (
                      <div
                        id="fullName-error"
                        className="flex items-center text-sm text-destructive mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                        {formErrors.fullName}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email *</Label>
                    <div className="relative">
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerData.email}
                        onChange={(e) => {
                          setRegisterData(prev => ({ ...prev, email: e.target.value }));
                          clearFieldError('email');
                        }}
                        onBlur={() => {
                          const errors = validateRegisterForm();
                          if (errors.email) {
                            setFormErrors(prev => ({ ...prev, email: errors.email }));
                          }
                        }}
                        className={`pl-10 ${formErrors.email ? 'border-destructive focus:ring-destructive' : ''}`}
                        required
                        aria-invalid={!!formErrors.email}
                        aria-describedby={formErrors.email ? "registerEmail-error" : undefined}
                        autoComplete="email"
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    {formErrors.email && (
                      <div
                        id="registerEmail-error"
                        className="flex items-center text-sm text-destructive mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Crie uma senha (mínimo 6 caracteres)"
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData(prev => ({ ...prev, password: e.target.value }));
                          clearFieldError('password');
                        }}
                        onBlur={() => {
                          const errors = validateRegisterForm();
                          if (errors.password) {
                            setFormErrors(prev => ({ ...prev, password: errors.password }));
                          }
                        }}
                        className={`pl-10 ${formErrors.password ? 'border-destructive focus:ring-destructive' : ''}`}
                        required
                        aria-invalid={!!formErrors.password}
                        aria-describedby={formErrors.password ? "registerPassword-error" : "password-help"}
                        autoComplete="new-password"
                        minLength={6}
                      />
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    {formErrors.password ? (
                      <div
                        id="registerPassword-error"
                        className="flex items-center text-sm text-destructive mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                        {formErrors.password}
                      </div>
                    ) : (
                      <div id="password-help" className="text-xs text-muted-foreground">
                        Mínimo de 6 caracteres
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(xx) xxxx-xxxx"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        autoComplete="tel"
                        aria-describedby="phone-help"
                      />
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div id="phone-help" className="text-xs text-muted-foreground">
                      Formato: (11) 99999-9999 (opcional)
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
                        autoComplete="street-address"
                        aria-describedby="address-help"
                      />
                      <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div id="address-help" className="text-xs text-muted-foreground">
                      Endereço completo em Itanhomi (opcional)
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Seu bairro"
                      value={registerData.neighborhood}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      autoComplete="address-level2"
                      aria-describedby="neighborhood-help"
                    />
                    <div id="neighborhood-help" className="text-xs text-muted-foreground">
                      Bairro onde você reside em Itanhomi (opcional)
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    aria-describedby={isLoading ? "register-loading" : undefined}
                  >
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                  {isLoading && (
                    <div id="register-loading" className="sr-only" aria-live="polite">
                      Processando cadastro, aguarde...
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
};

export default AuthPage;