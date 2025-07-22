import React from "react"
import { cn } from "@/lib/utils"

// Skip Link para navegação por teclado
interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-primary text-primary-foreground px-4 py-2 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  )
}

// Componente para anúncios de tela (screen reader)
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

export function ScreenReaderOnly({ children, as: Component = "span" }: ScreenReaderOnlyProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  )
}

// Componente para live regions (anúncios dinâmicos)
interface LiveRegionProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  className?: string
}

export function LiveRegion({ 
  children, 
  politeness = 'polite', 
  atomic = false,
  className 
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

// Hook para gerenciar anúncios de tela
export function useScreenReader() {
  const [announcement, setAnnouncement] = React.useState('')
  const [politeness, setPoliteness] = React.useState<'polite' | 'assertive'>('polite')

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(priority)
    setAnnouncement(message)
    
    // Limpar após um tempo para permitir novos anúncios
    setTimeout(() => setAnnouncement(''), 1000)
  }

  const AnnouncementRegion = () => (
    <LiveRegion politeness={politeness}>
      {announcement}
    </LiveRegion>
  )

  return { announce, AnnouncementRegion }
}

// Componente para navegação por teclado aprimorada
interface KeyboardNavigationProps {
  children: React.ReactNode
  onEscape?: () => void
  onEnter?: () => void
  trapFocus?: boolean
  className?: string
}

export function KeyboardNavigation({
  children,
  onEscape,
  onEnter,
  trapFocus = false,
  className
}: KeyboardNavigationProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break
        case 'Enter':
          if (onEnter) {
            event.preventDefault()
            onEnter()
          }
          break
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      
      if (trapFocus) {
        // Implementar trap de foco
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleTabTrap = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault()
                lastElement?.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault()
                firstElement?.focus()
              }
            }
          }
        }

        container.addEventListener('keydown', handleTabTrap)
        
        return () => {
          container.removeEventListener('keydown', handleKeyDown)
          container.removeEventListener('keydown', handleTabTrap)
        }
      }
      
      return () => {
        container.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [onEscape, onEnter, trapFocus])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Componente para melhorar contraste e legibilidade
interface HighContrastProps {
  children: React.ReactNode
  enabled?: boolean
  className?: string
}

export function HighContrast({ children, enabled = false, className }: HighContrastProps) {
  return (
    <div className={cn(
      enabled && [
        "contrast-125 brightness-110",
        "[&_*]:!border-black [&_*]:!text-black",
        "[&_button]:!bg-black [&_button]:!text-white",
        "[&_input]:!border-2 [&_input]:!border-black"
      ],
      className
    )}>
      {children}
    </div>
  )
}

// Hook para preferências de acessibilidade
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = React.useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'normal' as 'small' | 'normal' | 'large',
    screenReader: false
  })

  React.useEffect(() => {
    // Detectar preferências do sistema
    const mediaQueries = {
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
    }

    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        highContrast: mediaQueries.highContrast.matches,
        reducedMotion: mediaQueries.reducedMotion.matches
      }))
    }

    // Verificar preferências iniciais
    updatePreferences()

    // Escutar mudanças
    mediaQueries.highContrast.addEventListener('change', updatePreferences)
    mediaQueries.reducedMotion.addEventListener('change', updatePreferences)

    return () => {
      mediaQueries.highContrast.removeEventListener('change', updatePreferences)
      mediaQueries.reducedMotion.removeEventListener('change', updatePreferences)
    }
  }, [])

  const updatePreference = <K extends keyof typeof preferences>(
    key: K, 
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return { preferences, updatePreference }
}

// Componente para melhorar foco visual
interface FocusRingProps {
  children: React.ReactNode
  className?: string
}

export function FocusRing({ children, className }: FocusRingProps) {
  return (
    <div className={cn(
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      "focus-within:outline-none rounded-md",
      className
    )}>
      {children}
    </div>
  )
}

// Componente para descrições acessíveis
interface AccessibleDescriptionProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function AccessibleDescription({ id, children, className }: AccessibleDescriptionProps) {
  return (
    <div id={id} className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </div>
  )
}

// Hook para gerenciar IDs únicos para acessibilidade
export function useAccessibleId(prefix: string = 'accessible') {
  const id = React.useId()
  return `${prefix}-${id}`
}

// Componente para status de carregamento acessível
interface AccessibleLoadingProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
}

export function AccessibleLoading({ 
  isLoading, 
  loadingText = 'Carregando...', 
  children 
}: AccessibleLoadingProps) {
  return (
    <div aria-busy={isLoading} aria-live="polite">
      {isLoading ? (
        <div>
          <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

// Componente para tabelas acessíveis
interface AccessibleTableProps {
  caption: string
  children: React.ReactNode
  className?: string
}

export function AccessibleTable({ caption, children, className }: AccessibleTableProps) {
  return (
    <table className={cn("w-full", className)} role="table">
      <caption className="sr-only">{caption}</caption>
      {children}
    </table>
  )
}

// Componente para formulários acessíveis
interface AccessibleFormFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function AccessibleFormField({
  label,
  description,
  error,
  required = false,
  children
}: AccessibleFormFieldProps) {
  const labelId = useAccessibleId('label')
  const descriptionId = useAccessibleId('description')
  const errorId = useAccessibleId('error')

  return (
    <div className="space-y-2">
      <label id={labelId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
      </label>
      
      {description && (
        <AccessibleDescription id={descriptionId}>
          {description}
        </AccessibleDescription>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          'aria-labelledby': labelId,
          'aria-describedby': [
            description && descriptionId,
            error && errorId
          ].filter(Boolean).join(' '),
          'aria-invalid': !!error,
          'aria-required': required
        })}
      </div>
      
      {error && (
        <div id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
