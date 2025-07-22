import React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface ProgressIndicatorProps {
  value: number
  max?: number
  status?: 'loading' | 'success' | 'error' | 'warning' | 'idle'
  label?: string
  description?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressIndicator({
  value,
  max = 100,
  status = 'idle',
  label,
  description,
  showPercentage = true,
  size = 'md',
  className
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100)
  
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getProgressColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      case 'warning':
        return 'bg-yellow-600'
      case 'loading':
        return 'bg-blue-600'
      default:
        return 'bg-primary'
    }
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn("w-full", sizeClasses[size])}
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-300",
            getProgressColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

// Componente específico para upload de arquivos
interface FileUploadProgressProps {
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  size?: string
  onCancel?: () => void
}

export function FileUploadProgress({
  fileName,
  progress,
  status,
  size,
  onCancel
}: FileUploadProgressProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
            📄
          </div>
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]">
              {fileName}
            </p>
            {size && (
              <p className="text-xs text-muted-foreground">
                {size}
              </p>
            )}
          </div>
        </div>
        {onCancel && status === 'uploading' && (
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        )}
      </div>
      
      <ProgressIndicator
        value={progress}
        status={status === 'uploading' ? 'loading' : status}
        showPercentage={status === 'uploading'}
        size="sm"
      />
    </div>
  )
}

// Componente para progresso de múltiplas etapas
interface StepProgressProps {
  steps: Array<{
    label: string
    status: 'pending' | 'current' | 'completed' | 'error'
  }>
  className?: string
}

export function StepProgress({ steps, className }: StepProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
            step.status === 'completed' && "bg-green-600 text-white",
            step.status === 'current' && "bg-blue-600 text-white",
            step.status === 'error' && "bg-red-600 text-white",
            step.status === 'pending' && "bg-gray-200 text-gray-600"
          )}>
            {step.status === 'completed' ? (
              <CheckCircle className="h-4 w-4" />
            ) : step.status === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : step.status === 'current' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              index + 1
            )}
          </div>
          <span className={cn(
            "text-sm",
            step.status === 'completed' && "text-green-600 font-medium",
            step.status === 'current' && "text-blue-600 font-medium",
            step.status === 'error' && "text-red-600 font-medium",
            step.status === 'pending' && "text-muted-foreground"
          )}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Hook para gerenciar progresso de operações
export function useProgress() {
  const [progress, setProgress] = React.useState(0)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = React.useState('')

  const start = (initialMessage = 'Iniciando...') => {
    setProgress(0)
    setStatus('loading')
    setMessage(initialMessage)
  }

  const update = (value: number, newMessage?: string) => {
    setProgress(value)
    if (newMessage) setMessage(newMessage)
  }

  const complete = (successMessage = 'Concluído!') => {
    setProgress(100)
    setStatus('success')
    setMessage(successMessage)
  }

  const error = (errorMessage = 'Erro na operação') => {
    setStatus('error')
    setMessage(errorMessage)
  }

  const reset = () => {
    setProgress(0)
    setStatus('idle')
    setMessage('')
  }

  return {
    progress,
    status,
    message,
    start,
    update,
    complete,
    error,
    reset
  }
}
