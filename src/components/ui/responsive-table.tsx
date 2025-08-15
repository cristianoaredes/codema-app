/**
 * Responsive Table Component
 * Displays as table on desktop, cards on mobile
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/utils/responsive';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low'; // High priority columns show on mobile
  align?: 'left' | 'center' | 'right';
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
  cardClassName?: string;
  loading?: boolean;
}

function ResponsiveTable<T>({
  data,
  columns,
  onRowClick,
  actions,
  keyExtractor,
  emptyMessage = 'Nenhum item encontrado',
  className,
  cardClassName,
  loading = false,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  // Get high priority columns for mobile card view
  const highPriorityColumns = columns.filter(col => col.priority === 'high');
  const mediumPriorityColumns = columns.filter(col => col.priority === 'medium');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map(item => {
          const key = keyExtractor(item);
          return (
            <Card
              key={key}
              className={cn(
                'overflow-hidden transition-all duration-200',
                onRowClick && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
                cardClassName
              )}
              onClick={() => onRowClick?.(item)}
            >
              <CardContent className="p-4">
                {/* High priority items - always visible */}
                <div className="space-y-2 mb-3">
                  {highPriorityColumns.map(col => (
                    <div key={col.key} className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">{col.header}:</span>
                      <span className="font-medium text-right">{col.accessor(item)}</span>
                    </div>
                  ))}
                </div>

                {/* Medium priority items - collapsible */}
                {mediumPriorityColumns.length > 0 && (
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-sm text-muted-foreground py-2 border-t">
                      <span>Ver mais detalhes</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="space-y-2 pt-2">
                      {mediumPriorityColumns.map(col => (
                        <div key={col.key} className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">{col.header}:</span>
                          <span className="text-sm text-right">{col.accessor(item)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Actions */}
                {actions && (
                  <div className="flex justify-end mt-3 pt-3 border-t">
                    {actions(item)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className={cn('rounded-lg border overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const key = keyExtractor(item);
              return (
                <tr
                  key={key}
                  className={cn(
                    'border-b transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted/50',
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.className
                      )}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResponsiveTable;

// Example usage component for actions dropdown
export function TableActions({
  onEdit,
  onDelete,
  onView,
  customActions = [],
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            Visualizar
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            Editar
          </DropdownMenuItem>
        )}
        {customActions.map((action, index) => (
          <DropdownMenuItem key={index} onClick={action.onClick}>
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}