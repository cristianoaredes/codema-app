import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Processo {
  id: string;
  numero_processo: string;
  tipo_processo: string;
  requerente: string;
  cpf_cnpj?: string;
  endereco_empreendimento?: string;
  descricao_atividade: string;
  status: string;
  prioridade: string;
  relator_id?: string;
  parecer_tecnico?: string;
  parecer_relator?: string;
  data_protocolo: string;
  prazo_parecer?: string;
  data_votacao?: string;
  resultado_votacao?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseProcessosReturn {
  processos: Processo[];
  loading: boolean;
  error: Error | null;
  fetchProcessos: () => Promise<void>;
  createProcesso: (processo: Partial<Processo>) => Promise<{ data?: Processo; error?: any }>;
  updateProcesso: (id: string, updates: Partial<Processo>) => Promise<{ data?: Processo; error?: any }>;
  deleteProcesso: (id: string) => Promise<{ error?: any }>;
}

// Helper function to check if table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    return error?.code !== '42P01'; // 42P01 = table does not exist
  } catch (error) {
    console.warn(`Table existence check failed for ${tableName}:`, error);
    return false;
  }
}

// Helper function to handle database errors
function handleDatabaseError(error: any, context: string): string {
  console.error(`Database error in ${context}:`, error);
  
  if (error?.code === '42P01') {
    return 'Tabela de processos ainda não foi criada no banco de dados';
  }
  if (error?.code === '23505') {
    return 'Já existe um processo com este número';
  }
  if (error?.code === '23503') {
    return 'Erro de referência: verifique se o relator existe';
  }
  
  return error?.message || 'Erro desconhecido ao acessar processos';
}

export function useProcessos(): UseProcessosReturn {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchProcessos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if table exists first
      const tableExists = await checkTableExists('processos');
      
      if (!tableExists) {
        console.warn('Processos table does not exist yet');
        setProcessos([]);
        return;
      }

      // Simplified query without join
      const { data, error: fetchError } = await supabase
        .from('processos')
        .select('*')
        .order('data_protocolo', { ascending: false });

      if (fetchError) {
        const errorMessage = handleDatabaseError(fetchError, 'fetchProcessos');
        setError(new Error(errorMessage));
        
        // Only show toast for non-table-missing errors
        if (fetchError.code !== '42P01') {
          toast({
            title: 'Erro ao carregar processos',
            description: errorMessage,
            variant: 'destructive'
          });
        }
        return;
      }

      setProcessos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(new Error(errorMessage));
      console.error('Unexpected error fetching processos:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createProcesso = useCallback(async (processo: Partial<Processo>) => {
    try {
      const tableExists = await checkTableExists('processos');
      
      if (!tableExists) {
        const error = { message: 'Tabela de processos ainda não foi criada' };
        toast({
          title: 'Aviso',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      const { data, error } = await supabase
        .from('processos')
        .insert(processo)
        .select()
        .single();

      if (error) {
        const errorMessage = handleDatabaseError(error, 'createProcesso');
        toast({
          title: 'Erro ao criar processo',
          description: errorMessage,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Sucesso',
        description: 'Processo criado com sucesso!'
      });

      // Refresh list
      await fetchProcessos();
      
      return { data };
    } catch (err) {
      const error = { message: err instanceof Error ? err.message : 'Erro inesperado' };
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  }, [fetchProcessos, toast]);

  const updateProcesso = useCallback(async (id: string, updates: Partial<Processo>) => {
    try {
      const tableExists = await checkTableExists('processos');
      
      if (!tableExists) {
        const error = { message: 'Tabela de processos ainda não foi criada' };
        toast({
          title: 'Aviso',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      const { data, error } = await supabase
        .from('processos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const errorMessage = handleDatabaseError(error, 'updateProcesso');
        toast({
          title: 'Erro ao atualizar processo',
          description: errorMessage,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Sucesso',
        description: 'Processo atualizado com sucesso!'
      });

      // Refresh list
      await fetchProcessos();
      
      return { data };
    } catch (err) {
      const error = { message: err instanceof Error ? err.message : 'Erro inesperado' };
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  }, [fetchProcessos, toast]);

  const deleteProcesso = useCallback(async (id: string) => {
    try {
      const tableExists = await checkTableExists('processos');
      
      if (!tableExists) {
        const error = { message: 'Tabela de processos ainda não foi criada' };
        toast({
          title: 'Aviso',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', id);

      if (error) {
        const errorMessage = handleDatabaseError(error, 'deleteProcesso');
        toast({
          title: 'Erro ao excluir processo',
          description: errorMessage,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Sucesso',
        description: 'Processo excluído com sucesso!'
      });

      // Refresh list
      await fetchProcessos();
      
      return {};
    } catch (err) {
      const error = { message: err instanceof Error ? err.message : 'Erro inesperado' };
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  }, [fetchProcessos, toast]);

  // Fetch on mount
  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

  return {
    processos,
    loading,
    error,
    fetchProcessos,
    createProcesso,
    updateProcesso,
    deleteProcesso
  };
}