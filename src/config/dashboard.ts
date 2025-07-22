import { 
  Calendar, 
  FileText, 
  Gavel, 
  Users, 
  DollarSign,
  BarChart3,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  MessageSquare,
  MapPin,
  Search,
  Shield
} from "lucide-react";
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UserRole } from '../types/auth';

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalConselheiros: number;
  totalReunioes: number;
  totalResolucoes: number;
  totalProtocolos: number;
  protocolosPendentes: number;
  reunioesProximas: number;
  resolucoesPendentes: number;
  [key: string]: number | undefined;
}

export interface DashboardCardConfig {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  getValue: (stats: DashboardStats) => string | number;
  change?: (stats: DashboardStats) => number;
  trend?: (stats: DashboardStats) => 'up' | 'down' | 'stable';
  priority?: 'high' | 'medium' | 'low' | ((stats: DashboardStats) => 'high' | 'medium' | 'low');
  action?: {
    label: string;
    path: string;
  };
  quickActions?: Array<{
    label: string;
    path: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  requireRole?: string[];
}

export interface QuickActionConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requireRole?: string[];
}

// Configurações de cards por role
export const dashboardCards: DashboardCardConfig[] = [
  // Cards públicos/gerais
  {
    id: 'total-reports',
    title: 'Relatórios Públicos',
    description: 'Total de relatórios da comunidade',
    icon: BarChart3,
    getValue: (stats) => stats.totalReports || 0,
    change: (stats) => stats.reportGrowth || 0,
    trend: (stats) => stats.reportGrowth > 0 ? 'up' : stats.reportGrowth < 0 ? 'down' : 'stable',
    action: {
      label: 'Ver Todos',
      path: '/relatorios'
    },
    quickActions: [
      {
        label: 'Filtrar por Região',
        path: '/relatorios?filter=region',
        icon: MapPin
      },
      {
        label: 'Exportar Dados',
        path: '/relatorios/export',
        icon: FileText
      }
    ]
  },
  {
    id: 'my-reports',
    title: 'Minhas Contribuições',
    description: 'Relatórios que você enviou',
    icon: User,
    getValue: (stats) => stats.myReports || 0,
    action: {
      label: 'Ver Meus',
      path: '/meus-relatorios'
    },
    quickActions: [
      {
        label: 'Novo Relatório',
        path: '/criar-relatorio',
        icon: Plus
      }
    ]
  },

  // Cards CODEMA
  {
    id: 'meetings',
    title: 'Reuniões Agendadas',
    description: 'Próximas reuniões do conselho',
    icon: Calendar,
    getValue: (stats) => stats.reunioesAgendadas || 0,
    priority: (stats) => stats.reunioesAgendadas > 3 ? 'high' : 'medium',
    action: {
      label: 'Ver Agenda',
      path: '/reunioes'
    },
    quickActions: [
      {
        label: 'Nova Reunião',
        path: '/reunioes/nova',
        icon: Plus
      },
      {
        label: 'Convocar Membros',
        path: '/reunioes/convocar',
        icon: Users
      }
    ],
    requireRole: ['codema']
  },
  {
    id: 'pending-minutes',
    title: 'Atas Pendentes',
    description: 'Atas aguardando aprovação',
    icon: FileText,
    getValue: (stats) => stats.atasPendentes || 0,
    priority: (stats) => stats.atasPendentes > 2 ? 'high' : 'medium',
    action: {
      label: 'Revisar',
      path: '/codema/atas'
    },
    quickActions: [
      {
        label: 'Criar Ata',
        path: '/codema/atas/nova',
        icon: Plus
      },
      {
        label: 'Aprovar Pendentes',
        path: '/codema/atas?status=pendente',
        icon: CheckCircle
      }
    ],
    requireRole: ['codema']
  },
  {
    id: 'pending-resolutions',
    title: 'Resoluções em Votação',
    description: 'Decisões aguardando votação',
    icon: Gavel,
    getValue: (stats) => stats.resolucoesPendentes || 0,
    priority: (stats) => stats.resolucoesPendentes > 1 ? 'high' : 'low',
    action: {
      label: 'Votar',
      path: '/codema/resolucoes'
    },
    quickActions: [
      {
        label: 'Nova Resolução',
        path: '/codema/resolucoes/nova',
        icon: Plus
      },
      {
        label: 'Histórico',
        path: '/codema/resolucoes/historico',
        icon: Clock
      }
    ],
    requireRole: ['codema']
  },
  {
    id: 'fma-balance',
    title: 'Saldo FMA',
    description: 'Fundo Municipal do Meio Ambiente',
    icon: DollarSign,
    getValue: (stats) => stats.fmaBalance ? `R$ ${stats.fmaBalance.toLocaleString('pt-BR')}` : 'R$ 0,00',
    action: {
      label: 'Ver Detalhes',
      path: '/fma'
    },
    quickActions: [
      {
        label: 'Relatório Financeiro',
        path: '/fma/relatorio',
        icon: BarChart3
      },
      {
        label: 'Movimentações',
        path: '/fma/movimentacoes',
        icon: FileText
      }
    ],
    requireRole: ['codema']
  },

  // Cards administrativos
  {
    id: 'counselors',
    title: 'Conselheiros Ativos',
    description: 'Membros do conselho',
    icon: Users,
    getValue: (stats) => stats.conselheiros || 0,
    action: {
      label: 'Gerenciar',
      path: '/codema/conselheiros'
    },
    quickActions: [
      {
        label: 'Adicionar Membro',
        path: '/codema/conselheiros/novo',
        icon: Plus
      },
      {
        label: 'Verificar Impedimentos',
        path: '/codema/conselheiros/impedimentos',
        icon: AlertTriangle
      }
    ],
    requireRole: ['admin', 'secretario', 'presidente']
  },
  {
    id: 'audit-alerts',
    title: 'Alertas de Auditoria',
    description: 'Atividades que precisam de atenção',
    icon: Shield,
    getValue: (stats) => stats.auditAlerts || 0,
    priority: (stats) => stats.auditAlerts > 0 ? 'high' : 'low',
    action: {
      label: 'Ver Auditoria',
      path: '/codema/auditoria'
    },
    quickActions: [
      {
        label: 'Logs Recentes',
        path: '/codema/auditoria/logs',
        icon: Search
      }
    ],
    requireRole: ['admin']
  }
];

