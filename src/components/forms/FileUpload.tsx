import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number; // em MB
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  acceptedTypes = ".pdf,.docx,.doc", 
  maxSize = 10,
  className = ""
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB.`,
        variant: "destructive"
      });
      return;
    }

    // Validar tipo
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (acceptedTypes && !acceptedTypes.includes(fileExtension)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: `Apenas arquivos ${acceptedTypes} são aceitos.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus("success");
    onFileSelect(file);

    toast({
      title: "Arquivo selecionado",
      description: `${file.name} foi selecionado com sucesso.`,
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={className}>
      {!selectedFile ? (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50 ${
            dragActive ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Arraste um arquivo aqui ou clique para selecionar
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Arquivos aceitos: {acceptedTypes.replace(/\./g, "").toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              Tamanho máximo: {maxSize}MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={acceptedTypes}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {uploadStatus === "success" ? (
                  <CheckCircle className="w-8 h-8 text-primary" />
                ) : (
                  <File className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}