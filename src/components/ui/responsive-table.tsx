import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResponsiveTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    render?: (item: T) => React.ReactNode;
    hideOnMobile?: boolean;
    priority?: 'high' | 'medium' | 'low'; // high = always show, medium = show on tablet+, low = desktop only
  }>;
  onRowClick?: (item: T) => void;
  actions?: Array<{
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive';
  }> | ((item: T) => Array<{
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive';
  }>);
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  actions,
  loading = false,
  emptyMessage = "Nenhum item encontrado",
  className
}: ResponsiveTableProps<T>) {
  // Helper function to get actions for an item
  const getActionsForItem = (item: T) => {
    if (!actions) return [];
    return typeof actions === 'function' ? actions(item) : actions;
  };

  // Separate columns by priority for responsive design
  const highPriorityColumns = columns.filter(col => col.priority === 'high' || !col.priority);
  const mediumPriorityColumns = columns.filter(col => col.priority === 'medium');
  const lowPriorityColumns = columns.filter(col => col.priority === 'low');

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => (
          <Card 
            key={index} 
            className={cn(
              "transition-all duration-200",
              onRowClick && "cursor-pointer hover:shadow-md active:scale-[0.98]"
            )}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Primary info - always visible */}
                {highPriorityColumns.slice(0, 2).map((column) => (
                  <div key={column.key}>
                    {column.key === highPriorityColumns[0]?.key ? (
                      <div className="font-medium text-base">
                        {column.render ? column.render(item) : item[column.key]}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {column.render ? column.render(item) : item[column.key]}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Secondary info - badges and status */}
                {highPriorityColumns.slice(2).map((column) => (
                  <div key={column.key} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {column.title}:
                    </span>
                    <div className="text-sm">
                      {column.render ? column.render(item) : item[column.key]}
                    </div>
                  </div>
                ))}

                {/* Actions */}
                {(() => {
                  const itemActions = getActionsForItem(item);
                  return (itemActions.length > 0 || onRowClick) && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      {onRowClick && (
                        <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-primary">
                          Ver detalhes
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {itemActions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {itemActions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(item);
                                }}
                                className={cn(
                                  action.variant === 'destructive' && "text-destructive focus:text-destructive"
                                )}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tablet View (md to lg) */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-2">
          {data.map((item, index) => (
            <Card 
              key={index}
              className={cn(
                "transition-all duration-200",
                onRowClick && "cursor-pointer hover:shadow-md"
              )}
              onClick={() => onRowClick?.(item)}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Main content - 2 columns */}
                  <div className="col-span-2 space-y-1">
                    {[...highPriorityColumns, ...mediumPriorityColumns].slice(0, 3).map((column, colIndex) => (
                      <div key={column.key} className={colIndex === 0 ? "font-medium" : "text-sm text-muted-foreground"}>
                        {column.render ? column.render(item) : item[column.key]}
                      </div>
                    ))}
                  </div>
                  
                  {/* Actions - 1 column */}
                  <div className="justify-self-end">
                    {(() => {
                      const itemActions = getActionsForItem(item);
                      return itemActions.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {itemActions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(item);
                                }}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : onRowClick ? (
                        <Button variant="outline" size="sm">
                          Ver detalhes
                        </Button>
                      ) : null;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop Table View (lg+) */}
      <div className="hidden lg:block">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {[...highPriorityColumns, ...mediumPriorityColumns, ...lowPriorityColumns].map((column) => (
                    <th key={column.key} className="text-left p-4 font-medium text-sm">
                      {column.title}
                    </th>
                  ))}
                  {actions && (
                    <th className="text-right p-4 font-medium text-sm w-16">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr 
                    key={index}
                    className={cn(
                      "border-b transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {[...highPriorityColumns, ...mediumPriorityColumns, ...lowPriorityColumns].map((column) => (
                      <td key={column.key} className="p-4 text-sm">
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {actions && (() => {
                      const itemActions = getActionsForItem(item);
                      return itemActions.length > 0 && (
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {itemActions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item);
                                  }}
                                >
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export additional helper components
export const ResponsiveTableSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);