import React from "react"
import { Search, X, Clock, User, FileText, Calendar, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { useGlobalSearch as _useGlobalSearch } from "@/hooks/useGlobalSearch"

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'conselheiro' | 'reuniao' | 'ata' | 'resolucao' | 'protocolo' | 'page'
  url: string
  metadata?: {
    date?: string
    status?: string
    tags?: string[]
  }
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const navigate = useNavigate()

  // Simular busca (em produção, conectar com API)
  const performSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Dados mockados para demonstração
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'João Silva',
        description: 'Conselheiro - Sociedade Civil',
        type: 'conselheiro',
        url: '/codema/conselheiros/1',
        metadata: {
          status: 'Ativo',
          tags: ['Sociedade Civil', 'Meio Ambiente']
        }
      },
      {
        id: '2',
        title: 'Reunião Ordinária - Janeiro 2025',
        description: 'Discussão sobre licenciamento ambiental',
        type: 'reuniao',
        url: '/codema/reunioes/2',
        metadata: {
          date: '2025-01-15',
          status: 'Agendada'
        }
      },
      {
        id: '3',
        title: 'Resolução 001/2025',
        description: 'Normas para licenciamento de atividades',
        type: 'resolucao',
        url: '/codema/resolucoes/3',
        metadata: {
          date: '2025-01-10',
          status: 'Aprovada'
        }
      },
      {
        id: '4',
        title: 'PROC-001/2025',
        description: 'Protocolo de licenciamento ambiental',
        type: 'protocolo',
        url: '/codema/protocolos/4',
        metadata: {
          date: '2025-01-08',
          status: 'Em análise'
        }
      }
    ]

    // Filtrar resultados baseado na query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(filteredResults)
    setIsLoading(false)
  }, [])

  // Debounce da busca
  React.useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleResultClick = (result: SearchResult) => {
    // Adicionar à lista de buscas recentes
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5)
      localStorage.setItem('codema-recent-searches', JSON.stringify(updated))
      return updated
    })

    navigate(result.url)
    onOpenChange(false)
    setQuery('')
  }

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('codema-recent-searches')
  }

  // Carregar buscas recentes do localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('codema-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'conselheiro':
        return <User className="h-4 w-4" />
      case 'reuniao':
        return <Calendar className="h-4 w-4" />
      case 'ata':
      case 'resolucao':
        return <FileText className="h-4 w-4" />
      case 'protocolo':
        return <Hash className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultTypeLabel = (type: SearchResult['type']) => {
    const labels = {
      conselheiro: 'Conselheiro',
      reuniao: 'Reunião',
      ata: 'Ata',
      resolucao: 'Resolução',
      protocolo: 'Protocolo',
      page: 'Página'
    }
    return labels[type]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Busca Global</DialogTitle>
          <DialogDescription className="sr-only">
            Busque por conselheiros, reuniões, atas, resoluções e protocolos
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conselheiros, reuniões, protocolos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 border-0 border-b rounded-none focus:ring-0 text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-4">
            {!query && recentSearches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Buscas recentes
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((recentQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(recentQuery)}
                      className="flex items-center space-x-2 w-full p-2 text-left rounded-md hover:bg-muted"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{recentQuery}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && (
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="flex items-start space-x-3 w-full p-3 text-left rounded-md hover:bg-muted group"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {result.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {getResultTypeLabel(result.type)}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                          )}
                          {result.metadata && (
                            <div className="flex items-center space-x-2 mt-1">
                              {result.metadata.date && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(result.metadata.date).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                              {result.metadata.status && (
                                <Badge variant="outline" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum resultado encontrado para "{query}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {!query && recentSearches.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Digite para buscar conselheiros, reuniões, protocolos e mais...
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ para navegar</span>
            <span>Enter para selecionar</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



// Componente de trigger para a busca
interface SearchTriggerProps {
  onClick: () => void
  className?: string
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 w-full max-w-sm px-3 py-2",
        "bg-muted/50 hover:bg-muted rounded-md transition-colors",
        "text-sm text-muted-foreground",
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Buscar...</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
