import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  User,
  Building,
  Tag,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  File,
  Archive,
  Clock,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveService, DocumentMetadata, SearchFilters } from '@/services/archiveService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const searchSchema = z.object({
  query: z.string().optional(),
  tipo_documento: z.array(z.string()).optional(),
  categoria: z.array(z.string()).optional(),
  periodo_inicio: z.string().optional(),
  periodo_fim: z.string().optional(),
  tags: z.string().optional(),
  autor: z.string().optional(),
  orgao: z.string().optional(),
  confidencial: z.boolean().optional(),
  status: z.array(z.string()).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchResult {
  documents: DocumentMetadata[];
  total: number;
  hasMore: boolean;
}

interface DocumentSearchProps {
  onDocumentSelect?: (document: DocumentMetadata) => void;
  initialFilters?: Partial<SearchFilters>;
  showSelection?: boolean;
  className?: string;
}

export function DocumentSearch({
  onDocumentSelect,
  initialFilters,
  showSelection = false,
  className
}: DocumentSearchProps) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'data_documento' | 'data_upload' | 'titulo'>('data_documento');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: initialFilters?.query || '',
      tipo_documento: initialFilters?.tipo_documento || [],
      categoria: initialFilters?.categoria || [],
      periodo_inicio: initialFilters?.periodo_inicio || '',
      periodo_fim: initialFilters?.periodo_fim || '',
      tags: initialFilters?.tags?.join(', ') || '',
      autor: initialFilters?.autor || '',
      orgao: initialFilters?.orgao || '',
      confidencial: initialFilters?.confidencial,
      status: initialFilters?.status || ['ativo'],
    },
  });

  const performSearch = async (data: SearchFormData, page = 1) => {
    setIsSearching(true);
    setCurrentPage(page);

    try {
      const filters: SearchFilters = {
        query: data.query,
        tipo_documento: data.tipo_documento,
        categoria: data.categoria,
        periodo_inicio: data.periodo_inicio,
        periodo_fim: data.periodo_fim,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : undefined,
        autor: data.autor,
        orgao: data.orgao,
        confidencial: data.confidencial,
        status: data.status,
      };

      const result = await ArchiveService.searchDocuments(filters, page, DEFAULT_PAGE_SIZE);
      setResults(result);

      if (result.total === 0) {
        toast({
          title: "Nenhum documento encontrado",
          description: "Tente ajustar os filtros de busca",
        });
      }

    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar documentos",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (data: SearchFormData) => {
    performSearch(data, 1);
  };

  const handlePageChange = (page: number) => {
    const data = form.getValues();
    performSearch(data, page);
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
  };

  const exportResults = async () => {
    if (!results) return;

    try {
      const filters = form.getValues();
      const searchFilters: SearchFilters = {
        query: filters.query,
        tipo_documento: filters.tipo_documento,
        categoria: filters.categoria,
        periodo_inicio: filters.periodo_inicio,
        periodo_fim: filters.periodo_fim,
        tags: filters.tags ? filters.tags.split(',').map(tag => tag.trim()) : undefined,
        autor: filters.autor,
        orgao: filters.orgao,
        confidencial: filters.confidencial,
        status: filters.status,
      };

      const csvData = await ArchiveService.exportDocumentList(searchFilters, 'csv');
      
      // Download do arquivo CSV
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `documentos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "Lista de documentos exportada com sucesso",
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a lista",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDocumentIcon = (tipo: string) => {
    const icons = {
      ata: FileText,
      resolucao: File,
      convocacao: Calendar,
      oficio: FileText,
      parecer: FileText,
      relatorio: Archive,
      lei: File,
      decreto: File,
      outro: File,
    };
    return icons[tipo as keyof typeof icons] || File;
  };

  const tiposDocumento = [
    { value: 'ata', label: 'Ata' },
    { value: 'resolucao', label: 'Resolução' },
    { value: 'convocacao', label: 'Convocação' },
    { value: 'oficio', label: 'Ofício' },
    { value: 'parecer', label: 'Parecer' },
    { value: 'relatorio', label: 'Relatório' },
    { value: 'lei', label: 'Lei' },
    { value: 'decreto', label: 'Decreto' },
    { value: 'outro', label: 'Outro' },
  ];

  const categorias = [
    { value: 'atual', label: 'Atual' },
    { value: 'historico', label: 'Histórico' },
    { value: 'arquivo_morto', label: 'Arquivo Morto' },
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'arquivado', label: 'Arquivado' },
    { value: 'excluido', label: 'Excluído' },
  ];

  // Busca inicial se há filtros
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      const data = form.getValues();
      performSearch(data, 1);
    }
  const initialFiltersString = React.useMemo(
    () => JSON.stringify(initialFilters ?? {}),
    [initialFilters]
  );
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      const data = form.getValues();
      performSearch(data, 1);
    }
  }, [initialFiltersString]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Formulário de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Documentos
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar documentos no arquivo digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Busca Principal */}
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Buscar por título, descrição ou conteúdo..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Buscar
                </Button>
              </div>

              {/* Filtros Avançados */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros Avançados
                    {isAdvancedOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                    {/* Tipo de Documento */}
                    <FormField
                      control={form.control}
                      name="tipo_documento"
                      render={() => (
                        <FormItem>
                          <FormLabel>Tipo de Documento</FormLabel>
                          <div className="space-y-2">
                            {tiposDocumento.map((tipo) => (
                              <FormField
                                key={tipo.value}
                                control={form.control}
                                name="tipo_documento"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={tipo.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(tipo.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), tipo.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== tipo.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {tipo.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Categoria */}
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={() => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <div className="space-y-2">
                            {categorias.map((categoria) => (
                              <FormField
                                key={categoria.value}
                                control={form.control}
                                name="categoria"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={categoria.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(categoria.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), categoria.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== categoria.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {categoria.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Período */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="periodo_inicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Inicial</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="periodo_fim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Final</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Autor */}
                    <FormField
                      control={form.control}
                      name="autor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Autor
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do autor" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Órgão */}
                    <FormField
                      control={form.control}
                      name="orgao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Órgão
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do órgão" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tags
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Tags separadas por vírgula" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Confidencial */}
                    <FormField
                      control={form.control}
                      name="confidencial"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Apenas documentos confidenciais
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Resultados da Busca
                </CardTitle>
                <CardDescription>
                  {results.total} documento(s) encontrado(s)
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                {showSelection && selectedDocuments.length > 0 && (
                  <Button variant="outline" onClick={clearSelection}>
                    Limpar Seleção ({selectedDocuments.length})
                  </Button>
                )}
                
                <Button variant="outline" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {results.documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum documento encontrado com os filtros aplicados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lista de Documentos */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {results.documents.map((document, index) => {
                      const DocumentIcon = getDocumentIcon(document.tipo_documento);
                      const isSelected = selectedDocuments.includes(document.id);

                      return (
                        <motion.div
                          key={document.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors",
                            isSelected && "bg-primary/10 border-primary"
                          )}
                        >
                          {showSelection && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleDocumentSelection(document.id)}
                              className="mt-1"
                            />
                          )}

                          <DocumentIcon className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-medium truncate">{document.titulo}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {document.descricao || 'Sem descrição'}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline">{document.tipo_documento}</Badge>
                                {document.confidencial && (
                                  <Badge variant="destructive">Confidencial</Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(document.data_documento)}
                              </div>
                              
                              {document.origem.autor && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {document.origem.autor}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <File className="h-4 w-4" />
                                {formatFileSize(document.arquivo_tamanho)}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {document.protocolo}
                              </div>
                            </div>

                            {document.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {document.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {document.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{document.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDocumentSelect?.(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(document.arquivo_url, '_blank')}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir Arquivo
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Paginação */}
                {results.total > 20 && (
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from(
                          { length: Math.ceil(results.total / 20) },
                          (_, i) => i + 1
                        ).slice(
                          Math.max(0, currentPage - 3),
                          Math.min(Math.ceil(results.total / 20), currentPage + 2)
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        {results.hasMore && (
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}