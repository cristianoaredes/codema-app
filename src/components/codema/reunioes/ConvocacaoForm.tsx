import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useConselheiros } from '@/hooks';
import { useConvocacaoTemplates, useEnviarConvocacoes } from '@/hooks';
import { Mail, MessageSquare, Users, Send } from 'lucide-react';

const convocacaoSchema = z.object({
  conselheiros_ids: z.array(z.string()).min(1, 'Selecione pelo menos um conselheiro'),
  tipo_envio: z.enum(['email', 'whatsapp', 'ambos']),
  template_id: z.string().optional(),
});

type ConvocacaoFormData = z.infer<typeof convocacaoSchema>;

interface ConvocacaoFormProps {
  reuniao_id: string;
  tipo_reuniao: 'ordinaria' | 'extraordinaria' | 'publica';
  onSuccess?: () => void;
}

export function ConvocacaoForm({ reuniao_id, tipo_reuniao, onSuccess }: ConvocacaoFormProps) {
  const [selectedAll, setSelectedAll] = useState(false);
  
  const { data: conselheiros = [] } = useConselheiros();
  const { data: templates = [] } = useConvocacaoTemplates();
  const enviarConvocacoes = useEnviarConvocacoes();

  const activeConselheiros = conselheiros.filter(c => c.status === 'ativo');
  const relevantTemplates = templates.filter(t => t.tipo_reuniao === tipo_reuniao);

  const form = useForm<ConvocacaoFormData>({
    resolver: zodResolver(convocacaoSchema),
    defaultValues: {
      conselheiros_ids: [],
      tipo_envio: 'email',
      template_id: relevantTemplates[0]?.id || undefined,
    },
  });

  const watchedConselheiros = form.watch('conselheiros_ids');

  const onSubmit = async (data: ConvocacaoFormData) => {
    try {
      await enviarConvocacoes.mutateAsync({
        reuniao_id,
        ...data,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao enviar convocações:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked);
    if (checked) {
      form.setValue('conselheiros_ids', activeConselheiros.map(c => c.id));
    } else {
      form.setValue('conselheiros_ids', []);
    }
  };

  const handleConselheiroChange = (conselheiro_id: string, checked: boolean) => {
    const current = form.getValues('conselheiros_ids');
    if (checked) {
      form.setValue('conselheiros_ids', [...current, conselheiro_id]);
    } else {
      form.setValue('conselheiros_ids', current.filter(id => id !== conselheiro_id));
      setSelectedAll(false);
    }
  };

  const getSegmentoColor = (segmento: string) => {
    switch (segmento) {
      case 'governo': return 'text-blue-600';
      case 'sociedade_civil': return 'text-purple-600';
      case 'setor_produtivo': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getSegmentoLabel = (segmento: string) => {
    switch (segmento) {
      case 'governo': return 'Governo';
      case 'sociedade_civil': return 'Sociedade Civil';
      case 'setor_produtivo': return 'Setor Produtivo';
      default: return segmento;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Selection */}
        {relevantTemplates.length > 0 && (
          <FormField
            control={form.control}
            name="template_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template de Convocação</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {relevantTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Template usado para gerar o conteúdo da convocação
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Send Method */}
        <FormField
          control={form.control}
          name="tipo_envio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Envio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="ambos">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Email + WhatsApp
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conselheiros Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selecionar Conselheiros
            </CardTitle>
            <CardDescription>
              Escolha quais conselheiros receberão a convocação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedAll}
                onCheckedChange={handleSelectAll}
              />
              <label 
                htmlFor="select-all" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecionar todos os conselheiros ativos ({activeConselheiros.length})
              </label>
            </div>

            {/* Individual Conselheiros */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activeConselheiros.map((conselheiro) => (
                <div key={conselheiro.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={conselheiro.id}
                    checked={watchedConselheiros.includes(conselheiro.id)}
                    onCheckedChange={(checked) => 
                      handleConselheiroChange(conselheiro.id, checked as boolean)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor={conselheiro.id}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {conselheiro.nome_completo}
                      </label>
                      <span className={`text-xs ${getSegmentoColor(conselheiro.segmento)}`}>
                        {getSegmentoLabel(conselheiro.segmento)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {conselheiro.entidade_representada}
                    </p>
                    {conselheiro.email && (
                      <p className="text-xs text-gray-500 truncate">
                        📧 {conselheiro.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Summary */}
            <div className="pt-2 border-t text-sm text-gray-600">
              <strong>{watchedConselheiros.length}</strong> conselheiro(s) selecionado(s)
            </div>
          </CardContent>
        </Card>

        <FormMessage>
          {form.formState.errors.conselheiros_ids?.message}
        </FormMessage>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={enviarConvocacoes.isPending || watchedConselheiros.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            {enviarConvocacoes.isPending ? 'Enviando...' : 'Enviar Convocações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}