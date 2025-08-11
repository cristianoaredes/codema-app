import { supabase } from '@/integrations/supabase/client';
import { Reuniao, Presenca, Convocacao } from '@/types';
import { ProtocoloGenerator } from '@/utils/generators/protocoloGenerator';

export class ReuniaoService {
  /**
   * Verifica o quórum de uma reunião
   */
  static async checkQuorum(reuniaoId: string): Promise<{
    presentes: number;
    totalConselheiros: number;
    quorumMinimo: number;
    hasQuorum: boolean;
    percentualPresenca: number;
  }> {
    // Buscar total de conselheiros ativos titulares
    const { data: conselheiros, error: conselheirosError } = await supabase
      .from('conselheiros')
      .select('id')
      .eq('status', 'ativo')
      .eq('titular', true);
    
    if (conselheirosError) throw conselheirosError;
    
    // Buscar presenças da reunião
    const { data: presencas, error: presencasError } = await supabase
      .from('presencas')
      .select('*')
      .eq('reuniao_id', reuniaoId)
      .eq('presente', true);
    
    if (presencasError) throw presencasError;
    
    const totalConselheiros = conselheiros?.length || 0;
    const presentes = presencas?.length || 0;
    const quorumMinimo = Math.floor(totalConselheiros / 2) + 1;
    const hasQuorum = presentes >= quorumMinimo;
    const percentualPresenca = totalConselheiros > 0 
      ? Math.round((presentes / totalConselheiros) * 100) 
      : 0;
    
    return {
      presentes,
      totalConselheiros,
      quorumMinimo,
      hasQuorum,
      percentualPresenca
    };
  }

  /**
   * Gera pauta automaticamente baseada em templates
   */
  static async generatePauta(tipo: 'ordinaria' | 'extraordinaria' | 'publica'): Promise<string> {
    const templates = {
      ordinaria: `
1. ABERTURA DA SESSÃO
   - Verificação de quórum
   - Aprovação da ata da reunião anterior

2. EXPEDIENTE
   - Comunicados da Presidência
   - Correspondências recebidas
   - Informes dos Conselheiros

3. ORDEM DO DIA
   - Análise de processos de licenciamento ambiental
   - Discussão de denúncias ambientais
   - Apreciação de pareceres técnicos

4. ASSUNTOS GERAIS
   - Propostas e sugestões dos conselheiros
   - Definição da data da próxima reunião

5. ENCERRAMENTO
      `,
      extraordinaria: `
1. ABERTURA DA SESSÃO
   - Verificação de quórum
   - Justificativa da convocação extraordinária

2. ORDEM DO DIA
   - [ASSUNTO ESPECÍFICO DA CONVOCAÇÃO]

3. DELIBERAÇÕES
   - Votação e decisões

4. ENCERRAMENTO
      `,
      publica: `
1. ABERTURA DA SESSÃO PÚBLICA
   - Verificação de quórum
   - Explicação dos procedimentos da audiência

2. APRESENTAÇÃO DO TEMA
   - Exposição técnica do assunto
   - Contextualização legal e ambiental

3. MANIFESTAÇÕES
   - Abertura para manifestações do público
   - Registro de questionamentos e sugestões

4. CONSIDERAÇÕES FINAIS
   - Síntese das manifestações
   - Próximos passos

5. ENCERRAMENTO
      `
    };
    
    return templates[tipo] || templates.ordinaria;
  }

  /**
   * Envia convocações automaticamente
   */
  static async sendConvocacoes(
    reuniaoId: string,
    tipo: 'email' | 'whatsapp' | 'ambos'
  ): Promise<{
    enviadas: number;
    erros: number;
    protocolo: string;
  }> {
    // Gerar protocolo de convocação
    const protocolo = await ProtocoloGenerator.gerarProtocolo('CONV');
    
    // Buscar reunião
    const { data: reuniao, error: reuniaoError } = await supabase
      .from('reunioes')
      .select('*')
      .eq('id', reuniaoId)
      .single();
    
    if (reuniaoError) throw reuniaoError;
    
    // Buscar conselheiros ativos
    const { data: conselheiros, error: conselheirosError } = await supabase
      .from('conselheiros')
      .select('*')
      .eq('status', 'ativo');
    
    if (conselheirosError) throw conselheirosError;
    
    let enviadas = 0;
    let erros = 0;
    
    // Criar convocações para cada conselheiro
    for (const conselheiro of (conselheiros || [])) {
      try {
        const convocacaoData = {
          reuniao_id: reuniaoId,
          conselheiro_id: conselheiro.id,
          tipo_envio: tipo === 'ambos' ? 'email' : tipo,
          status: 'pendente' as const,
          protocolo_convocacao: protocolo
        };
        
        const { error } = await supabase
          .from('convocacoes')
          .upsert(convocacaoData, {
            onConflict: 'reuniao_id,conselheiro_id'
          });
        
        if (error) throw error;
        
        // TODO: Integrate with actual email/whatsapp service
        // For now, mark as sent
        await supabase
          .from('convocacoes')
          .update({
            status: 'enviada',
            enviada_em: new Date().toISOString()
          })
          .eq('reuniao_id', reuniaoId)
          .eq('conselheiro_id', conselheiro.id);
        
        enviadas++;
      } catch (error) {
        console.error(`Erro ao enviar convocação para ${conselheiro.nome_completo}:`, error);
        erros++;
      }
    }
    
    // Atualizar reunião com protocolo de convocação
    await supabase
      .from('reunioes')
      .update({ protocolo_convocacao: protocolo })
      .eq('id', reuniaoId);
    
    return {
      enviadas,
      erros,
      protocolo
    };
  }

