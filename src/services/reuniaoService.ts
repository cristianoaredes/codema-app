import { supabase } from '@/integrations/supabase/client';
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
        
        // Send convocation via email/WhatsApp
        let envioSucesso = false;
        
        try {
          // Buscar perfil do conselheiro para obter email
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name, notification_preferences')
            .eq('id', conselheiro.profile_id)
            .single();
          
          if (!profileError && profile?.email) {
            // Send email convocation
            if (tipo === 'email' || tipo === 'ambos') {
              const dataFormatada = new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              await supabase
                .from('email_queue')
                .insert({
                  to_email: profile.email,
                  subject: `Convocação para Reunião ${reuniao.tipo === 'ordinaria' ? 'Ordinária' : 'Extraordinária'} - CODEMA`,
                  html_content: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                      <h2>Convocação para Reunião - CODEMA</h2>
                      <p>Prezado(a) ${profile.full_name},</p>
                      <p>Você está sendo convocado(a) para a reunião ${reuniao.tipo} do CODEMA.</p>
                      
                      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Detalhes da Reunião:</h3>
                        <p><strong>Protocolo:</strong> ${protocolo}</p>
                        <p><strong>Data/Hora:</strong> ${dataFormatada}</p>
                        <p><strong>Local:</strong> ${reuniao.local}</p>
                        <p><strong>Tipo:</strong> ${reuniao.tipo === 'ordinaria' ? 'Ordinária' : 'Extraordinária'}</p>
                      </div>
                      
                      ${reuniao.pauta ? `
                        <h3>Pauta:</h3>
                        <div style="white-space: pre-line; background-color: #f9f9f9; padding: 10px; border-radius: 3px;">
                          ${reuniao.pauta}
                        </div>
                      ` : ''}
                      
                      ${reuniao.observacoes ? `
                        <h3>Observações:</h3>
                        <p>${reuniao.observacoes}</p>
                      ` : ''}
                      
                      <p>Sua presença é fundamental para o bom funcionamento do conselho.</p>
                      <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                    </div>
                  `,
                  text_content: `Convocação para reunião ${reuniao.tipo} em ${dataFormatada} - Local: ${reuniao.local}`,
                  email_type: 'convocacao',
                  scheduled_for: new Date().toISOString()
                });
              
              envioSucesso = true;
            }
            
            // WhatsApp integration
            if (tipo === 'whatsapp' || tipo === 'ambos') {
              // Check if profile has WhatsApp (phone number)
              const { data: conselheiroData, error: conselheiroError } = await supabase
                .from('conselheiros')
                .select('telefone, whatsapp')
                .eq('profile_id', conselheiro.profile_id)
                .single();

              const phoneNumber = conselheiroData?.whatsapp || conselheiroData?.telefone;
              
              if (!conselheiroError && phoneNumber) {
                const dataFormatada = new Date(reuniao.data_reuniao).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                // Create WhatsApp message content
                const whatsappMessage = `
🏛️ *Convocação CODEMA*

Prezado(a) ${profile.full_name},

Você está sendo convocado(a) para a reunião ${reuniao.tipo} do CODEMA.

📅 *Data/Hora:* ${dataFormatada}
📍 *Local:* ${reuniao.local}
📋 *Protocolo:* ${protocolo}

${reuniao.pauta ? `
*Pauta:*
${reuniao.pauta.substring(0, 200)}${reuniao.pauta.length > 200 ? '...' : ''}
` : ''}

Sua presença é fundamental para o bom funcionamento do conselho.

Atenciosamente,
Secretaria do CODEMA
                `.trim();

                // Queue WhatsApp message for sending
                await supabase
                  .from('whatsapp_queue')
                  .insert({
                    to_phone: phoneNumber.replace(/\D/g, ''), // Remove non-digits
                    message_content: whatsappMessage,
                    message_type: 'convocacao',
                    scheduled_for: new Date().toISOString(),
                    status: 'pending',
                    metadata: {
                      reuniao_id: reuniaoId,
                      conselheiro_id: conselheiro.id,
                      protocolo: protocolo
                    }
                  });

                console.log(`WhatsApp convocation queued for ${profile.full_name} at ${phoneNumber}`);
                envioSucesso = true;
              } else {
                console.warn(`No WhatsApp/phone number found for ${profile.full_name}`);
              }
            }
          }
        } catch (emailError) {
          console.error('Erro ao enviar convocação por email:', emailError);
        }
        
        // Update convocation status
        await supabase
          .from('convocacoes')
          .update({
            status: envioSucesso ? 'enviada' : 'erro',
            enviada_em: envioSucesso ? new Date().toISOString() : null
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
      try {
        // Get conselheiro data for notification
        const { data: conselheiro } = await supabase
          .from('conselheiros')
          .select(`
            id,
            profiles:profile_id (
              full_name,
              email
            )
          `)
          .eq('id', conselheiroId)
          .single();

        if (conselheiro?.profiles?.email) {
          // Queue alert notification email
          await supabase
            .from('email_queue')
            .insert({
              to_email: conselheiro.profiles.email,
              subject: 'Alerta: Muitas Faltas Consecutivas - CODEMA',
              html_content: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2>Alerta de Presença - CODEMA</h2>
                  <p>Prezado(a) ${conselheiro.profiles.full_name},</p>
                  <p>Registramos que você teve <strong>${faltasConsecutivas} faltas consecutivas</strong> em reuniões do CODEMA.</p>
                  <p>Lembramos que a participação regular é fundamental para o bom funcionamento do conselho.</p>
                  <p>Em caso de dificuldades para participar, entre em contato conosco.</p>
                  <p>Atenciosamente,<br/>Secretaria do CODEMA</p>
                </div>
              `,
              text_content: `Alerta: ${faltasConsecutivas} faltas consecutivas registradas para ${conselheiro.profiles.full_name}`,
              email_type: 'alert',
              scheduled_for: new Date().toISOString()
            });

          console.log(`Alerta de faltas enviado para: ${conselheiro.profiles.email}`);
        }
      } catch (error) {
        console.error('Erro ao enviar alerta de faltas:', error);
        // Log but don't fail the main operation
      }
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
    
    // Count decisions and referrals from meeting minutes if available
    let totalDecisoes = 0;
    let totalEncaminhamentos = 0;
    
    if (reuniao?.ata) {
      try {
        // Parse ata content to count decisions and referrals
        const ataContent = reuniao.ata.toLowerCase();
        
        // Count decisions (looking for common decision-related terms)
        const decisaoTerms = ['aprovado', 'rejeitado', 'decidido', 'resolvido', 'deliberado'];
        totalDecisoes = decisaoTerms.reduce((count, term) => {
          const matches = ataContent.match(new RegExp(term, 'g'));
          return count + (matches ? matches.length : 0);
        }, 0);
        
        // Count referrals (looking for referral-related terms)
        const encaminhamentoTerms = ['encaminhado', 'encaminha-se', 'solicita-se', 'recomenda-se'];
        totalEncaminhamentos = encaminhamentoTerms.reduce((count, term) => {
          const matches = ataContent.match(new RegExp(term, 'g'));
          return count + (matches ? matches.length : 0);
        }, 0);
      } catch (error) {
        console.warn('Erro ao analisar ata para contagem:', error);
      }
    }
    
    return {
      presencaPercentual: quorum.percentualPresenca,
      totalDecisoes,
      totalEncaminhamentos,
      temAta: !!reuniao?.ata,
      temQuorum: quorum.hasQuorum
    };
  }

  /**
   * Valida dados da reunião antes de salvar
   */
  static validateReuniaoData(data: Record<string, unknown>): {
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