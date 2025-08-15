import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  ExternalLink,
  Eye,
  Info,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
  Shield,
  History,
  Share2,
  Printer,
  Copy,
  CheckCircle,
  AlertCircle,
  File,
  Image,
  Archive,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ArchiveService, DocumentMetadata } from '@/services/archiveService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  document: DocumentMetadata;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (document: DocumentMetadata) => void;
  className?: string;
}

export function DocumentViewer({
  document,
  isOpen,
  onClose,
  onEdit,
  className
}: DocumentViewerProps) {
  const { toast } = useToast();
  const [relatedDocuments, setRelatedDocuments] = useState<DocumentMetadata[]>([]);
  const [documentVersions, setDocumentVersions] = useState<DocumentMetadata[]>([]);
  const [validationStatus, setValidationStatus] = useState<any>(null);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (isOpen && document.id) {
      loadRelatedDocuments();
      loadDocumentVersions();
      validateDocument();
    }
  }, [isOpen, document.id]);

  const loadRelatedDocuments = async () => {
    setIsLoadingRelated(true);
    try {
      const related = await ArchiveService.getRelatedDocuments(document.id, 5);
      setRelatedDocuments(related);
    } catch (error) {
      console.error('Erro ao carregar documentos relacionados:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const loadDocumentVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const versions = await ArchiveService.getDocumentVersions(document.id);
      setDocumentVersions(versions);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const validateDocument = async () => {
    try {
      const validation = await ArchiveService.validateDocument(document.id);
      setValidationStatus(validation);
    } catch (error) {
      console.error('Erro na validação:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.arquivo_url;
    link.download = document.arquivo_nome;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: `Baixando ${document.arquivo_nome}`,
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.titulo,
          text: document.descricao || document.titulo,
          url: document.arquivo_url,
        });
      } else {
        await navigator.clipboard.writeText(document.arquivo_url);
        toast({
          title: "Link copiado",
          description: "Link do documento copiado para a área de transferência",
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(document.arquivo_url);
      toast({
        title: "URL copiada",
        description: "URL do documento copiada para a área de transferência",
      });
    } catch (error) {
      console.error('Erro ao copiar URL:', error);
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return Image;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('zip') || type.includes('archive')) return Archive;
    return File;
  };

  const canPreview = (type: string) => {
    return type.includes('pdf') || type.includes('image') || type.includes('text');
  };

  const getPreviewUrl = () => {
    if (document.arquivo_tipo.includes('pdf')) {
      return `${document.arquivo_url}#toolbar=1&navpanes=1&scrollbar=1`;
    }
    return document.arquivo_url;
  };

  const FileIcon = getFileIcon(document.arquivo_tipo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileIcon className="h-6 w-6" />
            {document.titulo}
          </DialogTitle>
          <DialogDescription>
            Protocolo: {document.protocolo} | Tipo: {document.tipo_documento}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de Ações */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{document.tipo_documento}</Badge>
              <Badge variant={document.categoria === 'atual' ? 'default' : 'secondary'}>
                {document.categoria}
              </Badge>
              {document.confidencial && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Confidencial
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(document)}>
                  Editar
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => window.open(document.arquivo_url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir
              </Button>
            </div>
          </div>

          <Tabs defaultValue="preview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">Visualização</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="versions">Versões</TabsTrigger>
              <TabsTrigger value="related">Relacionados</TabsTrigger>
            </TabsList>

            {/* Aba: Visualização */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Pré-visualização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {canPreview(document.arquivo_tipo) ? (
                    <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                      {document.arquivo_tipo.includes('pdf') ? (
                        <iframe
                          src={getPreviewUrl()}
                          className="w-full h-full"
                          title={document.titulo}
                          onError={() => setPreviewError(true)}
                        />
                      ) : document.arquivo_tipo.includes('image') ? (
                        <img
                          src={document.arquivo_url}
                          alt={document.titulo}
                          className="w-full h-full object-contain"
                          onError={() => setPreviewError(true)}
                        />
                      ) : (
                        <iframe
                          src={document.arquivo_url}
                          className="w-full h-full"
                          title={document.titulo}
                          onError={() => setPreviewError(true)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Pré-visualização não disponível</h3>
                      <p className="text-muted-foreground mb-4">
                        Este tipo de arquivo não suporta pré-visualização no navegador
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Arquivo
                        </Button>
                        <Button variant="outline" onClick={() => window.open(document.arquivo_url, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir em Nova Aba
                        </Button>
                      </div>
                    </div>
                  )}

                  {previewError && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Erro ao carregar a pré-visualização. 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-2"
                          onClick={() => window.open(document.arquivo_url, '_blank')}
                        >
                          Clique aqui para abrir o arquivo diretamente.
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Detalhes */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Título</label>
                        <p className="font-medium">{document.titulo}</p>
                      </div>

                      {document.descricao && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                          <p className="text-sm">{document.descricao}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Protocolo</label>
                          <p className="font-mono text-sm">{document.protocolo}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Versão</label>
                          <p className="text-sm">v{document.versao}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data do Documento
                        </label>
                        <p className="text-sm">{formatDate(document.data_documento)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arquivo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      Informações do Arquivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome Original</label>
                        <p className="font-mono text-sm break-all">{document.arquivo_nome}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tamanho</label>
                          <p className="text-sm">{formatFileSize(document.arquivo_tamanho)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                          <p className="text-sm">{document.arquivo_tipo}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Checksum</label>
                        <p className="font-mono text-xs break-all">{document.checksum}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar URL
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                          <Printer className="h-4 w-4 mr-2" />
                          Imprimir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Origem */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Origem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {document.origem.autor && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Autor</label>
                        <p className="text-sm">{document.origem.autor}</p>
                      </div>
                    )}

                    {document.origem.orgao && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Órgão</label>
                        <p className="text-sm">{document.origem.orgao}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Criado por</label>
                      <p className="text-sm">{document.created_by}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Upload</label>
                      <p className="text-sm">{formatDate(document.data_upload)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags e Classificação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tags e Classificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Período</label>
                      <p className="text-sm">{document.periodo.ano}{document.periodo.mes && `/${document.periodo.mes.toString().padStart(2, '0')}`}</p>
                    </div>

                    {document.tags.length > 0 ? (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {document.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma tag definida</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status de Validação */}
              {validationStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Status de Integridade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      {validationStatus.valid ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Válido
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Problemas Detectados
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Arquivo existe: </span>
                        {validationStatus.file_exists ? '✅' : '❌'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Checksum válido: </span>
                        {validationStatus.checksum_match ? '✅' : '❌'}
                      </div>
                    </div>

                    {validationStatus.issues.length > 0 && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Problemas detectados:</strong>
                          <ul className="list-disc list-inside mt-2">
                            {validationStatus.issues.map((issue: string, index: number) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Aba: Versões */}
            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Versões
                  </CardTitle>
                  <CardDescription>
                    Acompanhe as diferentes versões deste documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingVersions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Carregando versões...</p>
                    </div>
                  ) : documentVersions.length > 1 ? (
                    <div className="space-y-3">
                      {documentVersions.map((version, index) => (
                        <div
                          key={version.id}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg",
                            version.id === document.id && "bg-primary/10 border-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={version.id === document.id ? "default" : "outline"}>
                              v{version.versao}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">
                                {version.id === document.id ? 'Versão Atual' : `Versão ${version.versao}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(version.updated_at || version.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(version.arquivo_tamanho)}
                            </span>
                            {version.id !== document.id && (
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Este documento possui apenas uma versão</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Relacionados */}
            <TabsContent value="related" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Documentos Relacionados
                  </CardTitle>
                  <CardDescription>
                    Documentos similares ou relacionados a este
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRelated ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Carregando documentos relacionados...</p>
                    </div>
                  ) : relatedDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {relatedDocuments.map((relatedDoc) => {
                        const RelatedIcon = getFileIcon(relatedDoc.arquivo_tipo);
                        return (
                          <div
                            key={relatedDoc.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <RelatedIcon className="h-6 w-6 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{relatedDoc.titulo}</p>
                              <p className="text-sm text-muted-foreground">
                                {relatedDoc.tipo_documento} • {formatDate(relatedDoc.data_documento)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{relatedDoc.tipo_documento}</Badge>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum documento relacionado encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}