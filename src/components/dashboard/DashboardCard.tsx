import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  priority?: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
  quickActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  description,
  change,
  trend = 'stable',
  priority,
  action,
  quickActions,
  icon,
  loading = false,
  className
}: DashboardCardProps) {
  const trendIcon = {
    up: <ArrowUpRight className="h-4 w-4" />,
    down: <ArrowDownRight className="h-4 w-4" />,
    stable: <Minus className="h-4 w-4" />
  };

  const trendColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-muted-foreground'
  };

  const priorityVariant = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary'
  } as const;

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden hover-lift hover-glow animate-fade-in",
        action && "cursor-pointer",
        className
      )}
      onClick={action?.onClick}
    >
      {/* Background gradient for priority */}
      {priority && (
        <div className={cn(
          "absolute top-0 right-0 w-24 h-24 opacity-10",
          priority === 'high' && "bg-gradient-to-br from-red-500 to-red-600",
          priority === 'medium' && "bg-gradient-to-br from-yellow-500 to-yellow-600",
          priority === 'low' && "bg-gradient-to-br from-green-500 to-green-600"
        )} />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {priority && (
              <Badge variant={priorityVariant[priority]} className="text-xs">
                {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            )}
            
            {quickActions && quickActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Ações rápidas</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {quickActions.map((quickAction, index) => (
                    <React.Fragment key={index}>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          quickAction.onClick();
                        }}
                      >
                        {quickAction.icon}
                        {quickAction.label}
                      </DropdownMenuItem>
                      {index < quickActions.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">
              {value}
            </p>
            
            {change !== undefined && (
              <div className={cn("flex items-center text-sm", trendColor[trend])}>
                {trendIcon[trend]}
                <span className="ml-1">
                  {change > 0 ? '+' : ''}{change}%
                </span>
                {trend === 'up' && <TrendingUp className="ml-1 h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="ml-1 h-3 w-3" />}
              </div>
            )}
          </div>

          {action && (
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Variante para cards de ação rápida
export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  className,
  ...props
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover-lift hover-glow animate-fade-in group",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold group-hover:text-primary transition-smooth">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-smooth" />
        </div>
      </CardContent>
    </Card>
  );
}