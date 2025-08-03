import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Save, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AtaReviewSystem } from "./AtaReviewSystem";
import { PdfGenerator } from "./PdfGenerator";
import { VersionControl } from "./VersionControl";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/monitoring";
import { cn } from "@/lib/utils";

const ataSchema = z.object({
  reuniao_id: z.string().min(1, "Selecione uma reunião"),
  template_id: z.string().optional(),
  data_reuniao: z.date({ required_error: "Data da reunião é obrigatória" }),
  hora_inicio: z.string().min(1, "Hora de início é obrigatória"),
  hora_fim: z.string().optional(),
  local_reuniao: z.string().min(1, "Local da reunião é obrigatório"),
  tipo_reuniao: z.enum(["ordinaria", "extraordinaria", "publica"], {
    required_error: "Selecione o tipo de reunião"
  }),
  observacoes: z.string().optional(),
});

type AtaFormData = z.infer<typeof ataSchema>;

interface AtaFormProps {
  ata?: {
    id?: string;
    numero?: string;
    data_reuniao?: string;
    conteudo?: string;
    status?: string;
    [key: string]: unknown;
  };
  onClose: () => void;
}

interface ItemPauta {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
}

interface Presente {
  id: string;
  nome: string;
  cargo: string;
  tipo: 'titular' | 'suplente' | 'convidado';
}

interface Deliberacao {
  id: string;
  item_pauta_id: string;
  decisao: string;
  votos_favor: number;
  votos_contra: number;
  abstencoes: number;
  observacoes: string;
}

