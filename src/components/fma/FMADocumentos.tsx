import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Upload,
  Download,
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  FilePlus,
  FileCheck,
  FileX,
  Trash2,
  Eye,
  Share2,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  FolderOpen,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Info,
  Paperclip,
  ExternalLink,
  Archive,
  Shield,
  HardDrive,
  Cloud,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Documento {
  id?: string;
  projeto_id: string;
  categoria: 'proposta' | 'contrato' | 'nota_fiscal' | 'recibo' | 'relatorio' | 'comprovante' | 'licenca' | 'parecer' | 'ata' | 'outros';
  tipo_arquivo: string;
  nome_arquivo: string;
  descricao?: string;
  url: string;
  tamanho: number;
  hash_arquivo?: string;
  versao?: number;
  status: 'ativo' | 'arquivado' | 'excluido';
  confidencial?: boolean;
  tags?: string[];
  uploaded_by?: string;
  validated_by?: string;
  validation_date?: string;
  expiration_date?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

interface FMADocumentosProps {
  projeto: any;
  canManage?: boolean;
}

const FMADocumentos: React.FC<FMADocumentosProps> = ({ projeto, canManage = false }) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("documentos");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [novoDocumento, setNovoDocumento] = useState<Partial<Documento>>({
    projeto_id: projeto.id,
    categoria: 'proposta',
    status: 'ativo',
    confidencial: false
  });

  useEffect(() => {
    fetchDocumentos();
  }, [projeto.id]);

  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fma_documentos')
        .select('*')
        .eq('projeto_id', projeto.id)
        .neq('status', 'excluido')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo: 10MB');
        return;
      }

      setSelectedFile(file);
      setNovoDocumento({
        ...novoDocumento,
        nome_arquivo: file.name,
        tipo_arquivo: file.type,
        tamanho: file.size
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload para Supabase Storage
      const fileName = `${projeto.id}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fma-documentos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('fma-documentos')
        .getPublicUrl(fileName);

      // Salvar metadados no banco
      const documentoData: Partial<Documento> = {
        ...novoDocumento,
        url: publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { error: dbError } = await supabase
        .from('fma_documentos')
        .insert(documentoData);

      if (dbError) throw dbError;

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success('Documento enviado com sucesso!');
      setShowUploadDialog(false);
      setSelectedFile(null);
      setNovoDocumento({
        projeto_id: projeto.id,
        categoria: 'proposta',
        status: 'ativo',
        confidencial: false
      });
      setUploadProgress(0);
      fetchDocumentos();
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documento: Documento) => {
    try {
      const response = await fetch(documento.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nome_arquivo;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Download iniciado');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const handleValidate = async (documentoId: string) => {
    try {
      const { error } = await supabase
        .from('fma_documentos')
        .update({
          validated_by: (await supabase.auth.getUser()).data.user?.id,
          validation_date: new Date().toISOString()
        })
        .eq('id', documentoId);

      if (error) throw error;
      
      toast.success('Documento validado');
      fetchDocumentos();
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      toast.error('Erro ao validar documento');
    }
  };

  const handleArchive = async (documentoId: string) => {
    try {
      const { error } = await supabase
        .from('fma_documentos')
        .update({ status: 'arquivado' })
        .eq('id', documentoId);

      if (error) throw error;
      
      toast.success('Documento arquivado');
      fetchDocumentos();
    } catch (error) {
      console.error('Erro ao arquivar documento:', error);
      toast.error('Erro ao arquivar documento');
    }
  };

  const handleDelete = async (documentoId: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;

    try {
      const { error } = await supabase
        .from('fma_documentos')
        .update({ status: 'excluido' })
        .eq('id', documentoId);

      if (error) throw error;
      
      toast.success('Documento excluído');
      fetchDocumentos();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const categorias = {
      proposta: 'Proposta',
      contrato: 'Contrato',
      nota_fiscal: 'Nota Fiscal',
      recibo: 'Recibo',
      relatorio: 'Relatório',
      comprovante: 'Comprovante',
      licenca: 'Licença',
      parecer: 'Parecer',
      ata: 'Ata',
      outros: 'Outros'
    };
    return categorias[categoria as keyof typeof categorias] || categoria;
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('pdf')) return FileText;
    if (tipo.includes('image')) return FileImage;
    if (tipo.includes('sheet') || tipo.includes('excel')) return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Filtrar documentos
  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === 'todos' || doc.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Estatísticas
  const totalDocumentos = documentos.length;
  const totalTamanho = documentos.reduce((sum, doc) => sum + doc.tamanho, 0);
  const documentosValidados = documentos.filter(doc => doc.validated_by).length;
  const documentosConfidenciais = documentos.filter(doc => doc.confidencial).length;

  // Agrupar por categoria
  const documentosPorCategoria = documentos.reduce((acc, doc) => {
    acc[doc.categoria] = (acc[doc.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Documentos do Projeto
              </CardTitle>
              <CardDescription>
                Gestão de documentos e anexos do projeto
              </CardDescription>
            </div>
            
            {canManage && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Documento
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Documentos</p>
                <p className="text-2xl font-bold">{totalDocumentos}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Espaço Utilizado</p>
                <p className="text-2xl font-bold">{formatFileSize(totalTamanho)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validados</p>
                <p className="text-2xl font-bold text-green-600">{documentosValidados}</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confidenciais</p>
                <p className="text-2xl font-bold text-orange-600">{documentosConfidenciais}</p>
              </div>
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="validacao">Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Categorias</SelectItem>
                <SelectItem value="proposta">Proposta</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="nota_fiscal">Nota Fiscal</SelectItem>
                <SelectItem value="recibo">Recibo</SelectItem>
                <SelectItem value="relatorio">Relatório</SelectItem>
                <SelectItem value="comprovante">Comprovante</SelectItem>
                <SelectItem value="licenca">Licença</SelectItem>
                <SelectItem value="parecer">Parecer</SelectItem>
                <SelectItem value="ata">Ata</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Documentos */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Enviado em</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocumentos.map((documento) => {
                    const FileIcon = getFileIcon(documento.tipo_arquivo);
                    return (
                      <TableRow key={documento.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{documento.nome_arquivo}</p>
                              {documento.descricao && (
                                <p className="text-sm text-muted-foreground">{documento.descricao}</p>
                              )}
                            </div>
                            {documento.confidencial && (
                              <Lock className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoriaLabel(documento.categoria)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(documento.tamanho)}</TableCell>
                        <TableCell>
                          {format(new Date(documento.created_at!), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {documento.validated_by ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Validado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(documento)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(documento.url, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!documento.validated_by && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleValidate(documento.id!)}
                                >
                                  <FileCheck className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(documento.id!)}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(documento.id!)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredDocumentos.length === 0 && (
                <div className="text-center py-8">
                  <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Nenhum documento encontrado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(documentosPorCategoria).map(([categoria, count]) => (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getCategoriaLabel(categoria)}
                  </CardTitle>
                  <CardDescription>
                    {count} {count === 1 ? 'documento' : 'documentos'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documentos
                      .filter(doc => doc.categoria === categoria)
                      .slice(0, 3)
                      .map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1">{doc.nome_arquivo}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="validacao" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Validação de Documentos</AlertTitle>
            <AlertDescription>
              Documentos validados são considerados oficiais e não podem ser alterados.
              A validação garante a integridade e autenticidade dos documentos.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documentos Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pendentes de Validação</CardTitle>
                <CardDescription>
                  {documentos.filter(d => !d.validated_by).length} documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documentos
                    .filter(d => !d.validated_by)
                    .map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.nome_arquivo}</span>
                        </div>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleValidate(doc.id!)}
                          >
                            <FileCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Documentos Validados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentos Validados</CardTitle>
                <CardDescription>
                  {documentos.filter(d => d.validated_by).length} documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documentos
                    .filter(d => d.validated_by)
                    .map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{doc.nome_arquivo}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {doc.validation_date && format(new Date(doc.validation_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Faça upload de documentos relacionados ao projeto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Categoria</Label>
              <Select
                value={novoDocumento.categoria}
                onValueChange={(value: any) => setNovoDocumento({...novoDocumento, categoria: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="nota_fiscal">Nota Fiscal</SelectItem>
                  <SelectItem value="recibo">Recibo</SelectItem>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                  <SelectItem value="comprovante">Comprovante</SelectItem>
                  <SelectItem value="licenca">Licença</SelectItem>
                  <SelectItem value="parecer">Parecer</SelectItem>
                  <SelectItem value="ata">Ata</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" as="span">
                        Selecionar Arquivo
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                value={novoDocumento.descricao || ''}
                onChange={(e) => setNovoDocumento({...novoDocumento, descricao: e.target.value})}
                placeholder="Descrição do documento"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confidencial"
                checked={novoDocumento.confidencial}
                onChange={(e) => setNovoDocumento({...novoDocumento, confidencial: e.target.checked})}
              />
              <Label htmlFor="confidencial">Documento confidencial</Label>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Enviando...' : 'Enviar Documento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FMADocumentos;