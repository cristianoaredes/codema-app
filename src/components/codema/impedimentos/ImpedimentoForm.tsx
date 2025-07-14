import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useCreateImpedimento } from '@/hooks/useImpedimentos';
import { ImpedimentoCreateInput } from '@/types/conselheiro';

const impedimentoSchema = z.object({
  conselheiro_id: z.string().min(1, 'Conselheiro é obrigatório'),
  reuniao_id: z.string().optional(),
  processo_id: z.string().optional(),
  tipo_impedimento: z.enum(['interesse_pessoal', 'parentesco', 'interesse_profissional', 'outros']),
  motivo: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres'),
});

type ImpedimentoFormData = z.infer<typeof impedimentoSchema>;

interface ImpedimentoFormProps {
  conselheiro_id?: string;
  reuniao_id?: string;
  processo_id?: string;
  onSuccess?: () => void;
}

export function ImpedimentoForm({ 
  conselheiro_id, 
  reuniao_id, 
  processo_id, 
  onSuccess 
}: ImpedimentoFormProps) {
  const createImpedimento = useCreateImpedimento();

  const form = useForm<ImpedimentoFormData>({
    resolver: zodResolver(impedimentoSchema),
    defaultValues: {
      conselheiro_id: conselheiro_id || '',
      reuniao_id: reuniao_id || '',
      processo_id: processo_id || '',
      tipo_impedimento: 'interesse_pessoal',
      motivo: '',
    },
  });

  const onSubmit = async (data: ImpedimentoFormData) => {
    try {
      await createImpedimento.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao declarar impedimento:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipo_impedimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Impedimento *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de impedimento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="interesse_pessoal">Interesse Pessoal</SelectItem>
                  <SelectItem value="parentesco">Parentesco</SelectItem>
                  <SelectItem value="interesse_profissional">Interesse Profissional</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione o tipo de impedimento que se aplica à situação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo do Impedimento *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva detalhadamente o motivo do impedimento..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Explique claramente por que existe impedimento para participar desta votação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createImpedimento.isPending}>
            {createImpedimento.isPending ? 'Declarando...' : 'Declarar Impedimento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}