import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Archive,
  FileSpreadsheet,
  Calendar,
  Tag,
  User,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveService, DocumentMetadata, UploadProgress } from '@/services/archiveService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const uploadSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  tipo_documento: z.enum(['ata', 'resolucao', 'convocacao', 'oficio', 'parecer', 'relatorio', 'lei', 'decreto', 'outro']),
  categoria: z.enum(['historico', 'atual', 'arquivo_morto']),
  data_documento: z.string().min(1, 'Data do documento é obrigatória'),
  tags: z.string().optional(),
  confidencial: z.boolean().default(false),
  autor: z.string().optional(),
  orgao: z.string().optional(),
  reuniao_id: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface FileWithProgress {
  file: File;
  progress: UploadProgress;
  metadata?: Partial<DocumentMetadata>;
  error?: string;
}

interface DocumentUploadProps {
  onUploadComplete?: (documents: DocumentMetadata[]) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // em bytes
  acceptedFileTypes?: string[];
  className?: string;
}

export function DocumentUpload({
  onUploadComplete,
  allowMultiple = true,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ],
  className
}: DocumentUploadProps) {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentMetadata[]>([]);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      categoria: 'atual',
      tipo_documento: 'outro',
      confidencial: false,
      data_documento: new Date().toISOString().split('T')[0],
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Verificar arquivos rejeitados
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast({
              title: "Arquivo muito grande",
              description: `${file.name} excede o limite de ${Math.round(maxFileSize / 1024 / 1024)}MB`,
              variant: "destructive",
            });
          } else if (error.code === 'file-invalid-type') {
            toast({
              title: "Tipo de arquivo não suportado",
              description: `${file.name} não é um tipo de arquivo aceito`,
              variant: "destructive",
            });
          }
        });
      });
    }

    // Verificar limite de arquivos
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive",
      });
      return;
    }

    // Adicionar arquivos aceitos
    const newFiles: FileWithProgress[] = acceptedFiles.map(file => ({
      file,
      progress: {
        progress: 0,
        stage: 'uploading',
        message: 'Preparando upload...'
      }
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [uploadedFiles.length, maxFiles, maxFileSize, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: allowMultiple,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileProgress = (index: number, progress: UploadProgress) => {
    setUploadedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, progress } : item
    ));
  };

  const setFileError = (index: number, error: string) => {
    setUploadedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, error } : item
    ));
  };

  const handleUpload = async (data: UploadFormData) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione pelo menos um arquivo para upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const successfulUploads: DocumentMetadata[] = [];

    try {
      // Upload de cada arquivo
      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileItem = uploadedFiles[i];
        
        if (fileItem.error) continue; // Pular arquivos com erro

        try {
          const metadata: Partial<DocumentMetadata> = {
            titulo: data.titulo + (uploadedFiles.length > 1 ? ` (${i + 1})` : ''),
            descricao: data.descricao,
            tipo_documento: data.tipo_documento,
            categoria: data.categoria,
            data_documento: data.data_documento,
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
            confidencial: data.confidencial,
            origem: {
              autor: data.autor,
              orgao: data.orgao,
              reuniao_id: data.reuniao_id
            },
            created_by: 'current-user' // TODO: pegar do contexto de auth
          };

          const uploadedDoc = await ArchiveService.uploadDocument(
            fileItem.file,
            metadata,
            (progress) => updateFileProgress(i, progress)
          );

          successfulUploads.push(uploadedDoc);

          updateFileProgress(i, {
            progress: 100,
            stage: 'complete',
            message: 'Upload concluído com sucesso!'
          });

        } catch (error) {
          console.error(`Erro no upload do arquivo ${fileItem.file.name}:`, error);
          setFileError(i, error instanceof Error ? error.message : 'Erro no upload');
        }
      }

      if (successfulUploads.length > 0) {
        setUploadedDocuments(successfulUploads);
        onUploadComplete?.(successfulUploads);

        toast({
          title: "Upload concluído",
          description: `${successfulUploads.length} documento(s) enviado(s) com sucesso`,
        });

        // Reset do formulário após sucesso
        form.reset();
        setUploadedFiles([]);
      }

    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro durante o upload dos documentos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('image')) return Image;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('zip') || fileType.includes('archive')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
          <CardDescription>
            Adicione documentos ao arquivo digital do CODEMA. Suporta PDF, Word, Excel, imagens e mais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Solte os arquivos aqui...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Máximo {maxFiles} arquivos, até {Math.round(maxFileSize / 1024 / 1024)}MB cada
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">Word</Badge>
                  <Badge variant="outline">Excel</Badge>
                  <Badge variant="outline">Imagens</Badge>
                  <Badge variant="outline">Texto</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Arquivos */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h4 className="font-medium">Arquivos Selecionados</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((fileItem, index) => {
                    const FileIcon = getFileIcon(fileItem.file.type);
                    const isComplete = fileItem.progress.stage === 'complete';
                    const hasError = !!fileItem.error;

                    return (
                      <motion.div
                        key={`${fileItem.file.name}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg",
                          isComplete && "bg-green-50 dark:bg-green-950 border-green-200",
                          hasError && "bg-red-50 dark:bg-red-950 border-red-200"
                        )}
                      >
                        <FileIcon className={cn(
                          "h-8 w-8 flex-shrink-0",
                          isComplete && "text-green-600",
                          hasError && "text-red-600"
                        )} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{fileItem.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(fileItem.file.size)}
                          </p>
                          
                          {fileItem.progress.progress > 0 && !hasError && (
                            <div className="mt-2 space-y-1">
                              <Progress value={fileItem.progress.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground">
                                {fileItem.progress.message}
                              </p>
                            </div>
                          )}
                          
                          {hasError && (
                            <p className="text-xs text-red-600 mt-1">
                              {fileItem.error}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {hasError && <AlertCircle className="h-5 w-5 text-red-600" />}
                          
                          {!isUploading && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Formulário de Metadados */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Informações do Documento
            </CardTitle>
            <CardDescription>
              Preencha as informações que serão aplicadas aos documentos selecionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Documento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ata da 1ª Reunião Ordinária" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_documento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ata">Ata</SelectItem>
                            <SelectItem value="resolucao">Resolução</SelectItem>
                            <SelectItem value="convocacao">Convocação</SelectItem>
                            <SelectItem value="oficio">Ofício</SelectItem>
                            <SelectItem value="parecer">Parecer</SelectItem>
                            <SelectItem value="relatorio">Relatório</SelectItem>
                            <SelectItem value="lei">Lei</SelectItem>
                            <SelectItem value="decreto">Decreto</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="atual">Atual</SelectItem>
                            <SelectItem value="historico">Histórico</SelectItem>
                            <SelectItem value="arquivo_morto">Arquivo Morto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_documento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data do Documento *
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <Input placeholder="Ex: Secretário do CODEMA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <Input placeholder="Ex: CODEMA Itanhomi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição opcional do documento..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Informações adicionais sobre o documento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: meio ambiente, licenciamento, urbano (separadas por vírgula)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tags separadas por vírgula para facilitar a busca
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          Documento Confidencial
                        </FormLabel>
                        <FormDescription>
                          Marque se o documento contém informações sensíveis ou sigilosas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUploadedFiles([]);
                      form.reset();
                    }}
                    disabled={isUploading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isUploading || uploadedFiles.length === 0}>
                    {isUploading ? "Enviando..." : "Enviar Documentos"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Resultados do Upload */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Documentos Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{doc.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      Protocolo: {doc.protocolo} | Tamanho: {formatFileSize(doc.arquivo_tamanho)}
                    </p>
                  </div>
                  <Badge variant="outline">{doc.tipo_documento}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}