import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, FileText, Calendar as _Calendar, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription as _CardDescription, CardHeader, CardTitle as _CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PublicationSystem } from "./PublicationSystem";
import { RevocationSystem } from "./RevocationSystem";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/monitoring";
import { gerarProtocolo as _gerarProtocolo } from "@/utils/generators";

const resolucaoSchema = z.object({
  template_id: z.string().optional(),
  reuniao_id: z.string().optional(),
  titulo: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  ementa: z.string().min(20, "Ementa deve ter pelo menos 20 caracteres"),
  tipo: z.enum(["normativa", "deliberativa", "administrativa"], {
    required_error: "Selecione o tipo de resolução"
  }),
  base_legal: z.string().min(10, "Base legal é obrigatória"),
  disposicoes_finais: z.string().optional(),
});

type ResolucaoFormData = z.infer<typeof resolucaoSchema>;

interface ResolucaoData {
  id?: string;
  numero: string;
  titulo: string;
  conteudo: string;
  status: string;
  data_aprovacao?: string;
  tipo: string;
  considerandos?: Considerando[];
  [key: string]: unknown;
}

interface ResolucaoFormProps {
  resolucao?: ResolucaoData;
  onClose: () => void;
}

interface Considerando {
  id: string;
  texto: string;
}

interface Artigo {
  id: string;
  numero: number;
  texto: string;
  paragrafos: string[];
  incisos: string[];
}

interface ReferenciaLegal {
  id: string;
  tipo: string; // 'lei', 'decreto', 'resolucao', 'portaria'
  numero: string;
  ano: string;
  orgao: string;
  ementa: string;
}

