import React from "react"
import { useLocation } from "react-router-dom"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
}

// Mapeamento de rotas para labels legíveis
const routeLabels: Record<string, string> = {
  'codema': 'CODEMA',
  'conselheiros': 'Conselheiros',
  'reunioes': 'Reuniões',
  'atas': 'Atas',
  'resolucoes': 'Resoluções',
  'protocolos': 'Protocolos',
  'auditoria': 'Auditoria',
  'dashboard': 'Dashboard',
  'configuracoes': 'Configurações',
  'relatorios': 'Relatórios',
  'criar-relatorio': 'Novo Relatório'
};

// Hook para gerar breadcrumbs automaticamente baseado na rota
export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();

  const generateBreadcrumbs = React.useCallback((): BreadcrumbItem[] => {
    try {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [];
      let currentPath = '';

      pathSegments.forEach((segment, index) => {
        const cleanSegment = segment.replace(/[^a-zA-Z0-9-_]/g, '');
        if (!cleanSegment) return;

        currentPath += `/${cleanSegment}`;
        const isLast = index === pathSegments.length - 1;

        const formatLabel = (seg: string): string => {
          return routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/[-_]/g, ' ');
        };

        breadcrumbs.push({
          label: formatLabel(cleanSegment),
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
      });

      return breadcrumbs;
    } catch (error) {
      console.error('Error generating breadcrumbs:', error);
      return [];
    }
  }, [location.pathname]);

  return generateBreadcrumbs();
}