  /**
   * Registra presença em lote
   */
  static async registerBulkPresence(
    reuniaoId: string,
    presencas: Array<{
      conselheiroId: string;
      presente: boolean;
      justificativa?: string;
    }>
  ): Promise<void> {
    const presencaData = presencas.map(p => ({
      reuniao_id: reuniaoId,
      conselheiro_id: p.conselheiroId,
      presente: p.presente,
      horario_chegada: p.presente ? new Date().toISOString() : null,
      justificativa_ausencia: !p.presente ? p.justificativa : null
    }));
    
    const { error } = await supabase
      .from('presencas')
      .upsert(presencaData, {
        onConflict: 'reuniao_id,conselheiro_id'
      });
    
    if (error) throw error;
    
    // Atualizar faltas consecutivas dos conselheiros ausentes
    for (const p of presencas) {
      if (!p.presente) {
        await this.updateConsecutiveAbsences(p.conselheiroId);
      } else {
        // Resetar faltas consecutivas se presente
        await supabase
          .from('conselheiros')
          .update({ faltas_consecutivas: 0 })
          .eq('id', p.conselheiroId);
      }
    }
  }

  /**
   * Atualiza faltas consecutivas
   */
  private static async updateConsecutiveAbsences(conselheiroId: string): Promise<void> {
    // Buscar últimas 3 reuniões
    const { data: reunioes, error: reunioesError } = await supabase
      .from('reunioes')
      .select('id')
      .eq('status', 'realizada')
      .order('data_reuniao', { ascending: false })
      .limit(3);
    
    if (reunioesError) throw reunioesError;
    
    const reuniaoIds = reunioes?.map(r => r.id) || [];
    
    // Verificar presenças nessas reuniões
    const { data: presencas, error: presencasError } = await supabase
      .from('presencas')
      .select('presente')
      .eq('conselheiro_id', conselheiroId)
      .in('reuniao_id', reuniaoIds);
    
    if (presencasError) throw presencasError;
    
    const faltasConsecutivas = presencas?.filter(p => !p.presente).length || 0;
    
    // Atualizar conselheiro
    const { error: updateError } = await supabase
      .from('conselheiros')
      .update({
        faltas_consecutivas: faltasConsecutivas,
        total_faltas: supabase.sql`total_faltas + 1`
      })
      .eq('id', conselheiroId);
    
    if (updateError) throw updateError;
    
    // Enviar alerta se necessário
    if (faltasConsecutivas >= 3) {
      // TODO: Send alert notification
      console.warn(`Conselheiro ${conselheiroId} com ${faltasConsecutivas} faltas consecutivas`);
    }
  }

  /**
   * Gera estatísticas da reunião
   */
  static async generateMeetingStats(reuniaoId: string): Promise<{
    duracao?: string;
    presencaPercentual: number;
    totalDecisoes: number;
    totalEncaminhamentos: number;
    temAta: boolean;
    temQuorum: boolean;
  }> {
    const quorum = await this.checkQuorum(reuniaoId);
    
    // Buscar reunião
    const { data: reuniao, error } = await supabase
      .from('reunioes')
      .select('*')
      .eq('id', reuniaoId)
      .single();
    
    if (error) throw error;
    
    // TODO: Implement decisions and referrals counting
    // when these tables are available
    
    return {
      presencaPercentual: quorum.percentualPresenca,
      totalDecisoes: 0, // TODO
      totalEncaminhamentos: 0, // TODO
      temAta: !!reuniao?.ata,
      temQuorum: quorum.hasQuorum
    };
  }

  /**
   * Valida dados da reunião antes de salvar
   */
  static validateReuniaoData(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validação de data
    if (data.data_reuniao) {
      const dataReuniao = new Date(data.data_reuniao);
      const hoje = new Date();
      
      // Não permitir reuniões no passado (exceto para registro histórico)
      if (dataReuniao < hoje && data.status === 'agendada') {
        errors.push('Não é possível agendar reunião para data passada');
      }
      
      // Avisar se for fim de semana
      const diaSemana = dataReuniao.getDay();
      if (diaSemana === 0 || diaSemana === 6) {
        console.warn('Reunião agendada para fim de semana');
      }
    }
    
    // Validação de pauta
    if (data.tipo === 'extraordinaria' && !data.pauta) {
      errors.push('Reunião extraordinária requer pauta específica');
    }
    
    // Validação de local
    if (!data.local || data.local.trim().length < 3) {
      errors.push('Local da reunião é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}