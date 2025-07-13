import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { councillorsApi } from '@/lib/codema/councillors';
import { Councillor } from '@/types/codema';
import { toast } from 'sonner';

export function useCouncillors() {
  return useQuery({
    queryKey: ['councillors'],
    queryFn: councillorsApi.list,
  });
}

export function useCouncillor(id: string) {
  return useQuery({
    queryKey: ['councillor', id],
    queryFn: () => councillorsApi.getById(id),
    enabled: !!id,
  });
}

export function useActiveCouncillors() {
  return useQuery({
    queryKey: ['councillors', 'active'],
    queryFn: councillorsApi.getActiveCouncillors,
  });
}

export function useExpiringMandates(daysAhead: number = 30) {
  return useQuery({
    queryKey: ['councillors', 'expiring', daysAhead],
    queryFn: () => councillorsApi.getExpiringMandates(daysAhead),
  });
}

export function useCreateCouncillor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (councillor: Omit<Councillor, 'id' | 'created_at' | 'updated_at'>) => 
      councillorsApi.create(councillor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['councillors'] });
      toast.success('Conselheiro cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao cadastrar conselheiro: ' + error.message);
    },
  });
}

export function useUpdateCouncillor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, councillor }: { id: string; councillor: Partial<Councillor> }) => 
      councillorsApi.update(id, councillor),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['councillors'] });
      queryClient.invalidateQueries({ queryKey: ['councillor', id] });
      toast.success('Conselheiro atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar conselheiro: ' + error.message);
    },
  });
}

export function useDeleteCouncillor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: councillorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['councillors'] });
      toast.success('Conselheiro removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover conselheiro: ' + error.message);
    },
  });
}