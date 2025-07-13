import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useScreenReaderSupport } from "@/components/accessibility/AccessibilityProvider";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const ReportForm = () => {
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
    location: "",
    priority: "medium"
  });
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { announceError, announceSuccess, announceLoading } = useScreenReaderSupport();

  // Refs for focus management
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLButtonElement>(null);

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.category_id) {
      errors.category_id = "Categoria é obrigatória";
    }
    
    if (!formData.title.trim()) {
      errors.title = "Título é obrigatório";
    } else if (formData.title.trim().length < 10) {
      errors.title = "Título deve ter pelo menos 10 caracteres";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Descrição é obrigatória";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Descrição deve ter pelo menos 20 caracteres";
    }
    
    if (!formData.location.trim()) {
      errors.location = "Localização é obrigatória";
    } else if (formData.location.trim().length < 5) {
      errors.location = "Localização deve ter pelo menos 5 caracteres";
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

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      const errorMessage = "Você precisa estar logado para enviar um relatório.";
      announceError(errorMessage);
      toast({
        title: "Login necessário",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Announce first error to screen reader
      const firstError = Object.entries(errors)[0];
      const fieldNames: Record<string, string> = {
        category_id: 'categoria',
        title: 'título',
        description: 'descrição',
        location: 'localização'
      };
      
      announceError(`Campo ${fieldNames[firstError[0]] || firstError[0]}: ${firstError[1]}`);
      
      // Focus on first field with error
      const firstErrorField = formRef.current?.querySelector(`[name="${firstError[0]}"], #${firstError[0]}`) as HTMLElement;
      firstErrorField?.focus();
      
      return;
    }

    setIsSubmitting(true);
    announceLoading(true, "Enviando relatório...");

    try {
      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          priority: formData.priority
        });

      if (error) {
        throw error;
      }

      const successMessage = "Relatório enviado com sucesso! Nossa equipe analisará e tomará as devidas providências.";
      announceSuccess(successMessage);
      toast({
        title: "Relatório enviado com sucesso!",
        description: "Obrigado pelo seu relatório. Nossa equipe analisará e tomará as devidas providências."
      });
      
      // Reset form
      setFormData({
        category_id: "",
        title: "",
        description: "",
        location: "",
        priority: "medium"
      });
      
      // Focus on first field after reset
      setTimeout(() => firstFieldRef.current?.focus(), 100);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      const errorMessage = "Ocorreu um erro ao enviar seu relatório. Tente novamente.";
      announceError(errorMessage);
      toast({
        title: "Erro ao enviar relatório",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      announceLoading(false);
    }
  };

  if (!user) {
    return (
      <section
        id="report-form"
        className="py-16 bg-muted/30"
        aria-labelledby="login-required-title"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-0 bg-card" role="alert">
              <CardHeader className="text-center pb-8">
                <div
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  role="img"
                  aria-label="Ícone de alerta - Login necessário"
                >
                  <AlertCircle className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <CardTitle
                  id="login-required-title"
                  className="text-2xl font-bold text-foreground"
                >
                  Login Necessário
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Para enviar um relatório, você precisa estar logado no sistema
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <Button
                  asChild
                  size="lg"
                  aria-describedby="login-required-title"
                >
                  <Link to="/auth">Entrar ou Cadastrar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="report-form"
      className="py-16 bg-muted/30"
      aria-labelledby="report-form-title"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader className="text-center pb-8">
              <CardTitle
                id="report-form-title"
                className="text-2xl font-bold text-foreground"
              >
                Reportar Problema Municipal
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Ajude-nos a melhorar os serviços municipais de Itanhomi reportando problemas em sua região
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
                aria-label="Formulário para reportar problema municipal"
                aria-describedby="report-form-title"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Categoria do Serviço *</Label>
                    <Select
                      name="category_id"
                      value={formData.category_id}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, category_id: value }));
                        clearFieldError('category_id');
                      }}
                      required
                    >
                      <SelectTrigger
                        ref={firstFieldRef}
                        id="category_id"
                        className={formErrors.category_id ? 'border-destructive focus:ring-destructive' : ''}
                        aria-invalid={!!formErrors.category_id}
                        aria-describedby={formErrors.category_id ? "category_id-error" : "category-help"}
                      >
                        <SelectValue placeholder="Selecione a categoria do problema" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category_id ? (
                      <div
                        id="category_id-error"
                        className="flex items-center text-sm text-destructive mt-1"
                        role="alert"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                        {formErrors.category_id}
                      </div>
                    ) : (
                      <div id="category-help" className="text-xs text-muted-foreground">
                        Escolha a categoria que melhor descreve o problema
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Nível de Prioridade</Label>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger
                        id="priority"
                        aria-describedby="priority-help"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa - Problema menor, sem urgência</SelectItem>
                        <SelectItem value="medium">Média - Problema comum, atenção normal</SelectItem>
                        <SelectItem value="high">Alta - Problema importante, requer atenção</SelectItem>
                        <SelectItem value="urgent">Urgente - Problema crítico, ação imediata</SelectItem>
                      </SelectContent>
                    </Select>
                    <div id="priority-help" className="text-xs text-muted-foreground">
                      Avalie a urgência do problema reportado
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Problema *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Breve descrição do problema (mínimo 10 caracteres)"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      clearFieldError('title');
                    }}
                    onBlur={() => {
                      const errors = validateForm();
                      if (errors.title) {
                        setFormErrors(prev => ({ ...prev, title: errors.title }));
                      }
                    }}
                    className={formErrors.title ? 'border-destructive focus:ring-destructive' : ''}
                    required
                    aria-invalid={!!formErrors.title}
                    aria-describedby={formErrors.title ? "title-error" : "title-help"}
                    minLength={10}
                    maxLength={100}
                  />
                  {formErrors.title ? (
                    <div
                      id="title-error"
                      className="flex items-center text-sm text-destructive mt-1"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {formErrors.title}
                    </div>
                  ) : (
                    <div id="title-help" className="text-xs text-muted-foreground">
                      Forneça um título claro e descritivo (10-100 caracteres)
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização *</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      name="location"
                      placeholder="Endereço ou ponto de referência em Itanhomi"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, location: e.target.value }));
                        clearFieldError('location');
                      }}
                      onBlur={() => {
                        const errors = validateForm();
                        if (errors.location) {
                          setFormErrors(prev => ({ ...prev, location: errors.location }));
                        }
                      }}
                      className={`pr-10 ${formErrors.location ? 'border-destructive focus:ring-destructive' : ''}`}
                      required
                      aria-invalid={!!formErrors.location}
                      aria-describedby={formErrors.location ? "location-error" : "location-help"}
                      minLength={5}
                      maxLength={200}
                    />
                    <MapPin
                      className="absolute right-3 top-3 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  {formErrors.location ? (
                    <div
                      id="location-error"
                      className="flex items-center text-sm text-destructive mt-1"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {formErrors.location}
                    </div>
                  ) : (
                    <div id="location-help" className="text-xs text-muted-foreground">
                      Informe o endereço ou ponto de referência em Itanhomi (5-200 caracteres)
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Forneça o máximo de detalhes possível sobre o problema (mínimo 20 caracteres)..."
                    value={formData.description}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, description: e.target.value }));
                      clearFieldError('description');
                    }}
                    onBlur={() => {
                      const errors = validateForm();
                      if (errors.description) {
                        setFormErrors(prev => ({ ...prev, description: errors.description }));
                      }
                    }}
                    className={formErrors.description ? 'border-destructive focus:ring-destructive' : ''}
                    rows={4}
                    required
                    aria-invalid={!!formErrors.description}
                    aria-describedby={formErrors.description ? "description-error" : "description-help"}
                    minLength={20}
                    maxLength={1000}
                  />
                  {formErrors.description ? (
                    <div
                      id="description-error"
                      className="flex items-center text-sm text-destructive mt-1"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {formErrors.description}
                    </div>
                  ) : (
                    <div id="description-help" className="text-xs text-muted-foreground">
                      Descreva o problema com detalhes para ajudar nossa equipe (20-1000 caracteres)
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Adicionar Fotos (Opcional)</Label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer focus-within:border-primary focus-within:ring-2 focus-within:ring-ring"
                    role="button"
                    tabIndex={0}
                    aria-describedby="file-upload-help"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // TODO: Implement file upload functionality
                      }
                    }}
                  >
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">Clique para fazer upload de fotos ou arraste e solte</p>
                    <p id="file-upload-help" className="text-xs text-muted-foreground mt-1">
                      Formatos aceitos: PNG, JPG. Tamanho máximo: 10MB por arquivo
                    </p>
                    {/* Hidden file input for accessibility */}
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      multiple
                      className="sr-only"
                      aria-describedby="file-upload-help"
                      onChange={(e) => {
                        // TODO: Implement file upload handling
                        console.log('Files selected:', e.target.files);
                      }}
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                  aria-describedby={isSubmitting ? "submit-loading" : undefined}
                >
                  <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                  {isSubmitting ? "Enviando..." : "Enviar Relatório"}
                </Button>
                {isSubmitting && (
                  <div id="submit-loading" className="sr-only" aria-live="polite">
                    Enviando relatório, aguarde...
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ReportForm;