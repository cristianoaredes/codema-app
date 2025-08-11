import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, File, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // em MB
  bucket?: string;
  folder?: string;
  allowedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  error?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = '*',
  multiple = false,
  maxSize = 10, // 10MB padrão
  bucket = 'documentos',
  folder = 'uploads',
  allowedTypes = [],
  className
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`;
    }

    // Validar tipo se especificado
    if (allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const uploadFile = async (file: File, index: number) => {
    const error = validateFile(file);
    if (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error } : f
      ));
      return;
    }

    // Atualizar status para uploading
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' } : f
    ));

    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload para Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, progress: percentage } : f
            ));
          }
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Atualizar status para sucesso
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success', url: publicUrl, progress: 100 } : f
      ));

      // Notificar sucesso
      toast.success(`${file.name} enviado com sucesso!`);

    } catch (error) {
      console.error('Erro no upload:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: 'Erro ao enviar arquivo' } : f
      ));
      toast.error(`Erro ao enviar ${file.name}`);
    }
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);

    // Iniciar uploads
    for (let i = 0; i < selectedFiles.length; i++) {
      await uploadFile(selectedFiles[i], multiple ? files.length + i : i);
    }

    // Chamar callback com URLs dos arquivos enviados com sucesso
    if (onUploadComplete) {
      const uploadedUrls = files
        .filter(f => f.status === 'success' && f.url)
        .map(f => f.url!);
      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de Upload */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-900">
          Clique para selecionar ou arraste arquivos aqui
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {allowedTypes.length > 0 
            ? `Tipos permitidos: ${allowedTypes.join(', ')}` 
            : 'Todos os tipos de arquivo'}
          {` • Máximo: ${maxSize}MB`}
        </p>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                        {file.error && (
                          <span className="text-red-500 ml-2">{file.error}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;