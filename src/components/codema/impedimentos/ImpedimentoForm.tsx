import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Save, X } from 'lucide-react';
import { ImpedimentoConselheiro, ImpedimentoCreateInput } from '@/types/conselheiro';

const impedimentoSchema = z.object({
  conselheiro_id: z.string({
    required_error: 'Conselheiro é obrigatório',
  }),
  reuniao_id: z.string().optional(),
  processo_id: z.string().optional(),
  tipo_impedimento: z.enum(['interesse_pessoal', 'parentesco', 'interesse_profissional', 'outros'], {
    required_error: 'Tipo de impedimento é obrigatório',
  }),
  motivo: z.string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(1000, 'Motivo deve ter no máximo 1000 caracteres'),
  ativo: z.boolean(),
}).refine((data) => data.reuniao_id || data.processo_id, {
  message: 'Deve estar associado a uma reunião ou processo',
  path: ['reuniao_id'],
});

type ImpedimentoFormData = z.infer<typeof impedimentoSchema>;

interface ImpedimentoFormProps {
  impedimento?: ImpedimentoConselheiro;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialConselheiroId?: string;
  initialReuniaoId?: string;
  initialProcessoId?: string;
}

interface ConselheiroOption {
  id: string;
  nome_completo: string;
  entidade_representada: string;
  titular: boolean;
}

interface ReuniaoOption {
  id: string;
  titulo: string;
  data_reuniao: string;
}

interface ProcessoOption {
  id: string;
  titulo: string;
  numero_processo: string;
}

