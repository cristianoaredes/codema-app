import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard, QuickActionCard } from "@/components/dashboard/DashboardCard";
import { CardSkeleton } from "@/components/ui/skeleton";
import { 
  BarChart,
  Calendar,
  FileText,
  Database,
  Users,
  AlertTriangle,
  Plus,
  Settings,
  MoreVertical,
  MapPin,
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
  // Estado para simulação de perfil
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
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
  const quickActionsList = getQuickActionsForRole(currentProfileRole);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const queries = [
        supabase.from("reports").select(`*, service_categories(name, icon)`).order("created_at", { ascending: false }).limit(5),
        (supabase as any).from("reunioes").select("*", { count: 'exact' }),
        (supabase as any).from("atas").select("*", { count: 'exact' }),
        (supabase as any).from("resolucoes").select("*", { count: 'exact' }),
      ];

      if (hasAdminAccess) {
        queries.push((supabase as any).from("conselheiros").select("*", { count: 'exact' }));
      }

      const results = await Promise.all(queries);
      
      const [reportsResult, reunioesResult, atasResult, resolucoesResult, conselheirosResult] = results;

      const reports = reportsResult.data || [];
      const totalReunioes = reunioesResult.count || 0;
      const totalAtas = atasResult.count || 0;
      const totalResolucoes = resolucoesResult.count || 0;
      const totalConselheiros = conselheirosResult?.count || 0;

      const reunioesAgendadas = (reunioesResult.data || []).filter((r: any) => new Date(r.data_hora) > new Date()).length;
      const atasPendentes = (atasResult.data || []).filter((a: any) => a.status === 'rascunho').length;
      const resolucoesPendentes = (resolucoesResult.data || []).filter((r: any) => r.status === 'em_votacao').length;
      
      setStats(prev => ({
        ...prev,
        totalReports: reports.length,
        reunioesAgendadas,
        atasPendentes,
        resolucoesPendentes,
        conselheiros: totalConselheiros,
        totalConselheiros,
        totalReunioes,
        totalResolucoes,
        totalAtas,
      }));

      setRecentReports(reports as unknown as Report[]);

    } catch (error: any) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => ({
    open: "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  }[status] || "bg-gray-100 text-gray-800 border-gray-200");

  const getPriorityColor = (priority: string) => ({
    urgent: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
  }[priority] || "bg-gray-100 text-gray-800");

  const getStatusLabel = (status: string) => ({
    open: "Aberto",
    in_progress: "Em Andamento",
    resolved: "Resolvido",
    closed: "Fechado",
  }[status] || status);

  const getPriorityLabel = (priority: string) => ({
    urgent: "Urgente",
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  }[priority] || priority);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} className="h-24" />)}
          </div>
          <div className="lg:col-span-2">
            <CardSkeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 sm:px-6 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Role Simulator - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Simulador de Perfil (Apenas Desenvolvimento)
            </CardTitle>
            <CardDescription>
              Selecione um perfil para visualizar o dashboard como se fosse aquele usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Select 
                value={simulatedRole || profile?.role || 'citizen'} 
                onValueChange={(value) => setSimulatedRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="secretario">Secretário</SelectItem>
                  <SelectItem value="conselheiro_titular">Conselheiro Titular</SelectItem>
                  <SelectItem value="conselheiro_suplente">Conselheiro Suplente</SelectItem>
                  <SelectItem value="citizen">Cidadão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {welcomeGuide.isVisible && <WelcomeGuide onDismiss={welcomeGuide.dismiss} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{roleConfig.title}</h1>
          <p className="text-muted-foreground mt-1">{roleConfig.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/criar-relatorio">
            <Button className="flex items-center gap-2" data-tour="new-report-btn">
              <Plus className="w-4 h-4" />
              Novo Relatório
            </Button>
          </Link>
          {hasCODEMAAccess && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/reunioes')}><Calendar className="mr-2 h-4 w-4" /><span>Reuniões</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/codema/atas')}><FileText className="mr-2 h-4 w-4" /><span>Atas</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}><Settings className="mr-2 h-4 w-4" /><span>Configurações</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        data-tour="dashboard-cards"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="visible"
      >
        {dashboardCards.map((cardConfig) => (
          <motion.div key={cardConfig.id} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <DashboardCard
              title={cardConfig.title}
              value={cardConfig.getValue(stats)}
              description={cardConfig.description}
              change={cardConfig.change?.(stats)}
              trend={cardConfig.trend?.(stats)}
              priority={typeof cardConfig.priority === 'function' ? cardConfig.priority(stats) : cardConfig.priority}
              icon={<cardConfig.icon className="h-6 w-6" />}
              action={cardConfig.action ? { label: cardConfig.action.label, onClick: () => navigate(cardConfig.action!.path) } : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {quickActionsList.length > 0 && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Ações Rápidas</h2>
                <p className="text-sm text-muted-foreground mt-1">Atalhos para as funções mais importantes.</p>
              </div>
              <div className="space-y-4" data-tour="quick-actions">
                {quickActionsList.map((action) => (
                  <QuickActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    icon={<action.icon className="h-5 w-5" />}
                    onClick={() => navigate(action.path)}
                    data-tour={action.id === 'ombudsman' ? 'ombudsman' : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>Últimas atividades e relatórios enviados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${getPriorityColor(report.priority)}`}>
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{report.title}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span>{report.location}</span></div>
                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{new Date(report.created_at).toLocaleDateString('pt-BR')}</span></div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`ml-4 ${getStatusColor(report.status).replace('bg-', 'bg-opacity-20 ')}`}>{getStatusLabel(report.status)}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum relatório encontrado</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Parece que ainda não há atividades. Que tal criar o primeiro relatório?</p>
                    <div className="flex justify-center gap-4">
                      <Link to="/criar-relatorio"><Button><Plus className="mr-2 h-4 w-4" />Criar Relatório</Button></Link>
                      {hasAdminAccess && (<Link to="/admin/data-seeder"><Button variant="outline"><Database className="mr-2 h-4 w-4" />Popular Dados</Button></Link>)}
                    </div>
                  </div>
                )}
              </div>
              {recentReports.length > 0 && (
                <div className="mt-6 text-center">
                  <Link to="/relatorios"><Button variant="outline">Ver Todos os Relatórios</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;