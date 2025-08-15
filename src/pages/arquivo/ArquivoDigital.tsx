import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Archive,
  Upload,
  Search,
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  Database,
  Folder,
  Clock,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentUpload } from '@/components/arquivo/DocumentUpload';
import { DocumentSearch } from '@/components/arquivo/DocumentSearch';
import { DocumentViewer } from '@/components/arquivo/DocumentViewer';
import { BreadcrumbWithActions, SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { ArchiveService, DocumentMetadata, DocumentStats } from '@/services/archiveService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function ArquivoDigital() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'busca');
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [archiveStats, setArchiveStats] = useState<DocumentStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    loadArchiveStats();
  }, []);

  useEffect(() => {
    if (activeTab !== searchParams.get('tab')) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  const loadArchiveStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await ArchiveService.getArchiveStats();
      setArchiveStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível obter as estatísticas do arquivo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDocumentSelect = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleUploadComplete = (documents: DocumentMetadata[]) => {
    toast({
      title: "Upload concluído",
      description: `${documents.length} documento(s) adicionado(s) ao arquivo`,
    });
    
    // Recarregar estatísticas
    loadArchiveStats();
    
    // Mudar para aba de busca se houver documentos
    if (documents.length > 0) {
      setActiveTab('busca');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const canUpload = profile?.role === 'admin' || profile?.role === 'secretario' || profile?.role === 'presidente';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <BreadcrumbWithActions
          title="Arquivo Digital"
          description="Sistema de gestão de documentos históricos do CODEMA"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadArchiveStats}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Atualizar Estatísticas
              </Button>
              {canUpload && (
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Novo Documento
                </Button>
              )}
            </div>
          }
        >
          <SmartBreadcrumb />
        </BreadcrumbWithActions>
      </motion.div>

      {/* Estatísticas do Arquivo */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Visão Geral do Arquivo
            </CardTitle>
            <CardDescription>
              Estatísticas e informações gerais sobre o arquivo digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : archiveStats ? (
              <div className="space-y-6">
                {/* Métricas Principais */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Archive className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">{archiveStats.total_documentos}</p>
                          <p className="text-xs text-muted-foreground">Total de Documentos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{formatFileSize(archiveStats.tamanho_total)}</p>
                          <p className="text-xs text-muted-foreground">Tamanho Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">{Object.keys(archiveStats.por_tipo).length}</p>
                          <p className="text-xs text-muted-foreground">Tipos de Documento</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-2xl font-bold">{Object.keys(archiveStats.por_ano).length}</p>
                          <p className="text-xs text-muted-foreground">Anos Cobertos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Distribuição por Tipo e Categoria */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(archiveStats.por_tipo)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 6)
                          .map(([tipo, count]) => (
                            <div key={tipo} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{tipo}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{count}</Badge>
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ 
                                      width: `${(count / archiveStats.total_documentos) * 100}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(archiveStats.por_categoria).map(([categoria, count]) => (
                          <div key={categoria} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{categoria}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{count}</Badge>
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ 
                                    width: `${(count / archiveStats.total_documentos) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Últimos Uploads */}
                {archiveStats.ultimos_uploads.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Últimos Documentos Adicionados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {archiveStats.ultimos_uploads.slice(0, 5).map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleDocumentSelect(doc)}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{doc.titulo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(doc.data_upload)} • {formatFileSize(doc.arquivo_tamanho)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{doc.tipo_documento}</Badge>
                              {doc.confidencial && (
                                <Badge variant="destructive" className="text-xs">
                                  <Shield className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Não foi possível carregar as estatísticas do arquivo. Tente novamente.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Funcionalidades Principais */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="busca" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Documentos
            </TabsTrigger>
            {canUpload && (
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload de Documentos
              </TabsTrigger>
            )}
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Aba: Busca */}
          <TabsContent value="busca" className="space-y-6">
            <DocumentSearch
              onDocumentSelect={handleDocumentSelect}
              showSelection={false}
            />
          </TabsContent>

          {/* Aba: Upload */}
          {canUpload && (
            <TabsContent value="upload" className="space-y-6">
              <DocumentUpload
                onUploadComplete={handleUploadComplete}
                allowMultiple={true}
                maxFiles={10}
                maxFileSize={50 * 1024 * 1024} // 50MB
              />
            </TabsContent>
          )}

          {/* Aba: Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Relatórios e Análises
                </CardTitle>
                <CardDescription>
                  Análises detalhadas sobre o arquivo digital e uso do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos por Ano</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {archiveStats ? (
                        <div className="space-y-2">
                          {Object.entries(archiveStats.por_ano)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .map(([ano, count]) => (
                              <div key={ano} className="flex items-center justify-between">
                                <span className="text-sm">{ano}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{count}</Badge>
                                  <div className="w-20 bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${(count / archiveStats.total_documentos) * 100}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Carregando dados...</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ações Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Lista Completa (CSV)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Relatório de Atividade
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verificar Integridade
                      </Button>
                      {(profile?.role === 'admin' || profile?.role === 'presidente') && (
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações do Arquivo
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Alert className="mt-6">
                  <Archive className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Backup automático:</strong> O sistema realiza backup automático de todos os documentos. 
                    Os documentos são armazenados com redundância para garantir a preservação do arquivo histórico.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Visualizador de Documentos */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }}
          onEdit={(doc) => {
            // TODO: Implementar edição de metadados
            toast({
              title: "Funcionalidade em desenvolvimento",
              description: "A edição de metadados será implementada em breve",
            });
          }}
        />
      )}

      {/* Informações de Acesso */}
      {!canUpload && (
        <motion.div variants={itemVariants}>
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Você tem acesso somente leitura ao arquivo digital. Para fazer upload de documentos, 
              entre em contato com um administrador ou secretário do CODEMA.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </motion.div>
  );
}