import { toast } from "sonner"
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"
import React from "react"

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const useNotifications = () => {
  const showNotification = (
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => {
    const { title, description, duration = 4000, action } = options || {}

    const getIcon = () => {
      switch (type) {
        case 'success':
          return React.createElement(CheckCircle, { size: 16 })
        case 'error':
          return React.createElement(XCircle, { size: 16 })
        case 'warning':
          return React.createElement(AlertCircle, { size: 16 })
        case 'info':
          return React.createElement(Info, { size: 16 })
        default:
          return React.createElement(Info, { size: 16 })
      }
    }

    const config = {
      duration,
      icon: getIcon(),
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
      className: `toast-${type}`,
      style: {
        border: type === 'success' ? '1px solid #10b981' :
               type === 'error' ? '1px solid #ef4444' :
               type === 'warning' ? '1px solid #f59e0b' :
               '1px solid #3b82f6'
      }
    }

    switch (type) {
      case 'success':
        toast.success(title || message, {
          ...config,
          description: description || (title ? message : undefined)
        })
        break
      case 'error':
        toast.error(title || message, {
          ...config,
          description: description || (title ? message : undefined)
        })
        break
      case 'warning':
        toast.warning(title || message, {
          ...config,
          description: description || (title ? message : undefined)
        })
        break
      case 'info':
        toast.info(title || message, {
          ...config,
          description: description || (title ? message : undefined)
        })
        break
      default:
        toast(title || message, {
          ...config,
          description: description || (title ? message : undefined)
        })
    }
  }

  // Métodos de conveniência para diferentes tipos de notificação
  const success = (message: string, options?: NotificationOptions) => {
    showNotification('success', message, options)
  }

  const error = (message: string, options?: NotificationOptions) => {
    showNotification('error', message, options)
  }

  const warning = (message: string, options?: NotificationOptions) => {
    showNotification('warning', message, options)
  }

  const info = (message: string, options?: NotificationOptions) => {
    showNotification('info', message, options)
  }

  // Notificações específicas para o contexto CODEMA
  const codemaNotifications = {
    conselheiroSaved: (nome: string) => {
      success(`Conselheiro ${nome} salvo com sucesso!`, {
        title: 'Cadastro realizado',
        duration: 3000
      })
    },
    
    conselheiroDeleted: (nome: string) => {
      success(`Conselheiro ${nome} removido com sucesso!`, {
        title: 'Exclusão realizada',
        duration: 3000
      })
    },
    
    mandateExpiring: (count: number) => {
      warning(`${count} mandato(s) expirando em 30 dias`, {
        title: 'Atenção: Mandatos expirando',
        duration: 6000,
        action: {
          label: 'Ver detalhes',
          onClick: () => {
            // Navegar para página de conselheiros com filtro
            window.location.href = '/codema/conselheiros?filter=expiring'
          }
        }
      })
    },
    
    reuniaoAgendada: (data: string) => {
      success(`Reunião agendada para ${data}`, {
        title: 'Reunião criada',
        duration: 4000
      })
    },
    
    protocoloGerado: (numero: string) => {
      success(`Protocolo ${numero} gerado com sucesso!`, {
        title: 'Protocolo criado',
        duration: 4000,
        action: {
          label: 'Visualizar',
          onClick: () => {
            // Navegar para página de protocolos
            window.location.href = `/codema/protocolos?search=${numero}`
          }
        }
      })
    },
    
    formValidationError: (field: string) => {
      error(`Por favor, verifique o campo: ${field}`, {
        title: 'Erro de validação',
        duration: 5000
      })
    },
    
    networkError: () => {
      error('Erro de conexão. Tente novamente.', {
        title: 'Erro de rede',
        duration: 5000,
        action: {
          label: 'Tentar novamente',
          onClick: () => {
            window.location.reload()
          }
        }
      })
    },
    
    sessionExpired: () => {
      warning('Sua sessão expirou. Faça login novamente.', {
        title: 'Sessão expirada',
        duration: 6000,
        action: {
          label: 'Fazer login',
          onClick: () => {
            window.location.href = '/login'
          }
        }
      })
    }
  }

  return {
    showNotification,
    success,
    error,
    warning,
    info,
    codema: codemaNotifications
  }
}
