import * as React from "react";
import { Home, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbItemConfig {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface SmartBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItemConfig[];
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
  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return [];
  }

  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItemConfig[] = [
    { 
      label: 'Início', 
      href: '/', 
      icon: <Home className="h-4 w-4" /> 
    }
  ];

  let currentPath = '';
  for (const path of paths) {
    currentPath += `/${path}`;
    const label = routeLabels[currentPath] || 
      path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      label,
      href: currentPath
    });
  }

  return breadcrumbs;
}

export function SmartBreadcrumb({
  items,
  className,
  ...props
}: SmartBreadcrumbProps) {
  const location = useLocation();
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);

  // Don't render if there's only one item or no items
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className={cn("", className)} {...props}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {item.icon}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.href || '#'}
                      className="flex items-center gap-1.5"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
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