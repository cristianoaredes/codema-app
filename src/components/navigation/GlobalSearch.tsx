import * as React from "react";
import { Search, X, Clock, FileText, Calendar, Users, Gavel, DollarSign as _DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: 'report' | 'meeting' | 'minute' | 'resolution' | 'counselor' | 'document';
  title: string;
  description?: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  metadata?: {
    date?: string;
    status?: string;
    priority?: string;
  };
}

interface GlobalSearchProps {
  variant?: 'inline' | 'modal';
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ 
  variant = 'inline', 
  placeholder = "Pesquisar...",
  className 
}: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  
  const navigate = useNavigate();
  const { user: _user, hasCODEMAAccess } = useAuth();

  // Load recent searches from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('codema-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save recent searches
  const addRecentSearch = React.useCallback((search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('codema-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Perform search
  const performSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const results: SearchResult[] = [];

    try {
      // Search reports (public)
      const { data: reports } = await supabase
        .from('reports')
        .select('id, title, description, location, status, priority, created_at')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .limit(5);

      reports?.forEach(report => {
        results.push({
          id: report.id,
          type: 'report',
          title: report.title,
          description: report.description || report.location,
          url: `/relatorios/${report.id}`,
          icon: FileText,
          metadata: {
            date: report.created_at,
            status: report.status,
            priority: report.priority
          }
        });
      });

      // Search CODEMA content if user has access
      if (hasCODEMAAccess) {
        // Search meetings
        const { data: meetings } = await supabase
          .from('reunioes')
          .select('id, titulo, descricao, data_reuniao, status')
          .or(`titulo.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%`)
          .limit(3);

        meetings?.forEach(meeting => {
          results.push({
            id: meeting.id,
            type: 'meeting',
            title: meeting.titulo,
            description: meeting.descricao,
            url: `/reunioes/${meeting.id}`,
            icon: Calendar,
            metadata: {
              date: meeting.data_reuniao,
              status: meeting.status
            }
          });
        });

        // Search minutes
        const { data: minutes } = await supabase
          .from('atas')
          .select('id, titulo, conteudo, data_reuniao, status')
          .or(`titulo.ilike.%${searchQuery}%,conteudo.ilike.%${searchQuery}%`)
          .limit(3);

        minutes?.forEach(minute => {
          results.push({
            id: minute.id,
            type: 'minute',
            title: minute.titulo,
            description: `Ata da reunião de ${new Date(minute.data_reuniao).toLocaleDateString('pt-BR')}`,
            url: `/codema/atas/${minute.id}`,
            icon: FileText,
            metadata: {
              date: minute.data_reuniao,
              status: minute.status
            }
          });
        });

        // Search resolutions
        const { data: resolutions } = await supabase
          .from('resolucoes')
          .select('id, titulo, descricao, status, created_at')
          .or(`titulo.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%`)
          .limit(3);

        resolutions?.forEach(resolution => {
          results.push({
            id: resolution.id,
            type: 'resolution',
            title: resolution.titulo,
            description: resolution.descricao,
            url: `/codema/resolucoes/${resolution.id}`,
            icon: Gavel,
            metadata: {
              date: resolution.created_at,
              status: resolution.status
            }
          });
        });

        // Search counselors (now using profiles table)
        const { data: counselors, error: _counselorsError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
          .ilike('full_name', `%${searchQuery}%`)
          .limit(3);

        counselors?.forEach(counselor => {
          results.push({
            id: counselor.id,
            type: 'counselor',
            title: counselor.full_name,
            description: `Conselheiro - ${counselor.email}`,
            url: `/codema/conselheiros/${counselor.id}`,
            icon: Users,
            metadata: {
              status: 'ativo' // perfis ativos são considerados conselheiros
            }
          });
        });
      }

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }

    setResults(results);
  }, [hasCODEMAAccess]);

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleSelect = (result: SearchResult) => {
    addRecentSearch(query);
    navigate(result.url);
    setOpen(false);
    setQuery("");
  };

  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    
    results.forEach(result => {
      const groupName = {
        'report': 'Relatórios',
        'meeting': 'Reuniões',
        'minute': 'Atas',
        'resolution': 'Resoluções',
        'counselor': 'Conselheiros',
        'document': 'Documentos'
      }[result.type] || 'Outros';

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(result);
    });

    return groups;
  }, [results]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (variant === 'inline') {
    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            className="pl-9 pr-9"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 p-0 -translate-y-1/2"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {open && (query || recentSearches.length > 0) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
            <Command className="rounded-md border-0">
              <CommandList className="max-h-80">
                {!query && recentSearches.length > 0 && (
                  <>
                    <CommandGroup heading="Pesquisas Recentes">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => setQuery(search)}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {search}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {loading && (
                  <div className="py-6 text-center text-sm">
                    Pesquisando...
                  </div>
                )}

                {query && !loading && results.length === 0 && (
                  <CommandEmpty>
                    Nenhum resultado encontrado para "{query}"
                  </CommandEmpty>
                )}

                {Object.entries(groupedResults).map(([groupName, items]) => (
                  <CommandGroup key={groupName} heading={groupName}>
                    {items.map((result) => {
                      const IconComponent = result.icon;
                      return (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-start gap-3 p-3"
                        >
                          <IconComponent className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="font-medium">{result.title}</div>
                            {result.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {result.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {result.metadata?.date && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(result.metadata.date).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                              {result.metadata?.status && (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getStatusColor(result.metadata.status))}
                                >
                                  {result.metadata.status}
                                </Badge>
                              )}
                              {result.metadata?.priority && (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getStatusColor(result.metadata.priority))}
                                >
                                  {result.metadata.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </div>
        )}

        {open && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    );
  }

  // Modal variant (similar to command palette)
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Digite para pesquisar..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Similar content as inline variant */}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

// Quick search trigger for header
export function SearchTrigger({ 
  onClick,
  className 
}: { 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "w-64 justify-start text-sm text-muted-foreground",
        className
      )}
    >
      <Search className="mr-2 h-4 w-4" />
      Pesquisar...
      <kbd className="ml-auto hidden pointer-events-none select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}