export function AtaForm({ ata, onClose }: AtaFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [itensPauta, setItensPauta] = useState<ItemPauta[]>([]);
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [ausentes, setAusentes] = useState<string[]>([]);
  const [deliberacoes, setDeliberacoes] = useState<Deliberacao[]>([]);

  const form = useForm<AtaFormData>({
    resolver: zodResolver(ataSchema),
    defaultValues: {
      data_reuniao: new Date(),
      hora_inicio: "09:00",
      tipo_reuniao: "ordinaria",
    },
  });

  // Buscar reuniões disponíveis
  const { data: reunioes = [] } = useQuery({
    queryKey: ['reunioes-para-ata'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('id, titulo, data_reuniao, tipo, local')
        .order('data_reuniao', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Buscar templates disponíveis
  const { data: templates = [] } = useQuery({
    queryKey: ['atas-templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('atas_templates')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });

  // Buscar conselheiros para lista de presença (agora usando profiles)
  const { data: conselheiros = [] } = useQuery({
    queryKey: ['conselheiros-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
      .eq('is_active', true)
      .order('full_name');

      if (error) throw error;
      
      // Mapear profiles para o formato esperado
      return data.map(profile => ({
        id: profile.id,
        nome: profile.full_name,
        cargo: profile.role === 'conselheiro_titular' ? 'Titular' : 'Suplente',
        tipo: profile.role,
        ativo: profile.is_active
      }));
    },
  });

  // Preencher dados se estiver editando
  useEffect(() => {
    if (ata) {
      form.reset({
        reuniao_id: ata.reuniao_id as string,
        template_id: ata.template_id as string,
        data_reuniao: new Date(ata.data_reuniao as string),
        hora_inicio: ata.hora_inicio as string,
        hora_fim: ata.hora_fim as string,
        local_reuniao: ata.local_reuniao as string,
        tipo_reuniao: ata.tipo_reuniao as "ordinaria" | "extraordinaria" | "publica",
        observacoes: ata.observacoes as string,
      });

      setItensPauta((ata.pauta as ItemPauta[]) || []);
      setPresentes((ata.presentes as Presente[]) || []);
      setAusentes((ata.ausentes as string[]) || []);
      setDeliberacoes((ata.deliberacoes as Deliberacao[]) || []);
    }
  }, [ata, form]);

  const mutation = useMutation({
    mutationFn: async (data: AtaFormData) => {
      const ataData = {
        ...data,
        pauta: itensPauta,
        presentes,
        ausentes,
        deliberacoes,
        data_reuniao: format(data.data_reuniao, 'yyyy-MM-dd'),
      };

      if (ata) {
        // Incrementar versão ao atualizar
        const { data: updatedAta, error } = await (supabase as any)
          .from('atas')
          .update({
            ...ataData,
            versao: (ata.versao as number) + 1,
            updated_by: profile?.id,
          })
          .eq('id', ata.id)
          .select()
          .single();

        if (error) throw error;

        await logAction(
          'update_ata',
          'atas',
          ata.id,
          { numero: ata.numero as string, versao: (ata.versao as number) + 1 }
        );

        return updatedAta;
      } else {
        // Gerar número da ata
        const { data: numero } = await supabase.rpc('generate_document_number', { doc_type: 'ata' });

        const { data: newAta, error } = await (supabase as any)
          .from('atas')
          .insert({
            ...ataData,
            numero,
            created_by: profile?.id,
          })
          .select()
          .single();

        if (error) throw error;

        await logAction(
          'create_ata',
          'atas',
          newAta.id,
          { numero: newAta.numero }
        );

        return newAta;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atas'] });
      toast({
        title: "Sucesso",
        description: ata ? "Ata atualizada com sucesso" : "Ata criada com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar ata: " + error.message,
        variant: "destructive",
      });
    },
  });

  const adicionarItemPauta = () => {
    const novoItem: ItemPauta = {
      id: Date.now().toString(),
      titulo: '',
      descricao: '',
      ordem: itensPauta.length + 1,
    };
    setItensPauta([...itensPauta, novoItem]);
  };

  const removerItemPauta = (id: string) => {
    setItensPauta(itensPauta.filter(item => item.id !== id));
  };

  const atualizarItemPauta = (id: string, campo: keyof ItemPauta, valor: string | number) => {
    setItensPauta(itensPauta.map(item => 
      item.id === id ? { ...item, [campo]: valor } : item
    ));
  };

  const marcarPresenca = (conselheiro: { id: string; nome: string; cargo: string; tipo: string }, presente: boolean) => {
    if (presente) {
      const novoPresente: Presente = {
        id: conselheiro.id,
        nome: conselheiro.nome,
        cargo: conselheiro.cargo,
        tipo: conselheiro.tipo as "titular" | "suplente" | "convidado",
      };
      setPresentes([...presentes.filter(p => p.id !== conselheiro.id), novoPresente]);
      setAusentes(ausentes.filter(id => id !== conselheiro.id));
    } else {
      setAusentes([...ausentes.filter(id => id !== conselheiro.id), conselheiro.id]);
      setPresentes(presentes.filter(p => p.id !== conselheiro.id));
    }
  };

  const onSubmit = (data: AtaFormData) => {
    mutation.mutate(data);
  };

  const canReview = profile?.role && ['conselheiro_titular', 'conselheiro_suplente', 'presidente'].includes(profile.role);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="dados-basicos" className="w-full">
          {/* Mobile: Scrollable horizontal tabs */}
          <div className="block sm:hidden">
            <TabsList className="flex h-auto w-full justify-start overflow-x-auto p-1">
              <TabsTrigger value="dados-basicos" className="flex-shrink-0 text-xs px-3 py-2">
                Básicos
              </TabsTrigger>
              <TabsTrigger value="pauta" className="flex-shrink-0 text-xs px-3 py-2">
                Pauta
              </TabsTrigger>
              <TabsTrigger value="presenca" className="flex-shrink-0 text-xs px-3 py-2">
                Presença
              </TabsTrigger>
              <TabsTrigger value="deliberacoes" className="flex-shrink-0 text-xs px-3 py-2">
                Deliberações
              </TabsTrigger>
              {ata && (
                <TabsTrigger value="revisoes" className="flex-shrink-0 text-xs px-3 py-2">
                  Revisões
                </TabsTrigger>
              )}
              {ata && (
                <TabsTrigger value="pdf" className="flex-shrink-0 text-xs px-3 py-2">
                  PDF
                </TabsTrigger>
              )}
              {ata && (
                <TabsTrigger value="versoes" className="flex-shrink-0 text-xs px-3 py-2">
                  Versões
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout */}
          <div className="hidden sm:block">
            <TabsList className={cn(
              "grid w-full",
              ata ? "grid-cols-7" : "grid-cols-4"
            )}>
              <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
              <TabsTrigger value="pauta">Pauta</TabsTrigger>
              <TabsTrigger value="presenca">Presença</TabsTrigger>
              <TabsTrigger value="deliberacoes">Deliberações</TabsTrigger>
              {ata && <TabsTrigger value="revisoes">Revisões</TabsTrigger>}
              {ata && <TabsTrigger value="pdf">PDF</TabsTrigger>}
              {ata && <TabsTrigger value="versoes">Versões</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="dados-basicos" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reuniao_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reunião</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma reunião" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reunioes.map((reuniao) => (
                          <SelectItem key={reuniao.id} value={reuniao.id}>
                            {reuniao.titulo} - {format(new Date(reuniao.data_reuniao), 'dd/MM/yyyy')}
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
                            {template.nome}
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
                name="data_reuniao"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Reunião</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_reuniao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Reunião</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ordinaria">Ordinária</SelectItem>
                        <SelectItem value="extraordinaria">Extraordinária</SelectItem>
                        <SelectItem value="publica">Audiência Pública</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fim (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="local_reuniao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local da Reunião</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Plenário da Câmara Municipal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações gerais sobre a reunião..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="pauta" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Pauta da Reunião</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione os itens que serão discutidos na reunião
                </p>
              </div>
              <Button type="button" onClick={adicionarItemPauta}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {itensPauta.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removerItemPauta(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Título do Item</Label>
                      <Input
                        value={item.titulo}
                        onChange={(e) => atualizarItemPauta(item.id, 'titulo', e.target.value)}
                        placeholder="Título do item da pauta"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={item.descricao}
                        onChange={(e) => atualizarItemPauta(item.id, 'descricao', e.target.value)}
                        placeholder="Descrição detalhada do item"
                        className="min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {itensPauta.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <ClipboardList className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum item da pauta adicionado</p>
                  <p className="text-sm text-gray-400">Clique em "Adicionar Item" para começar</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="presenca" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Lista de Presença</h3>
              <p className="text-sm text-muted-foreground">
                Marque os conselheiros presentes na reunião
              </p>
            </div>

            <div className="space-y-3">
              {conselheiros.map((conselheiro) => {
                const presente = presentes.some(p => p.id === conselheiro.id);
                const ausente = ausentes.includes(conselheiro.id);

                return (
                  <div key={conselheiro.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                    <div>
                      <p className="font-medium">{conselheiro.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {conselheiro.cargo} - {conselheiro.tipo === 'titular' ? 'Titular' : 'Suplente'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant={presente ? "default" : "outline"}
                        size="sm"
                        onClick={() => marcarPresenca(conselheiro, true)}
                      >
                        Presente
                      </Button>
                      <Button
                        type="button"
                        variant={ausente ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => marcarPresenca(conselheiro, false)}
                      >
                        Ausente
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Resumo de Presença</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{presentes.length}</p>
                  <p className="text-sm text-green-600">Presentes</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-700">{ausentes.length}</p>
                  <p className="text-sm text-red-600">Ausentes</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{conselheiros.length}</p>
                  <p className="text-sm text-blue-600">Total</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deliberacoes" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Deliberações</h3>
              <p className="text-sm text-muted-foreground">
                Registre as decisões tomadas para cada item da pauta
              </p>
            </div>

            {itensPauta.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <ClipboardList className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">Adicione itens da pauta primeiro</p>
                <p className="text-sm text-gray-400">As deliberações são baseadas nos itens da pauta</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itensPauta.map((item) => {
                  const deliberacao = deliberacoes.find(d => d.item_pauta_id === item.id);
                  
                  return (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{item.titulo}</CardTitle>
                        <CardDescription>{item.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Decisão</Label>
                          <Textarea
                            value={deliberacao?.decisao || ''}
                            onChange={(e) => {
                              const novaDeliberacao = {
                                id: deliberacao?.id || Date.now().toString(),
                                item_pauta_id: item.id,
                                decisao: e.target.value,
                                votos_favor: deliberacao?.votos_favor || 0,
                                votos_contra: deliberacao?.votos_contra || 0,
                                abstencoes: deliberacao?.abstencoes || 0,
                                observacoes: deliberacao?.observacoes || '',
                              };
                              
                              setDeliberacoes(prev => 
                                prev.some(d => d.id === novaDeliberacao.id)
                                  ? prev.map(d => d.id === novaDeliberacao.id ? novaDeliberacao : d)
                                  : [...prev, novaDeliberacao]
                              );
                            }}
                            placeholder="Descreva a decisão tomada para este item"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label>Votos a Favor</Label>
                            <Input
                              type="number"
                              min="0"
                              value={deliberacao?.votos_favor || ''}
                              onChange={(e) => {
                                const votos = parseInt(e.target.value) || 0;
                                const novaDeliberacao = {
                                  id: deliberacao?.id || Date.now().toString(),
                                  item_pauta_id: item.id,
                                  decisao: deliberacao?.decisao || '',
                                  votos_favor: votos,
                                  votos_contra: deliberacao?.votos_contra || 0,
                                  abstencoes: deliberacao?.abstencoes || 0,
                                  observacoes: deliberacao?.observacoes || '',
                                };
                                
                                setDeliberacoes(prev => 
                                  prev.some(d => d.id === novaDeliberacao.id)
                                    ? prev.map(d => d.id === novaDeliberacao.id ? novaDeliberacao : d)
                                    : [...prev, novaDeliberacao]
                                );
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label>Votos Contra</Label>
                            <Input
                              type="number"
                              min="0"
                              value={deliberacao?.votos_contra || ''}
                              onChange={(e) => {
                                const votos = parseInt(e.target.value) || 0;
                                const novaDeliberacao = {
                                  id: deliberacao?.id || Date.now().toString(),
                                  item_pauta_id: item.id,
                                  decisao: deliberacao?.decisao || '',
                                  votos_favor: deliberacao?.votos_favor || 0,
                                  votos_contra: votos,
                                  abstencoes: deliberacao?.abstencoes || 0,
                                  observacoes: deliberacao?.observacoes || '',
                                };
                                
                                setDeliberacoes(prev => 
                                  prev.some(d => d.id === novaDeliberacao.id)
                                    ? prev.map(d => d.id === novaDeliberacao.id ? novaDeliberacao : d)
                                    : [...prev, novaDeliberacao]
                                );
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label>Abstenções</Label>
                            <Input
                              type="number"
                              min="0"
                              value={deliberacao?.abstencoes || ''}
                              onChange={(e) => {
                                const abstencoes = parseInt(e.target.value) || 0;
                                const novaDeliberacao = {
                                  id: deliberacao?.id || Date.now().toString(),
                                  item_pauta_id: item.id,
                                  decisao: deliberacao?.decisao || '',
                                  votos_favor: deliberacao?.votos_favor || 0,
                                  votos_contra: deliberacao?.votos_contra || 0,
                                  abstencoes: abstencoes,
                                  observacoes: deliberacao?.observacoes || '',
                                };
                                
                                setDeliberacoes(prev => 
                                  prev.some(d => d.id === novaDeliberacao.id)
                                    ? prev.map(d => d.id === novaDeliberacao.id ? novaDeliberacao : d)
                                    : [...prev, novaDeliberacao]
                                );
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Revisões Tab */}
          {ata && (
            <TabsContent value="revisoes">
              <AtaReviewSystem ataId={ata.id} canReview={canReview} />
            </TabsContent>
          )}

          {/* PDF Tab */}
          {ata && (
            <TabsContent value="pdf">
              <PdfGenerator ata={ata} />
            </TabsContent>
          )}

          {/* Versões Tab */}
          {ata && (
            <TabsContent value="versoes">
              <VersionControl ataId={ata.id as string} currentVersion={ata.versao as number} />
            </TabsContent>
          )}
        </Tabs>

        <Separator />

        {/* Mobile: Sticky bottom actions */}
        <div className="block sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
        
        {/* Desktop: Regular actions */}
        <div className="hidden sm:flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Salvando..." : "Salvar Ata"}
          </Button>
        </div>
        
        {/* Mobile: Bottom spacing for sticky actions */}
        <div className="block sm:hidden h-20"></div>
      </form>
    </Form>
  );
}