import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Tipos para o sistema de votação
export interface VotingSession {
  id: string;
  reuniao_id: string;
  titulo: string;
  descricao?: string;
  tipo_votacao: 'simples' | 'qualificada' | 'unanime' | 'secreta';
  status: 'preparando' | 'aberta' | 'encerrada' | 'cancelada';
  permite_abstencao: boolean;
  voto_secreto: boolean;
  quorum_minimo: number;
  maioria_requerida: 'simples' | 'absoluta' | 'qualificada' | 'unanime';
  percentual_qualificada?: number;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  timeout_minutes: number;
  created_by: string;
  metadata?: Record<string, any>;
  hash_inicial?: string;
  hash_final?: string;
}

export interface VotingOption {
  id: string;
  session_id: string;
  texto: string;
  ordem: number;
  cor: string;
  ativa: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  session_id: string;
  voter_id: string;
  option_id?: string; // null para abstenção
  voted_at: string;
  device_info?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  vote_hash: string;
}

export interface VotingResults {
  id: string;
  session_id: string;
  total_eligible: number;
  total_present: number;
  total_votes: number;
  total_abstentions: number;
  results_data: Record<string, {
    votes: number;
    percentage: number;
    texto: string;
  }>;
  quorum_reached: boolean;
  approved?: boolean;
  winning_option_id?: string;
  calculated_at: string;
  result_hash: string;
}

export interface VotingPresence {
  id: string;
  session_id: string;
  conselheiro_id: string;
  presente: boolean;
  justificativa?: string;
  marked_at: string;
  marked_by?: string;
}

export interface CreateVotingSessionRequest {
  reuniao_id: string;
  titulo: string;
  descricao?: string;
  tipo_votacao: VotingSession['tipo_votacao'];
  permite_abstencao?: boolean;
  voto_secreto?: boolean;
  quorum_minimo?: number;
  maioria_requerida?: VotingSession['maioria_requerida'];
  percentual_qualificada?: number;
  timeout_minutes?: number;
  opcoes: Array<{
    texto: string;
    cor?: string;
  }>;
  conselheiros_presentes: string[]; // IDs dos conselheiros presentes
}

export interface VotingStatistics {
  total_sessions: number;
  sessions_by_status: Record<string, number>;
  total_votes_cast: number;
  average_participation: number;
  most_active_sessions: Array<{
    session_id: string;
    titulo: string;
    total_votes: number;
    participation_rate: number;
  }>;
  approval_rate: number;
}

