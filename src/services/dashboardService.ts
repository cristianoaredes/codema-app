import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  reunioes: {
    total: number;
    comQuorum: number;
    taxaQuorum: number;
    duracaoMedia: number;
    proximasReunioes: number;
  };
  atas: {
    total: number;
    pendentes: number;
    aprovadas: number;
    taxaAprovacao: number;
    tempoMedioAprovacao: number;
  };
  resolucoes: {
    total: number;
    aprovadas: number;
    rejeitadas: number;
    implementadas: number;
    taxaImplementacao: number;
  };
  conselheiros: {
    ativos: number;
    presencaMedia: number;
    mandatosVencendo: number;
    maisParticipativo: string;
  };
  tendencias: {
    reunioesMensais: Array<{ mes: string; total: number; quorum: number }>;
    resolucoesPorTipo: Array<{ tipo: string; quantidade: number }>;
    presencaPorConselheiro: Array<{ nome: string; presenca: number }>;
  };
}

export class DashboardService {
  /**
   * Obtém métricas completas do dashboard executivo
   */
  static async getExecutiveMetrics(
    dataInicio?: string,
    dataFim?: string
  ): Promise<DashboardMetrics> {
    const [
      reunioesData,
      atasData, 
      resolucoesData,
      conselheirosData,
      tendenciasData
    ] = await Promise.all([
      this.getReuniaoMetrics(dataInicio, dataFim),
      this.getAtaMetrics(dataInicio, dataFim),
      this.getResolucaoMetrics(dataInicio, dataFim),
      this.getConselheiroMetrics(),
      this.getTendenciasData(dataInicio, dataFim)
    ]);

    return {
      reunioes: reunioesData,
      atas: atasData,
      resolucoes: resolucoesData,
      conselheiros: conselheirosData,
      tendencias: tendenciasData
    };
  }

  /**
   * Métricas de reuniões
   */
  private static async getReuniaoMetrics(dataInicio?: string, dataFim?: string) {
    let query = supabase
      .from('reunioes')
      .select(`
        id,
        data_reuniao,
        status,
        duracao_minutos,
        presencas (
          presente
        )
      `);

    if (dataInicio) query = query.gte('data_reuniao', dataInicio);
    if (dataFim) query = query.lte('data_reuniao', dataFim);

    const { data: reunioes } = await query;

    // Obter total de conselheiros ativos para cálculo do quórum
    const { data: conselheiros } = await supabase
      .from('conselheiros')
      .select('id')
      .eq('status', 'ativo')
      .eq('titular', true);

    const totalConselheiros = conselheiros?.length || 0;
    const quorumMinimo = Math.floor(totalConselheiros / 2) + 1;

    const total = reunioes?.length || 0;
    let comQuorum = 0;
    let duracaoTotal = 0;
    let reunioesComDuracao = 0;

    reunioes?.forEach(reuniao => {
      const presentes = reuniao.presencas?.filter(p => p.presente).length || 0;
      if (presentes >= quorumMinimo) {
        comQuorum++;
      }
      
      if (reuniao.duracao_minutos) {
        duracaoTotal += reuniao.duracao_minutos;
        reunioesComDuracao++;
      }
    });

    // Próximas reuniões (próximos 30 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 30);
    
    const { data: proximasReunioes } = await supabase
      .from('reunioes')
      .select('id')
      .gte('data_reuniao', new Date().toISOString())
      .lte('data_reuniao', dataLimite.toISOString())
      .eq('status', 'agendada');

    return {
      total,
      comQuorum,
      taxaQuorum: total > 0 ? Math.round((comQuorum / total) * 100) : 0,
      duracaoMedia: reunioesComDuracao > 0 ? Math.round(duracaoTotal / reunioesComDuracao) : 0,
      proximasReunioes: proximasReunioes?.length || 0
    };
  }

