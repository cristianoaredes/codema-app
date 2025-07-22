import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton específico para cards do dashboard
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para linhas de tabela
function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Skeleton para formulários
function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-[100px] mb-2" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-[120px] mb-2" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-[80px] mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-11 w-[120px]" />
    </div>
  )
}

// Skeleton para lista de notificações
function NotificationSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Skeleton específico para lista de conselheiros
function ConselheiroCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center space-x-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

// Skeleton para lista de reuniões
function ReuniaoSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para protocolo
function ProtocoloSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para dashboard stats
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

// Skeleton para tabela completa
function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </div>
    </div>
  )
}

// Skeleton para página de loading completa
function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded" />
      </div>
      
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Content */}
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ConselheiroCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  TableRowSkeleton, 
  FormSkeleton, 
  NotificationSkeleton,
  ConselheiroCardSkeleton,
  ReuniaoSkeleton,
  ProtocoloSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  PageSkeleton
}
