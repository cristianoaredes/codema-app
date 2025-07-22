import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

interface AdminStats {
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  avgResolutionTime: number;
}

interface Report {
  id: string;
  title: string;
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

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    avgResolutionTime: 0
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      // Fetch all reports with user and category data
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select(`
          *,
          profiles(full_name, email),
          service_categories(name, icon)
        `)
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Calculate statistics
      const totalReports = reportsData?.length || 0;
      const pendingReports = reportsData?.filter(r => r.status === 'open' || r.status === 'in_progress').length || 0;
      const resolvedReports = reportsData?.filter(r => r.status === 'resolved').length || 0;
      const totalUsers = usersData?.length || 0;

      // Calculate average resolution time (simplified)
      const resolvedWithTime = reportsData?.filter(r => r.status === 'resolved' && r.resolved_at) || [];
      const avgResolutionTime = resolvedWithTime.length > 0 
        ? resolvedWithTime.reduce((acc, r) => {
            const created = new Date(r.created_at);
            const resolved = new Date(r.resolved_at);
            return acc + (resolved.getTime() - created.getTime());
          }, 0) / resolvedWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      setStats({
        totalUsers,
        totalReports,
        pendingReports,
        resolvedReports,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
      });

      setReports(reportsData || []);
      setUsers(usersData || []);

    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados administrativos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const updateData: { status: string; resolved_at?: string } = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do relatório atualizado com sucesso.",
      });

      // Refresh data
      fetchAdminData();

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do relatório.",
        variant: "destructive"
      });
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "moderator": return "Moderador";
      case "citizen": return "Cidadão";
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando painel administrativo...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gestão completa do sistema municipal
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Relatórios enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedReports}</div>
            <p className="text-xs text-muted-foreground">
              Problemas solucionados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}d</div>
            <p className="text-xs text-muted-foreground">
              Resolução de problemas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Gerenciar Relatórios</TabsTrigger>
          <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Gerencie todos os relatórios da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{report.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <p><strong>Local:</strong> {report.location}</p>
                        <p><strong>Categoria:</strong> {report.service_categories?.name}</p>
                        <p><strong>Enviado por:</strong> {report.profiles?.full_name || report.profiles?.email}</p>
                        <p><strong>Data:</strong> {new Date(report.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {report.status === 'open' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'in_progress')}
                          >
                            Iniciar
                          </Button>
                        )}
                        {report.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {reports.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum relatório encontrado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Visualize todos os usuários registrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {user.full_name || 'Nome não informado'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className={
                      user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                      user.role === 'moderator' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum usuário encontrado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;