export function ResolucaoForm({ resolucao, onClose }: ResolucaoFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [considerandos, setConsiderandos] = useState<Considerando[]>([]);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [referenciasLegais, setReferenciasLegais] = useState<ReferenciaLegal[]>([]);

  const form = useForm<ResolucaoFormData>({
    resolver: zodResolver(resolucaoSchema),
    defaultValues: {
      tipo: "normativa",
    },
  });

  // Buscar templates disponíveis
  const { data: templates = [] } = useQuery({
    queryKey: ['resolucoes-templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('resolucoes_templates')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });

  // Buscar reuniões para vincular
  const { data: reunioes = [] } = useQuery({
    queryKey: ['reunioes-para-resolucao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('id, titulo, data_reuniao, tipo')
        .order('data_reuniao', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  // Preencher dados se estiver editando
  useEffect(() => {
    if (resolucao) {
      form.reset({
        template_id: resolucao.template_id as string,
        reuniao_id: resolucao.reuniao_id as string,
        titulo: resolucao.titulo as string,
        ementa: resolucao.ementa as string,
        tipo: resolucao.tipo as "normativa" | "deliberativa" | "administrativa",
        base_legal: resolucao.base_legal as string,
        disposicoes_finais: resolucao.disposicoes_finais as string,
      });

      setConsiderandos(resolucao.considerandos || []);
      setArtigos((resolucao.artigos || []) as Artigo[]);
      setReferenciasLegais((resolucao.referencias_legais || []) as ReferenciaLegal[]);
    }
  }, [resolucao, form]);

  const mutation = useMutation({
    mutationFn: async (data: ResolucaoFormData) => {
      const resolucaoData = {
        ...data,
        considerandos,
        artigos,
        referencias_legais: referenciasLegais,
      };

      if (resolucao) {
        const { data: updatedResolucao, error } = await (supabase as any)
          .from('resolucoes')
          .update({
            ...resolucaoData,
            updated_by: profile?.id,
          })
          .eq('id', resolucao.id)
          .select()
          .single();

        if (error) throw error;

        await logAction(
          'update_resolucao',
          'resolucoes',
          resolucao.id,
          { numero: resolucao.numero, versao: (resolucao.versao as number) + 1 }
        );

        return updatedResolucao;
      } else {
        // Gerar número da resolução
        const { data: numero } = await supabase.rpc('generate_document_number', { doc_type: 'resolucao' });
        const protocoloResolucao = `RES-${new Date().getFullYear()}-${numero}`;

        const { data: newResolucao, error } = await (supabase as any)
          .from('resolucoes')
          .insert({
            ...resolucaoData,
            numero,
            protocolo: protocoloResolucao,
            created_by: profile?.id,
          })
          .select()
          .single();

        if (error) throw error;

        await logAction(
          'create_resolucao',
          'resolucoes',
          newResolucao.id,
          { protocolo: protocoloResolucao, titulo: data.titulo }
        );

        return newResolucao;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolucoes'] });
      toast({
        title: "Sucesso",
        description: resolucao ? "Resolução atualizada com sucesso" : "Resolução criada com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar resolução: " + error.message,
        variant: "destructive",
      });
    },
  });

  const adicionarConsiderando = () => {
    const novoConsiderando: Considerando = {
      id: Date.now().toString(),
      texto: '',
    };
    setConsiderandos([...considerandos, novoConsiderando]);
  };

  const removerConsiderando = (id: string) => {
    setConsiderandos(considerandos.filter(c => c.id !== id));
  };

  const atualizarConsiderando = (id: string, texto: string) => {
    setConsiderandos(considerandos.map(c => c.id === id ? { ...c, texto } : c));
  };

  const adicionarArtigo = () => {
    const novoArtigo: Artigo = {
      id: Date.now().toString(),
      numero: artigos.length + 1,
      texto: '',
      paragrafos: [],
      incisos: [],
    };
    setArtigos([...artigos, novoArtigo]);
  };

  const removerArtigo = (id: string) => {
    setArtigos(artigos.filter(a => a.id !== id).map((a, index) => ({ ...a, numero: index + 1 })));
  };

  const atualizarArtigo = (id: string, campo: keyof Artigo, valor: string | number | string[]) => {
    setArtigos(artigos.map(a => a.id === id ? { ...a, [campo]: valor } : a));
  };

  const adicionarParagrafo = (artigoId: string) => {
    setArtigos(artigos.map(a => 
      a.id === artigoId 
        ? { ...a, paragrafos: [...a.paragrafos, ''] }
        : a
    ));
  };

  const adicionarInciso = (artigoId: string) => {
    setArtigos(artigos.map(a => 
      a.id === artigoId 
        ? { ...a, incisos: [...a.incisos, ''] }
        : a
    ));
  };

  const adicionarReferencia = () => {
    const novaReferencia: ReferenciaLegal = {
      id: Date.now().toString(),
      tipo: 'lei',
      numero: '',
      ano: new Date().getFullYear().toString(),
      orgao: '',
      ementa: '',
    };
    setReferenciasLegais([...referenciasLegais, novaReferencia]);
  };

  const removerReferencia = (id: string) => {
    setReferenciasLegais(referenciasLegais.filter(r => r.id !== id));
  };

  const atualizarReferencia = (id: string, campo: keyof ReferenciaLegal, valor: string) => {
    setReferenciasLegais(referenciasLegais.map(r => r.id === id ? { ...r, [campo]: valor } : r));
  };

  const onSubmit = (data: ResolucaoFormData) => {
    if (considerandos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um considerando",
        variant: "destructive",
      });
      return;
    }

    if (artigos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um artigo",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="identificacao" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="identificacao">Identificação</TabsTrigger>
            <TabsTrigger value="considerandos">Considerandos</TabsTrigger>
            <TabsTrigger value="artigos">Artigos</TabsTrigger>
            <TabsTrigger value="referencias">Referências</TabsTrigger>
            {resolucao && <TabsTrigger value="publicacao">Publicação</TabsTrigger>}
            {resolucao && <TabsTrigger value="revogacao">Revogação</TabsTrigger>}
          </TabsList>

          <TabsContent value="identificacao" className="space-y-4">
            {resolucao && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Editando resolução <strong>{resolucao.numero}</strong> - Status: <strong>{resolucao.status}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.titulo || template.nome || 'Template sem nome'}
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
                name="reuniao_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reunião de Origem (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma reunião" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reunioes.map((reuniao) => (
                          <SelectItem key={reuniao.id} value={reuniao.id}>
                            {reuniao.titulo} - {new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR')}
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
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Resolução</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normativa">Normativa</SelectItem>
                        <SelectItem value="deliberativa">Deliberativa</SelectItem>
                        <SelectItem value="administrativa">Administrativa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Resolução</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Dispõe sobre a criação de área de proteção ambiental..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ementa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ementa</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Resumo do que dispõe a resolução..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_legal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Legal</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Lei Federal nº 6.938/81, Lei Municipal nº 123/2020..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disposicoes_finais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disposições Finais (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Disposições transitórias, revogações, vigência..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="considerandos" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Considerandos</h3>
                <p className="text-sm text-muted-foreground">
                  Fundamentos que justificam a resolução (considerando que...)
                </p>
              </div>
              <Button type="button" onClick={adicionarConsiderando}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Considerando
              </Button>
            </div>

            <div className="space-y-4">
              {considerandos.map((considerando, index) => (
                <Card key={considerando.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Considerando {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removerConsiderando(considerando.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={considerando.texto}
                      onChange={(e) => atualizarConsiderando(considerando.id, e.target.value)}
                      placeholder="Considerando que..."
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>
              ))}

              {considerandos.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum considerando adicionado</p>
                  <p className="text-sm text-gray-400">Clique em "Adicionar Considerando" para começar</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artigos" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Artigos</h3>
                <p className="text-sm text-muted-foreground">
                  Dispositivos normativos da resolução
                </p>
              </div>
              <Button type="button" onClick={adicionarArtigo}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Artigo
              </Button>
            </div>

            <div className="space-y-4">
              {artigos.map((artigo) => (
                <Card key={artigo.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Art. {artigo.numero}º</Badge>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarParagrafo(artigo.id)}
                        >
                          + Parágrafo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarInciso(artigo.id)}
                        >
                          + Inciso
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removerArtigo(artigo.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Texto Principal</Label>
                      <Textarea
                        value={artigo.texto}
                        onChange={(e) => atualizarArtigo(artigo.id, 'texto', e.target.value)}
                        placeholder="Texto do artigo..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {artigo.paragrafos.length > 0 && (
                      <div>
                        <Label>Parágrafos</Label>
                        {artigo.paragrafos.map((paragrafo, pIndex) => (
                          <div key={pIndex} className="mt-2">
                            <Textarea
                              value={paragrafo}
                              onChange={(e) => {
                                const novosParagrafos = [...artigo.paragrafos];
                                novosParagrafos[pIndex] = e.target.value;
                                atualizarArtigo(artigo.id, 'paragrafos', novosParagrafos);
                              }}
                              placeholder={`§ ${pIndex + 1}º...`}
                              className="min-h-[60px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {artigo.incisos.length > 0 && (
                      <div>
                        <Label>Incisos</Label>
                        {artigo.incisos.map((inciso, iIndex) => (
                          <div key={iIndex} className="mt-2">
                            <Textarea
                              value={inciso}
                              onChange={(e) => {
                                const novosIncisos = [...artigo.incisos];
                                novosIncisos[iIndex] = e.target.value;
                                atualizarArtigo(artigo.id, 'incisos', novosIncisos);
                              }}
                              placeholder={`${String.fromCharCode(73 + iIndex)} - ...`}
                              className="min-h-[60px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {artigos.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum artigo adicionado</p>
                  <p className="text-sm text-gray-400">Clique em "Adicionar Artigo" para começar</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="referencias" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Referências Legais</h3>
                <p className="text-sm text-muted-foreground">
                  Leis, decretos e normas citadas na resolução
                </p>
              </div>
              <Button type="button" onClick={adicionarReferencia}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Referência
              </Button>
            </div>

            <div className="space-y-4">
              {referenciasLegais.map((referencia) => (
                <Card key={referencia.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <Label>Tipo</Label>
                        <Select 
                          value={referencia.tipo} 
                          onValueChange={(value) => atualizarReferencia(referencia.id, 'tipo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lei">Lei</SelectItem>
                            <SelectItem value="decreto">Decreto</SelectItem>
                            <SelectItem value="resolucao">Resolução</SelectItem>
                            <SelectItem value="portaria">Portaria</SelectItem>
                            <SelectItem value="instrucao_normativa">Instrução Normativa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input
                          value={referencia.numero}
                          onChange={(e) => atualizarReferencia(referencia.id, 'numero', e.target.value)}
                          placeholder="Ex: 6.938"
                        />
                      </div>
                      <div>
                        <Label>Ano</Label>
                        <Input
                          value={referencia.ano}
                          onChange={(e) => atualizarReferencia(referencia.id, 'ano', e.target.value)}
                          placeholder="Ex: 1981"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removerReferencia(referencia.id)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Órgão</Label>
                        <Input
                          value={referencia.orgao}
                          onChange={(e) => atualizarReferencia(referencia.id, 'orgao', e.target.value)}
                          placeholder="Ex: Federal, Municipal"
                        />
                      </div>
                      <div>
                        <Label>Ementa</Label>
                        <Input
                          value={referencia.ementa}
                          onChange={(e) => atualizarReferencia(referencia.id, 'ementa', e.target.value)}
                          placeholder="Resumo da norma"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {referenciasLegais.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhuma referência legal adicionada</p>
                  <p className="text-sm text-gray-400">Adicione as leis e normas que fundamentam esta resolução</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Publicação Tab */}
          {resolucao && (
            <TabsContent value="publicacao">
              <PublicationSystem resolucaoId={resolucao.id} resolucao={resolucao as any} />
            </TabsContent>
          )}

          {/* Revogação Tab */}
          {resolucao && (
            <TabsContent value="revogacao">
              <RevocationSystem resolucaoId={resolucao.id} resolucao={resolucao as any} />
            </TabsContent>
          )}
        </Tabs>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Salvando..." : "Salvar Resolução"}
          </Button>
        </div>
      </form>
    </Form>
  );
}