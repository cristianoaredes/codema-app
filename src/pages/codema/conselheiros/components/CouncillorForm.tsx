import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { EntitySelector } from "@/components/codema/councillors/EntitySelector";
import { Councillor } from "@/types/codema";

const councillorSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.enum(['titular', 'suplente']),
  entidade_representada: z.string().min(3, "Entidade é obrigatória"),
  segmento: z.enum(['poder_publico', 'sociedade_civil', 'setor_produtivo', 'instituicao_ensino']),
  especializacao: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  mandato_inicio: z.string(),
  mandato_fim: z.string(),
  ativo: z.boolean().default(true),
  impedimentos: z.array(z.string()).optional(),
  observacoes: z.string().optional(),
});

type CouncillorFormValues = z.infer<typeof councillorSchema>;

interface CouncillorFormProps {
  councillor?: Councillor;
  onSubmit: (values: CouncillorFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CouncillorForm({ councillor, onSubmit, onCancel, isSubmitting }: CouncillorFormProps) {
  const form = useForm<CouncillorFormValues>({
    resolver: zodResolver(councillorSchema),
    defaultValues: councillor ? {
      nome: councillor.nome,
      tipo: councillor.tipo,
      entidade_representada: councillor.entidade_representada,
      segmento: councillor.segmento,
      especializacao: councillor.especializacao || '',
      email: councillor.email,
      telefone: councillor.telefone,
      mandato_inicio: councillor.mandato_inicio.split('T')[0],
      mandato_fim: councillor.mandato_fim.split('T')[0],
      ativo: councillor.ativo,
      impedimentos: councillor.impedimentos || [],
      observacoes: councillor.observacoes || '',
    } : {
      tipo: 'titular',
      segmento: 'poder_publico',
      ativo: true,
      impedimentos: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="João da Silva" {...field} />
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
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="titular">Titular</SelectItem>
                    <SelectItem value="suplente">Suplente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entidade_representada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entidade Representada</FormLabel>
                <FormControl>
                  <Input placeholder="Secretaria de Meio Ambiente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="segmento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segmento</FormLabel>
                <FormControl>
                  <EntitySelector 
                    value={field.value} 
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="conselheiro@email.com" {...field} />
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
                  <Input placeholder="(33) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mandato_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início do Mandato</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mandato_fim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim do Mandato</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="especializacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialização</FormLabel>
              <FormControl>
                <Input placeholder="Engenheiro Ambiental, Biólogo, etc." {...field} />
              </FormControl>
              <FormDescription>
                Área de formação ou expertise do conselheiro
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o conselheiro"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Ativo</FormLabel>
                <FormDescription>
                  Conselheiro está ativo e pode participar das reuniões
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

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : councillor ? 'Atualizar' : 'Cadastrar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}