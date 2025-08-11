import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbWithActions, SmartBreadcrumb } from "@/components/navigation/SmartBreadcrumb";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const documentoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  tipo: z.enum([
    "ata",
    "resolucao", 
    "parecer",
    "oficio",
    "relatorio",
    "edital",
    "portaria",
    "outros"
  ]),
  status: z.enum(["rascunho", "publicado", "arquivado"]).default("rascunho"),
  palavras_chave: z.string().optional(),
  arquivo: z.any().optional(),
});

type DocumentoFormData = z.infer<typeof documentoSchema>;

export default function NovoDocumento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const form = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      tipo: "outros",
      status: "rascunho",
      palavras_chave: "",
    },
  });

  const uploadFile = async (file: globalThis.File): Promise<{ url: string; path: string } | null> => {
    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `documentos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return { url: publicUrl, path: filePath };
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const onSubmit = async (data: DocumentoFormData) => {
    if (!profile?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let arquivo_url = null;
      let arquivo_nome = null;
      let tamanho_arquivo = null;

      // Upload do arquivo se fornecido
      if (data.arquivo && data.arquivo[0]) {
        const file = data.arquivo[0];
        const uploadResult = await uploadFile(file);
        
        if (uploadResult) {
          arquivo_url = uploadResult.url;
          arquivo_nome = file.name;
          tamanho_arquivo = file.size;
        }
      }

      // Processar palavras-chave
      const palavrasChave = data.palavras_chave
        ? data.palavras_chave.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : null;

      const { error } = await supabase.from("documentos").insert({
        titulo: data.titulo,
        descricao: data.descricao,
        tipo: data.tipo,
        status: data.status,
        palavras_chave: palavrasChave,
        arquivo_url,
        arquivo_nome,
        tamanho_arquivo,
        autor_id: profile.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso!",
      });

      navigate("/documentos");
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty) {
      const confirmLeave = window.confirm(
        "Você tem alterações não salvas. Deseja realmente sair?"
      );
      if (!confirmLeave) return;
    }
    navigate("/documentos");
  };

  const tiposDocumento = [
    { value: "ata", label: "Ata" },
    { value: "resolucao", label: "Resolução" },
    { value: "parecer", label: "Parecer" },
    { value: "oficio", label: "Ofício" },
    { value: "relatorio", label: "Relatório" },
    { value: "edital", label: "Edital" },
    { value: "portaria", label: "Portaria" },
    { value: "outros", label: "Outros" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbWithActions
        title="Novo Documento"
        description="Criar um novo documento do CODEMA"
        actions={
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      >
        <SmartBreadcrumb />
      </BreadcrumbWithActions>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informações do Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Resolução CODEMA nº 001/2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
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
                          {tiposDocumento.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rascunho">Rascunho</SelectItem>
                          <SelectItem value="publicado">Publicado</SelectItem>
                          <SelectItem value="arquivado">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="palavras_chave"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavras-chave</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: meio ambiente, licenciamento, parecer" {...field} />
                      </FormControl>
                      <FormDescription>
                        Separe as palavras-chave por vírgula
                      </FormDescription>
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
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o conteúdo do documento..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Resumo ou descrição do documento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arquivo"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Arquivo do Documento (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 10MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || uploadingFile}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Salvando..." : uploadingFile ? "Enviando arquivo..." : "Criar Documento"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}