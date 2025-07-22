import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { useBreadcrumbs, type BreadcrumbItem } from "@/hooks/useBreadcrumbs"

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
}

export function Breadcrumbs({ 
  items, 
  className, 
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true 
}: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: "Início", href: "/", icon: <Home className="h-4 w-4" />, current: false }, ...items]
    : items

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const itemKey = item.href || `${item.label}-${index}`;
          const isCurrentPage = item.current === true;
          const isClickable = item.href && !isCurrentPage;
          
          return (
            <li key={itemKey} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isClickable ? (
                <Link
                  to={item.href}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Navegar para ${item.label}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    "flex items-center space-x-1 font-medium",
                    isCurrentPage ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  )
}

// Componente de breadcrumbs automático
export function AutoBreadcrumbs({ className }: { className?: string }) {
  const breadcrumbs = useBreadcrumbs()
  
  if (breadcrumbs.length === 0) return null
  
  return <Breadcrumbs items={breadcrumbs} className={className} />
}
