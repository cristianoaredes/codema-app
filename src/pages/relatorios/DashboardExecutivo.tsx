import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Download, Filter, RefreshCw } from 'lucide-react';

import { DashboardService, DashboardMetrics } from '@/services/dashboardService';
import { ExecutiveMetrics } from '@/components/dashboard/ExecutiveMetrics';
import {
  ReunioesMensaisChart,
  ResolucoesPorTipoChart,
  PresencaPorConselheiroChart,
  TendenciaQuorumChart,
  MetricasComparasChart,
  ChartSkeleton,
  useTrendChartData
} from '@/components/dashboard/ChartComponents';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardExecutivo() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estados para filtros
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 12),
    to: new Date()
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // Query para obter métricas
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardMetrics>({
    queryKey: [
      'dashboard-executive-metrics',
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
      refreshKey
    ],
    queryFn: () => DashboardService.getExecutiveMetrics(
      dateRange.from.toISOString(),
      dateRange.to.toISOString()
    ),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });

  // Processar dados para gráficos
  const chartData = useTrendChartData(metrics?.tendencias);

  // Handlers
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Atualizando dados",
      description: "As métricas estão sendo atualizadas...",
    });
  };

  const handleExportReport = async () => {
    try {
      const reportData = await DashboardService.exportRelatorio(
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
      );

      // Simular exportação para PDF
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-executivo-codema-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (section: string) => {
    switch (section) {
      case 'reunioes':
        navigate('/reunioes');
        break;
      case 'atas':
        navigate('/codema/atas');
        break;
      case 'resolucoes':
        navigate('/codema/resolucoes');
        break;
      case 'conselheiros':
        navigate('/codema/conselheiros');
        break;
      case 'nova-reuniao':
        navigate('/reunioes/nova');
        break;
      case 'atas-pendentes':
        navigate('/codema/atas?status=pendente');
        break;
      default:
        console.log(`Navegação para ${section} não implementada`);
    }
  };

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };

  // Loading state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro ao carregar métricas do dashboard</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Métricas e relatórios do CODEMA para gestão estratégica
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <CalendarDays className="h-3 w-3 mr-1" />
            {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
            {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
          </Badge>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Ajuste o período para visualizar métricas específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Período de Análise
                </label>
                <DatePickerWithRange
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  placeholder="Selecione o período"
                />
              </div>
              
              <div className="md:w-48">
                <label className="text-sm font-medium mb-2 block">
                  Período Rápido
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const now = new Date();
                    let from: Date;
                    
                    switch (value) {
                      case '3m':
                        from = subMonths(now, 3);
                        break;
                      case '6m':
                        from = subMonths(now, 6);
                        break;
                      case '12m':
                        from = subMonths(now, 12);
                        break;
                      case '24m':
                        from = subMonths(now, 24);
                        break;
                      default:
                        return;
                    }
                    
                    setDateRange({ from, to: now });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Período rápido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Últimos 3 meses</SelectItem>
                    <SelectItem value="6m">Últimos 6 meses</SelectItem>
                    <SelectItem value="12m">Último ano</SelectItem>
                    <SelectItem value="24m">Últimos 2 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {metrics ? (
            <ExecutiveMetrics
              metrics={metrics}
              isLoading={isLoading}
              onExportReport={handleExportReport}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <ChartSkeleton key={i} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba: Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {chartData ? (
              <>
                <ReunioesMensaisChart
                  title="Reuniões Mensais"
                  description="Total de reuniões realizadas e com quórum válido"
                  data={chartData.reunioesMensais}
                />
                
                <TendenciaQuorumChart
                  title="Tendência de Quórum"
                  description="Evolução da taxa de quórum ao longo do tempo"
                  data={chartData.tendenciaQuorum}
                />
                
                <ResolucoesPorTipoChart
                  title="Resoluções por Tipo"
                  description="Distribuição das resoluções aprovadas por categoria"
                  data={chartData.resolucoesPorTipo}
                />
                
                <MetricasComparasChart
                  title="Comparativo de Atividades"
                  description="Evolução de reuniões, atas e resoluções"
                  data={chartData.metricasComparas}
                />
              </>
            ) : (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            )}
          </div>
        </TabsContent>

        {/* Aba: Detalhes */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6">
            {chartData ? (
              <PresencaPorConselheiroChart
                title="Ranking de Presença dos Conselheiros"
                description="Top 10 conselheiros com maior taxa de presença"
                data={chartData.presencaPorConselheiro}
                className="lg:col-span-2"
              />
            ) : (
              <ChartSkeleton className="h-96" />
            )}
            
            {/* Informações Adicionais */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Ações</CardTitle>
                  <CardDescription>
                    Itens que requerem atenção da gestão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics ? (
                    <>
                      {metrics.conselheiros.mandatosVencendo > 0 && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <span className="text-sm">Mandatos vencendo</span>
                          <Badge variant="destructive">
                            {metrics.conselheiros.mandatosVencendo}
                          </Badge>
                        </div>
                      )}
                      
                      {metrics.atas.pendentes > 0 && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <span className="text-sm">Atas pendentes</span>
                          <Badge variant="secondary">
                            {metrics.atas.pendentes}
                          </Badge>
                        </div>
                      )}
                      
                      {metrics.reunioes.taxaQuorum < 70 && (
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <span className="text-sm">Taxa de quórum baixa</span>
                          <Badge variant="destructive">
                            {metrics.reunioes.taxaQuorum}%
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas do Período</CardTitle>
                  <CardDescription>
                    Resumo das atividades do CODEMA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total de reuniões</span>
                        <span className="font-medium">{metrics.reunioes.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Atas aprovadas</span>
                        <span className="font-medium">{metrics.atas.aprovadas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Resoluções implementadas</span>
                        <span className="font-medium">{metrics.resolucoes.implementadas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Conselheiros ativos</span>
                        <span className="font-medium">{metrics.conselheiros.ativos}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}