import { supabase } from '@/integrations/supabase/client';

export interface MobileAuthResponse {
  success: boolean;
  session?: any;
  profile?: any;
  qr_token?: string;
  error?: string;
}

export interface ReunionMobileData {
  id: string;
  titulo: string;
  data_reuniao: string;
  local: string;
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';
  tipo: string;
  pauta?: string;
  participantes_confirmados: number;
  total_conselheiros: number;
  quorum_atingido: boolean;
  tempo_restante?: number; // em minutos
  proxima_pauta?: {
    id: string;
    titulo: string;
    descricao: string;
  };
}

export interface AttendanceData {
  conselheiro_id: string;
  reuniao_id: string;
  presente: boolean;
  hora_entrada?: string;
  hora_saida?: string;
  observacoes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface NotificationPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    convocacoes: boolean;
    lembretes: boolean;
    inicio_reuniao: boolean;
    votacoes: boolean;
    atas: boolean;
  };
}

export interface MobileDashboard {
  proximas_reunioes: ReunionMobileData[];
  reuniao_atual?: ReunionMobileData;
  notificacoes_pendentes: number;
  atas_pendentes: number;
  resolucoes_recentes: Array<{
    id: string;
    numero: string;
    titulo: string;
    data: string;
    status: string;
  }>;
  estatisticas: {
    presencas_mes: number;
    total_reunioes_ano: number;
    participacao_percentual: number;
  };
}

