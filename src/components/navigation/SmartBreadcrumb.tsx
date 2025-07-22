import * as React from "react";
import { Home, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";
import { useBreadcrumbs, BreadcrumbItem } from "@/hooks/useBreadcrumbs";

export interface BreadcrumbItemConfig {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface SmartBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  // A propriedade items pode ser removida se sempre usarmos a geração automática
}

// Auto-generate breadcrumbs from route with proper labels
const routeLabels: Record<string, string> = {
  '/': 'Início',
  '/dashboard': 'Dashboard',
  '/relatorios': 'Relatórios',
  '/criar-relatorio': 'Novo Relatório',
  '/meus-relatorios': 'Meus Relatórios',
  '/reunioes': 'Reuniões',
  '/reunioes/nova': 'Nova Reunião',
  '/codema': 'CODEMA',
  '/codema/atas': 'Atas',
  '/codema/atas/nova': 'Nova Ata',
  '/codema/resolucoes': 'Resoluções',
  '/codema/resolucoes/nova': 'Nova Resolução',
  '/codema/resolucoes/historico': 'Histórico de Resoluções',
  '/codema/conselheiros': 'Conselheiros',
  '/codema/conselheiros/novo': 'Novo Conselheiro',
  '/codema/conselheiros/impedimentos': 'Impedimentos',
  '/codema/auditoria': 'Auditoria',
  '/codema/auditoria/logs': 'Logs de Auditoria',
  '/fma': 'FMA - Fundo Municipal',
  '/fma/relatorio': 'Relatório FMA',
  '/fma/movimentacoes': 'Movimentações FMA',
  '/documentos': 'Documentos',
  '/ouvidoria': 'Ouvidoria',
  '/perfil': 'Meu Perfil',
  '/configuracoes': 'Configurações'
};

function generateBreadcrumbs(pathname: string): BreadcrumbItemConfig[] {
  const breadcrumbs: BreadcrumbItemConfig[] = [];
  
  // Start with the root breadcrumb
  breadcrumbs.push({ 
    label: routeLabels['/'] || 'Início', 
    href: '/', 
  });
  
  // Don't show more breadcrumbs on home page
  if (pathname === '/') {
    // Return only home if it's the current page
    return [{ ...breadcrumbs[0], href: undefined, icon: <Home className="h-4 w-4" /> }];
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || 
                  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    // Avoid duplicating the "Início" label if the logic somehow generates it again
    if (currentPath === '/' && breadcrumbs.length > 0) return;

    breadcrumbs.push({
      label,
      href: currentPath
    });
  });

  // Add home icon to the first element and mark last element
  if (breadcrumbs.length > 0) {
    breadcrumbs[0].icon = <Home className="h-4 w-4" />;
    // The last item should not have a link
    breadcrumbs[breadcrumbs.length - 1].href = undefined;
  }

  return breadcrumbs;
}

export function SmartBreadcrumb({
  className,
  ...props
}: SmartBreadcrumbProps) {
  const breadcrumbItems = useBreadcrumbs();

  // Se não houver breadcrumbs (ex: na página inicial), não renderiza nada
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs 
      items={breadcrumbItems} 
      className={cn("", className)} 
      {...props}
    />
  );
}

// Breadcrumb container with background for sticky positioning
export function BreadcrumbContainer({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "sticky top-16 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3",
      className
    )}>
      {children}
    </div>
  );
}

// Enhanced breadcrumb with page actions
export function BreadcrumbWithActions({
  children,
  actions,
  title,
  description,
  className
}: {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <BreadcrumbContainer className={cn("space-y-3", className)}>
      {children && (
        <div className="flex items-center justify-between">
          {children}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {(title || description) && (
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </BreadcrumbContainer>
  );
}