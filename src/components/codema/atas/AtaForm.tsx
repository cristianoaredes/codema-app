import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCreateAta, useUpdateAta } from '@/hooks/useAtas';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X, FileText, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Ata, AtaStatus } from '@/types/ata';

import { ataSchema } from '@/schemas/ata';

type AtaFormData = z.infer<typeof ataSchema>;

interface AtaFormProps {
  ata?: Ata;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialReuniaoId?: string;
}

const AtaForm: React.FC<AtaFormProps> = ({
  ata,
  onSuccess,
  onCancel,
  initialReuniaoId,
}) => {
  const isEditing = Boolean(ata);
  
  const createMutation = useCreateAta();
  const updateMutation = useUpdateAta();

  const form = useForm<AtaFormData>({
    resolver: zodResolver(ataSchema),
    defaultValues: {
      numero: ata?.numero || '',
      titulo: ata?.titulo || '',
      conteudo: ata?.conteudo || '',
      data_reuniao: ata?.data_reuniao ? new Date(ata.data_reuniao) : new Date(),
      status: ata?.status || 'rascunho',
      reuniao_id: ata?.reuniao_id || initialReuniaoId || '',
    },
  });

  // Buscar reuniões disponíveis para seleção
  const { data: reunioes, isLoading: isLoadingReunioes } = useQuery({
    queryKey: ['reunioes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reunioes')
        .select('id, data, tipo, status')
        .order('data', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusIcon = (status: AtaStatus) => {
    switch (status) {
      case 'rascunho':
        return <FileText className="h-4 w-4" />;
      case 'em_revisao':
        return <Clock className="h-4 w-4" />;
      case 'aprovada':
      case 'publicada':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const onSubmit = async (data: AtaFormData) => {
    try {
      const payload = {
        numero: data.numero,
        titulo: data.titulo,
        conteudo: data.conteudo,
        data_reuniao: data.data_reuniao.toISOString(),
        reuniao_id: data.reuniao_id || null,
      };

      if (isEditing && ata) {
        await updateMutation.mutateAsync({
          id: ata.id,
          updates: {
            ...payload,
            status: data.status as 'pendente' | 'aprovada' | 'rejeitada'
          }
        });
      } else {
        await createMutation.mutateAsync({
          ...payload,
          reuniao_id: payload.reuniao_id || '',
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar ata:', error);
      // Error handling is done by the mutation hooks
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{isEditing ? 'Editar Ata' : 'Nova Ata'}</span>
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informações da ata' 
            : 'Crie uma nova ata de reunião do CODEMA'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Ata *</FormLabel>
                      <FormControl>
                        <Input placeholder="ATA-001/2024" {...field} />
                      </FormControl>
                      <FormDescription>Número sequencial único da ata</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_reuniao"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Reunião *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Selecione a data</span>
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
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ata da Reunião Ordinária - Janeiro 2024"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reuniao_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reunião Associada</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma reunião (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingReunioes ? (
                          <div className="p-2 text-sm text-muted-foreground">Carregando reuniões...</div>
                        ) : reunioes && reunioes.length > 0 ? (
                          reunioes.map((reuniao) => (
                            <SelectItem key={reuniao.id} value={reuniao.id}>
                              {format(new Date(reuniao.data), 'dd/MM/yyyy', { locale: ptBR })} - {reuniao.tipo}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">Nenhuma reunião encontrada</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione a reunião à qual esta ata se refere
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Status</h3>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status da Ata *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rascunho">
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-600">
                              {getStatusIcon('rascunho')}
                            </div>
                            <span>📝 Rascunho</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="em_revisao">
                          <div className="flex items-center space-x-2">
                            <div className="text-yellow-600">
                              {getStatusIcon('em_revisao')}
                            </div>
                            <span>⏳ Em Revisão</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="aprovada">
                          <div className="flex items-center space-x-2">
                            <div className="text-green-600">
                              {getStatusIcon('aprovada')}
                            </div>
                            <span>✅ Aprovada</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="publicada">
                          <div className="flex items-center space-x-2">
                            <div className="text-blue-600">
                              {getStatusIcon('publicada')}
                            </div>
                            <span>🌐 Publicada</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Rascunho: em elaboração | Em Revisão: aguardando aprovação | Aprovada: pronta para publicar | Publicada: disponível publicamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Conteúdo</h3>
              
              <FormField
                control={form.control}
                name="conteudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo da Ata *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="1. ABERTURA\n\nFoi aberta a reunião às 14h00, pelo presidente...\n\n2. PRESENÇA\n\nEstiveram presentes os conselheiros...\n\n3. PAUTA\n\n3.1. Item 1 da pauta...\n\n4. DELIBERAÇÕES\n\n...\n\n5. ENCERRAMENTO\n\nNada mais havendo a tratar, foi encerrada a reunião às 16h30."
                        rows={15}
                        {...field} 
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Digite o conteúdo completo da ata. Use formatação clara com títulos numerados.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {(createMutation.isPending || updateMutation.isPending)
                    ? 'Salvando...' 
                    : isEditing ? 'Atualizar' : 'Criar Ata'}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AtaForm;
