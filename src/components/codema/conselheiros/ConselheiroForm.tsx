import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCreateConselheiro, useUpdateConselheiro } from '@/hooks/useConselheiros';
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conselheiro, ConselheiroCreateInput } from '@/types/conselheiro';

import { conselheiroSchema } from '@/schemas/conselheiro';

type ConselheiroFormData = z.infer<typeof conselheiroSchema>;

interface ConselheiroFormProps {
  conselheiro?: Conselheiro;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ConselheiroForm: React.FC<ConselheiroFormProps> = ({
  conselheiro,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const isEditing = Boolean(conselheiro);
  
  const createMutation = useCreateConselheiro();
  const updateMutation = useUpdateConselheiro();

  const form = useForm<ConselheiroFormData>({
    resolver: zodResolver(conselheiroSchema),
    defaultValues: {
      nome_completo: conselheiro?.nome_completo || '',
      cpf: conselheiro?.cpf || '',
      email: conselheiro?.email || '',
      telefone: conselheiro?.telefone || '',
      endereco: conselheiro?.endereco || '',
      mandato_inicio: conselheiro?.mandato_inicio ? new Date(conselheiro.mandato_inicio) : new Date(),
      mandato_fim: conselheiro?.mandato_fim ? new Date(conselheiro.mandato_fim) : new Date(),
      mandato_numero: conselheiro?.mandato_numero || 1,
      entidade_representada: conselheiro?.entidade_representada || '',
      segmento: conselheiro?.segmento || 'governo',
      titular: conselheiro?.titular ?? true,
      observacoes: conselheiro?.observacoes || '',
    },
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const onSubmit = async (data: ConselheiroFormData) => {
    try {
      const payload: ConselheiroCreateInput = {
        ...data,
        mandato_inicio: data.mandato_inicio.toISOString(),
        mandato_fim: data.mandato_fim.toISOString(),
      };

      if (isEditing && conselheiro) {
        await updateMutation.mutateAsync({
          id: conselheiro.id,
          updates: payload
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar conselheiro:', error);
      // Toast messages are handled by the mutation hooks
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{isEditing ? 'Editar Conselheiro' : 'Novo Conselheiro'}</span>
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Atualize as informações do conselheiro' 
            : 'Cadastre um novo conselheiro do CODEMA'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informações Pessoais</h3>
              
              <FormField
                control={form.control}
                name="nome_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXX.XXX.XXX-XX"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            if (formatted.length <= 14) {
                              field.onChange(formatted);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(XX) XXXXX-XXXX"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatTelefone(e.target.value);
                            if (formatted.length <= 15) {
                              field.onChange(formatted);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Endereço completo"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informações do Mandato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informações do Mandato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="mandato_inicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Início *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="mandato_fim"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Fim *</FormLabel>
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
                              date < new Date()
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
                  name="mandato_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Mandato</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1, 2, 3..."
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Número sequencial do mandato</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Representação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Representação</h3>
              
              <FormField
                control={form.control}
                name="entidade_representada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entidade Representada *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da entidade ou órgão representado"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="segmento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o segmento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="governo">🏛️ Governo</SelectItem>
                          <SelectItem value="sociedade_civil">👥 Sociedade Civil</SelectItem>
                          <SelectItem value="setor_produtivo">🏭 Setor Produtivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="titular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Conselheiro Titular
                        </FormLabel>
                        <FormDescription>
                          Marque se for titular, desmarque se for suplente
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
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre o conselheiro..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    : isEditing ? 'Atualizar' : 'Cadastrar'}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ConselheiroForm;