import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface DetailPageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl: string;
  backLabel?: string;
  status?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  protocol?: string;
  actions?: Action[];
  children?: React.ReactNode;
  className?: string;
}

export function DetailPageHeader({
  title,
  subtitle,
  backUrl,
  backLabel = "Voltar",
  status,
  protocol,
  actions = [],
  children,
  className
}: DetailPageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backUrl);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Back button and title row */}
      <div className="flex items-start gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack}
          className="flex-shrink-0 mt-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {status && (
                  <Badge variant={status.variant || 'default'}>
                    {status.label}
                  </Badge>
                )}
              </div>
              
              {subtitle && (
                <p className="text-sm text-muted-foreground mb-2">
                  {subtitle}
                </p>
              )}
              
              {protocol && (
                <p className="text-sm text-muted-foreground">
                  Protocolo: {protocol}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Show first 2 actions as buttons on larger screens */}
                <div className="hidden sm:flex items-center gap-2">
                  {actions.slice(0, 2).map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'default'}
                      size="sm"
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                    </Button>
                  ))}
                </div>

                {/* Dropdown for additional actions or mobile */}
                {actions.length > 2 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.slice(2).map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.onClick}
                          disabled={action.disabled}
                        >
                          {action.icon && (
                            <span className="mr-2">{action.icon}</span>
                          )}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Mobile: Show all actions in dropdown */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.onClick}
                          disabled={action.disabled}
                        >
                          {action.icon && (
                            <span className="mr-2">{action.icon}</span>
                          )}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional content slot */}
      {children && (
        <div className="ml-20">
          {children}
        </div>
      )}
    </div>
  );
}