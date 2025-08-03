import * as React from "react";
import { 
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type Row as _Row
} from "@tanstack/react-table";
import { 
  Search,
  Filter as _Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Eye as _Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2 as _Trash2,
  Edit as _Edit,
  CheckSquare,
  Square as _Square
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge as _Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SmartTableAction<T> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
}

export interface SmartTableBulkAction<T> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: T[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
}

export interface SmartTableFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export interface SmartTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  filters?: SmartTableFilter[];
  actions?: SmartTableAction<T>[];
  bulkActions?: SmartTableBulkAction<T>[];
  selectable?: boolean;
  exportable?: boolean;
  onExport?: (data: T[]) => void;
  refreshable?: boolean;
  onRefresh?: () => void;
  addable?: boolean;
  onAdd?: () => void;
  pageSize?: number;
  className?: string;
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function SmartTable<T>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Pesquisar...",
  globalFilter = "",
  onGlobalFilterChange,
  filters = [],
  actions = [],
  bulkActions = [],
  selectable = false,
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  addable = false,
  onAdd,
  pageSize = 10,
  className,
  emptyState
}: SmartTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState(globalFilter);

  // Enhanced columns with selection and actions
  const enhancedColumns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    const cols: ColumnDef<T, unknown>[] = [];

    // Selection column
    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Original columns
    cols.push(...columns);

    // Actions column
    if (actions.length > 0) {
      cols.push({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const rowData = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover-lift"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.map((action) => {
                  const IconComponent = action.icon;
                  const isDisabled = action.disabled?.(rowData) || false;
                  
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => !isDisabled && action.onClick(rowData)}
                      disabled={isDisabled}
                      className={cn(
                        "cursor-pointer",
                        action.variant === 'destructive' && "text-destructive focus:text-destructive"
                      )}
                    >
                      {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      });
    }

    return cols;
  }, [columns, selectable, actions]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: onGlobalFilterChange || setInternalGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: onGlobalFilterChange ? globalFilter : internalGlobalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleExport = () => {
    const dataToExport = hasSelection 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
    onExport?.(dataToExport);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-9 w-80 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="rounded-md border">
          <div className="border-b p-4">
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-24 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b p-4">
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-4 w-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Global Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={onGlobalFilterChange ? globalFilter : internalGlobalFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  if (onGlobalFilterChange) {
                    onGlobalFilterChange(value);
                  } else {
                    setInternalGlobalFilter(value);
                  }
                }}
                className="pl-8 w-80"
              />
            </div>
          )}

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.id}>
              {filter.type === 'select' && filter.options ? (
                <Select
                  value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn(filter.id)?.setFilterValue(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={filter.placeholder || filter.label}
                  value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn(filter.id)?.setFilterValue(event.target.value)
                  }
                  className="w-[150px]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          {hasSelection && bulkActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  {selectedRows.length} selecionado(s)
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações em lote</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {bulkActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => action.onClick(selectedRows.map(row => row.original))}
                      className={cn(
                        "cursor-pointer",
                        action.variant === 'destructive' && "text-destructive focus:text-destructive"
                      )}
                    >
                      {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Add Button */}
          {addable && onAdd && (
            <Button onClick={onAdd} size="sm" className="hover-lift">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          )}

          {/* Refresh Button */}
          {refreshable && onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="hover-lift">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {/* Export Button */}
          {exportable && onExport && (
            <Button variant="outline" size="sm" onClick={handleExport} className="hover-lift">
              <Download className="mr-2 h-4 w-4" />
              {hasSelection ? `Exportar (${selectedRows.length})` : 'Exportar'}
            </Button>
          )}

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover-lift">
                <EyeOff className="mr-2 h-4 w-4" />
                Colunas
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Visibilidade</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border hover-glow transition-smooth">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="relative">
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center space-x-2",
                            header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground transition-colors"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="ml-2">
                              {header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <div className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={enhancedColumns.length} className="h-24 text-center">
                  {emptyState ? (
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">{emptyState.title}</h3>
                      <p className="text-sm text-muted-foreground">{emptyState.description}</p>
                      {emptyState.action && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={emptyState.action.onClick}
                          className="mt-2"
                        >
                          {emptyState.action.label}
                        </Button>
                      )}
                    </div>
                  ) : (
                    "Nenhum resultado encontrado."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {hasSelection && (
            <span>
              {selectedRows.length} de {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Linhas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex hover-lift"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para primeira página</span>
              <span className="text-xs">««</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 hover-lift"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para página anterior</span>
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 hover-lift"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para próxima página</span>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex hover-lift"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para última página</span>
              <span className="text-xs">»»</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}