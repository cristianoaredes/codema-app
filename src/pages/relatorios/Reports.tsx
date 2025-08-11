import { useEffect, useState, useCallback } from "react";
import { useAuth, useToast } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription as _CardDescription, CardHeader, CardTitle, Badge, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { 
  MapPin, 
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  location: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  service_categories: {
    name: string;
    icon: string;
  };
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

const Reports = () => {
  const { user: _user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          profiles(full_name, email),
          service_categories(name, icon)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
    fetchCategories();
  }, [fetchReports]);

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
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || report.service_categories?.name === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Aberto";
      case "in_progress": return "Em Andamento";
      case "resolved": return "Resolvido";
      case "closed": return "Fechado";
      default: return status;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Relatórios da Comunidade
          </h1>
          <p className="text-muted-foreground">
            Acompanhe todos os relatórios enviados pela comunidade
          </p>
        </div>
        <Link to="/criar-relatorio">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Relatório
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {report.title}
                      </h3>
                      <Badge variant="outline" className={getPriorityColor(report.priority)}>
                        {getPriorityLabel(report.priority)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {report.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {report.service_categories?.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusLabel(report.status)}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedReport(
                        expandedReport === report.id ? null : report.id
                      )}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {expandedReport === report.id ? "Ocultar" : "Ver Detalhes"}
                    </Button>
                  </div>
                </div>

                {expandedReport === report.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2">Descrição:</h4>
                    <p className="text-muted-foreground mb-4">{report.description}</p>
                    
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Enviado por:</strong> {report.profiles?.full_name || report.profiles?.email || 'Usuário anônimo'}</p>
                      <p><strong>Data de criação:</strong> {new Date(report.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                Nenhum relatório encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;