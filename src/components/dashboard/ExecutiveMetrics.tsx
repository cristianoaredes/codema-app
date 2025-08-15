import React from 'react';
import { DashboardCard, QuickActionCard } from '@/components/dashboard/DashboardCard';
import { 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import { DashboardMetrics } from '@/services/dashboardService';
import { motion } from 'framer-motion';

interface ExecutiveMetricsProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
  onExportReport?: () => void;
  onViewDetails?: (section: string) => void;
}

export function ExecutiveMetrics({ 
  metrics, 
  isLoading = false, 
  onExportReport,
  onViewDetails 
}: ExecutiveMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <DashboardCard
            key={i}
            title=""
            value=""
            loading={true}
          />
        ))}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* KPIs Principais */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Indicadores Principais</h2>
        <motion.div 
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Taxa de Quórum"
              value={`${metrics.reunioes.taxaQuorum}%`}
              description="Reuniões com quórum válido"
              change={metrics.reunioes.taxaQuorum >= 80 ? 5 : -2}
              trend={metrics.reunioes.taxaQuorum >= 80 ? 'up' : 'down'}
              priority={metrics.reunioes.taxaQuorum < 70 ? 'high' : 'medium'}
              icon={<Target className="h-4 w-4" />}
              action={{
                label: "Ver Detalhes",
                onClick: () => onViewDetails?.('reunioes')
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Conselheiros Ativos"
              value={metrics.conselheiros.ativos}
              description="Total de conselheiros em exercício"
              icon={<Users className="h-4 w-4" />}
              priority={metrics.conselheiros.mandatosVencendo > 3 ? 'high' : 'low'}
              quickActions={[
                {
                  label: "Gerenciar Mandatos",
                  onClick: () => onViewDetails?.('conselheiros'),
                  icon: <Calendar className="h-4 w-4" />
                }
              ]}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Resoluções Implementadas"
              value={`${metrics.resolucoes.taxaImplementacao}%`}
              description="Taxa de implementação efetiva"
              change={metrics.resolucoes.taxaImplementacao >= 70 ? 8 : -5}
              trend={metrics.resolucoes.taxaImplementacao >= 70 ? 'up' : 'down'}
              priority={metrics.resolucoes.taxaImplementacao < 50 ? 'high' : 'medium'}
              icon={<CheckCircle className="h-4 w-4" />}
              action={{
                label: "Ver Resoluções",
                onClick: () => onViewDetails?.('resolucoes')
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Tempo Médio Aprovação"
              value={`${metrics.atas.tempoMedioAprovacao} dias`}
              description="Atas pendentes de aprovação"
              icon={<Clock className="h-4 w-4" />}
              priority={metrics.atas.tempoMedioAprovacao > 15 ? 'high' : 'low'}
              quickActions={[
                {
                  label: "Atas Pendentes",
                  onClick: () => onViewDetails?.('atas'),
                  icon: <FileText className="h-4 w-4" />
                }
              ]}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Métricas Detalhadas por Seção */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Métricas Detalhadas</h2>
        
        {/* Reuniões */}
        <motion.div variants={containerVariants} className="mb-6">
          <h3 className="text-md font-medium mb-3 text-muted-foreground">Reuniões</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Total de Reuniões"
                value={metrics.reunioes.total}
                description="No período selecionado"
                icon={<Calendar className="h-4 w-4" />}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Duração Média"
                value={`${metrics.reunioes.duracaoMedia}min`}
                description="Tempo médio das reuniões"
                icon={<Clock className="h-4 w-4" />}
                priority={metrics.reunioes.duracaoMedia > 180 ? 'medium' : 'low'}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Próximas Reuniões"
                value={metrics.reunioes.proximasReunioes}
                description="Agendadas para os próximos 30 dias"
                icon={<TrendingUp className="h-4 w-4" />}
                className="h-full"
                action={{
                  label: "Agendar",
                  onClick: () => onViewDetails?.('agendar')
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Atas e Resoluções */}
        <motion.div variants={containerVariants} className="mb-6">
          <h3 className="text-md font-medium mb-3 text-muted-foreground">Documentação</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Atas Pendentes"
                value={metrics.atas.pendentes}
                description="Aguardando aprovação"
                icon={<FileText className="h-4 w-4" />}
                priority={metrics.atas.pendentes > 5 ? 'high' : 'low'}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Taxa de Aprovação"
                value={`${metrics.atas.taxaAprovacao}%`}
                description="Atas aprovadas vs total"
                icon={<CheckCircle className="h-4 w-4" />}
                trend={metrics.atas.taxaAprovacao >= 90 ? 'up' : 'stable'}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Resoluções Aprovadas"
                value={metrics.resolucoes.aprovadas}
                description="No período selecionado"
                icon={<Award className="h-4 w-4" />}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Resoluções Rejeitadas"
                value={metrics.resolucoes.rejeitadas}
                description="Não aprovadas pelo conselho"
                icon={<AlertTriangle className="h-4 w-4" />}
                priority={metrics.resolucoes.rejeitadas > 10 ? 'medium' : 'low'}
                className="h-full"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Conselheiros */}
        <motion.div variants={containerVariants}>
          <h3 className="text-md font-medium mb-3 text-muted-foreground">Conselheiros</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Presença Média"
                value={`${metrics.conselheiros.presencaMedia}%`}
                description="Taxa de comparecimento às reuniões"
                icon={<Users className="h-4 w-4" />}
                trend={metrics.conselheiros.presencaMedia >= 80 ? 'up' : 'down'}
                priority={metrics.conselheiros.presencaMedia < 70 ? 'high' : 'low'}
                className="h-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Mandatos Vencendo"
                value={metrics.conselheiros.mandatosVencendo}
                description="Próximos 90 dias"
                icon={<AlertTriangle className="h-4 w-4" />}
                priority={metrics.conselheiros.mandatosVencendo > 0 ? 'high' : 'low'}
                className="h-full"
                action={{
                  label: "Gerenciar",
                  onClick: () => onViewDetails?.('mandatos')
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Mais Participativo"
                value={metrics.conselheiros.maisParticipativo}
                description="Conselheiro com maior presença"
                icon={<Award className="h-4 w-4" />}
                className="h-full"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <motion.div 
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <QuickActionCard
              title="Exportar Relatório"
              description="Gerar relatório executivo completo"
              icon={<BarChart3 className="h-5 w-5" />}
              onClick={() => onExportReport?.()}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickActionCard
              title="Agendar Reunião"
              description="Nova reunião do conselho"
              icon={<Calendar className="h-5 w-5" />}
              onClick={() => onViewDetails?.('nova-reuniao')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickActionCard
              title="Gerenciar Conselheiros"
              description="Visualizar mandatos e presença"
              icon={<Users className="h-5 w-5" />}
              onClick={() => onViewDetails?.('conselheiros')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickActionCard
              title="Revisar Atas"
              description="Atas pendentes de aprovação"
              icon={<FileText className="h-5 w-5" />}
              onClick={() => onViewDetails?.('atas-pendentes')}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}