// Ações rápidas por role
export const quickActions: QuickActionConfig[] = [
  // Ações públicas
  {
    id: 'new-report',
    title: 'Novo Relatório',
    description: 'Reportar um problema ou sugestão',
    icon: Plus,
    path: '/criar-relatorio'
  },
  {
    id: 'ombudsman',
    title: 'Ouvidoria',
    description: 'Denúncias e reclamações',
    icon: MessageSquare,
    path: '/ouvidoria'
  },

  // Ações CODEMA
  {
    id: 'schedule-meeting',
    title: 'Agendar Reunião',
    description: 'Convocar nova reunião do conselho',
    icon: Calendar,
    path: '/reunioes/nova',
    requireRole: ['secretario', 'presidente']
  },
  {
    id: 'create-minute',
    title: 'Criar Ata',
    description: 'Documentar reunião realizada',
    icon: FileText,
    path: '/codema/atas/nova',
    requireRole: ['secretario']
  },
  {
    id: 'new-resolution',
    title: 'Nova Resolução',
    description: 'Propor nova decisão do conselho',
    icon: Gavel,
    path: '/codema/resolucoes/nova',
    requireRole: ['codema']
  },

  // Ações administrativas
  {
    id: 'manage-users',
    title: 'Gerenciar Usuários',
    description: 'Administrar membros do sistema',
    icon: Users,
    path: '/codema/conselheiros',
    requireRole: ['admin']
  },
  {
    id: 'system-settings',
    title: 'Configurações',
    description: 'Configurar sistema e permissões',
    icon: Settings,
    path: '/configuracoes',
    requireRole: ['admin']
  }
];

// Configurações específicas por role
export const roleConfigurations = {
  citizen: {
    cards: ['total-reports', 'my-reports'],
    quickActions: ['new-report', 'ombudsman'],
    title: 'Portal do Cidadão',
    description: 'Acompanhe e participe das ações ambientais do município'
  },
  conselheiro_titular: {
    cards: ['total-reports', 'my-reports', 'meetings', 'pending-minutes', 'pending-resolutions'],
    quickActions: ['new-report', 'new-resolution'],
    title: 'Dashboard - Conselheiro Titular',
    description: 'Gerencie suas atividades como membro do CODEMA'
  },
  conselheiro_suplente: {
    cards: ['total-reports', 'my-reports', 'meetings', 'pending-minutes', 'pending-resolutions'],
    quickActions: ['new-report', 'new-resolution'],
    title: 'Dashboard - Conselheiro Suplente',
    description: 'Acompanhe as atividades do CODEMA'
  },
  secretario: {
    cards: ['total-reports', 'meetings', 'pending-minutes', 'pending-resolutions', 'counselors', 'fma-balance'],
    quickActions: ['schedule-meeting', 'create-minute', 'new-resolution', 'new-report'],
    title: 'Dashboard - Secretário Executivo',
    description: 'Coordene as atividades e documentação do CODEMA'
  },
  presidente: {
    cards: ['total-reports', 'meetings', 'pending-minutes', 'pending-resolutions', 'counselors', 'fma-balance'],
    quickActions: ['schedule-meeting', 'new-resolution', 'new-report'],
    title: 'Dashboard - Presidente',
    description: 'Lidere as decisões e direcionamentos do CODEMA'
  },
  admin: {
    cards: ['total-reports', 'meetings', 'pending-minutes', 'pending-resolutions', 'counselors', 'fma-balance', 'audit-alerts'],
    quickActions: ['schedule-meeting', 'create-minute', 'new-resolution', 'manage-users', 'system-settings'],
    title: 'Dashboard - Administrador',
    description: 'Administre o sistema e supervisione todas as atividades'
  }
};

export function getRoleConfig(role: string) {
  return roleConfigurations[role as keyof typeof roleConfigurations] || roleConfigurations.citizen;
}

export function getCardsForRole(role: string) {
  const config = getRoleConfig(role);
  return dashboardCards.filter(card => 
    config.cards.includes(card.id) && 
    (!card.requireRole || card.requireRole.includes(role) || card.requireRole.includes('codema'))
  );
}

export function getQuickActionsForRole(role: string) {
  const config = getRoleConfig(role);
  return quickActions.filter(action => 
    config.quickActions.includes(action.id) && 
    (!action.requireRole || action.requireRole.includes(role))
  );
}