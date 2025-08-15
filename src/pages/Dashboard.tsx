import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAtas } from "@/hooks/useAtas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard, QuickActionCard } from "@/components/dashboard/DashboardCard";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useIsMobile, useIsTablet } from "@/utils/responsive";
import { 
  Calendar,
  FileText,
  Database,
  Users as _Users,
  AlertTriangle,
  Plus,
  Settings,
  MoreVertical,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { getRoleConfig, getCardsForRole, getQuickActionsForRole } from "@/config/dashboard";
import { WelcomeGuide, useWelcomeGuide } from "@/components/dashboard/WelcomeGuide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/auth";

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
  totalConselheiros: number;
  totalReunioes: number;
  totalResolucoes: number;
  totalProtocolos: number;
  totalAtas: number;
  totalImpedimentos: number;
  protocolosPendentes: number;
  reunioesProximas: number;
  [key: string]: number;
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
  
  // Hooks de dados
  const { data: atas = [], error: atasError } = useAtas();
  
  // Estado para simulação de perfil
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const welcomeGuide = useWelcomeGuide();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    reunioesAgendadas: 0,
    atasPendentes: 0,
    resolucoesPendentes: 0,
    conselheiros: 0,
    myReports: 0,
    reportGrowth: 0,
    fmaBalance: 150000,
    auditAlerts: 0,
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

  // O perfil a ser usado é o simulado, ou o real se não houver simulação
  const currentProfileRole = simulatedRole || profile?.role || 'citizen';

  // Get role-specific configuration based on the current (real or simulated) role
  const roleConfig = getRoleConfig(currentProfileRole);
  const dashboardCards = getCardsForRole(currentProfileRole);
  const quickActions = getQuickActionsForRole(currentProfileRole);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [];
      
      // Queries sempre executadas
      queries.push(
        supabase
          .from("reports")
          .select(`*, service_categories(name, icon)`)
          .order("created_at", { ascending: false })
          .limit(5)
      );

      // Query para meus relatórios se houver usuário logado
      if (user) {
        queries.push(
          supabase
            .from("reports")
            .select("id")
            .eq("user_id", user.id)
        );
      }

      // Queries CODEMA baseadas no perfil atual (real ou simulado)
      if (hasCODEMAAccess || ['conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'admin'].includes(currentProfileRole)) {
        queries.push(
          supabase.from("reunioes").select("*", { count: 'exact' }),
          supabase.from("resolucoes").select("*", { count: 'exact' }).eq("status", "em_votacao")
        );
      }

      // Queries administrativas baseadas no perfil atual
      if (hasAdminAccess || ['admin', 'secretario', 'presidente'].includes(currentProfileRole)) {
        queries.push(
          supabase
            .from("profiles")
            .select("*", { count: 'exact' })
            .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
        );
      }

      const results = await Promise.all(queries);
      
      // Process results
      const newStats: DashboardStats = { ...stats };
      let reportIndex = 0;

      // Recent reports
      if (results[reportIndex]?.data) {
        setRecentReports(results[reportIndex].data as Report[]);
        newStats.totalReports = results[reportIndex].data.length;
      } else {
        newStats.totalReports = 0;
      }
      reportIndex++;

      // My reports count
      if (user && results[reportIndex]) {
        newStats.myReports = results[reportIndex].data?.length || 0;
        reportIndex++;
      }

      // CODEMA stats - verificação para perfis com acesso
      if (hasCODEMAAccess || ['conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente', 'admin'].includes(currentProfileRole)) {
        if (results[reportIndex]) {
          newStats.reunioesAgendadas = results[reportIndex].count || 0;
          reportIndex++;
        }
        // Atas pendentes - usar dados do hook useAtas
        newStats.atasPendentes = atas.filter(ata => ata.status === 'pendente').length;
        if (results[reportIndex]) {
          newStats.resolucoesPendentes = results[reportIndex].count || 0;
          reportIndex++;
        }
      }

      // Admin stats - verificação para perfis administrativos
      if (hasAdminAccess || ['admin', 'secretario', 'presidente'].includes(currentProfileRole)) {
        if (results[reportIndex]) {
          newStats.conselheiros = results[reportIndex].count || 0;
          reportIndex++;
        }
      }

      // Calculate growth (mock data for now)
      newStats.reportGrowth = Math.floor(Math.random() * 20) - 10;
      newStats.fmaBalance = 150000 + Math.random() * 50000;
      newStats.auditAlerts = Math.floor(Math.random() * 5);
      
      // Ensure all required properties are set
      newStats.totalConselheiros = newStats.conselheiros || 0;
      newStats.totalReunioes = newStats.reunioesAgendadas || 0;
      newStats.totalResolucoes = newStats.resolucoesPendentes || 0;
      newStats.totalProtocolos = 0;
      newStats.totalAtas = newStats.atasPendentes || 0;
      newStats.totalImpedimentos = 0;
      newStats.protocolosPendentes = 0;
      newStats.reunioesProximas = newStats.reunioesAgendadas || 0;

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, hasCODEMAAccess, hasAdminAccess, currentProfileRole, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "resolved":
        return "outline";
      default:
        return "outline";
    }
  };

  // Função para simular outro perfil
  const handleRoleSimulation = (role: UserRole | "reset") => {
    if (role === "reset") {
      setSimulatedRole(null);
      toast({
        title: "Simulação encerrada",
        description: "Voltando ao perfil original",
      });
    } else {
      setSimulatedRole(role);
      toast({
        title: "Simulação ativada",
        description: `Visualizando como: ${roleConfig.title}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Guide */}
      {welcomeGuide.isVisible && (
        <WelcomeGuide onDismiss={welcomeGuide.dismiss} />
      )}

      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            {roleConfig.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            {roleConfig.description}
          </p>
        </div>
        
        {/* Seletor de simulação de perfil - apenas para admins */}
        {hasAdminAccess && (
          <div className="flex items-center gap-2">
            <Select 
              value={simulatedRole || "current"}
              onValueChange={(value) => handleRoleSimulation(value as UserRole | "reset")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Simular perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Perfil Atual</SelectItem>
                <SelectItem value="citizen">Cidadão</SelectItem>
                <SelectItem value="conselheiro_titular">Conselheiro Titular</SelectItem>
                <SelectItem value="conselheiro_suplente">Conselheiro Suplente</SelectItem>
                <SelectItem value="secretario">Secretário</SelectItem>
                <SelectItem value="presidente">Presidente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="reset">Encerrar Simulação</SelectItem>
              </SelectContent>
            </Select>
            {simulatedRole && (
              <Badge variant="secondary">
                Simulando: {roleConfig.title.split(' - ')[1]}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild size={isMobile ? "sm" : "default"}>
            <Link to="/criar-relatorio">
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Novo Relatório</span>
              <span className="sm:hidden">Novo</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/ajuda")}>
                <Database className="mr-2 h-4 w-4" />
                Ajuda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          dashboardCards.map((card, index) => {
            const value = card.getValue(stats);
            const change = card.change ? card.change(stats) : undefined;
            const trend = card.trend ? card.trend(stats) : undefined;
            const priority = typeof card.priority === 'function' 
              ? card.priority(stats) 
              : card.priority;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DashboardCard
                  title={card.title}
                  value={value}
                  description={card.description}
                  change={change}
                  trend={trend}
                  priority={priority}
                  icon={<card.icon className="h-5 w-5" />}
                  action={card.action ? {
                    label: card.action.label,
                    onClick: () => navigate(card.action!.path)
                  } : undefined}
                  quickActions={card.quickActions?.map(qa => ({
                    label: qa.label,
                    onClick: () => navigate(qa.path),
                    icon: qa.icon ? <qa.icon className="h-4 w-4 mr-2" /> : undefined
                  }))}
                />
              </motion.div>
            );
          })
        )}
      </div>

      {/* Quick Actions - Mobile optimized */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ações Rápidas</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <QuickActionCard
                  title={action.title}
                  description={action.description}
                  icon={<action.icon className="h-6 w-6 text-primary" />}
                  onClick={() => handleQuickAction(action.path)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports - Mobile optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Relatórios Recentes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Últimas contribuições da comunidade
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : recentReports.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
                  onClick={() => navigate(`/relatorios/${report.id}`)}
                >
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{report.title}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                        <Badge variant={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                        {report.location && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-0.5" />
                            <span className="truncate max-w-[100px] sm:max-w-none">{report.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-0 sm:ml-auto flex-shrink-0">
                    {new Date(report.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum relatório disponível
              </p>
              <Button asChild className="mt-4">
                <Link to="/criar-relatorio">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Relatório
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Alert */}
      {hasAdminAccess && stats.auditAlerts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas de Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Existem {stats.auditAlerts} alertas de auditoria que requerem sua atenção.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/codema/auditoria">
                Ver Alertas
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;