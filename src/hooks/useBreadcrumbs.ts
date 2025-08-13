import React from "react"
import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Home } from "lucide-react"

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
  'criar-relatorio': 'Novo Relatório',
  'fma': 'FMA',
  'documentos': 'Documentos',
  'processos': 'Processos',
  'ouvidoria': 'Ouvidoria',
  'perfil': 'Perfil',
  'admin': 'Administração',
  'users': 'Usuários',
  'data-seeder': 'Dados de Teste',
  'nova': 'Nova',
  'novo': 'Novo'
};

// Verificar se é um UUID/ID
const isId = (segment: string): boolean => {
  // UUID pattern ou ID numérico
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
         /^\d+$/.test(segment);
};

// Função para buscar título dinâmico baseado na rota e ID
const fetchDynamicTitle = async (route: string, id: string): Promise<string> => {
  try {
    if (route.includes('relatorios')) {
      const { data } = await supabase
        .from('reports')
        .select('title')
        .eq('id', id)
        .single();
      return data?.title ? `Relatório: ${data.title}` : `Relatório #${id.slice(0, 8)}`;
    }
    
    if (route.includes('atas')) {
      const { data } = await supabase
        .from('atas')
        .select('numero_ata')
        .eq('id', id)
        .single();
      return data?.numero_ata ? `Ata ${data.numero_ata}` : `Ata #${id.slice(0, 8)}`;
    }
    
    if (route.includes('resolucoes')) {
      const { data } = await supabase
        .from('resolucoes')
        .select('numero, titulo')
        .eq('id', id)
        .single();
      return data?.numero ? `Resolução ${data.numero}` : `Resolução #${id.slice(0, 8)}`;
    }
    
    if (route.includes('conselheiros')) {
      const { data } = await supabase
        .from('conselheiros')
        .select('nome')
        .eq('id', id)
        .single();
      return data?.nome || `Conselheiro #${id.slice(0, 8)}`;
    }
    
    if (route.includes('reunioes')) {
      const { data } = await supabase
        .from('reunioes')
        .select('numero_reuniao')
        .eq('id', id)
        .single();
      return data?.numero_reuniao ? `Reunião ${data.numero_reuniao}` : `Reunião #${id.slice(0, 8)}`;
    }
    
    return `#${id.slice(0, 8)}`;
  } catch (error) {
    console.warn('Error fetching dynamic title:', error);
    return `#${id.slice(0, 8)}`;
  }
};

// Hook para gerar breadcrumbs automaticamente baseado na rota
export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();

  // Query para buscar títulos dinâmicos para rotas com ID
  const { data: dynamicTitles } = useQuery({
    queryKey: ['breadcrumb-dynamic-titles', location.pathname],
    queryFn: async () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const titles: Record<string, string> = {};

      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (isId(segment) && i > 0) {
          const parentSegment = pathSegments[i - 1];
          const routeContext = pathSegments.slice(0, i).join('/');
          const dynamicTitle = await fetchDynamicTitle(routeContext, segment);
          titles[segment] = dynamicTitle;
        }
      }

      return titles;
    },
    enabled: location.pathname.includes('/') && 
             location.pathname.split('/').some(segment => isId(segment)),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1
  });

  const generateBreadcrumbs = React.useCallback((): BreadcrumbItem[] => {
    try {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [];
      let currentPath = '';

      // Adicionar Home como primeiro item
      breadcrumbs.push({
        label: 'Início',
        href: '/dashboard',
        icon: React.createElement(Home, { className: "h-4 w-4" }),
        current: false,
      });

      pathSegments.forEach((segment, index) => {
        const cleanSegment = segment.replace(/[^a-zA-Z0-9-_]/g, '');
        if (!cleanSegment) return;

        currentPath += `/${cleanSegment}`;
        const isLast = index === pathSegments.length - 1;

        const formatLabel = (seg: string): string => {
          // Se é um ID e temos um título dinâmico, usar ele
          if (isId(seg) && dynamicTitles?.[seg]) {
            return dynamicTitles[seg];
          }
          
          // Usar mapeamento de rota ou formatação padrão
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
      return [{
        label: 'Início',
        href: '/dashboard',
        icon: React.createElement(Home, { className: "h-4 w-4" }),
        current: true,
      }];
    }
  }, [location.pathname, dynamicTitles]);

  return generateBreadcrumbs();
}
