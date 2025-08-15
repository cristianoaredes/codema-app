import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Denuncia } from './useOuvidoriaDenuncias';
import type { Reuniao } from '@/hooks/useReunioes';

export interface DenunciaReuniao {
  id: string;
  denuncia_id: string;
  reuniao_id: string;
  status: 'pendente' | 'discutida' | 'votada' | 'arquivada';
  ordem_pauta?: number;
  relator_id?: string;
  parecer?: string;
  votos_favoraveis?: number;
  votos_contrarios?: number;
  abstencoes?: number;
  decisao?: 'procedente' | 'improcedente' | 'diligencia' | 'arquivada';
  ata_referencia?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  denuncia?: Denuncia;
  reuniao?: Reuniao;
  relator?: {
    id: string;
    full_name: string;
  };
}

export interface VotacaoDenuncia {
  denuncia_id: string;
  reuniao_id: string;
  votos_favoraveis: number;
  votos_contrarios: number;
  abstencoes: number;
  decisao: 'procedente' | 'improcedente' | 'diligencia' | 'arquivada';
  justificativa?: string;
}

export const useOuvidoriaReunioes = () => {
  const [loading, setLoading] = useState(false);
  const [denunciasReuniao, setDenunciasReuniao] = useState<DenunciaReuniao[]>([]);

  // Adicionar denúncia à pauta da reunião
  const adicionarDenunciaPauta = useCallback(async (
    denuncia_id: string,
    reuniao_id: string,
    ordem_pauta?: number,
    relator_id?: string
  ) => {
    setLoading(true);
    try {
      // Verificar se a denúncia já está na pauta
      const { data: existing } = await supabase
        .from('denuncias_reunioes')
        .select('id')
        .eq('denuncia_id', denuncia_id)
        .eq('reuniao_id', reuniao_id)
        .single();

      if (existing) {
        toast.warning('Esta denúncia já está na pauta desta reunião');
        return null;
      }

      // Adicionar à pauta
      const { data, error } = await supabase
        .from('denuncias_reunioes')
        .insert({
          denuncia_id,
          reuniao_id,
          status: 'pendente',
          ordem_pauta: ordem_pauta || await getProximaOrdemPauta(reuniao_id),
          relator_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Denúncia adicionada à pauta da reunião');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar denúncia à pauta:', error);
      toast.error('Erro ao adicionar denúncia à pauta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar denúncias de uma reunião
  const buscarDenunciasReuniao = useCallback(async (reuniao_id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('denuncias_reunioes')
        .select(`
          *,
          denuncia:denuncias!inner(*),
          reuniao:reunioes!inner(*),
          relator:profiles!relator_id(id, full_name)
        `)
        .eq('reuniao_id', reuniao_id)
        .order('ordem_pauta', { ascending: true });

      if (error) throw error;

      setDenunciasReuniao(data || []);
      return data;
    } catch (error) {
      console.error('Erro ao buscar denúncias da reunião:', error);
      toast.error('Erro ao buscar denúncias da reunião');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar reuniões de uma denúncia
  const buscarReunioesDenuncia = useCallback(async (denuncia_id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('denuncias_reunioes')
        .select(`
          *,
          reuniao:reunioes!inner(*),
          relator:profiles!relator_id(id, full_name)
        `)
        .eq('denuncia_id', denuncia_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões da denúncia:', error);
      toast.error('Erro ao buscar reuniões da denúncia');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar votação de denúncia
  const registrarVotacao = useCallback(async (votacao: VotacaoDenuncia) => {
    setLoading(true);
    try {
      // Atualizar registro na tabela de integração
      const { data, error } = await supabase
        .from('denuncias_reunioes')
        .update({
          status: 'votada',
          votos_favoraveis: votacao.votos_favoraveis,
          votos_contrarios: votacao.votos_contrarios,
          abstencoes: votacao.abstencoes,
          decisao: votacao.decisao,
          observacoes: votacao.justificativa,
          updated_at: new Date().toISOString()
        })
        .eq('denuncia_id', votacao.denuncia_id)
        .eq('reuniao_id', votacao.reuniao_id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar status da denúncia baseado na decisão
      const novoStatus = votacao.decisao === 'procedente' ? 'procedente' :
                        votacao.decisao === 'improcedente' ? 'improcedente' :
                        votacao.decisao === 'diligencia' ? 'em_apuracao' :
                        'arquivada';

      await supabase
        .from('denuncias')
        .update({
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', votacao.denuncia_id);

      toast.success('Votação registrada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao registrar votação:', error);
      toast.error('Erro ao registrar votação');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar parecer do relator
  const atualizarParecer = useCallback(async (
    denuncia_id: string,
    reuniao_id: string,
    parecer: string
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('denuncias_reunioes')
        .update({
          parecer,
          status: 'discutida',
          updated_at: new Date().toISOString()
        })
        .eq('denuncia_id', denuncia_id)
        .eq('reuniao_id', reuniao_id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Parecer atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar parecer:', error);
      toast.error('Erro ao atualizar parecer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remover denúncia da pauta
  const removerDenunciaPauta = useCallback(async (
    denuncia_id: string,
    reuniao_id: string
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('denuncias_reunioes')
        .delete()
        .eq('denuncia_id', denuncia_id)
        .eq('reuniao_id', reuniao_id);

      if (error) throw error;

      toast.success('Denúncia removida da pauta');
      return true;
    } catch (error) {
      console.error('Erro ao remover denúncia da pauta:', error);
      toast.error('Erro ao remover denúncia da pauta');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reordenar denúncias na pauta
  const reordenarPauta = useCallback(async (
    reuniao_id: string,
    denuncias: { denuncia_id: string; ordem_pauta: number }[]
  ) => {
    setLoading(true);
    try {
      const updates = denuncias.map(d => ({
        denuncia_id: d.denuncia_id,
        reuniao_id,
        ordem_pauta: d.ordem_pauta,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('denuncias_reunioes')
        .upsert(updates, { onConflict: 'denuncia_id,reuniao_id' });

      if (error) throw error;

      toast.success('Ordem da pauta atualizada');
      return true;
    } catch (error) {
      console.error('Erro ao reordenar pauta:', error);
      toast.error('Erro ao reordenar pauta');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Gerar relatório de denúncias para ata
  const gerarRelatorioAta = useCallback(async (reuniao_id: string) => {
    const denuncias = await buscarDenunciasReuniao(reuniao_id);
    
    if (!denuncias || denuncias.length === 0) {
      return 'Nenhuma denúncia foi discutida nesta reunião.';
    }

    let relatorio = '\n### DENÚNCIAS AMBIENTAIS APRECIADAS\n\n';
    
    denuncias.forEach((dr, index) => {
      relatorio += `**${index + 1}. Protocolo ${dr.denuncia?.protocolo}**\n`;
      relatorio += `- **Tipo**: ${dr.denuncia?.tipo_denuncia}\n`;
      relatorio += `- **Local**: ${dr.denuncia?.local_ocorrencia}\n`;
      relatorio += `- **Relator**: ${dr.relator?.full_name || 'Não designado'}\n`;
      
      if (dr.parecer) {
        relatorio += `- **Parecer**: ${dr.parecer}\n`;
      }
      
      if (dr.status === 'votada') {
        relatorio += `- **Votação**: ${dr.votos_favoraveis} favoráveis, ${dr.votos_contrarios} contrários, ${dr.abstencoes} abstenções\n`;
        relatorio += `- **Decisão**: ${dr.decisao?.toUpperCase()}\n`;
      }
      
      if (dr.observacoes) {
        relatorio += `- **Observações**: ${dr.observacoes}\n`;
      }
      
      relatorio += '\n';
    });

    return relatorio;
  }, [buscarDenunciasReuniao]);

  // Função auxiliar para obter próxima ordem na pauta
  const getProximaOrdemPauta = async (reuniao_id: string): Promise<number> => {
    const { data } = await supabase
      .from('denuncias_reunioes')
      .select('ordem_pauta')
      .eq('reuniao_id', reuniao_id)
      .order('ordem_pauta', { ascending: false })
      .limit(1)
      .single();

    return (data?.ordem_pauta || 0) + 1;
  };

  // Buscar estatísticas de denúncias em reuniões
  const buscarEstatisticas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('denuncias_reunioes')
        .select('status, decisao');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pendentes: data?.filter(d => d.status === 'pendente').length || 0,
        discutidas: data?.filter(d => d.status === 'discutida').length || 0,
        votadas: data?.filter(d => d.status === 'votada').length || 0,
        procedentes: data?.filter(d => d.decisao === 'procedente').length || 0,
        improcedentes: data?.filter(d => d.decisao === 'improcedente').length || 0,
        diligencias: data?.filter(d => d.decisao === 'diligencia').length || 0,
        arquivadas: data?.filter(d => d.decisao === 'arquivada').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }, []);

  return {
    loading,
    denunciasReuniao,
    adicionarDenunciaPauta,
    buscarDenunciasReuniao,
    buscarReunioesDenuncia,
    registrarVotacao,
    atualizarParecer,
    removerDenunciaPauta,
    reordenarPauta,
    gerarRelatorioAta,
    buscarEstatisticas
  };
};