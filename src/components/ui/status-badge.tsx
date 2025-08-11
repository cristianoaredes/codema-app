import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Pause, 
  Play,
  FileText,
  Calendar,
  Gavel
} from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
  pending: Clock,
  inactive: Pause,
  default: Play,
}

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ComponentType<{ className?: string }>
  showIcon?: boolean
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, size, icon, showIcon = true, children, ...props }, ref) => {
    const Icon = icon || iconMap[variant || "default"]

    return (
      <div
        className={cn(statusBadgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {showIcon && Icon && <Icon className="h-3 w-3" />}
        {children}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// Componentes específicos para o sistema CODEMA
const ConselheiroStatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    ativo: { variant: "success" as const, label: "Ativo" },
    inativo: { variant: "inactive" as const, label: "Inativo" },
    mandato_expirado: { variant: "error" as const, label: "Mandato Expirado" },
    mandato_expirando: { variant: "warning" as const, label: "Expirando" },
  }

  const config = statusMap[status as keyof typeof statusMap] || { 
    variant: "default" as const, 
    label: status 
  }

  return (
    <StatusBadge variant={config.variant}>
      {config.label}
    </StatusBadge>
  )
}

const ReuniaoStatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    agendada: { variant: "info" as const, label: "Agendada", icon: Calendar },
    em_andamento: { variant: "warning" as const, label: "Em Andamento", icon: Play },
    concluida: { variant: "success" as const, label: "Concluída", icon: CheckCircle },
    cancelada: { variant: "error" as const, label: "Cancelada", icon: XCircle },
    adiada: { variant: "pending" as const, label: "Adiada", icon: Clock },
  }

  const config = statusMap[status as keyof typeof statusMap] || { 
    variant: "default" as const, 
    label: status,
    icon: Calendar
  }

  return (
    <StatusBadge variant={config.variant} icon={config.icon}>
      {config.label}
    </StatusBadge>
  )
}

const ProtocoloStatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    gerado: { variant: "success" as const, label: "Gerado", icon: CheckCircle },
    pendente: { variant: "pending" as const, label: "Pendente", icon: Clock },
    processando: { variant: "warning" as const, label: "Processando", icon: Play },
    erro: { variant: "error" as const, label: "Erro", icon: XCircle },
  }

  const config = statusMap[status as keyof typeof statusMap] || { 
    variant: "default" as const, 
    label: status,
    icon: FileText
  }

  return (
    <StatusBadge variant={config.variant} icon={config.icon}>
      {config.label}
    </StatusBadge>
  )
}

const ResolucaoStatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    rascunho: { variant: "inactive" as const, label: "Rascunho", icon: FileText },
    em_votacao: { variant: "warning" as const, label: "Em Votação", icon: Gavel },
    aprovada: { variant: "success" as const, label: "Aprovada", icon: CheckCircle },
    rejeitada: { variant: "error" as const, label: "Rejeitada", icon: XCircle },
    publicada: { variant: "info" as const, label: "Publicada", icon: FileText },
  }

  const config = statusMap[status as keyof typeof statusMap] || { 
    variant: "default" as const, 
    label: status,
    icon: FileText
  }

  return (
    <StatusBadge variant={config.variant} icon={config.icon}>
      {config.label}
    </StatusBadge>
  )
}

// Componente de confirmação visual para ações
interface ActionConfirmationProps {
  action: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  className?: string
}

const ActionConfirmation: React.FC<ActionConfirmationProps> = ({
  action,
  status,
  message,
  className
}) => {
  if (status === 'idle') return null

  const statusConfig = {
    loading: { variant: "pending" as const, icon: Clock, label: `${action}...` },
    success: { variant: "success" as const, icon: CheckCircle, label: `${action} realizada com sucesso` },
    error: { variant: "error" as const, icon: XCircle, label: `Erro ao ${action.toLowerCase()}` },
  }

  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatusBadge variant={config.variant} icon={config.icon}>
        {message || config.label}
      </StatusBadge>
    </div>
  )
}

// Hook para gerenciar confirmações de ações
const useActionConfirmation = () => {
  const [confirmations, setConfirmations] = React.useState<
    Record<string, { status: 'loading' | 'success' | 'error'; message?: string }>
  >({})

  const showConfirmation = (
    action: string, 
    status: 'loading' | 'success' | 'error', 
    message?: string
  ) => {
    setConfirmations(prev => ({
      ...prev,
      [action]: { status, message }
    }))

    // Auto-remove success/error confirmations after 3 seconds
    if (status !== 'loading') {
      setTimeout(() => {
        setConfirmations(prev => {
          const { [action]: _, ...rest } = prev
          return rest
        })
      }, 3000)
    }
  }

  const clearConfirmation = (action: string) => {
    setConfirmations(prev => {
      const { [action]: _, ...rest } = prev
      return rest
    })
  }

  return {
    confirmations,
    showConfirmation,
    clearConfirmation,
  }
}

export {
  StatusBadge,
  ConselheiroStatusBadge,
  ReuniaoStatusBadge,
  ProtocoloStatusBadge,
  ResolucaoStatusBadge,
  ActionConfirmation,
  useActionConfirmation,
  statusBadgeVariants,
}
