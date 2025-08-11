import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, FileText, Users, Building, AlertTriangle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
  status?: string;
  url?: string;
  metadata?: any;
}

interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  module?: string;
}

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedModule, setSelectedModule] = useState('all');

  const searchModules = {
    all: { label: 'Todos', icon: Search },
    reunioes: { label: 'Reuniões', icon: Calendar },
    atas: { label: 'Atas', icon: FileText },
    conselheiros: { label: 'Conselheiros', icon: Users },
    processos: { label: 'Processos', icon: Building },
    denuncias: { label: 'Denúncias', icon: AlertTriangle },
    fma: { label: 'FMA', icon: DollarSign },
  };

  const performSearch = async () => {
    if (!query.trim() && Object.keys(filters).length === 0) return;

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Buscar em Reuniões
      if (selectedModule === 'all' || selectedModule === 'reunioes') {
        const { data: reunioes } = await supabase
          .from('reunioes')
          .select('*')
          .ilike('titulo', `%${query}%`)
          .order('data', { ascending: false })
          .limit(10);

        if (reunioes) {
          searchResults.push(...reunioes.map(r => ({
            id: r.id,
            type: 'reuniao',
            title: r.titulo,
            description: `${r.tipo} - ${r.local}`,
            date: r.data,
            status: r.status,
            url: `/reunioes/${r.id}`
          })));
        }
      }

      // Buscar em Processos
      if (selectedModule === 'all' || selectedModule === 'processos') {
        const { data: processos } = await supabase
          .from('processos')
          .select('*')
          .or(`numero_processo.ilike.%${query}%,interessado.ilike.%${query}%,assunto.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (processos) {
          searchResults.push(...processos.map(p => ({
            id: p.id,
            type: 'processo',
            title: p.numero_processo,
            description: `${p.interessado} - ${p.assunto}`,
            date: p.created_at,
            status: p.status,
            url: `/processos/${p.id}`
          })));
        }
      }

      // Buscar em Conselheiros (usando profiles)
      if (selectedModule === 'all' || selectedModule === 'conselheiros') {
        const { data: conselheiros } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
          .in('role', ['counselor', 'president', 'secretary'])
          .order('full_name')
          .limit(10);

        if (conselheiros) {
          searchResults.push(...conselheiros.map(c => ({
            id: c.id,
            type: 'conselheiro',
            title: c.full_name || c.email,
            description: c.role,
            url: `/conselheiros/${c.id}`
          })));
        }
      }

      // Buscar em Denúncias
      if (selectedModule === 'all' || selectedModule === 'denuncias') {
        const { data: denuncias } = await supabase
          .from('ouvidoria_denuncias')
          .select('*')
          .or(`protocolo.ilike.%${query}%,descricao.ilike.%${query}%,local_ocorrencia.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (denuncias) {
          searchResults.push(...denuncias.map(d => ({
            id: d.id,
            type: 'denuncia',
            title: d.protocolo,
            description: `${d.tipo_denuncia} - ${d.local_ocorrencia}`,
            date: d.created_at,
            status: d.status,
            url: `/ouvidoria/denuncias/${d.id}`
          })));
        }
      }

      // Buscar em FMA - Receitas
      if (selectedModule === 'all' || selectedModule === 'fma') {
        const { data: receitas } = await supabase
          .from('fma_receitas')
          .select('*')
          .or(`origem.ilike.%${query}%,descricao.ilike.%${query}%,numero_documento.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (receitas) {
          searchResults.push(...receitas.map(r => ({
            id: r.id,
            type: 'fma_receita',
            title: `Receita: ${r.origem}`,
            description: r.descricao,
            date: r.data_entrada,
            status: r.status,
            url: '/fma?tab=receitas'
          })));
        }

        // Buscar em FMA - Projetos
        const { data: projetos } = await supabase
          .from('fma_projetos')
          .select('*')
          .or(`titulo.ilike.%${query}%,proponente.ilike.%${query}%,descricao.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (projetos) {
          searchResults.push(...projetos.map(p => ({
            id: p.id,
            type: 'fma_projeto',
            title: p.titulo,
            description: `${p.proponente} - ${p.area_atuacao}`,
            date: p.created_at,
            status: p.status,
            url: '/fma?tab=projetos'
          })));
        }
      }

      // Aplicar filtros adicionais
      let filteredResults = searchResults;

      if (filters.dateFrom) {
        filteredResults = filteredResults.filter(r => 
          r.date && new Date(r.date) >= new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filteredResults = filteredResults.filter(r => 
          r.date && new Date(r.date) <= new Date(filters.dateTo!)
        );
      }

      if (filters.status) {
        filteredResults = filteredResults.filter(r => 
          r.status === filters.status
        );
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 3) {
        performSearch();
      } else if (query.length === 0) {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [query, selectedModule, filters]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reuniao':
        return <Calendar className="h-4 w-4" />;
      case 'processo':
        return <Building className="h-4 w-4" />;
      case 'conselheiro':
        return <Users className="h-4 w-4" />;
      case 'denuncia':
        return <AlertTriangle className="h-4 w-4" />;
      case 'fma_receita':
      case 'fma_projeto':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      reuniao: 'Reunião',
      processo: 'Processo',
      conselheiro: 'Conselheiro',
      denuncia: 'Denúncia',
      fma_receita: 'Receita FMA',
      fma_projeto: 'Projeto FMA',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
      agendada: { label: 'Agendada', variant: 'default' },
      confirmada: { label: 'Confirmada', variant: 'success' },
      em_andamento: { label: 'Em Andamento', variant: 'warning' },
      concluida: { label: 'Concluída', variant: 'success' },
      cancelada: { label: 'Cancelada', variant: 'destructive' },
      em_analise: { label: 'Em Análise', variant: 'warning' },
      aprovado: { label: 'Aprovado', variant: 'success' },
      arquivado: { label: 'Arquivado', variant: 'default' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Busca Avançada</CardTitle>
        <CardDescription>
          Pesquise em todos os módulos do sistema CODEMA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Busca */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite sua busca..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtros por Módulo */}
        <Tabs value={selectedModule} onValueChange={setSelectedModule}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7">
            {Object.entries(searchModules).map(([key, module]) => (
              <TabsTrigger key={key} value={key}>
                <module.icon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{module.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filtros Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            type="date"
            placeholder="Data inicial"
            value={filters.dateFrom || ''}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
          <Input
            type="date"
            placeholder="Data final"
            value={filters.dateTo || ''}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
          <Select
            value={filters.status || ''}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="agendada">Agendada</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-muted-foreground">Buscando...</p>
          </div>
        ) : results.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {results.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => result.url && navigate(result.url)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{getTypeIcon(result.type)}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{result.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                        {result.date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(result.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : query.length >= 3 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum resultado encontrado</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Digite pelo menos 3 caracteres para buscar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;