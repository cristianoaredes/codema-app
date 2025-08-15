import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Area,
  AreaChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

// Cores padrão para gráficos
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
];

interface BaseChartProps {
  title: string;
  description?: string;
  className?: string;
}

// Gráfico de Barras para Reuniões Mensais
interface ReunioesMensaisChartProps extends BaseChartProps {
  data: Array<{ mes: string; total: number; quorum: number }>;
}

export function ReunioesMensaisChart({ 
  title, 
  description, 
  data, 
  className 
}: ReunioesMensaisChartProps) {
  const chartConfig: ChartConfig = {
    total: {
      label: 'Total de Reuniões',
      color: 'hsl(var(--chart-1))',
    },
    quorum: {
      label: 'Com Quórum',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mes"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              <Bar dataKey="quorum" fill="var(--color-quorum)" radius={4} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Gráfico de Pizza para Resoluções por Tipo
interface ResolucoesPorTipoChartProps extends BaseChartProps {
  data: Array<{ tipo: string; quantidade: number }>;
}

export function ResolucoesPorTipoChart({ 
  title, 
  description, 
  data, 
  className 
}: ResolucoesPorTipoChartProps) {
  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
      config[item.tipo] = {
        label: item.tipo,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
    return config;
  }, [data]);

  // Preparar dados para o PieChart
  const chartData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="quantidade"
                nameKey="tipo"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="tipo" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Gráfico de Barras Horizontais para Presença por Conselheiro
interface PresencaPorConselheiroChartProps extends BaseChartProps {
  data: Array<{ nome: string; presenca: number }>;
}

export function PresencaPorConselheiroChart({ 
  title, 
  description, 
  data, 
  className 
}: PresencaPorConselheiroChartProps) {
  const chartConfig: ChartConfig = {
    presenca: {
      label: 'Presença (%)',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="horizontal"
              margin={{
                left: 100,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="nome"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={90}
                tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="presenca"
                fill="var(--color-presenca)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Gráfico de Área para Tendência de Quórum
interface TendenciaQuorumChartProps extends BaseChartProps {
  data: Array<{ mes: string; taxaQuorum: number }>;
}

export function TendenciaQuorumChart({ 
  title, 
  description, 
  data, 
  className 
}: TendenciaQuorumChartProps) {
  const chartConfig: ChartConfig = {
    taxaQuorum: {
      label: 'Taxa de Quórum (%)',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="taxaQuorum"
                type="natural"
                fill="var(--color-taxaQuorum)"
                fillOpacity={0.4}
                stroke="var(--color-taxaQuorum)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Gráfico de Linha para Múltiplas Métricas
interface MetricasComparasChartProps extends BaseChartProps {
  data: Array<{
    mes: string;
    reunioes: number;
    atas: number;
    resolucoes: number;
  }>;
}

export function MetricasComparasChart({ 
  title, 
  description, 
  data, 
  className 
}: MetricasComparasChartProps) {
  const chartConfig: ChartConfig = {
    reunioes: {
      label: 'Reuniões',
      color: 'hsl(var(--chart-1))',
    },
    atas: {
      label: 'Atas',
      color: 'hsl(var(--chart-2))',
    },
    resolucoes: {
      label: 'Resoluções',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Line
                dataKey="reunioes"
                type="monotone"
                stroke="var(--color-reunioes)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="atas"
                type="monotone"
                stroke="var(--color-atas)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="resolucoes"
                type="monotone"
                stroke="var(--color-resolucoes)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente wrapper para loading states
interface ChartSkeletonProps {
  className?: string;
}

export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        <div className="h-3 w-48 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

// Tipos de dados que os gráficos podem processar
export type ChartDataTypes = {
  reunioesMensais: Array<{ mes: string; total: number; quorum: number }>;
  resolucoesPorTipo: Array<{ tipo: string; quantidade: number }>;
  presencaPorConselheiro: Array<{ nome: string; presenca: number }>;
  tendenciaQuorum: Array<{ mes: string; taxaQuorum: number }>;
  metricasComparas: Array<{
    mes: string;
    reunioes: number;
    atas: number;
    resolucoes: number;
  }>;
};

// Hook para transformar dados das tendências
export function useTrendChartData(tendencias: any) {
  return React.useMemo(() => {
    if (!tendencias) return null;

    // Transformar dados das reuniões mensais para tendência de quórum
    const tendenciaQuorum = tendencias.reunioesMensais?.map((item: any) => ({
      mes: item.mes,
      taxaQuorum: item.total > 0 ? Math.round((item.quorum / item.total) * 100) : 0
    })) || [];

    // Dados combinados para comparação
    const metricasComparas = tendencias.reunioesMensais?.map((item: any) => ({
      mes: item.mes,
      reunioes: item.total,
      atas: Math.round(item.total * 0.8), // Estimativa baseada na prática
      resolucoes: Math.round(item.quorum * 0.6) // Estimativa baseada no quórum
    })) || [];

    return {
      reunioesMensais: tendencias.reunioesMensais || [],
      resolucoesPorTipo: tendencias.resolucoesPorTipo || [],
      presencaPorConselheiro: tendencias.presencaPorConselheiro || [],
      tendenciaQuorum,
      metricasComparas
    };
  }, [tendencias]);
}