import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, FileText, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const CreateReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "",
    priority: "medium"
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar um relatório.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.category_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("reports")
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            category_id: formData.category_id,
            priority: formData.priority,
            status: "open"
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu relatório foi enviado com sucesso. A administração municipal foi notificada.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        category_id: "",
        priority: "medium"
      });

      // Navigate to reports page
      navigate("/relatorios");

    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar seu relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return priority;
    }
  };

  const getPriorityDescription = (priority: string) => {
    switch (priority) {
      case "urgent": return "Situação de emergência que requer ação imediata";
      case "high": return "Problema importante que afeta muitas pessoas";
      case "medium": return "Problema moderado que precisa de atenção";
      case "low": return "Problema menor que pode aguardar";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Criar Novo Relatório
          </h1>
          <p className="text-muted-foreground">
            Relate um problema ou solicite um serviço municipal
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações do Relatório
            </CardTitle>
            <CardDescription>
              Preencha os detalhes do problema ou solicitação que você deseja reportar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título do Relatório *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Buraco na Rua Principal, Lâmpada queimada na Praça..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria do Serviço *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria do problema" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex flex-col">
                          <span>{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {category.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localização *
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Rua das Flores, 123 - Centro, próximo à escola..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Seja o mais específico possível para facilitar a localização.
                </p>
              </div>

              {/* Priority */}
              <div className="space-y-3">
                <Label>Prioridade *</Label>
                <RadioGroup
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  className="space-y-3"
                >
                  {["urgent", "high", "medium", "low"].map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <RadioGroupItem value={priority} id={priority} />
                      <Label htmlFor={priority} className="flex-1 cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">{getPriorityLabel(priority)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getPriorityDescription(priority)}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o problema em detalhes: quando começou, como afeta você ou a comunidade, possíveis causas, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Quanto mais detalhes você fornecer, melhor poderemos atender sua solicitação.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? "Enviando..." : "Enviar Relatório"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateReport;