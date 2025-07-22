import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard, QuickActionCard } from "@/components/dashboard/DashboardCard";
import { LoadingSpinner } from "@/components/ui/loading";
import { CardSkeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  MapPin, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Users,
  FileText,
  Gavel,
  Shield,
  Eye,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { getRoleConfig, getCardsForRole, getQuickActionsForRole } from "@/config/dashboard";
import { WelcomeGuide, useWelcomeGuide } from "@/components/dashboard/WelcomeGuide";

interface DashboardStats {
  totalReports: number;
  reunioesAgendadas: number;
  atasPendentes: number;
  resolucoesPendentes: number;
  conselheiros: number;
  myReports: number;
  reportGrowth: number;
  fmaBalance: number;
  auditAlerts: number;
  // Propriedades adicionais para compatibilidade
  totalConselheiros: number;
  totalReunioes: number;
  totalResolucoes: number;
  totalProtocolos: number;
  totalAtas: number;
  totalImpedimentos: number;
  protocolosPendentes: number;
  reunioesProximas: number;
  [key: string]: number; // Index signature para compatibilidade
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
  const { user, profile, hasAdminAccess, hasCODEMAAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const welcomeGuide = useWelcomeGuide();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    reunioesAgendadas: 0,
    atasPendentes: 0,
    resolucoesPendentes: 0,
    conselheiros: 0,
    myReports: 0,
    reportGrowth: 0,
    fmaBalance: 0,
    auditAlerts: 0,
    // Propriedades adicionais para compatibilidade
    totalConselheiros: 0,
    totalReunioes: 0,
    totalResolucoes: 0,
    totalProtocolos: 0,
    totalAtas: 0,
    totalImpedimentos: 0,
    protocolosPendentes: 0,
    reunioesProximas: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Get role-specific configuration
  const roleConfig = getRoleConfig(profile?.role || 'citizen');
  const dashboardCards = getCardsForRole(profile?.role || 'citizen');
  const quickActionsList = getQuickActionsForRole(profile?.role || 'citizen');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch CODEMA data in parallel
      const queries = [
        supabase.from("reports").select(`*, service_categories(name, icon)`).order("created_at", { ascending: false }),
        supabase.from("reunioes").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("atas").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("resolucoes").select("*").order("created_at", { ascending: false })
      ];

      // Add admin-only queries
      if (hasAdminAccess) {
        queries.push((supabase as any).from("conselheiros").select("*"));
      }

      const results = await Promise.all(queries);
      
      const reports = results[0].data || [];
      const reunioes = results[1].data || [];
      const atas = results[2].data || [];
      const resolucoes = results[3].data || [];
      const conselheiros = hasAdminAccess ? (results[4]?.data || []) : [];

      // Calculate CODEMA statistics
      const totalReports = reports.length;
      const reunioesAgendadas = reunioes.filter((r: any) => r.status === 'agendada').length;
      const atasPendentes = atas.filter((a: any) => a.status === 'rascunho').length;
      const resolucoesPendentes = resolucoes.filter((r: any) => r.status === 'em_votacao').length;
      const myReports = reports.filter((r: any) => r.user_id === user?.id).length;

      // Calculate growth (mockup - in real app, compare with previous period)
      const reportGrowth = Math.floor(Math.random() * 20) - 10; // -10 to +10%
      
      // Mock FMA balance and audit alerts
      const fmaBalance = 150000 + Math.floor(Math.random() * 50000);
      const auditAlerts = Math.floor(Math.random() * 3);

      setStats({
        totalReports,
        reunioesAgendadas,
        atasPendentes,
        resolucoesPendentes,
        conselheiros: conselheiros.length,
        myReports,
        reportGrowth,
        fmaBalance,
        auditAlerts,
        // Propriedades adicionais para compatibilidade
        totalConselheiros: conselheiros.length,
        totalReunioes: reunioes.length,
        totalResolucoes: resolucoes.length,
        totalProtocolos: 0, // Mock value
        totalAtas: atas.length,
        totalImpedimentos: 0, // Mock value
        protocolosPendentes: 0, // Mock value
        reunioesProximas: reunioes.filter((r: any) => r.status === 'agendada').length
      });

      // Set recent reports
      setRecentReports(reports.slice(0, 5) as Report[]);

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
      <div className="container mx-auto px-6 py-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Quick Actions skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Recent reports skeleton */}
        <CardSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Guide */}
      {welcomeGuide.isVisible && (
        <WelcomeGuide onDismiss={welcomeGuide.dismiss} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {roleConfig.title}
          </h1>
          <p className="text-muted-foreground">
            {roleConfig.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Bem-vindo, {profile?.full_name || user?.email}!
            </span>
            <Badge variant="outline" className="text-xs">
              {profile?.role === 'secretario' ? 'Secretário' :
               profile?.role === 'presidente' ? 'Presidente' :
               profile?.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
               profile?.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' :
               profile?.role === 'admin' ? 'Administrador' : 'Cidadão'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {hasCODEMAAccess && (
            <>
              <Link to="/reunioes">
                <Button variant="secondary" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reuniões
                </Button>
              </Link>
              <Link to="/codema/atas">
                <Button variant="secondary" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Atas
                </Button>
              </Link>
            </>
          )}
          <Link to="/criar-relatorio">
            <Button className="flex items-center gap-2" data-tour="new-report-btn">
              <Plus className="w-4 h-4" />
              Novo Relatório
            </Button>
          </Link>
        </div>
      </div>

      {/* Role-specific Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8" data-tour="dashboard-cards">
        {dashboardCards.map((cardConfig) => {
          const IconComponent = cardConfig.icon;
          const value = cardConfig.getValue(stats);
          const change = cardConfig.change ? cardConfig.change(stats) : undefined;
          const trend = cardConfig.trend ? cardConfig.trend(stats) : 'stable';
          const priority = typeof cardConfig.priority === 'function' 
            ? cardConfig.priority(stats) 
            : cardConfig.priority;

          return (
            <DashboardCard
              key={cardConfig.id}
              title={cardConfig.title}
              value={value}
              description={cardConfig.description}
              change={change}
              trend={trend}
              priority={priority}
              icon={<IconComponent className="h-4 w-4" />}
              action={cardConfig.action ? {
                label: cardConfig.action.label,
                onClick: () => navigate(cardConfig.action!.path)
              } : undefined}
              quickActions={cardConfig.quickActions?.map(action => ({
                label: action.label,
                onClick: () => navigate(action.path),
                icon: action.icon ? <action.icon className="h-4 w-4" /> : undefined
              }))}
            />
          );
        })}
      </div>

      {/* Quick Actions */}
      {quickActionsList.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ações Rápidas</h2>
            <p className="text-sm text-muted-foreground">
              Acesse rapidamente as funções mais utilizadas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" data-tour="quick-actions">
            {quickActionsList.map((action) => {
              const IconComponent = action.icon;
              return (
                <QuickActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  icon={<IconComponent className="h-5 w-5" />}
                  onClick={() => navigate(action.path)}
                  data-tour={action.id === 'ombudsman' ? 'ombudsman' : undefined}
                />
              );
            })}
          </div>
        </>
      )}

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
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum relatório encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a reportar um problema ou sugestão para sua comunidade
                </p>
                <div className="space-y-2">
                  <Link to="/criar-relatorio">
                    <Button className="mr-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Relatório
                    </Button>
                  </Link>
                  {hasAdminAccess && (
                    <Link to="/admin/data-seeder">
                      <Button variant="outline">
                        <Database className="mr-2 h-4 w-4" />
                        Popular Dados de Exemplo
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
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