const ImpedimentoForm: React.FC<ImpedimentoFormProps> = ({
  impedimento,
  onSuccess,
  onCancel,
  initialConselheiroId,
  initialReuniaoId,
  initialProcessoId,
}) => {
  const { toast } = useToast();
  const isEditing = Boolean(impedimento);
  const [conselheiros, setConselheiros] = useState<ConselheiroOption[]>([]);
  const [reunioes, setReunioes] = useState<ReuniaoOption[]>([]);
  const [processos, setProcessos] = useState<ProcessoOption[]>([]);

  const form = useForm<ImpedimentoFormData>({
    resolver: zodResolver(impedimentoSchema),
    defaultValues: {
      conselheiro_id: impedimento?.conselheiro_id || initialConselheiroId || '',
      reuniao_id: impedimento?.reuniao_id || initialReuniaoId || '',
      processo_id: impedimento?.processo_id || initialProcessoId || '',
      tipo_impedimento: impedimento?.tipo_impedimento || 'interesse_pessoal',
      motivo: impedimento?.motivo || '',
      ativo: impedimento?.ativo ?? true,
    },
  });

  useEffect(() => {
    const loadConselheiros = async () => {
      const { data, error } = await supabase
        .from('conselheiros')
        .select('id, nome_completo, entidade_representada, titular')
        .eq('status', 'ativo')
        .order('nome_completo');

      if (error) {
        console.error('Erro ao carregar conselheiros:', error);
        return;
      }

      setConselheiros(data || []);
    };

    const loadReunioes = async () => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('id, titulo, data_reuniao')
        .order('data_reuniao', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao carregar reuniões:', error);
        return;
      }

      setReunioes(data || []);
    };

    const loadProcessos = async () => {
      const { data, error } = await supabase
        .from('resolucoes')
        .select('id, titulo, numero_processo')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao carregar processos:', error);
        return;
      }

      setProcessos(data || []);
    };

    loadConselheiros();
    loadReunioes();
    loadProcessos();
  }, []);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'interesse_pessoal':
        return '👤';
      case 'parentesco':
        return '👨‍👩‍👧‍👦';
      case 'interesse_profissional':
        return '💼';
      case 'outros':
        return '❓';
      default:
        return '⚠️';
    }
  };

  const onSubmit = async (data: ImpedimentoFormData) => {
    try {
      const payload: ImpedimentoCreateInput = {
        conselheiro_id: data.conselheiro_id,
        reuniao_id: data.reuniao_id || undefined,
        processo_id: data.processo_id || undefined,
        tipo_impedimento: data.tipo_impedimento,
        motivo: data.motivo,
      };

      let error;
      
      if (isEditing) {
        ({ error } = await supabase
          .from('impedimentos_conselheiro')
          .update({
            ...payload,
            ativo: data.ativo,
          })
          .eq('id', impedimento!.id));
      } else {
        ({ error } = await supabase
          .from('impedimentos_conselheiro')
          .insert([{
            ...payload,
            declarado_em: new Date().toISOString(),
            ativo: data.ativo,
          }]));
      }

      if (error) throw error;

      toast({
        title: isEditing ? 'Impedimento atualizado' : 'Impedimento registrado',
        description: isEditing 
          ? 'O impedimento foi atualizado com sucesso.' 
          : 'O impedimento foi registrado com sucesso.',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar impedimento:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o impedimento. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span>{isEditing ? 'Editar Impedimento' : 'Declarar Impedimento'}</span>
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informações do impedimento'
            : 'Registre um impedimento para participação em reunião ou votação'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identificação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Identificação</h3>
              
              <FormField
                control={form.control}
                name="conselheiro_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conselheiro *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o conselheiro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conselheiros.map((conselheiro) => (
                          <SelectItem key={conselheiro.id} value={conselheiro.id}>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {conselheiro.titular ? '📝' : '🗋'}
                              </span>
                              <div>
                                <div className="font-medium">{conselheiro.nome_completo}</div>
                                <div className="text-xs text-muted-foreground">
                                  {conselheiro.entidade_representada}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contexto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contexto do Impedimento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reuniao_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reunião</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a reunião (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reunioes.map((reuniao) => (
                            <SelectItem key={reuniao.id} value={reuniao.id}>
                              <div>
                                <div className="font-medium">{reuniao.titulo}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
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
                  name="processo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o processo (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {processos.map((processo) => (
                            <SelectItem key={processo.id} value={processo.id}>
                              <div>
                                <div className="font-medium">{processo.numero_processo}</div>
                                <div className="text-xs text-muted-foreground">
                                  {processo.titulo}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tipo de Impedimento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tipo de Impedimento</h3>
              
              <FormField
                control={form.control}
                name="tipo_impedimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de impedimento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="interesse_pessoal">
                          <div className="flex items-center space-x-2">
                            <span>{getTipoIcon('interesse_pessoal')}</span>
                            <div>
                              <div className="font-medium">Interesse Pessoal</div>
                              <div className="text-xs text-muted-foreground">
                                Interesse direto na matéria
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="parentesco">
                          <div className="flex items-center space-x-2">
                            <span>{getTipoIcon('parentesco')}</span>
                            <div>
                              <div className="font-medium">Parentesco</div>
                              <div className="text-xs text-muted-foreground">
                                Relação familiar com interessado
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="interesse_profissional">
                          <div className="flex items-center space-x-2">
                            <span>{getTipoIcon('interesse_profissional')}</span>
                            <div>
                              <div className="font-medium">Interesse Profissional</div>
                              <div className="text-xs text-muted-foreground">
                                Interesse profissional na decisão
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="outros">
                          <div className="flex items-center space-x-2">
                            <span>{getTipoIcon('outros')}</span>
                            <div>
                              <div className="font-medium">Outros</div>
                              <div className="text-xs text-muted-foreground">
                                Outro tipo de impedimento
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva detalhadamente o motivo do impedimento...\n\nEx: Possuo interesse pessoal direto no processo em questão, pois sou proprietário de imóvel na área de influência do projeto."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Explique claramente o motivo que gera o impedimento para participação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            {isEditing && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Status</h3>
                
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Impedimento Ativo
                        </FormLabel>
                        <FormDescription>
                          Desmarque se o impedimento não se aplica mais
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </Button>
              
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {form.formState.isSubmitting 
                    ? 'Salvando...' 
                    : isEditing ? 'Atualizar' : 'Declarar Impedimento'}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ImpedimentoForm;
