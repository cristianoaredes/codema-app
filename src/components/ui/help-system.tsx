import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  HelpCircle, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  X,
  ChevronDown,
  ChevronUp,
  Book,
  Video,
  ExternalLink
} from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"

// Tooltip de ajuda contextual
interface HelpTooltipProps {
  content: string | React.ReactNode
  title?: string
  placement?: "top" | "bottom" | "left" | "right"
  className?: string
  children: React.ReactNode
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  placement = "top",
  className,
  children
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const scrollX = window.pageXOffset
      const scrollY = window.pageYOffset

      let x = rect.left + scrollX + rect.width / 2
      let y = rect.top + scrollY

      switch (placement) {
        case "top":
          y -= 10
          break
        case "bottom":
          y += rect.height + 10
          break
        case "left":
          x = rect.left + scrollX - 10
          y += rect.height / 2
          break
        case "right":
          x = rect.right + scrollX + 10
          y += rect.height / 2
          break
      }

      setPosition({ x, y })
    }
  }, [placement])

  React.useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible, updatePosition])

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("inline-flex items-center", className)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-popover text-popover-foreground border rounded-md shadow-lg max-w-xs"
          style={{
            left: position.x,
            top: position.y,
            transform: placement === "top" || placement === "bottom" 
              ? "translateX(-50%)" 
              : placement === "left" 
                ? "translateX(-100%)" 
                : "translateX(0)"
          }}
        >
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          <div>{content}</div>
        </div>
      )}
    </>
  )
}

// Ícone de ajuda com tooltip
interface HelpIconProps {
  content: string | React.ReactNode
  title?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export const HelpIcon: React.FC<HelpIconProps> = ({
  content,
  title,
  size = "sm",
  className
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <HelpTooltip content={content} title={title}>
      <HelpCircle 
        className={cn(
          "text-muted-foreground hover:text-foreground cursor-help transition-colors",
          sizeClasses[size],
          className
        )}
      />
    </HelpTooltip>
  )
}

// Seção de ajuda expansível
interface HelpSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  icon: Icon = HelpCircle,
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("border rounded-lg", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

// Instruções passo-a-passo
interface StepProps {
  number: number
  title: string
  description: string
  completed?: boolean
  current?: boolean
}

interface StepByStepGuideProps {
  steps: StepProps[]
  className?: string
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({
  steps,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step.completed 
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : step.current
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                : "bg-muted text-muted-foreground"
          )}>
            {step.completed ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              step.number
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-medium",
              step.current && "text-foreground",
              step.completed && "text-muted-foreground"
            )}>
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Card de ajuda com diferentes tipos
interface HelpCardProps {
  type?: "info" | "warning" | "error" | "success"
  title: string
  description: string
  actions?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export const HelpCard: React.FC<HelpCardProps> = ({
  type = "info",
  title,
  description,
  actions,
  dismissible = false,
  onDismiss,
  className
}) => {
  const typeConfig = {
    info: {
      icon: Info,
      className: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
      iconClassName: "text-blue-600 dark:text-blue-400"
    },
    warning: {
      icon: AlertCircle,
      className: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
      iconClassName: "text-yellow-600 dark:text-yellow-400"
    },
    error: {
      icon: AlertCircle,
      className: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
      iconClassName: "text-red-600 dark:text-red-400"
    },
    success: {
      icon: CheckCircle,
      className: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
      iconClassName: "text-green-600 dark:text-green-400"
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Card className={cn(config.className, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className={cn("h-5 w-5 mt-0.5", config.iconClassName)} />
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      {actions && (
        <CardContent className="pt-0">
          {actions}
        </CardContent>
      )}
    </Card>
  )
}

// Sistema de documentação contextual
interface DocLinkProps {
  href: string
  title: string
  type?: "article" | "video" | "external"
  className?: string
}

export const DocLink: React.FC<DocLinkProps> = ({
  href,
  title,
  type = "article",
  className
}) => {
  const typeConfig = {
    article: { icon: Book, label: "Artigo" },
    video: { icon: Video, label: "Vídeo" },
    external: { icon: ExternalLink, label: "Link externo" }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <a
      href={href}
      target={type === "external" ? "_blank" : undefined}
      rel={type === "external" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
      <Badge variant="secondary" className="text-xs">
        {config.label}
      </Badge>
    </a>
  )
}

// Hook para gerenciar estado de ajuda
export const useHelpSystem = () => {
  const [activeHelp, setActiveHelp] = React.useState<string | null>(null)
  const [dismissedHelp, setDismissedHelp] = React.useState<Set<string>>(new Set())

  const showHelp = (id: string) => {
    setActiveHelp(id)
  }

  const hideHelp = () => {
    setActiveHelp(null)
  }

  const dismissHelp = (id: string) => {
    setDismissedHelp(prev => new Set(prev).add(id))
    if (activeHelp === id) {
      setActiveHelp(null)
    }
  }

  const isHelpDismissed = (id: string) => {
    return dismissedHelp.has(id)
  }

  return {
    activeHelp,
    showHelp,
    hideHelp,
    dismissHelp,
    isHelpDismissed
  }
}

export {
  type StepProps
}
