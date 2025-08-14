import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TreePine,
  Droplets,
  Wind,
  Zap,
  Building,
  School,
  Heart,
  Shield,
  FileText,
  Download,
  RefreshCw,
  Info,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Indicador {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  unidade: string;
  meta: number;
  valor_atual: number;
  percentual_meta: number;
  tendencia: 'subindo' | 'descendo' | 'estavel';
  status: 'excelente' | 'bom' | 'atencao' | 'critico';
  icon: React.ElementType;
  historico?: { data: string; valor: number }[];
}

interface FMAIndicadoresProps {
  receitas?: any[];
  projetos?: any[];
  periodo?: string;
}

const FMAIndicadores: React.FC<FMAIndicadoresProps> = ({ 
  receitas = [], 
  projetos = [],
  periodo = 'trimestre'
}) => {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(periodo);
  const [activeTab, setActiveTab] = useState("visao-geral");

  useEffect(() => {
    calculateIndicadores();
  }, [receitas, projetos, selectedPeriodo]);

  const calculateIndicadores = () => {
    setLoading(true);

    // Indicadores Financeiros
    const totalArrecadado = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
    const totalInvestido = projetos
      .filter(p => p.status === 'aprovado' || p.status === 'em_execucao' || p.status === 'concluido')
      .reduce((sum, p) => sum + (p.valor_aprovado || 0), 0);
    
    const eficienciaFinanceira = totalArrecadado > 0 
      ? (totalInvestido / totalArrecadado) * 100 
      : 0;

    // Indicadores de Projetos
    const totalProjetos = projetos.length;
    const projetosAprovados = projetos.filter(p => p.status === 'aprovado').length;
    const projetosEmExecucao = projetos.filter(p => p.status === 'em_execucao').length;
    const projetosConcluidos = projetos.filter(p => p.status === 'concluido').length;
    
    const taxaSucesso = totalProjetos > 0 
      ? (projetosConcluidos / totalProjetos) * 100 
      : 0;

    // Indicadores por Área de Atuação
    const projetosPorArea = {
      educacao_ambiental: projetos.filter(p => p.area_atuacao === 'educacao_ambiental').length,
      recuperacao_areas: projetos.filter(p => p.area_atuacao === 'recuperacao_areas').length,
      conservacao_biodiversidade: projetos.filter(p => p.area_atuacao === 'conservacao_biodiversidade').length,
      saneamento: projetos.filter(p => p.area_atuacao === 'saneamento').length,
      fiscalizacao: projetos.filter(p => p.area_atuacao === 'fiscalizacao').length
    };

    // Indicadores de Impacto
    const pessoasAtendidas = projetos.reduce((sum, p) => sum + (p.pessoas_beneficiadas || 0), 0);
    const areaRecuperada = projetos.reduce((sum, p) => sum + (p.area_recuperada_ha || 0), 0);
    const arvorePlantadas = projetos.reduce((sum, p) => sum + (p.arvores_plantadas || 0), 0);

    // Prazo médio de execução
    const projetosComPrazo = projetos.filter(p => p.data_inicio_real && p.data_fim_real);
    const prazoMedio = projetosComPrazo.length > 0
      ? projetosComPrazo.reduce((sum, p) => {
          const inicio = new Date(p.data_inicio_real);
          const fim = new Date(p.data_fim_real);
          return sum + differenceInDays(fim, inicio);
        }, 0) / projetosComPrazo.length
      : 0;

    // Criar indicadores
    const novosIndicadores: Indicador[] = [
      {
        id: '1',
        nome: 'Arrecadação Total',
        descricao: 'Total de recursos arrecadados no período',
        categoria: 'financeiro',
        unidade: 'R$',
        meta: 500000,
        valor_atual: totalArrecadado,
        percentual_meta: (totalArrecadado / 500000) * 100,
        tendencia: totalArrecadado > 400000 ? 'subindo' : 'descendo',
        status: totalArrecadado > 450000 ? 'excelente' : totalArrecadado > 300000 ? 'bom' : 'atencao',
        icon: DollarSign
      },
      {
        id: '2',
        nome: 'Eficiência Financeira',
        descricao: 'Percentual de recursos investidos em projetos',
        categoria: 'financeiro',
        unidade: '%',
        meta: 85,
        valor_atual: eficienciaFinanceira,
        percentual_meta: (eficienciaFinanceira / 85) * 100,
        tendencia: eficienciaFinanceira > 80 ? 'subindo' : 'descendo',
        status: eficienciaFinanceira > 80 ? 'excelente' : eficienciaFinanceira > 60 ? 'bom' : 'atencao',
        icon: TrendingUp
      },
      {
        id: '3',
        nome: 'Projetos em Execução',
        descricao: 'Número de projetos atualmente em execução',
        categoria: 'projetos',
        unidade: 'un',
        meta: 15,
        valor_atual: projetosEmExecucao,
        percentual_meta: (projetosEmExecucao / 15) * 100,
        tendencia: 'estavel',
        status: projetosEmExecucao > 12 ? 'excelente' : projetosEmExecucao > 8 ? 'bom' : 'atencao',
        icon: Activity
      },
      {
        id: '4',
        nome: 'Taxa de Sucesso',
        descricao: 'Percentual de projetos concluídos com sucesso',
        categoria: 'projetos',
        unidade: '%',
        meta: 90,
        valor_atual: taxaSucesso,
        percentual_meta: (taxaSucesso / 90) * 100,
        tendencia: taxaSucesso > 85 ? 'subindo' : 'descendo',
        status: taxaSucesso > 85 ? 'excelente' : taxaSucesso > 70 ? 'bom' : 'critico',
        icon: Award
      },
      {
        id: '5',
        nome: 'Educação Ambiental',
        descricao: 'Projetos de educação ambiental',
        categoria: 'areas',
        unidade: 'projetos',
        meta: 10,
        valor_atual: projetosPorArea.educacao_ambiental,
        percentual_meta: (projetosPorArea.educacao_ambiental / 10) * 100,
        tendencia: 'subindo',
        status: projetosPorArea.educacao_ambiental > 8 ? 'excelente' : 'bom',
        icon: School
      },
      {
        id: '6',
        nome: 'Recuperação de Áreas',
        descricao: 'Projetos de recuperação ambiental',
        categoria: 'areas',
        unidade: 'projetos',
        meta: 8,
        valor_atual: projetosPorArea.recuperacao_areas,
        percentual_meta: (projetosPorArea.recuperacao_areas / 8) * 100,
        tendencia: 'estavel',
        status: projetosPorArea.recuperacao_areas > 6 ? 'excelente' : 'bom',
        icon: TreePine
      },
      {
        id: '7',
        nome: 'Pessoas Beneficiadas',
        descricao: 'Total de pessoas atendidas pelos projetos',
        categoria: 'impacto',
        unidade: 'pessoas',
        meta: 5000,
        valor_atual: pessoasAtendidas,
        percentual_meta: (pessoasAtendidas / 5000) * 100,
        tendencia: pessoasAtendidas > 4000 ? 'subindo' : 'estavel',
        status: pessoasAtendidas > 4500 ? 'excelente' : pessoasAtendidas > 3000 ? 'bom' : 'atencao',
        icon: Users
      },
      {
        id: '8',
        nome: 'Área Recuperada',
        descricao: 'Hectares de área recuperada',
        categoria: 'impacto',
        unidade: 'ha',
        meta: 100,
        valor_atual: areaRecuperada,
        percentual_meta: (areaRecuperada / 100) * 100,
        tendencia: areaRecuperada > 80 ? 'subindo' : 'estavel',
        status: areaRecuperada > 90 ? 'excelente' : areaRecuperada > 60 ? 'bom' : 'atencao',
        icon: TreePine
      },
      {
        id: '9',
        nome: 'Tempo Médio de Execução',
        descricao: 'Prazo médio de execução dos projetos',
        categoria: 'eficiencia',
        unidade: 'dias',
        meta: 180,
        valor_atual: prazoMedio,
        percentual_meta: prazoMedio > 0 ? ((180 - prazoMedio) / 180) * 100 : 0,
        tendencia: prazoMedio < 200 ? 'subindo' : 'descendo',
        status: prazoMedio < 150 ? 'excelente' : prazoMedio < 200 ? 'bom' : 'atencao',
        icon: Clock
      },
      {
        id: '10',
        nome: 'Conformidade Legal',
        descricao: 'Projetos em conformidade com legislação',
        categoria: 'governanca',
        unidade: '%',
        meta: 100,
        valor_atual: 98,
        percentual_meta: 98,
        tendencia: 'estavel',
        status: 'excelente',
        icon: Shield
      }
    ];

    setIndicadores(novosIndicadores);
    setLoading(false);
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo':
        return <ChevronUp className="h-4 w-4 text-green-600" />;
      case 'descendo':
        return <ChevronDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelente':
        return 'text-green-600 bg-green-50';
      case 'bom':
        return 'text-blue-600 bg-blue-50';
      case 'atencao':
        return 'text-yellow-600 bg-yellow-50';
      case 'critico':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatValue = (valor: number, unidade: string) => {
    switch (unidade) {
      case 'R$':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valor);
      case '%':
        return `${valor.toFixed(1)}%`;
      case 'dias':
        return `${Math.round(valor)} dias`;
      case 'ha':
        return `${valor.toFixed(2)} ha`;
      default:
        return valor.toLocaleString('pt-BR');
    }
  };

  const indicadoresFinanceiros = indicadores.filter(i => i.categoria === 'financeiro');
  const indicadoresProjetos = indicadores.filter(i => i.categoria === 'projetos');
  const indicadoresImpacto = indicadores.filter(i => i.categoria === 'impacto');
  const indicadoresAreas = indicadores.filter(i => i.categoria === 'areas');

  const handleExportReport = () => {
    const report = indicadores.map(ind => ({
      Indicador: ind.nome,
      Valor: formatValue(ind.valor_atual, ind.unidade),
      Meta: formatValue(ind.meta, ind.unidade),
      'Atingimento (%)': ind.percentual_meta.toFixed(1),
      Status: ind.status,
      Tendência: ind.tendencia
    }));

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `indicadores_fma_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Indicadores de Desempenho
              </CardTitle>
              <CardDescription>
                Acompanhamento de KPIs do Fundo Municipal do Meio Ambiente
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Mensal</SelectItem>
                  <SelectItem value="trimestre">Trimestral</SelectItem>
                  <SelectItem value="semestre">Semestral</SelectItem>
                  <SelectItem value="ano">Anual</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => calculateIndicadores()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="impacto">Impacto Social</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          {/* Cards de Destaque */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {indicadores.slice(0, 4).map((indicador) => {
              const Icon = indicador.icon;
              return (
                <Card key={indicador.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      {getTendenciaIcon(indicador.tendencia)}
                    </div>
                    <p className="text-sm text-muted-foreground">{indicador.nome}</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatValue(indicador.valor_atual, indicador.unidade)}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Meta: {formatValue(indicador.meta, indicador.unidade)}</span>
                        <span>{indicador.percentual_meta.toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.min(indicador.percentual_meta, 100)} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Matriz de Indicadores */}
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicadores.map((indicador) => {
                  const Icon = indicador.icon;
                  return (
                    <div key={indicador.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-lg ${getStatusColor(indicador.status)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{indicador.nome}</p>
                            <p className="text-sm text-muted-foreground">{indicador.descricao}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatValue(indicador.valor_atual, indicador.unidade)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Meta: {formatValue(indicador.meta, indicador.unidade)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(indicador.percentual_meta, 100)} className="w-24" />
                              <Badge variant={indicador.status === 'excelente' ? 'default' : 'secondary'}>
                                {indicador.status}
                              </Badge>
                            </div>
                            
                            {getTendenciaIcon(indicador.tendencia)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          {indicadores.filter(i => i.status === 'critico' || i.status === 'atencao').length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Indicadores que Requerem Atenção</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {indicadores
                    .filter(i => i.status === 'critico' || i.status === 'atencao')
                    .map(i => (
                      <li key={i.id} className="flex items-center gap-2">
                        <span className="font-medium">{i.nome}:</span>
                        <span>{formatValue(i.valor_atual, i.unidade)} de {formatValue(i.meta, i.unidade)}</span>
                        <Badge variant={i.status === 'critico' ? 'destructive' : 'default'}>
                          {i.percentual_meta.toFixed(0)}% da meta
                        </Badge>
                      </li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicadoresFinanceiros.map((indicador) => {
              const Icon = indicador.icon;
              return (
                <Card key={indicador.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{indicador.nome}</CardTitle>
                        <CardDescription>{indicador.descricao}</CardDescription>
                      </div>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold">
                            {formatValue(indicador.valor_atual, indicador.unidade)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Meta: {formatValue(indicador.meta, indicador.unidade)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTendenciaIcon(indicador.tendencia)}
                          <Badge variant={indicador.status === 'excelente' ? 'default' : 'secondary'}>
                            {indicador.percentual_meta.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={Math.min(indicador.percentual_meta, 100)} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="projetos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...indicadoresProjetos, ...indicadoresAreas].map((indicador) => {
              const Icon = indicador.icon;
              return (
                <Card key={indicador.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{indicador.nome}</CardTitle>
                        <CardDescription>{indicador.descricao}</CardDescription>
                      </div>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold">
                            {formatValue(indicador.valor_atual, indicador.unidade)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Meta: {formatValue(indicador.meta, indicador.unidade)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTendenciaIcon(indicador.tendencia)}
                          <Badge variant={indicador.status === 'excelente' ? 'default' : 'secondary'}>
                            {indicador.percentual_meta.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={Math.min(indicador.percentual_meta, 100)} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="impacto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicadoresImpacto.map((indicador) => {
              const Icon = indicador.icon;
              return (
                <Card key={indicador.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{indicador.nome}</CardTitle>
                        <CardDescription>{indicador.descricao}</CardDescription>
                      </div>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold">
                            {formatValue(indicador.valor_atual, indicador.unidade)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Meta: {formatValue(indicador.meta, indicador.unidade)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTendenciaIcon(indicador.tendencia)}
                          <Badge variant={indicador.status === 'excelente' ? 'default' : 'secondary'}>
                            {indicador.percentual_meta.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={Math.min(indicador.percentual_meta, 100)} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Card de Impacto Ambiental */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto Ambiental Acumulado</CardTitle>
              <CardDescription>
                Resultados ambientais alcançados pelos projetos do FMA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TreePine className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {projetos.reduce((sum, p) => sum + (p.arvores_plantadas || 0), 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Árvores Plantadas</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Droplets className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {projetos.reduce((sum, p) => sum + (p.agua_economizada_m3 || 0), 0).toLocaleString('pt-BR')} m³
                  </p>
                  <p className="text-sm text-muted-foreground">Água Economizada</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Wind className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {projetos.reduce((sum, p) => sum + (p.co2_evitado_ton || 0), 0).toLocaleString('pt-BR')} ton
                  </p>
                  <p className="text-sm text-muted-foreground">CO₂ Evitado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FMAIndicadores;