  /**
   * Métricas de atas
   */
  private static async getAtaMetrics(dataInicio?: string, dataFim?: string) {
    let query = supabase
      .from('atas')
      .select('*');

    if (dataInicio) query = query.gte('created_at', dataInicio);
    if (dataFim) query = query.lte('created_at', dataFim);

    const { data: atas } = await query;

    const total = atas?.length || 0;
    const pendentes = atas?.filter(ata => ata.status === 'pendente').length || 0;
    const aprovadas = atas?.filter(ata => ata.status === 'aprovada').length || 0;

    // Calcular tempo médio de aprovação
    const atasAprovadas = atas?.filter(ata => 
      ata.status === 'aprovada' && ata.data_aprovacao && ata.created_at
    ) || [];

    let tempoMedioAprovacao = 0;
    if (atasAprovadas.length > 0) {
      const temposAprovacao = atasAprovadas.map(ata => {
        const criacao = new Date(ata.created_at);
        const aprovacao = new Date(ata.data_aprovacao);
        return Math.ceil((aprovacao.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24));
      });
      
      tempoMedioAprovacao = Math.round(
        temposAprovacao.reduce((acc, tempo) => acc + tempo, 0) / temposAprovacao.length
      );
    }

    return {
      total,
      pendentes,
      aprovadas,
      taxaAprovacao: total > 0 ? Math.round((aprovadas / total) * 100) : 0,
      tempoMedioAprovacao
    };
  }

  /**
   * Métricas de resoluções
   */
  private static async getResolucaoMetrics(dataInicio?: string, dataFim?: string) {
    let query = supabase
      .from('resolucoes')
      .select('*');

    if (dataInicio) query = query.gte('created_at', dataInicio);
    if (dataFim) query = query.lte('created_at', dataFim);

    const { data: resolucoes } = await query;

    const total = resolucoes?.length || 0;
    const aprovadas = resolucoes?.filter(res => res.status === 'aprovada').length || 0;
    const rejeitadas = resolucoes?.filter(res => res.status === 'rejeitada').length || 0;
    const implementadas = resolucoes?.filter(res => res.implementada === true).length || 0;

    return {
      total,
      aprovadas,
      rejeitadas,
      implementadas,
      taxaImplementacao: aprovadas > 0 ? Math.round((implementadas / aprovadas) * 100) : 0
    };
  }

  /**
   * Métricas de conselheiros
   */
  private static async getConselheiroMetrics() {
    // Conselheiros ativos
    const { data: conselheiros } = await supabase
      .from('conselheiros')
      .select('*')
      .eq('status', 'ativo');

    const ativos = conselheiros?.length || 0;

    // Mandatos vencendo (próximos 90 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 90);

    const mandatosVencendo = conselheiros?.filter(conselheiro => {
      if (conselheiro.data_fim_mandato) {
        const fimMandato = new Date(conselheiro.data_fim_mandato);
        return fimMandato <= dataLimite;
      }
      return false;
    }).length || 0;

    // Presença média e conselheiro mais participativo
    const { data: presencas } = await supabase
      .from('presencas')
      .select(`
        presente,
        conselheiro_id,
        conselheiros (
          nome
        )
      `)
      .eq('presente', true);

    let presencaMedia = 0;
    let maisParticipativo = 'N/A';

    if (presencas && presencas.length > 0) {
      // Agrupar presenças por conselheiro
      const presencasPorConselheiro = presencas.reduce((acc, presenca) => {
        const id = presenca.conselheiro_id;
        if (!acc[id]) {
          acc[id] = {
            nome: presenca.conselheiros?.nome || 'Desconhecido',
            total: 0
          };
        }
        acc[id].total++;
        return acc;
      }, {} as Record<string, { nome: string; total: number }>);

      // Calcular média
      const totalPresencas = Object.values(presencasPorConselheiro)
        .reduce((acc, cons) => acc + cons.total, 0);
      presencaMedia = Math.round(totalPresencas / Object.keys(presencasPorConselheiro).length);

      // Encontrar mais participativo
      const maisAtivo = Object.values(presencasPorConselheiro)
        .sort((a, b) => b.total - a.total)[0];
      if (maisAtivo) {
        maisParticipativo = maisAtivo.nome;
      }
    }

    return {
      ativos,
      presencaMedia,
      mandatosVencendo,
      maisParticipativo
    };
  }

