import React from "react"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Container responsivo principal
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-4 py-4 sm:px-6 lg:px-8',
    lg: 'px-6 py-6 sm:px-8 lg:px-12'
  }

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
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
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
  className 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridCols = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(
      "grid",
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Navegação mobile
interface MobileNavigationProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  title?: string
}

export function MobileNavigation({ 
  children, 
  trigger,
  title = "Menu" 
}: MobileNavigationProps) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Formulário responsivo
interface ResponsiveFormProps {
  children: React.ReactNode
  className?: string
  layout?: 'stacked' | 'horizontal'
}

export function ResponsiveForm({ 
  children, 
  className,
  layout = 'stacked' 
}: ResponsiveFormProps) {
  return (
    <form className={cn(
      "space-y-4",
      layout === 'horizontal' && "md:space-y-0 md:space-x-4 md:flex md:items-end",
      className
    )}>
      {children}
    </form>
  )
}

// Card responsivo
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function ResponsiveCard({ 
  children, 
  className,
  padding = 'md',
  hover = false 
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div className={cn(
      "bg-card border rounded-lg shadow-sm",
      paddingClasses[padding],
      hover && "hover:shadow-md transition-shadow",
      className
    )}>
      {children}
    </div>
  )
}

// Tabela responsiva
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border rounded-lg">
          <table className={cn("min-w-full divide-y divide-border", className)}>
            {children}
          </table>
        </div>
      </div>
    </div>
  )
}

// Stack responsivo (vertical em mobile, horizontal em desktop)
interface ResponsiveStackProps {
  children: React.ReactNode
  direction?: 'column' | 'row'
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end'
  breakpoint?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveStack({ 
  children, 
  direction = 'row',
  spacing = 'md',
  align = 'start',
  breakpoint = 'md',
  className 
}: ResponsiveStackProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  }

  const horizontalSpacingClasses = {
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  }

  const breakpointClasses = {
    sm: 'sm:flex-row sm:space-y-0',
    md: 'md:flex-row md:space-y-0',
    lg: 'lg:flex-row lg:space-y-0'
  }

  return (
    <div className={cn(
      "flex flex-col",
      spacingClasses[spacing],
      alignClasses[align],
      direction === 'row' && [
        breakpointClasses[breakpoint],
        `${breakpoint}:${horizontalSpacingClasses[spacing]}`
      ],
      className
    )}>
      {children}
    </div>
  )
}

// Imagem responsiva
interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  loading?: 'lazy' | 'eager'
  sizes?: string
}

export function ResponsiveImage({ 
  src, 
  alt, 
  className,
  aspectRatio = 'auto',
  loading = 'lazy',
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }

  return (
    <div className={cn(
      "relative overflow-hidden",
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        sizes={sizes}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

// Hook para detectar breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('md')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else setBreakpoint('xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

// Hook para detectar se é mobile - usando o hook centralizado
import { useIsMobile } from "@/hooks/use-media-query"

// Componente para ocultar/mostrar baseado no breakpoint
interface ResponsiveShowProps {
  children: React.ReactNode
  above?: 'sm' | 'md' | 'lg' | 'xl'
  below?: 'sm' | 'md' | 'lg' | 'xl'
  only?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveShow({ children, above, below, only }: ResponsiveShowProps) {
  let className = ''

  if (above) {
    const classes = {
      sm: 'hidden sm:block',
      md: 'hidden md:block',
      lg: 'hidden lg:block',
      xl: 'hidden xl:block'
    }
    className = classes[above]
  }

  if (below) {
    const classes = {
      sm: 'sm:hidden',
      md: 'md:hidden',
      lg: 'lg:hidden',
      xl: 'xl:hidden'
    }
    className = classes[below]
  }

  if (only) {
    const classes = {
      sm: 'hidden sm:block md:hidden',
      md: 'hidden md:block lg:hidden',
      lg: 'hidden lg:block xl:hidden',
      xl: 'hidden xl:block'
    }
    className = classes[only]
  }

  return <div className={className}>{children}</div>
}

// Dropdown responsivo (menu em mobile, dropdown em desktop)
interface ResponsiveDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  title?: string
}

export function ResponsiveDropdown({ 
  trigger, 
  children, 
  title = "Opções" 
}: ResponsiveDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto">
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1"
      >
        {trigger}
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-20">
            <div className="py-1">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
