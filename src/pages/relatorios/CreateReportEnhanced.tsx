import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MapPin as _MapPin, FileText, ArrowLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SmartForm, SmartFormField, SmartTextarea } from "@/components/forms/SmartForm";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation schema with enhanced rules
const reportSchema = z.object({
  title: z.string()
    .min(10, "Título deve ter pelo menos 10 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  description: z.string()
    .min(20, "Descrição deve ter pelo menos 20 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  location: z.string()
    .min(5, "Localização deve ter pelo menos 5 caracteres")
    .max(200, "Localização deve ter no máximo 200 caracteres"),
  category_id: z.string()
    .min(1, "Selecione uma categoria"),
  priority: z.enum(["low", "medium", "high", "urgent"])
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const priorityLabels = {
  low: "Baixa",
  medium: "Média", 
  high: "Alta",
  urgent: "Urgente"
};

const priorityDescriptions = {
  low: "Questão que pode ser resolvida sem pressa",
  medium: "Questão importante que requer atenção em breve",
  high: "Questão importante que requer atenção prioritária",
  urgent: "Questão crítica que requer ação imediata"
};

const CreateReportEnhanced = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const defaultValues: Partial<ReportFormData> = {
    title: "",
    description: "",
    location: "",
    category_id: "",
    priority: "medium"
  };

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias de serviço.",
        variant: "destructive"
      });
    } finally {
      setLoadingCategories(false);
    }
    }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (data: ReportFormData) => {
    if (!user) {
      throw new Error("Você precisa estar logado para enviar um relatório.");
    }

    const { error } = await supabase
      .from("reports")
      .insert([
        {
          user_id: user.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category_id: data.category_id,
          priority: data.priority,
          status: "open"
        }
      ]);

    if (error) throw error;

    toast({
      title: "Relatório enviado!",
      description: "Seu relatório foi enviado com sucesso e será analisado em breve.",
    });

    navigate("/dashboard");
  };

  const handleAutoSave = async (data: unknown) => {
    console.log("Auto-saving report data:", data);
    // Could save to a drafts table in the future
  };

  if (loadingCategories) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Novo Relatório
          </h1>
          <p className="text-muted-foreground">
            Reporte problemas, sugestões ou questões ambientais de sua região
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Seus dados são salvos automaticamente enquanto você digita. 
          Você pode sair e voltar a qualquer momento para continuar editando.
        </AlertDescription>
      </Alert>

      {/* Enhanced Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Relatório</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para criar seu relatório. 
            Todos os campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmartForm
            schema={reportSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            autoSave={{
              enabled: true,
              key: "report-draft",
              interval: 2000,
              onSave: handleAutoSave,
              onError: (error) => {
                console.error("Auto-save error:", error);
              }
            }}
            submitButton={{
              text: "Enviar Relatório",
              loadingText: "Enviando...",
              variant: "default"
            }}
            realTimeValidation={true}
            showSaveStatus={true}
          >
            {(form) => (
              <div className="space-y-6">
                {/* Title Field */}
                <SmartFormField
                  form={form}
                  name="title"
                  label="Título do Relatório"
                  description="Resuma brevemente o problema ou questão (10-100 caracteres)"
                  placeholder="Ex: Poluição do ar na Rua das Flores"
                  required
                />

                {/* Description Field */}
                <SmartTextarea
                  form={form}
                  name="description"
                  label="Descrição Detalhada"
                  description="Descreva o problema com detalhes, incluindo quando aconteceu, frequência, impactos, etc. (20-1000 caracteres)"
                  placeholder="Descreva o problema detalhadamente..."
                  required
                />

                {/* Location Field */}
                <SmartFormField
                  form={form}
                  name="location"
                  label="Localização"
                  description="Endereço completo ou ponto de referência (5-200 caracteres)"
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  required
                />

                {/* Category Selection */}
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Categoria *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria do problema" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <div>
                                  <div className="font-medium">{category.name}</div>
                                  <div className="text-xs text-muted-foreground">{category.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority Selection */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Prioridade</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {Object.entries(priorityLabels).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2">
                              <RadioGroupItem value={value} id={value} />
                              <Label htmlFor={value} className="flex-1 cursor-pointer">
                                <div className="font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {priorityDescriptions[value as keyof typeof priorityDescriptions]}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </SmartForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateReportEnhanced;