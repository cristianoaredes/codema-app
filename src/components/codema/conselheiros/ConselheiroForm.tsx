import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Label } from '@/components/ui';
import { Checkbox } from '@/components/ui';
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
import { useCreateConselheiro, useUpdateConselheiro } from '@/hooks';
import { Conselheiro } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, User, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

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
  profile_id: z.string().optional(), // Vincular com usuário
});

type ConselheiroFormData = z.infer<typeof conselheiroSchema>;

interface ConselheiroFormProps {
  conselheiro?: Conselheiro;
  onSuccess?: () => void;
}

export function ConselheiroForm({ conselheiro, onSuccess }: ConselheiroFormProps) {
  const isEditing = !!conselheiro;
  const [linkUserMode, setLinkUserMode] = useState(false);
  
  const createConselheiro = useCreateConselheiro();
  const updateConselheiro = useUpdateConselheiro();

  // Buscar usuários disponíveis para vincular
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['available-users-for-conselheiro'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .not('id', 'in', `(${
          // Subquery para excluir usuários já vinculados
          `SELECT profile_id FROM conselheiros WHERE profile_id IS NOT NULL`
        })`)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !isEditing // Só buscar quando for criação
  });

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
      profile_id: conselheiro?.profile_id || '',
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
        // Garantir que campos obrigatórios estão presentes
        const createData = {
          ...data,
          nome_completo: data.nome_completo!,
          entidade_representada: data.entidade_representada!,
          mandato_inicio: data.mandato_inicio!,
          mandato_fim: data.mandato_fim!,
          segmento: data.segmento!,
          titular: data.titular ?? true,
        };
        await createConselheiro.mutateAsync(createData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar conselheiro:', error);
    }
  };

  const isLoading = createConselheiro.isPending || updateConselheiro.isPending;

  return (
    <div className="space-y-6">
      {/* Informações sobre integração com usuário */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="h-4 w-4" />
              Vinculação com Usuário
            </CardTitle>
            <CardDescription>
              Cada conselheiro pode ser vinculado a um usuário do sistema para acesso personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={linkUserMode ? "default" : "outline"}
                size="sm"
                onClick={() => setLinkUserMode(!linkUserMode)}
              >
                <User className="h-4 w-4 mr-2" />
                {linkUserMode ? "Cancelar Vinculação" : "Vincular a Usuário Existente"}
              </Button>
              
              {!linkUserMode && (
                <Badge variant="secondary" className="text-xs">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Usuário será criado automaticamente se email fornecido
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Vincular usuário existente */}
          {linkUserMode && !isEditing && (
            <FormField
              control={form.control}
              name="profile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário a ser Vinculado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário existente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground">{user.email} • {user.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Vincular a um usuário existente permite acesso direto ao sistema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Grid responsivo - Uma coluna no mobile, duas no desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Nome Completo - span completo */}
            <FormField
              control={form.control}
              name="nome_completo"
              render={({ field }) => (
                <FormItem className="lg:col-span-2">
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do conselheiro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF e Email - lado a lado no desktop */}
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email {!linkUserMode && "*"}</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                  </FormControl>
                  {!linkUserMode && (
                    <FormDescription>
                      Se fornecido, um usuário será criado automaticamente
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone e Entidade */}
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

            {/* Segmento e Número do Mandato */}
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

            {/* Datas do Mandato */}
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

            {/* Status (apenas na edição) */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
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

          {/* Endereço - linha completa */}
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
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Titular - checkbox */}
          <FormField
            control={form.control}
            name="titular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

          {/* Observações - linha completa */}
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
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons - responsivos */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Conselheiro' : 'Cadastrar Conselheiro'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}