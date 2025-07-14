import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateConselheiro, useUpdateConselheiro } from '@/hooks/useConselheiros';
import { Conselheiro } from '@/types/conselheiro';

const conselheiroSchema = z.object({
  nome_completo: z.string().min(1, 'Nome completo é obrigatório'),
  cpf: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  mandato_inicio: z.string().min(1, 'Data de início do mandato é obrigatória'),
  mandato_fim: z.string().min(1, 'Data de fim do mandato é obrigatória'),
  mandato_numero: z.number().optional(),
  entidade_representada: z.string().min(1, 'Entidade representada é obrigatória'),
  segmento: z.enum(['governo', 'sociedade_civil', 'setor_produtivo']),
  titular: z.boolean().default(true),
  status: z.enum(['ativo', 'inativo', 'licenciado', 'afastado']).optional(),
  observacoes: z.string().optional(),
});

type ConselheiroFormData = z.infer<typeof conselheiroSchema>;

interface ConselheiroFormProps {
  conselheiro?: Conselheiro;
  onSuccess?: () => void;
}

export function ConselheiroForm({ conselheiro, onSuccess }: ConselheiroFormProps) {
  const isEditing = !!conselheiro;
  
  const createConselheiro = useCreateConselheiro();
  const updateConselheiro = useUpdateConselheiro();

  const form = useForm<ConselheiroFormData>({
    resolver: zodResolver(conselheiroSchema),
    defaultValues: {
      nome_completo: conselheiro?.nome_completo || '',
      cpf: conselheiro?.cpf || '',
      email: conselheiro?.email || '',
      telefone: conselheiro?.telefone || '',
      endereco: conselheiro?.endereco || '',
      mandato_inicio: conselheiro?.mandato_inicio.split('T')[0] || '',
      mandato_fim: conselheiro?.mandato_fim.split('T')[0] || '',
      mandato_numero: conselheiro?.mandato_numero || undefined,
      entidade_representada: conselheiro?.entidade_representada || '',
      segmento: conselheiro?.segmento || 'sociedade_civil',
      titular: conselheiro?.titular ?? true,
      status: conselheiro?.status || 'ativo',
      observacoes: conselheiro?.observacoes || '',
    },
  });

  const onSubmit = async (data: ConselheiroFormData) => {
    try {
      if (isEditing) {
        await updateConselheiro.mutateAsync({
          id: conselheiro.id,
          updates: data,
        });
      } else {
        await createConselheiro.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar conselheiro:', error);
    }
  };

  const isLoading = createConselheiro.isPending || updateConselheiro.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome Completo */}
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do conselheiro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CPF */}
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Telefone */}
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Entidade Representada */}
          <FormField
            control={form.control}
            name="entidade_representada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entidade Representada *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da entidade ou órgão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Segmento */}
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
                    <SelectItem value="governo">Governo</SelectItem>
                    <SelectItem value="sociedade_civil">Sociedade Civil</SelectItem>
                    <SelectItem value="setor_produtivo">Setor Produtivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mandato Início */}
          <FormField
            control={form.control}
            name="mandato_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início do Mandato *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mandato Fim */}
          <FormField
            control={form.control}
            name="mandato_fim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim do Mandato *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mandato Número */}
          <FormField
            control={form.control}
            name="mandato_numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Mandato</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 1, 2, 3..."
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Número sequencial do mandato (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status (apenas na edição) */}
          {isEditing && (
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
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="licenciado">Licenciado</SelectItem>
                      <SelectItem value="afastado">Afastado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Endereço */}
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Endereço completo do conselheiro"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Titular */}
        <FormField
          control={form.control}
          name="titular"
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
                  Conselheiro Titular
                </FormLabel>
                <FormDescription>
                  Marque se for conselheiro titular (não suplente)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Observações */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações gerais sobre o conselheiro"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}