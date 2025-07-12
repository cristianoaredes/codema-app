import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  MapPin, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  myReports: number;
}

interface Report {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  location: string;
  service_categories: {
    name: string;
    icon: string;
  };
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    myReports: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch CODEMA data in parallel
      const [reportsResult, reunioesResult, documentosResult] = await Promise.all([
        supabase.from("reports").select(`*, service_categories(name, icon)`).order("created_at", { ascending: false }),
        supabase.from("reunioes").select("*").order("created_at", { ascending: false }),
        supabase.from("documentos").select("*").order("created_at", { ascending: false })
      ]);

      if (reportsResult.error) throw reportsResult.error;
      if (reunioesResult.error) throw reunioesResult.error;
      if (documentosResult.error) throw documentosResult.error;

      const reports = reportsResult.data || [];
      const reunioes = reunioesResult.data || [];
      const documentos = documentosResult.data || [];

      // Calculate CODEMA statistics
      const totalReports = reports.length;
      const pendingReports = reports.filter(r => r.status === 'open' || r.status === 'in_progress').length;
      const resolvedReports = reports.filter(r => r.status === 'resolved').length;
      const myReports = reports.filter(r => r.user_id === user?.id).length;

      setStats({
        totalReports,
        pendingReports: reunioes.filter(r => r.status === 'agendada').length,
        resolvedReports: documentos.filter(d => d.status === 'publicado').length,
        myReports
      });

      // Set recent reports
      setRecentReports(reports.slice(0, 5));

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard CODEMA
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || user?.email}! 
            <span className="ml-2 text-primary font-medium">
              {profile?.role === 'secretario' ? 'Secretário' :
               profile?.role === 'presidente' ? 'Presidente' :
               profile?.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
               profile?.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' : 'Membro'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/reunioes/nova">
            <Button variant="secondary" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nova Reunião
            </Button>
          </Link>
          <Link to="/documentos/novo">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Documento
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Processos ambientais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniões Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Próximas reuniões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Publicados</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedReports}</div>
            <p className="text-xs text-muted-foreground">
              Atas e documentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Contribuições</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myReports}</div>
            <p className="text-xs text-muted-foreground">
              Suas participações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>
            Últimos relatórios enviados pela comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{report.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(report.priority)}>
                        {getPriorityLabel(report.priority)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  
                  <Badge className={getStatusColor(report.status)}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum relatório encontrado.
              </p>
            )}
          </div>
          
          {recentReports.length > 0 && (
            <div className="mt-6 text-center">
              <Link to="/relatorios">
                <Button variant="outline">Ver Todos os Relatórios</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;