export class MobileApiService {
  /**
   * Autenticação via QR Code para mobile
   */
  static async authenticateWithQRCode(qrToken: string): Promise<MobileAuthResponse> {
    try {
      // Verificar se o token QR é válido
      const { data: tokenData, error: tokenError } = await supabase
        .from('mobile_auth_tokens')
        .select('*')
        .eq('token', qrToken)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return {
          success: false,
          error: 'Token QR inválido ou expirado'
        };
      }

      // Buscar perfil do conselheiro
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          conselheiros (
            id,
            nome,
            cargo,
            status,
            telefone,
            data_inicio_mandato,
            data_fim_mandato
          )
        `)
        .eq('id', tokenData.user_id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: 'Perfil de usuário não encontrado'
        };
      }

      // Marcar token como usado
      await supabase
        .from('mobile_auth_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      // Criar sessão mobile
      const { data: session, error: sessionError } = await supabase
        .from('mobile_sessions')
        .insert({
          user_id: tokenData.user_id,
          device_info: tokenData.device_info,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          active: true
        })
        .select()
        .single();

      if (sessionError) {
        return {
          success: false,
          error: 'Erro ao criar sessão mobile'
        };
      }

      return {
        success: true,
        session,
        profile
      };

    } catch (error) {
      console.error('Erro na autenticação mobile:', error);
      return {
        success: false,
        error: 'Erro interno na autenticação'
      };
    }
  }

  /**
   * Gerar token QR para autenticação
   */
  static async generateQRToken(userId: string, deviceInfo: any): Promise<string> {
    try {
      const token = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      const { error } = await supabase
        .from('mobile_auth_tokens')
        .insert({
          token,
          user_id: userId,
          device_info: deviceInfo,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (error) throw error;

      return token;

    } catch (error) {
      console.error('Erro ao gerar token QR:', error);
      throw error;
    }
  }

  /**
   * Obter dashboard mobile do conselheiro
   */
  static async getMobileDashboard(userId: string): Promise<MobileDashboard> {
    try {
      // Buscar conselheiro
      const { data: conselheiro } = await supabase
        .from('conselheiros')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!conselheiro) {
        throw new Error('Conselheiro não encontrado');
      }

      // Buscar próximas reuniões
      const { data: proximasReunioes } = await supabase
        .from('reunioes')
        .select(`
          id,
          titulo,
          data_reuniao,
          local,
          status,
          tipo,
          pauta,
          presencas (
            presente
          )
        `)
        .gte('data_reuniao', new Date().toISOString())
        .order('data_reuniao', { ascending: true })
        .limit(5);

      // Buscar reunião atual (se houver)
      const { data: reuniaoAtual } = await supabase
        .from('reunioes')
        .select(`
          id,
          titulo,
          data_reuniao,
          local,
          status,
          tipo,
          pauta,
          presencas (
            presente
          )
        `)
        .eq('status', 'em_andamento')
        .single();

      // Buscar notificações pendentes
      const { count: notificacoesPendentes } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('destinatario_id', conselheiro.id)
        .eq('lida', false);

      // Buscar estatísticas de presença
      const anoAtual = new Date().getFullYear();
      const mesAtual = new Date().getMonth() + 1;

      const { data: presencasMes } = await supabase
        .from('presencas')
        .select('presente')
        .eq('conselheiro_id', conselheiro.id)
        .gte('created_at', `${anoAtual}-${mesAtual.toString().padStart(2, '0')}-01`)
        .eq('presente', true);

      const { count: totalReunioesAno } = await supabase
        .from('reunioes')
        .select('*', { count: 'exact', head: true })
        .gte('data_reuniao', `${anoAtual}-01-01`)
        .lte('data_reuniao', `${anoAtual}-12-31`);

      // Buscar resoluções recentes
      const { data: resolucoesRecentes } = await supabase
        .from('resolucoes')
        .select('id, numero, titulo, data_aprovacao, status')
        .order('data_aprovacao', { ascending: false })
        .limit(5);

      return {
        proximas_reunioes: proximasReunioes?.map(r => ({
          id: r.id,
          titulo: r.titulo,
          data_reuniao: r.data_reuniao,
          local: r.local,
          status: r.status,
          tipo: r.tipo,
          pauta: r.pauta,
          participantes_confirmados: r.presencas?.filter((p: any) => p.presente).length || 0,
          total_conselheiros: r.presencas?.length || 0,
          quorum_atingido: (r.presencas?.filter((p: any) => p.presente).length || 0) >= Math.ceil((r.presencas?.length || 0) / 2),
          tempo_restante: Math.max(0, Math.ceil((new Date(r.data_reuniao).getTime() - Date.now()) / (1000 * 60)))
        })) || [],
        reuniao_atual: reuniaoAtual ? {
          id: reuniaoAtual.id,
          titulo: reuniaoAtual.titulo,
          data_reuniao: reuniaoAtual.data_reuniao,
          local: reuniaoAtual.local,
          status: reuniaoAtual.status,
          tipo: reuniaoAtual.tipo,
          pauta: reuniaoAtual.pauta,
          participantes_confirmados: reuniaoAtual.presencas?.filter((p: any) => p.presente).length || 0,
          total_conselheiros: reuniaoAtual.presencas?.length || 0,
          quorum_atingido: (reuniaoAtual.presencas?.filter((p: any) => p.presente).length || 0) >= Math.ceil((reuniaoAtual.presencas?.length || 0) / 2)
        } : undefined,
        notificacoes_pendentes: notificacoesPendentes || 0,
        atas_pendentes: 0, // TODO: implementar contagem de atas pendentes de aprovação
        resolucoes_recentes: resolucoesRecentes?.map(r => ({
          id: r.id,
          numero: r.numero,
          titulo: r.titulo,
          data: r.data_aprovacao,
          status: r.status
        })) || [],
        estatisticas: {
          presencas_mes: presencasMes?.length || 0,
          total_reunioes_ano: totalReunioesAno || 0,
          participacao_percentual: totalReunioesAno ? Math.round(((presencasMes?.length || 0) / (totalReunioesAno || 1)) * 100) : 0
        }
      };

    } catch (error) {
      console.error('Erro ao buscar dashboard mobile:', error);
      throw error;
    }
  }

  /**
   * Realizar check-in de presença via mobile
   */
  static async checkInPresenca(data: AttendanceData): Promise<{success: boolean; message: string}> {
    try {
      // Verificar se a reunião existe e está ativa
      const { data: reuniao, error: reuniaoError } = await supabase
        .from('reunioes')
        .select('id, status, data_reuniao, local')
        .eq('id', data.reuniao_id)
        .single();

      if (reuniaoError || !reuniao) {
        return {
          success: false,
          message: 'Reunião não encontrada'
        };
      }

      if (reuniao.status !== 'em_andamento' && reuniao.status !== 'agendada') {
        return {
          success: false,
          message: 'Reunião não está disponível para check-in'
        };
      }

      // Verificar se já existe presença registrada
      const { data: presencaExistente } = await supabase
        .from('presencas')
        .select('id, presente')
        .eq('reuniao_id', data.reuniao_id)
        .eq('conselheiro_id', data.conselheiro_id)
        .single();

      const presencaData = {
        reuniao_id: data.reuniao_id,
        conselheiro_id: data.conselheiro_id,
        presente: data.presente,
        hora_entrada: data.presente ? new Date().toISOString() : null,
        hora_saida: !data.presente ? new Date().toISOString() : null,
        observacoes: data.observacoes,
        checkin_location: data.location ? JSON.stringify(data.location) : null,
        checkin_mobile: true,
        updated_at: new Date().toISOString()
      };

      if (presencaExistente) {
        // Atualizar presença existente
        const { error } = await supabase
          .from('presencas')
          .update(presencaData)
          .eq('id', presencaExistente.id);

        if (error) throw error;
      } else {
        // Criar nova presença
        const { error } = await supabase
          .from('presencas')
          .insert({
            ...presencaData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Registrar log de auditoria
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'presencas',
          operation: presencaExistente ? 'update' : 'insert',
          record_id: data.reuniao_id,
          old_values: presencaExistente ? JSON.stringify(presencaExistente) : null,
          new_values: JSON.stringify(presencaData),
          user_id: data.conselheiro_id,
          created_at: new Date().toISOString(),
          metadata: JSON.stringify({
            tipo: 'checkin_mobile',
            reuniao_id: data.reuniao_id,
            location: data.location
          })
        });

      return {
        success: true,
        message: data.presente ? 'Check-in realizado com sucesso' : 'Check-out realizado com sucesso'
      };

    } catch (error) {
      console.error('Erro no check-in de presença:', error);
      return {
        success: false,
        message: 'Erro interno no check-in'
      };
    }
  }

  /**
   * Obter detalhes de reunião para mobile
   */
  static async getReunionDetails(reuniaoId: string, userId: string): Promise<ReunionMobileData | null> {
    try {
      const { data: reuniao, error } = await supabase
        .from('reunioes')
        .select(`
          id,
          titulo,
          data_reuniao,
          local,
          status,
          tipo,
          pauta,
          ata,
          presencas (
            conselheiro_id,
            presente,
            hora_entrada,
            hora_saida,
            conselheiros (
              nome,
              cargo
            )
          ),
          pautas_reuniao (
            id,
            titulo,
            descricao,
            ordem,
            status
          )
        `)
        .eq('id', reuniaoId)
        .single();

      if (error || !reuniao) {
        return null;
      }

      const proximaPauta = reuniao.pautas_reuniao
        ?.filter((p: any) => p.status === 'pendente')
        ?.sort((a: any, b: any) => a.ordem - b.ordem)[0];

      return {
        id: reuniao.id,
        titulo: reuniao.titulo,
        data_reuniao: reuniao.data_reuniao,
        local: reuniao.local,
        status: reuniao.status,
        tipo: reuniao.tipo,
        pauta: reuniao.pauta,
        participantes_confirmados: reuniao.presencas?.filter((p: any) => p.presente).length || 0,
        total_conselheiros: reuniao.presencas?.length || 0,
        quorum_atingido: (reuniao.presencas?.filter((p: any) => p.presente).length || 0) >= Math.ceil((reuniao.presencas?.length || 0) / 2),
        tempo_restante: Math.max(0, Math.ceil((new Date(reuniao.data_reuniao).getTime() - Date.now()) / (1000 * 60))),
        proxima_pauta: proximaPauta ? {
          id: proximaPauta.id,
          titulo: proximaPauta.titulo,
          descricao: proximaPauta.descricao
        } : undefined
      };

    } catch (error) {
      console.error('Erro ao buscar detalhes da reunião:', error);
      return null;
    }
  }

  /**
   * Atualizar preferências de notificação mobile
   */
  static async updateNotificationPreferences(
    userId: string, 
    preferences: NotificationPreferences
  ): Promise<{success: boolean; message: string}> {
    try {
      const { error } = await supabase
        .from('mobile_preferences')
        .upsert({
          user_id: userId,
          preferences: JSON.stringify(preferences),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return {
        success: true,
        message: 'Preferências atualizadas com sucesso'
      };

    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return {
        success: false,
        message: 'Erro ao atualizar preferências'
      };
    }
  }

  /**
   * Obter notificações do conselheiro
   */
  static async getNotifications(userId: string, limit = 20, offset = 0): Promise<any[]> {
    try {
      // Buscar conselheiro
      const { data: conselheiro } = await supabase
        .from('conselheiros')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!conselheiro) {
        return [];
      }

      const { data: notificacoes, error } = await supabase
        .from('notificacoes')
        .select(`
          id,
          titulo,
          mensagem,
          tipo,
          lida,
          created_at,
          data_envio,
          metadata
        `)
        .eq('destinatario_id', conselheiro.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return notificacoes || [];

    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ 
          lida: true, 
          lida_em: new Date().toISOString() 
        })
        .eq('id', notificationId);

      return !error;

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  /**
   * Validar sessão mobile
   */
  static async validateMobileSession(sessionToken: string): Promise<boolean> {
    try {
      const { data: session, error } = await supabase
        .from('mobile_sessions')
        .select('id, expires_at, active')
        .eq('session_token', sessionToken)
        .eq('active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      return !error && !!session;

    } catch (error) {
      console.error('Erro ao validar sessão mobile:', error);
      return false;
    }
  }
}