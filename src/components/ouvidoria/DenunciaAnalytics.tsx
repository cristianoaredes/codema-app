import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Target,
  Gauge,
  Shield
} from "lucide-react";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";

interface DenunciaAnalyticsProps {
  denuncias: Denuncia[];
  period?: 'week' | 'month' | 'quarter' | 'year';
  onExport?: () => void;
}

interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

const DenunciaAnalytics: React.FC<DenunciaAnalyticsProps> = ({
  denuncias,
  period = 'month',
  onExport
}) => {
  // Cálculos e métricas
  const metrics = useMemo(() => {
    const total = denuncias.length;
    const procedentes = denuncias.filter(d => d.status === 'procedente').length;
    const improcedentes = denuncias.filter(d => d.status === 'improcedente').length;
    const emApuracao = denuncias.filter(d => 
      ['em_apuracao', 'fiscalizacao_agendada', 'fiscalizacao_realizada'].includes(d.status)
    ).length;
    const recebidas = denuncias.filter(d => d.status === 'recebida').length;
    const arquivadas = denuncias.filter(d => d.status === 'arquivada').length;
    
    // Taxa de resolução
    const resolvidas = procedentes + improcedentes + arquivadas;
    const taxaResolucao = total > 0 ? Math.round((resolvidas / total) * 100) : 0;
    
    // Tempo médio de resolução (simulado)
    const tempoMedioResolucao = 7.5; // dias
    
    // Denúncias por tipo
    const porTipo = denuncias.reduce((acc, d) => {
      acc[d.tipo_denuncia] = (acc[d.tipo_denuncia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Denúncias por prioridade
    const porPrioridade = denuncias.reduce((acc, d) => {
      acc[d.prioridade] = (acc[d.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Denúncias anônimas vs identificadas
    const anonimas = denuncias.filter(d => d.anonima).length;
    const identificadas = total - anonimas;
    
    return {
      total,
      procedentes,
      improcedentes,
      emApuracao,
      recebidas,
      arquivadas,
      resolvidas,
      taxaResolucao,
      tempoMedioResolucao,
      porTipo,
      porPrioridade,
      anonimas,
      identificadas
    };
  }, [denuncias]);

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      queima_lixo: "Queima de Lixo",
      desmatamento: "Desmatamento",
      poluicao_agua: "Poluição da Água",
      poluicao_sonora: "Poluição Sonora",
      construcao_irregular: "Construção Irregular",
      outros: "Outros"
    };
    return tipos[tipo] || tipo;
  };

  const getPrioridadeLabel = (prioridade: string) => {
    const prioridades: Record<string, string> = {
      baixa: "Baixa",
      normal: "Normal",
      alta: "Alta",
      urgente: "Urgente"
    };
    return prioridades[prioridade] || prioridade;
  };

  // Preparar dados para gráficos
  const tipoChartData: ChartData[] = Object.entries(metrics.porTipo).map(([tipo, value]) => ({
    label: getTipoLabel(tipo),
    value,
    percentage: metrics.total > 0 ? Math.round((value / metrics.total) * 100) : 0
  }));

  const prioridadeChartData: ChartData[] = Object.entries(metrics.porPrioridade).map(([prioridade, value]) => ({
    label: getPrioridadeLabel(prioridade),
    value,
    percentage: metrics.total > 0 ? Math.round((value / metrics.total) * 100) : 0,
    color: prioridade === 'urgente' ? '#dc2626' : 
           prioridade === 'alta' ? '#ea580c' :
           prioridade === 'normal' ? '#3b82f6' : '#6b7280'
  }));

  const statusChartData: ChartData[] = [
    { 
      label: 'Procedentes', 
      value: metrics.procedentes,
      percentage: metrics.total > 0 ? Math.round((metrics.procedentes / metrics.total) * 100) : 0,
      color: '#dc2626'
    },
    { 
      label: 'Improcedentes', 
      value: metrics.improcedentes,
      percentage: metrics.total > 0 ? Math.round((metrics.improcedentes / metrics.total) * 100) : 0,
      color: '#16a34a'
    },
    { 
      label: 'Em Apuração', 
      value: metrics.emApuracao,
      percentage: metrics.total > 0 ? Math.round((metrics.emApuracao / metrics.total) * 100) : 0,
      color: '#ea580c'
    },
    { 
      label: 'Recebidas', 
      value: metrics.recebidas,
      percentage: metrics.total > 0 ? Math.round((metrics.recebidas / metrics.total) * 100) : 0,
      color: '#3b82f6'
    },
    { 
      label: 'Arquivadas', 
      value: metrics.arquivadas,
      percentage: metrics.total > 0 ? Math.round((metrics.arquivadas / metrics.total) * 100) : 0,
      color: '#6b7280'
    }
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'Total de Denúncias',
      value: metrics.total,
      icon: <FileText className="h-4 w-4" />,
      color: 'text-blue-600',
      change: 12, // % de mudança (simulado)
      description: 'Este período'
    },
    {
      title: 'Taxa de Resolução',
      value: `${metrics.taxaResolucao}%`,
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600',
      change: 5,
      description: 'Casos finalizados'
    },
    {
      title: 'Tempo Médio',
      value: `${metrics.tempoMedioResolucao} dias`,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600',
      change: -15,
      description: 'Para resolução'
    },
    {
      title: 'Casos Urgentes',
      value: metrics.porPrioridade['urgente'] || 0,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600',
      description: 'Requerem atenção'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics de Denúncias
              </CardTitle>
              <CardDescription>
                Análise detalhada de desempenho e métricas do sistema de ouvidoria
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Select value={period} defaultValue="month">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change !== undefined && (
                  <div className="flex items-center gap-1 text-sm">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-muted-foreground">vs período anterior</span>
                  </div>
                )}
                {metric.description && (
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusChartData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.value}</span>
                      <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                  <Progress 
                    value={item.percentage} 
                    className="h-2"
                    style={{ 
                      '--progress-color': item.color 
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tipos de Denúncia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tipoChartData.slice(0, 5).map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.value}</span>
                      <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Análise de Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prioridadeChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.value}
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}% do total</p>
                    </div>
                  </div>
                  <Badge variant={
                    item.label === 'Urgente' ? 'destructive' :
                    item.label === 'Alta' ? 'default' :
                    'secondary'
                  }>
                    {item.value} casos
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Métricas de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Denúncias Anônimas</span>
                <div className="flex items-center gap-2">
                  <Progress value={(metrics.anonimas / metrics.total) * 100} className="w-24 h-2" />
                  <span className="text-sm font-medium">{metrics.anonimas}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Denúncias Identificadas</span>
                <div className="flex items-center gap-2">
                  <Progress value={(metrics.identificadas / metrics.total) * 100} className="w-24 h-2" />
                  <span className="text-sm font-medium">{metrics.identificadas}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Com Fiscal Atribuído</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(denuncias.filter(d => d.fiscal_responsavel_id).length / metrics.total) * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-sm font-medium">
                    {denuncias.filter(d => d.fiscal_responsavel_id).length}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Com Relatório</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(denuncias.filter(d => d.relatorio_fiscalizacao).length / metrics.total) * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-sm font-medium">
                    {denuncias.filter(d => d.relatorio_fiscalizacao).length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Gráfico de tendências temporais
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Integração com biblioteca de gráficos pendente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DenunciaAnalytics;