  /**
   * Dados para gráficos de tendências
   */
  private static async getTendenciasData(dataInicio?: string, dataFim?: string) {
    // Reuniões mensais com quórum (últimos 12 meses)
    const dataLimiteInicio = dataInicio ? new Date(dataInicio) : new Date();
    if (!dataInicio) {
      dataLimiteInicio.setMonth(dataLimiteInicio.getMonth() - 12);
    }

    const { data: reunioesMensais } = await supabase
      .from('reunioes')
      .select(`
        data_reuniao,
        presencas (presente)
      `)
      .gte('data_reuniao', dataLimiteInicio.toISOString())
      .order('data_reuniao');

    // Agrupar por mês
    const reunioesPorMes = reunioesMensais?.reduce((acc, reuniao) => {
      const mes = new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[mes]) {
        acc[mes] = { total: 0, comQuorum: 0 };
      }
      
      acc[mes].total++;
      
      const presentes = reuniao.presencas?.filter(p => p.presente).length || 0;
      // Assumindo quórum de 50% + 1 (será recalculado dinamicamente)
      if (presentes >= 3) { // Placeholder - deve ser calculado dinamicamente
        acc[mes].comQuorum++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; comQuorum: number }>) || {};

    const reunioesMensaisArray = Object.entries(reunioesPorMes).map(([mes, dados]) => ({
      mes,
      total: dados.total,
      quorum: dados.comQuorum
    }));

    // Resoluções por tipo
    const { data: resolucoesPorTipo } = await supabase
      .from('resolucoes')
      .select('tipo')
      .eq('status', 'aprovada');

    const tiposCount = resolucoesPorTipo?.reduce((acc, res) => {
      const tipo = res.tipo || 'Não especificado';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const resolucoesPorTipoArray = Object.entries(tiposCount).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));

    // Presença por conselheiro (top 10)
    const { data: presencaDetalhada } = await supabase
      .from('presencas')
      .select(`
        presente,
        conselheiro_id,
        conselheiros (nome)
      `);

    const presencaPorConselheiro = presencaDetalhada?.reduce((acc, presenca) => {
      const nome = presenca.conselheiros?.nome || 'Desconhecido';
      if (!acc[nome]) {
        acc[nome] = { total: 0, presente: 0 };
      }
      acc[nome].total++;
      if (presenca.presente) {
        acc[nome].presente++;
      }
      return acc;
    }, {} as Record<string, { total: number; presente: number }>) || {};

    const presencaPorConselheiroArray = Object.entries(presencaPorConselheiro)
      .map(([nome, dados]) => ({
        nome,
        presenca: dados.total > 0 ? Math.round((dados.presente / dados.total) * 100) : 0
      }))
      .sort((a, b) => b.presenca - a.presenca)
      .slice(0, 10);

    return {
      reunioesMensais: reunioesMensaisArray,
      resolucoesPorTipo: resolucoesPorTipoArray,
      presencaPorConselheiro: presencaPorConselheiroArray
    };
  }

  /**
   * Exportar relatório em formato JSON para PDF
   */
  static async exportRelatorio(dataInicio?: string, dataFim?: string) {
    const metrics = await this.getExecutiveMetrics(dataInicio, dataFim);
    
    return {
      titulo: 'Relatório Executivo CODEMA',
      periodo: {
        inicio: dataInicio || 'Início dos registros',
        fim: dataFim || 'Data atual'
      },
      dataGeracao: new Date().toLocaleString('pt-BR'),
      metricas: metrics
    };
  }
}