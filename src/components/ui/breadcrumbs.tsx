import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { type BreadcrumbItem } from "@/hooks/useBreadcrumbs"

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
}

export function Breadcrumbs({ 
  items, 
  className, 
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbsProps) {
  
  const allItems = [
    { label: "Início", href: "/", icon: <Home className="h-4 w-4" /> }, 
    ...items
  ];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const itemKey = `${item.label}-${index}`; // Garante uma chave única
          const isLastItem = index === allItems.length - 1;
          const isClickable = item.href && !isLastItem;
          
          return (
            <li key={itemKey} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isClickable ? (
                <Link
                  to={item.href!}
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
                    isLastItem ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isLastItem ? "page" : undefined}
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
// O componente AutoBreadcrumbs não é mais necessário aqui, pois SmartBreadcrumb o substitui.
// Se ele for usado em algum lugar, podemos removê-lo ou ajustá-lo. Por agora, vou remover.
