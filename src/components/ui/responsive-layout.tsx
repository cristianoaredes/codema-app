import * as React from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// Hook personalizado para breakpoints
export const useBreakpoint = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
  const isDesktop = useMediaQuery("(min-width: 1025px)")
  const isLarge = useMediaQuery("(min-width: 1280px)")

  return { isMobile, isTablet, isDesktop, isLarge }
}

// Container responsivo
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = "xl"
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  }

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Grid responsivo
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className
}) => {
  const gridClasses = [
    `grid gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(" ")

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

// Componente de navegação mobile
interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  children
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50 md:hidden">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md"
              aria-label="Fechar menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Formulário responsivo
interface ResponsiveFormProps {
  children: React.ReactNode
  className?: string
  layout?: "single" | "double" | "auto"
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  className,
  layout = "auto"
}) => {
  const layoutClasses = {
    single: "space-y-4",
    double: "grid grid-cols-1 md:grid-cols-2 gap-4",
    auto: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
  }

  return (
    <form className={cn(layoutClasses[layout], className)}>
      {children}
    </form>
  )
}

// Tabela responsiva
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  stackOnMobile?: boolean
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
  stackOnMobile = true
}) => {
  const { isMobile } = useBreakpoint()

  if (isMobile && stackOnMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full">
        {children}
      </table>
    </div>
  )
}

// Card responsivo
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
  hover?: boolean
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  padding = "md",
  hover = false
}) => {
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  }

  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-lg border shadow-sm",
      paddingClasses[padding],
      hover && "hover:shadow-md transition-shadow",
      className
    )}>
      {children}
    </div>
  )
}

// Componente para imagens responsivas
interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  fill = false
}) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "object-cover transition-transform hover:scale-105",
          fill ? "absolute inset-0 w-full h-full" : "w-full h-auto"
        )}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
      />
    </div>
  )
}

// Hook para detectar orientação do dispositivo
export const useOrientation = () => {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

// Componente para layout adaptativo baseado no dispositivo
interface AdaptiveLayoutProps {
  children: React.ReactNode
  mobileLayout?: React.ReactNode
  tabletLayout?: React.ReactNode
  desktopLayout?: React.ReactNode
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  mobileLayout,
  tabletLayout,
  desktopLayout
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  if (isMobile && mobileLayout) return <>{mobileLayout}</>
  if (isTablet && tabletLayout) return <>{tabletLayout}</>
  if (isDesktop && desktopLayout) return <>{desktopLayout}</>

  return <>{children}</>
}

export {
  useMediaQuery
}
