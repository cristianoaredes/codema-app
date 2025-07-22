import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, Home, Search, Menu, X } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MenuItem, BreadcrumbItem } from "@/types/navigation"

// Breadcrumbs aprimorado

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  maxItems?: number
}

export const EnhancedBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 5
}) => {
  const displayItems = items.length > maxItems 
    ? [items[0], { label: "...", href: undefined }, ...items.slice(-2)]
    : items

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const Icon = item.icon

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground/50">
                  {separator}
                </span>
              )}
              
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="flex items-center hover:text-foreground transition-colors"
                  aria-current={item.current ? "page" : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </a>
              ) : (
                <span 
                  className={cn(
                    "flex items-center",
                    isLast && "text-foreground font-medium"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Busca global aprimorada
interface GlobalSearchProps {
  placeholder?: string
  onSearch: (query: string) => void
  suggestions?: string[]
  className?: string
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = "Buscar no sistema...",
  onSearch,
  suggestions = [],
  className
}) => {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([])

  React.useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered.slice(0, 5))
      setIsOpen(filtered.length > 0)
    } else {
      setIsOpen(false)
    }
  }, [query, suggestions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setIsOpen(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
          aria-label="Busca global"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
      </form>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50">
          <ul role="listbox" className="py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  role="option"
                  aria-selected={false}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Menu hierárquico otimizado
interface HierarchicalMenuProps {
  items: MenuItem[]
  className?: string
  maxDepth?: number
  onItemClick?: (item: MenuItem) => void
}

export const HierarchicalMenu: React.FC<HierarchicalMenuProps> = ({
  items,
  className,
  maxDepth = 3,
  onItemClick
}) => {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openItems.has(item.id)
    const Icon = item.icon

    return (
      <li key={item.id} className="w-full">
        <div className="flex items-center">
          <button
            onClick={() => {
              if (hasChildren) {
                toggleItem(item.id)
              } else if (onItemClick) {
                onItemClick(item)
              }
            }}
            disabled={item.disabled}
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
              item.disabled && "opacity-50 cursor-not-allowed",
              depth > 0 && "ml-4"
            )}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  "h-4 w-4 ml-2 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            )}
          </button>
        </div>

        {hasChildren && isOpen && depth < maxDepth && (
          <ul className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav className={cn("w-full", className)}>
      <ul className="space-y-1">
        {items.map(item => renderMenuItem(item))}
      </ul>
    </nav>
  )
}

// Navegação mobile aprimorada
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: MenuItem[]
  className?: string
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  className
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

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

  if (!isMobile || !isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-80 max-w-[80vw] bg-background border-r z-50",
        "transform transition-transform duration-300 ease-in-out",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <HierarchicalMenu 
              items={items}
              onItemClick={(item) => {
                if (item.href) {
                  window.location.href = item.href
                }
                onClose()
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}


