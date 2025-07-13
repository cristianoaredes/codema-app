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
  Plus,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useScreenReaderSupport } from "@/components/accessibility/AccessibilityProvider";
import {
  spacingClasses,
  typographyClasses,
  elevationClasses,
  cardVariants,
  loadingClasses,
  iconSizes,
  animationClasses,
  emptyStateClasses
} from "@/styles/component-styles";

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
  const { announceLoading, announceError } = useScreenReaderSupport();
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
      announceLoading(true, "Carregando dados do dashboard...");
      
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
      const errorMessage = "Não foi possível carregar os dados do dashboard.";
      announceError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      announceLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-warning/10 text-warning-foreground border-warning/20";
      case "in_progress":
        return "bg-info/10 text-info-foreground border-info/20";
      case "resolved":
        return "bg-success/10 text-success-foreground border-success/20";
      case "closed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive-foreground border-destructive/20";
      case "high":
        return "bg-warning/10 text-warning-foreground border-warning/20";
      case "medium":
        return "bg-info/10 text-info-foreground border-info/20";
      case "low":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
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
      <div
        className={loadingClasses.container}
        role="status"
        aria-live="polite"
        aria-label="Carregando dados do dashboard"
      >
        <div className={loadingClasses.content}>
          <Loader2 className={`${loadingClasses.spinner} ${animationClasses.fadeIn}`} aria-hidden="true" />
          <div className={`${loadingClasses.text} ${animationClasses.fadeIn}`}>Carregando dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <main className={`${spacingClasses.container.maxWidth} ${spacingClasses.container.padding}`}>
      {/* Header */}
      <header className={`flex justify-between items-center ${spacingClasses.header.marginBottom}`}>
        <div className={spacingClasses.content.gap}>
          <h1 className={typographyClasses.pageTitle}>
            Dashboard CODEMA
          </h1>
          <p className={typographyClasses.pageSubtitle}>
            Bem-vindo, {profile?.full_name || user?.email}!
            <span
              className="ml-2 text-primary font-medium"
              aria-label={`Função: ${
                profile?.role === 'secretario' ? 'Secretário' :
                profile?.role === 'presidente' ? 'Presidente' :
                profile?.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
                profile?.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' : 'Membro'
              }`}
            >
              {profile?.role === 'secretario' ? 'Secretário' :
               profile?.role === 'presidente' ? 'Presidente' :
               profile?.role === 'conselheiro_titular' ? 'Conselheiro Titular' :
               profile?.role === 'conselheiro_suplente' ? 'Conselheiro Suplente' : 'Membro'}
            </span>
          </p>
        </div>
        <nav
          className={`flex ${spacingClasses.content.itemGap}`}
          aria-label="Ações rápidas do dashboard"
          role="navigation"
        >
          <Link to="/reunioes/nova">
            <Button
              variant="secondary"
              className={`flex items-center ${spacingClasses.content.itemGap} ${animationClasses.hoverScale}`}
              aria-describedby="nova-reuniao-desc"
            >
              <User className={iconSizes.sm} aria-hidden="true" />
              Nova Reunião
            </Button>
          </Link>
          <Link to="/documentos/novo">
            <Button
              className={`flex items-center ${spacingClasses.content.itemGap} ${animationClasses.hoverScale}`}
              aria-describedby="novo-documento-desc"
            >
              <Plus className={iconSizes.sm} aria-hidden="true" />
              Novo Documento
            </Button>
          </Link>
        </nav>
        
        {/* Screen reader descriptions */}
        <div className="sr-only">
          <div id="nova-reuniao-desc">Criar uma nova reunião do CODEMA</div>
          <div id="novo-documento-desc">Criar um novo documento ou ata</div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${spacingClasses.section.gap} ${spacingClasses.section.marginBottom}`}
        aria-labelledby="stats-heading"
        role="region"
      >
        <h2 id="stats-heading" className="sr-only">Estatísticas do Dashboard</h2>
        
        <Card
          role="img"
          aria-labelledby="total-processes"
          className={`${cardVariants.stat} ${animationClasses.slideIn}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="total-processes" className={typographyClasses.cardSubtitle}>Total de Processos</CardTitle>
            <BarChart3 className={`${iconSizes.sm} text-primary`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${stats.totalReports} processos ambientais no total`}>
              {stats.totalReports}
            </div>
            <p className={typographyClasses.caption}>
              Processos ambientais
            </p>
          </CardContent>
        </Card>

        <Card
          role="img"
          aria-labelledby="scheduled-meetings"
          className={`${cardVariants.stat} ${animationClasses.slideIn}`}
          style={{ animationDelay: '100ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="scheduled-meetings" className={typographyClasses.cardSubtitle}>Reuniões Agendadas</CardTitle>
            <Calendar className={`${iconSizes.sm} text-primary`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${stats.pendingReports} reuniões agendadas`}>
              {stats.pendingReports}
            </div>
            <p className={typographyClasses.caption}>
              Próximas reuniões
            </p>
          </CardContent>
        </Card>

        <Card
          role="img"
          aria-labelledby="published-documents"
          className={`${cardVariants.stat} ${animationClasses.slideIn}`}
          style={{ animationDelay: '200ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="published-documents" className={typographyClasses.cardSubtitle}>Documentos Publicados</CardTitle>
            <CheckCircle className={`${iconSizes.sm} text-primary`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${stats.resolvedReports} documentos publicados`}>
              {stats.resolvedReports}
            </div>
            <p className={typographyClasses.caption}>
              Atas e documentos
            </p>
          </CardContent>
        </Card>

        <Card
          role="img"
          aria-labelledby="my-contributions"
          className={`${cardVariants.stat} ${animationClasses.slideIn}`}
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="my-contributions" className={typographyClasses.cardSubtitle}>Minhas Contribuições</CardTitle>
            <User className={`${iconSizes.sm} text-primary`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${stats.myReports} suas contribuições`}>
              {stats.myReports}
            </div>
            <p className={typographyClasses.caption}>
              Suas participações
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Reports */}
      <Card className={`${cardVariants.default} ${animationClasses.fadeIn}`}>
        <CardHeader>
          <CardTitle className={typographyClasses.sectionTitle}>Relatórios Recentes</CardTitle>
          <CardDescription className={typographyClasses.sectionSubtitle}>
            Últimos relatórios enviados pela comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={spacingClasses.content.gap}>
            {recentReports.length > 0 ? (
              recentReports.map((report, index) => (
                <div
                  key={report.id}
                  className={`${cardVariants.listItem} p-4 ${elevationClasses.hover} ${animationClasses.fadeIn}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className={`flex items-center ${spacingClasses.content.itemGap} mb-2`}>
                      <h4 className={typographyClasses.cardTitle}>{report.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(report.priority)}>
                        {getPriorityLabel(report.priority)}
                      </Badge>
                    </div>
                    
                    <div className={`flex items-center ${spacingClasses.content.gap} ${typographyClasses.bodySecondary}`}>
                      <div className={`flex items-center ${spacingClasses.content.smallGap}`}>
                        <MapPin className={iconSizes.sm} />
                        {report.location}
                      </div>
                      <div className={`flex items-center ${spacingClasses.content.smallGap}`}>
                        <Calendar className={iconSizes.sm} />
                        {new Date(report.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className={`flex items-center ${spacingClasses.content.smallGap}`}>
                        <Clock className={iconSizes.sm} />
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
              <div className={`${emptyStateClasses.container} py-8`}>
                <p className={typographyClasses.bodySecondary}>
                  Nenhum relatório encontrado.
                </p>
              </div>
            )}
          </div>
          
          {recentReports.length > 0 && (
            <div className="mt-6 text-center">
              <Link to="/relatorios">
                <Button
                  variant="outline"
                  className={animationClasses.hoverScale}
                >
                  Ver Todos os Relatórios
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Dashboard;