// Classe de serviço para votação eletrônica
export class VotingService {
  private static realtimeChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Criar uma nova sessão de votação
   */
  static async createVotingSession(data: CreateVotingSessionRequest): Promise<VotingSession> {
    try {
      // 1. Criar a sessão
      const { data: session, error: sessionError } = await supabase
        .from('voting_sessions')
        .insert({
          reuniao_id: data.reuniao_id,
          titulo: data.titulo,
          descricao: data.descricao,
          tipo_votacao: data.tipo_votacao,
          permite_abstencao: data.permite_abstencao ?? true,
          voto_secreto: data.voto_secreto ?? false,
          quorum_minimo: data.quorum_minimo ?? 5,
          maioria_requerida: data.maioria_requerida ?? 'simples',
          percentual_qualificada: data.percentual_qualificada,
          timeout_minutes: data.timeout_minutes ?? 30,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          metadata: {}
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Criar as opções de votação
      const optionsToInsert = data.opcoes.map((opcao, index) => ({
        session_id: session.id,
        texto: opcao.texto,
        ordem: index + 1,
        cor: opcao.cor ?? this.getDefaultOptionColor(index),
        ativa: true
      }));

      const { error: optionsError } = await supabase
        .from('voting_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      // 3. Registrar presença dos conselheiros
      const currentUser = await supabase.auth.getUser();
      const presenceToInsert = data.conselheiros_presentes.map(conselheiro_id => ({
        session_id: session.id,
        conselheiro_id,
        presente: true,
        marked_by: currentUser.data.user?.id
      }));

      const { error: presenceError } = await supabase
        .from('voting_presence')
        .insert(presenceToInsert);

      if (presenceError) throw presenceError;

      // 4. Registrar auditoria
      await this.logAuditAction(session.id, 'session_created', null, {
        titulo: data.titulo,
        tipo_votacao: data.tipo_votacao,
        opcoes_count: data.opcoes.length,
        presentes_count: data.conselheiros_presentes.length
      });

      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de votação:', error);
      throw error;
    }
  }

  /**
   * Buscar sessões de votação de uma reunião
   */
  static async getVotingSessionsByReuniao(reuniao_id: string): Promise<VotingSession[]> {
    try {
      const { data, error } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('reuniao_id', reuniao_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar sessões de votação:', error);
      throw error;
    }
  }

  /**
   * Buscar detalhes completos de uma sessão de votação
   */
  static async getVotingSessionDetails(sessionId: string): Promise<{
    session: VotingSession;
    options: VotingOption[];
    results?: VotingResults;
    userVote?: Vote;
  }> {
    try {
      const [sessionResponse, optionsResponse, resultsResponse] = await Promise.all([
        supabase.from('voting_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('voting_options').select('*').eq('session_id', sessionId).order('ordem'),
        supabase.from('voting_results').select('*').eq('session_id', sessionId).single()
      ]);

      if (sessionResponse.error) throw sessionResponse.error;

      const session = sessionResponse.data;
      const options = optionsResponse.data || [];
      const results = resultsResponse.data;

      // Buscar voto do usuário atual (se existir)
      const user = await supabase.auth.getUser();
      let userVote = undefined;

      if (user.data.user) {
        const { data: voteData } = await supabase
          .from('votes')
          .select('*')
          .eq('session_id', sessionId)
          .eq('voter_id', user.data.user.id)
          .single();

        userVote = voteData;
      }

      return { session, options, results, userVote };
    } catch (error) {
      console.error('Erro ao buscar detalhes da sessão:', error);
      throw error;
    }
  }

  /**
   * Iniciar uma sessão de votação
   */
  static async startVotingSession(sessionId: string): Promise<{ success: boolean; hash_inicial?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('start_voting_session', {
        p_session_id: sessionId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao iniciar sessão de votação:', error);
      throw error;
    }
  }

  /**
   * Encerrar uma sessão de votação
   */
  static async endVotingSession(sessionId: string): Promise<{ success: boolean; results?: any; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('end_voting_session', {
        p_session_id: sessionId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao encerrar sessão de votação:', error);
      throw error;
    }
  }

  /**
   * Registrar um voto
   */
  static async castVote(
    sessionId: string, 
    optionId?: string, // undefined para abstenção
    deviceInfo?: Record<string, any>
  ): Promise<{ success: boolean; vote_hash?: string; error?: string }> {
    try {
      // Obter informações do dispositivo/navegador
      const userAgent = navigator.userAgent;
      const deviceData = {
        ...deviceInfo,
        timestamp: new Date().toISOString(),
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      };

      const { data, error } = await supabase.rpc('cast_vote', {
        p_session_id: sessionId,
        p_voter_id: (await supabase.auth.getUser()).data.user?.id,
        p_option_id: optionId || null,
        p_device_info: deviceData,
        p_user_agent: userAgent
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar voto:', error);
      throw error;
    }
  }

  /**
   * Calcular resultados em tempo real
   */
  static async calculateResults(sessionId: string): Promise<VotingResults> {
    try {
      const { data, error } = await supabase.rpc('calculate_voting_results', {
        p_session_id: sessionId
      });

      if (error) throw error;

      // Buscar os resultados atualizados do banco
      const { data: results, error: resultsError } = await supabase
        .from('voting_results')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (resultsError) throw resultsError;
      return results;
    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      throw error;
    }
  }

  /**
   * Configurar escuta em tempo real para uma sessão de votação
   */
  static subscribeToVotingSession(
    sessionId: string,
    callbacks: {
      onVote?: (vote: Vote) => void;
      onResults?: (results: VotingResults) => void;
      onSessionUpdate?: (session: VotingSession) => void;
      onPresenceUpdate?: (presence: VotingPresence[]) => void;
    }
  ): () => void {
    // Remover canal existente se houver
    this.unsubscribeFromVotingSession(sessionId);

    const channel = supabase.channel(`voting_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (callbacks.onVote) {
            callbacks.onVote(payload.new as Vote);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'votes',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (callbacks.onVote) {
            callbacks.onVote(payload.new as Vote);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voting_results',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (callbacks.onResults) {
            callbacks.onResults(payload.new as VotingResults);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'voting_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          if (callbacks.onSessionUpdate) {
            callbacks.onSessionUpdate(payload.new as VotingSession);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voting_presence',
          filter: `session_id=eq.${sessionId}`
        },
        async () => {
          if (callbacks.onPresenceUpdate) {
            // Recarregar lista de presença
            const { data } = await supabase
              .from('voting_presence')
              .select('*')
              .eq('session_id', sessionId);
            
            if (data) {
              callbacks.onPresenceUpdate(data);
            }
          }
        }
      )
      .subscribe();

    this.realtimeChannels.set(sessionId, channel);

    // Retornar função de cleanup
    return () => this.unsubscribeFromVotingSession(sessionId);
  }

  /**
   * Remover escuta em tempo real de uma sessão
   */
  static unsubscribeFromVotingSession(sessionId: string): void {
    const channel = this.realtimeChannels.get(sessionId);
    if (channel) {
      supabase.removeChannel(channel);
      this.realtimeChannels.delete(sessionId);
    }
  }

  /**
   * Buscar estatísticas gerais do sistema de votação
   */
  static async getVotingStatistics(): Promise<VotingStatistics> {
    try {
      const { data, error } = await supabase.rpc('get_voting_statistics');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de votação:', error);
      throw error;
    }
  }

  /**
   * Buscar presença de uma sessão
   */
  static async getVotingPresence(sessionId: string): Promise<VotingPresence[]> {
    try {
      const { data, error } = await supabase
        .from('voting_presence')
        .select(`
          *,
          profiles:conselheiro_id (
            full_name,
            role
          )
        `)
        .eq('session_id', sessionId)
        .order('marked_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar presença da votação:', error);
      throw error;
    }
  }

  /**
   * Marcar presença/ausência de um conselheiro
   */
  static async markPresence(
    sessionId: string,
    conselheiroId: string,
    presente: boolean,
    justificativa?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('voting_presence')
        .upsert({
          session_id: sessionId,
          conselheiro_id: conselheiroId,
          presente,
          justificativa,
          marked_by: (await supabase.auth.getUser()).data.user?.id,
          marked_at: new Date().toISOString()
        });

      if (error) throw error;

      // Recalcular resultados se necessário
      await this.calculateResults(sessionId);
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      throw error;
    }
  }

  /**
   * Verificar se o usuário pode votar numa sessão
   */
  static async canUserVote(sessionId: string, userId?: string): Promise<{
    canVote: boolean;
    reason?: string;
    hasVoted?: boolean;
  }> {
    try {
      const user = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!user) {
        return { canVote: false, reason: 'Usuário não autenticado' };
      }

      // Verificar status da sessão
      const { data: session } = await supabase
        .from('voting_sessions')
        .select('status')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return { canVote: false, reason: 'Sessão não encontrada' };
      }

      if (session.status !== 'aberta') {
        return { canVote: false, reason: 'Votação não está aberta' };
      }

      // Verificar presença
      const { data: presence } = await supabase
        .from('voting_presence')
        .select('presente')
        .eq('session_id', sessionId)
        .eq('conselheiro_id', user)
        .single();

      if (!presence || !presence.presente) {
        return { canVote: false, reason: 'Usuário não está presente na sessão' };
      }

      // Verificar se já votou
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('session_id', sessionId)
        .eq('voter_id', user)
        .single();

      return {
        canVote: true,
        hasVoted: !!existingVote
      };
    } catch (error) {
      console.error('Erro ao verificar permissão de voto:', error);
      return { canVote: false, reason: 'Erro interno' };
    }
  }

  /**
   * Obter logs de auditoria de uma sessão (apenas admin)
   */
  static async getAuditLogs(sessionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('voting_audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            role
          )
        `)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      throw error;
    }
  }

  // Métodos privados/utilitários

  private static getDefaultOptionColor(index: number): string {
    const colors = [
      '#10B981', // Verde
      '#F59E0B', // Amarelo
      '#EF4444', // Vermelho
      '#3B82F6', // Azul
      '#8B5CF6', // Roxo
      '#F97316', // Laranja
      '#06B6D4', // Ciano
      '#84CC16', // Lima
    ];
    return colors[index % colors.length];
  }

  private static async logAuditAction(
    sessionId: string,
    action: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const actionHash = await this.generateActionHash(action, sessionId);

      await supabase.from('voting_audit_logs').insert({
        session_id: sessionId,
        user_id: user?.id,
        action,
        old_data: oldData,
        new_data: newData,
        action_hash: actionHash
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      // Não propagar erro de auditoria para não quebrar o fluxo principal
    }
  }

  private static async generateActionHash(action: string, sessionId: string): Promise<string> {
    const data = `${action}${sessionId}${Date.now()}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validar configuração de uma sessão de votação
   */
  static validateVotingSession(data: CreateVotingSessionRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.titulo?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!data.opcoes || data.opcoes.length < 2) {
      errors.push('Pelo menos 2 opções são necessárias');
    }

    if (data.opcoes?.some(opt => !opt.texto?.trim())) {
      errors.push('Todas as opções devem ter texto');
    }

    if (data.quorum_minimo && data.quorum_minimo < 1) {
      errors.push('Quórum mínimo deve ser maior que 0');
    }

    if (data.percentual_qualificada && (data.percentual_qualificada < 50 || data.percentual_qualificada > 100)) {
      errors.push('Percentual para maioria qualificada deve estar entre 50% e 100%');
    }

    if (!data.conselheiros_presentes || data.conselheiros_presentes.length === 0) {
      errors.push('Pelo menos um conselheiro deve estar presente');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Exportar resultados de votação para auditoria
   */
  static async exportVotingResults(sessionId: string): Promise<{
    session: VotingSession;
    options: VotingOption[];
    results: VotingResults;
    auditLog: any[];
    exportedAt: string;
    checksum: string;
  }> {
    try {
      const [sessionDetails, auditLog] = await Promise.all([
        this.getVotingSessionDetails(sessionId),
        this.getAuditLogs(sessionId)
      ]);

      const exportData = {
        session: sessionDetails.session,
        options: sessionDetails.options,
        results: sessionDetails.results!,
        auditLog,
        exportedAt: new Date().toISOString(),
        checksum: '' // Será calculado
      };

      // Calcular checksum dos dados
      const dataString = JSON.stringify({
        session: exportData.session,
        options: exportData.options,
        results: exportData.results
      });
      
      exportData.checksum = await this.generateActionHash(dataString, sessionId);

      return exportData;
    } catch (error) {
      console.error('Erro ao exportar resultados:', error);
      throw error;
    }
  }

  /**
   * Cleanup - remover todas as subscriptions ativas
   */
  static cleanup(): void {
    this.realtimeChannels.forEach((channel, sessionId) => {
      this.unsubscribeFromVotingSession(sessionId);
    });
  }
}