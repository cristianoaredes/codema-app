import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
  const { toast } = useToast();
  const { user, profile: _profile } = useAuth();

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
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para enviar um relatório.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

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
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Erro ao enviar relatório",
        description: "Ocorreu um erro ao enviar seu relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section id="report-form" className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Login Necessário</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Para enviar um relatório, você precisa estar logado no sistema
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <Button asChild size="lg">
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
    <section id="report-form" className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0 bg-card">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-foreground">Reportar Problema Municipal</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Ajude-nos a melhorar os serviços municipais de Itanhomi reportando problemas em sua região
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria do Serviço</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Nível de Prioridade</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Problema</Label>
                  <Input
                    id="title"
                    placeholder="Breve descrição do problema"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      placeholder="Endereço ou ponto de referência em Itanhomi"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="pr-10"
                      required
                    />
                    <MapPin className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    placeholder="Forneça o máximo de detalhes possível sobre o problema..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Adicionar Fotos (Opcional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para fazer upload de fotos ou arraste e solte</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 10MB</p>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar Relatório"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ReportForm;