import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Search, Filter, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  spacingClasses,
  typographyClasses,
  elevationClasses,
  cardVariants,
  loadingClasses,
  iconSizes,
  animationClasses,
  emptyStateClasses,
  documentTypeStyles,
  statusStyles,
  generateStatusClass,
  generateDocumentTypeClass
} from "@/styles/component-styles";

interface Documento {
  id: string;
  titulo: string;
  tipo: string;
  arquivo_url: string | null;
  arquivo_nome: string | null;
  tamanho_arquivo: number | null;
  status: string;
  palavras_chave: string[] | null;
  created_at: string;
  autor_id: string;
  profiles?: {
    full_name: string;
  };
}

const Documentos = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchDocumentos();
    }
  }, [user]);

  useEffect(() => {
    filterDocumentos();
  }, [documentos, searchTerm, tipoFilter, statusFilter]);

  const fetchDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          profiles(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocumentos = () => {
    let filtered = documentos;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.palavras_chave?.some(palavra => 
          palavra.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtro de tipo
    if (tipoFilter !== "all") {
      filtered = filtered.filter(doc => doc.tipo === tipoFilter);
    }

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocumentos(filtered);
  };

  const getTipoBadgeStyle = (tipo: string) => {
    const styles = documentTypeStyles[tipo as keyof typeof documentTypeStyles] || documentTypeStyles.ata;
    return {
      backgroundColor: styles.background,
      color: styles.color,
      borderColor: styles.border,
    };
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles = statusStyles.document[status as keyof typeof statusStyles.document] || statusStyles.document.arquivado;
    return {
      backgroundColor: styles.background,
      color: styles.color,
      borderColor: styles.border,
    };
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "ata": return "Ata";
      case "agenda": return "Agenda";
      case "processo": return "Processo";
      case "parecer": return "Parecer";
      case "licenca": return "Licença";
      case "resolucao": return "Resolução";
      default: return tipo;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "rascunho": return "Rascunho";
      case "publicado": return "Publicado";
      case "arquivado": return "Arquivado";
      default: return status;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const canManageDocumentos = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);

  if (loading) {
    return (
      <div className={loadingClasses.container}>
        <div className={loadingClasses.content}>
          <div className={`${loadingClasses.text} ${animationClasses.fadeIn}`}>Carregando documentos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${spacingClasses.container.maxWidth} ${spacingClasses.container.padding}`}>
      {/* Header */}
      <div className={`flex justify-between items-center ${spacingClasses.header.marginBottom}`}>
        <div className={spacingClasses.content.gap}>
          <h1 className={typographyClasses.pageTitle}>
            Documentos CODEMA
          </h1>
          <p className={typographyClasses.pageSubtitle}>
            Atas, agendas, processos e documentos do conselho
          </p>
        </div>
        {canManageDocumentos && (
          <Link to="/documentos/novo">
            <Button className={`flex items-center ${spacingClasses.content.itemGap} ${animationClasses.hoverScale}`}>
              <Plus className={iconSizes.sm} />
              Novo Documento
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className={`${cardVariants.filter} ${spacingClasses.card.marginBottom}`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${spacingClasses.content.itemGap} ${typographyClasses.sectionTitle}`}>
            <Filter className={iconSizes.md} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-4 ${spacingClasses.content.gap}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Tipo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ata">Ata</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
                <SelectItem value="processo">Processo</SelectItem>
                <SelectItem value="parecer">Parecer</SelectItem>
                <SelectItem value="licenca">Licença</SelectItem>
                <SelectItem value="resolucao">Resolução</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className={animationClasses.hoverScale}
              onClick={() => {
                setSearchTerm("");
                setTipoFilter("all");
                setStatusFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentos List */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${spacingClasses.section.gap}`}>
        {filteredDocumentos.length > 0 ? (
          filteredDocumentos.map((documento) => (
            <Card key={documento.id} className={`${cardVariants.document} ${animationClasses.fadeIn}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    className={generateDocumentTypeClass(documento.tipo)}
                    style={getTipoBadgeStyle(documento.tipo)}
                  >
                    {getTipoLabel(documento.tipo)}
                  </Badge>
                  <Badge
                    className={generateStatusClass('document', documento.status)}
                    style={getStatusBadgeStyle(documento.status)}
                  >
                    {getStatusLabel(documento.status)}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {documento.titulo}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    {documento.arquivo_nome || "Sem arquivo"}
                    {documento.tamanho_arquivo && (
                      <span className="text-xs">
                        ({formatFileSize(documento.tamanho_arquivo)})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(documento.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  {documento.profiles?.full_name && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Autor:</strong> {documento.profiles.full_name}
                    </div>
                  )}

                  {documento.palavras_chave && documento.palavras_chave.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {documento.palavras_chave.slice(0, 3).map((palavra, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {palavra}
                        </Badge>
                      ))}
                      {documento.palavras_chave.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{documento.palavras_chave.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalhes
                  </Button>
                  {documento.arquivo_url && (
                    <Button size="sm" variant="ghost" className="px-3">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className={cardVariants.default}>
              <CardContent className={emptyStateClasses.container}>
                <FileText className={emptyStateClasses.icon} />
                <h3 className={emptyStateClasses.title}>Nenhum documento encontrado</h3>
                <p className={emptyStateClasses.description}>
                  {searchTerm || tipoFilter !== "all" || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Ainda não há documentos cadastrados no sistema."
                  }
                </p>
                {canManageDocumentos && !searchTerm && tipoFilter === "all" && statusFilter === "all" && (
                  <Link to="/documentos/novo">
                    <Button className={animationClasses.hoverScale}>
                      <Plus className={`${iconSizes.sm} mr-2`} />
                      Criar primeiro documento
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentos;