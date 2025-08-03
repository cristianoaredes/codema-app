export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      atas: {
        Row: {
          assinatura_presidente: string | null
          assinatura_secretario: string | null
          ausentes: Json
          created_at: string | null
          created_by: string
          data_assinatura_presidente: string | null
          data_assinatura_secretario: string | null
          data_reuniao: string
          deliberacoes: Json
          hash_integridade: string | null
          hora_fim: string | null
          hora_inicio: string
          id: string
          local_reuniao: string
          numero: string
          observacoes: string | null
          pauta: Json
          pdf_gerado: boolean | null
          pdf_url: string | null
          presentes: Json
          rascunho: boolean | null
          reuniao_id: string | null
          status: string | null
          template_id: string | null
          tipo_reuniao: string
          updated_at: string | null
          updated_by: string | null
          versao: number | null
        }
        Insert: {
          assinatura_presidente?: string | null
          assinatura_secretario?: string | null
          ausentes?: Json
          created_at?: string | null
          created_by: string
          data_assinatura_presidente?: string | null
          data_assinatura_secretario?: string | null
          data_reuniao: string
          deliberacoes?: Json
          hash_integridade?: string | null
          hora_fim?: string | null
          hora_inicio: string
          id?: string
          local_reuniao: string
          numero: string
          observacoes?: string | null
          pauta?: Json
          pdf_gerado?: boolean | null
          pdf_url?: string | null
          presentes?: Json
          rascunho?: boolean | null
          reuniao_id?: string | null
          status?: string | null
          template_id?: string | null
          tipo_reuniao: string
          updated_at?: string | null
          updated_by?: string | null
          versao?: number | null
        }
        Update: {
          assinatura_presidente?: string | null
          assinatura_secretario?: string | null
          ausentes?: Json
          created_at?: string | null
          created_by?: string
          data_assinatura_presidente?: string | null
          data_assinatura_secretario?: string | null
          data_reuniao?: string
          deliberacoes?: Json
          hash_integridade?: string | null
          hora_fim?: string | null
          hora_inicio?: string
          id?: string
          local_reuniao?: string
          numero?: string
          observacoes?: string | null
          pauta?: Json
          pdf_gerado?: boolean | null
          pdf_url?: string | null
          presentes?: Json
          rascunho?: boolean | null
          reuniao_id?: string | null
          status?: string | null
          template_id?: string | null
          tipo_reuniao?: string
          updated_at?: string | null
          updated_by?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "atas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "atas_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      atas_notificacoes: {
        Row: {
          ata_id: string | null
          created_at: string | null
          data_envio: string | null
          destinatario_id: string
          enviado: boolean | null
          id: string
          tipo: string
        }
        Insert: {
          ata_id?: string | null
          created_at?: string | null
          data_envio?: string | null
          destinatario_id: string
          enviado?: boolean | null
          id?: string
          tipo: string
        }
        Update: {
          ata_id?: string | null
          created_at?: string | null
          data_envio?: string | null
          destinatario_id?: string
          enviado?: boolean | null
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "atas_notificacoes_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      atas_revisoes: {
        Row: {
          ata_id: string | null
          comentario: string
          created_at: string | null
          id: string
          linha_referencia: number | null
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          revisor_id: string
          secao: string
          status: string | null
          sugestao_alteracao: string | null
        }
        Insert: {
          ata_id?: string | null
          comentario: string
          created_at?: string | null
          id?: string
          linha_referencia?: number | null
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          revisor_id: string
          secao: string
          status?: string | null
          sugestao_alteracao?: string | null
        }
        Update: {
          ata_id?: string | null
          comentario?: string
          created_at?: string | null
          id?: string
          linha_referencia?: number | null
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          revisor_id?: string
          secao?: string
          status?: string | null
          sugestao_alteracao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atas_revisoes_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      atas_templates: {
        Row: {
          ativo: boolean | null
          campos_obrigatorios: Json
          conteudo_template: string
          created_at: string | null
          created_by: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos_obrigatorios?: Json
          conteudo_template: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos_obrigatorios?: Json
          conteudo_template?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      atas_versoes: {
        Row: {
          ata_id: string | null
          conteudo: Json
          created_at: string | null
          created_by: string
          id: string
          modificacoes: string | null
          versao: number
        }
        Insert: {
          ata_id?: string | null
          conteudo: Json
          created_at?: string | null
          created_by: string
          id?: string
          modificacoes?: string | null
          versao: number
        }
        Update: {
          ata_id?: string | null
          conteudo?: Json
          created_at?: string | null
          created_by?: string
          id?: string
          modificacoes?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "atas_versoes_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          ip_address: unknown | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conselheiros: {
        Row: {
          cpf: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          entidade_representada: string
          faltas_consecutivas: number | null
          id: string
          mandato_fim: string
          mandato_inicio: string
          mandato_numero: number | null
          nome_completo: string
          observacoes: string | null
          profile_id: string | null
          segmento: string
          status: string | null
          telefone: string | null
          titular: boolean | null
          total_faltas: number | null
          updated_at: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          entidade_representada: string
          faltas_consecutivas?: number | null
          id?: string
          mandato_fim: string
          mandato_inicio: string
          mandato_numero?: number | null
          nome_completo: string
          observacoes?: string | null
          profile_id?: string | null
          segmento: string
          status?: string | null
          telefone?: string | null
          titular?: boolean | null
          total_faltas?: number | null
          updated_at?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          entidade_representada?: string
          faltas_consecutivas?: number | null
          id?: string
          mandato_fim?: string
          mandato_inicio?: string
          mandato_numero?: number | null
          nome_completo?: string
          observacoes?: string | null
          profile_id?: string | null
          segmento?: string
          status?: string | null
          telefone?: string | null
          titular?: boolean | null
          total_faltas?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conselheiros_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      convocacao_agendamentos: {
        Row: {
          created_at: string | null
          data_envio_programada: string
          data_envio_realizada: string | null
          enviar_email: boolean | null
          enviar_whatsapp: boolean | null
          erro_processamento: string | null
          id: string
          reuniao_id: string | null
          status: string | null
          template_id: string | null
          total_enviadas: number | null
          total_erros: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_envio_programada: string
          data_envio_realizada?: string | null
          enviar_email?: boolean | null
          enviar_whatsapp?: boolean | null
          erro_processamento?: string | null
          id?: string
          reuniao_id?: string | null
          status?: string | null
          template_id?: string | null
          total_enviadas?: number | null
          total_erros?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_envio_programada?: string
          data_envio_realizada?: string | null
          enviar_email?: boolean | null
          enviar_whatsapp?: boolean | null
          erro_processamento?: string | null
          id?: string
          reuniao_id?: string | null
          status?: string | null
          template_id?: string | null
          total_enviadas?: number | null
          total_erros?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convocacao_agendamentos_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convocacao_agendamentos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "convocacao_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      convocacao_templates: {
        Row: {
          assunto_email: string
          ativo: boolean | null
          corpo_email: string
          corpo_whatsapp: string | null
          created_at: string | null
          dias_antecedencia: number | null
          id: string
          nome: string
          tipo_reuniao: string
          updated_at: string | null
        }
        Insert: {
          assunto_email: string
          ativo?: boolean | null
          corpo_email: string
          corpo_whatsapp?: string | null
          created_at?: string | null
          dias_antecedencia?: number | null
          id?: string
          nome: string
          tipo_reuniao: string
          updated_at?: string | null
        }
        Update: {
          assunto_email?: string
          ativo?: boolean | null
          corpo_email?: string
          corpo_whatsapp?: string | null
          created_at?: string | null
          dias_antecedencia?: number | null
          id?: string
          nome?: string
          tipo_reuniao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      convocacoes: {
        Row: {
          confirmacao_presenca: string | null
          conselheiro_id: string | null
          created_at: string | null
          data_confirmacao: string | null
          enviada_em: string | null
          erro_envio: string | null
          id: string
          observacoes: string | null
          reuniao_id: string | null
          status: string | null
          tipo_envio: string
          token_confirmacao: string | null
          updated_at: string | null
        }
        Insert: {
          confirmacao_presenca?: string | null
          conselheiro_id?: string | null
          created_at?: string | null
          data_confirmacao?: string | null
          enviada_em?: string | null
          erro_envio?: string | null
          id?: string
          observacoes?: string | null
          reuniao_id?: string | null
          status?: string | null
          tipo_envio: string
          token_confirmacao?: string | null
          updated_at?: string | null
        }
        Update: {
          confirmacao_presenca?: string | null
          conselheiro_id?: string | null
          created_at?: string | null
          data_confirmacao?: string | null
          enviada_em?: string | null
          erro_envio?: string | null
          id?: string
          observacoes?: string | null
          reuniao_id?: string | null
          status?: string | null
          tipo_envio?: string
          token_confirmacao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convocacoes_conselheiro_id_fkey"
            columns: ["conselheiro_id"]
            isOneToOne: false
            referencedRelation: "conselheiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convocacoes_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          autor_id: string
          created_at: string
          id: string
          palavras_chave: string[] | null
          reuniao_id: string | null
          status: string
          tamanho_arquivo: number | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          autor_id: string
          created_at?: string
          id?: string
          palavras_chave?: string[] | null
          reuniao_id?: string | null
          status?: string
          tamanho_arquivo?: number | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          autor_id?: string
          created_at?: string
          id?: string
          palavras_chave?: string[] | null
          reuniao_id?: string | null
          status?: string
          tamanho_arquivo?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          created_by: string | null
          email_type: string
          error_details: Json | null
          error_message: string | null
          failed_at: string | null
          html_content: string
          id: string
          max_attempts: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          subject: string
          text_content: string | null
          to_email: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          created_by?: string | null
          email_type: string
          error_details?: Json | null
          error_message?: string | null
          failed_at?: string | null
          html_content: string
          id?: string
          max_attempts?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          subject: string
          text_content?: string | null
          to_email: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          created_by?: string | null
          email_type?: string
          error_details?: Json | null
          error_message?: string | null
          failed_at?: string | null
          html_content?: string
          id?: string
          max_attempts?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          text_content?: string | null
          to_email?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fma_projetos: {
        Row: {
          area_atuacao: Database["public"]["Enums"]["fma_projeto_area"]
          cpf_cnpj_proponente: string | null
          created_at: string | null
          data_fim_prevista: string | null
          data_inicio_prevista: string | null
          descricao: string
          id: string
          objetivos: string | null
          percentual_execucao: number | null
          prazo_execucao: number | null
          proponente: string
          status: Database["public"]["Enums"]["fma_projeto_status"]
          titulo: string
          updated_at: string | null
          valor_aprovado: number | null
          valor_solicitado: number
        }
        Insert: {
          area_atuacao: Database["public"]["Enums"]["fma_projeto_area"]
          cpf_cnpj_proponente?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio_prevista?: string | null
          descricao: string
          id?: string
          objetivos?: string | null
          percentual_execucao?: number | null
          prazo_execucao?: number | null
          proponente: string
          status?: Database["public"]["Enums"]["fma_projeto_status"]
          titulo: string
          updated_at?: string | null
          valor_aprovado?: number | null
          valor_solicitado: number
        }
        Update: {
          area_atuacao?: Database["public"]["Enums"]["fma_projeto_area"]
          cpf_cnpj_proponente?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio_prevista?: string | null
          descricao?: string
          id?: string
          objetivos?: string | null
          percentual_execucao?: number | null
          prazo_execucao?: number | null
          proponente?: string
          status?: Database["public"]["Enums"]["fma_projeto_status"]
          titulo?: string
          updated_at?: string | null
          valor_aprovado?: number | null
          valor_solicitado?: number
        }
        Relationships: []
      }
      fma_receitas: {
        Row: {
          created_at: string | null
          data_entrada: string
          descricao: string
          id: string
          numero_documento: string | null
          origem: string
          responsavel_cadastro_id: string | null
          status: Database["public"]["Enums"]["fma_receita_status"]
          tipo_receita: Database["public"]["Enums"]["fma_receita_tipo"]
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_entrada: string
          descricao: string
          id?: string
          numero_documento?: string | null
          origem: string
          responsavel_cadastro_id?: string | null
          status?: Database["public"]["Enums"]["fma_receita_status"]
          tipo_receita: Database["public"]["Enums"]["fma_receita_tipo"]
          updated_at?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_entrada?: string
          descricao?: string
          id?: string
          numero_documento?: string | null
          origem?: string
          responsavel_cadastro_id?: string | null
          status?: Database["public"]["Enums"]["fma_receita_status"]
          tipo_receita?: Database["public"]["Enums"]["fma_receita_tipo"]
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      impedimentos_conselheiros: {
        Row: {
          ativo: boolean | null
          conselheiro_id: string | null
          created_at: string | null
          declarado_em: string | null
          id: string
          motivo: string
          processo_id: string | null
          reuniao_id: string | null
          tipo_impedimento: string
        }
        Insert: {
          ativo?: boolean | null
          conselheiro_id?: string | null
          created_at?: string | null
          declarado_em?: string | null
          id?: string
          motivo: string
          processo_id?: string | null
          reuniao_id?: string | null
          tipo_impedimento: string
        }
        Update: {
          ativo?: boolean | null
          conselheiro_id?: string | null
          created_at?: string | null
          declarado_em?: string | null
          id?: string
          motivo?: string
          processo_id?: string | null
          reuniao_id?: string | null
          tipo_impedimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "impedimentos_conselheiros_conselheiro_id_fkey"
            columns: ["conselheiro_id"]
            isOneToOne: false
            referencedRelation: "conselheiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impedimentos_conselheiros_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          assunto: string
          created_at: string | null
          data_envio_programada: string
          data_envio_realizada: string | null
          erro_envio: string | null
          horas_antecedencia: number
          id: string
          mensagem: string
          reuniao_id: string | null
          status: string | null
          tipo_envio: string
          total_enviados: number | null
        }
        Insert: {
          assunto: string
          created_at?: string | null
          data_envio_programada: string
          data_envio_realizada?: string | null
          erro_envio?: string | null
          horas_antecedencia?: number
          id?: string
          mensagem: string
          reuniao_id?: string | null
          status?: string | null
          tipo_envio: string
          total_enviados?: number | null
        }
        Update: {
          assunto?: string
          created_at?: string | null
          data_envio_programada?: string
          data_envio_realizada?: string | null
          erro_envio?: string | null
          horas_antecedencia?: number
          id?: string
          mensagem?: string
          reuniao_id?: string | null
          status?: string | null
          tipo_envio?: string
          total_enviados?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          reset_token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          reset_token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          reset_token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "password_reset_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      persistent_sessions: {
        Row: {
          created_at: string | null
          device_id: string
          device_info: Json | null
          expires_at: string
          id: string
          last_used: string | null
          refresh_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id: string
          device_info?: Json | null
          expires_at: string
          id?: string
          last_used?: string | null
          refresh_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          last_used?: string | null
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      presencas: {
        Row: {
          conselheiro_id: string | null
          created_at: string | null
          horario_chegada: string | null
          horario_saida: string | null
          id: string
          justificativa_ausencia: string | null
          observacoes: string | null
          presente: boolean | null
          reuniao_id: string | null
          updated_at: string | null
        }
        Insert: {
          conselheiro_id?: string | null
          created_at?: string | null
          horario_chegada?: string | null
          horario_saida?: string | null
          id?: string
          justificativa_ausencia?: string | null
          observacoes?: string | null
          presente?: boolean | null
          reuniao_id?: string | null
          updated_at?: string | null
        }
        Update: {
          conselheiro_id?: string | null
          created_at?: string | null
          horario_chegada?: string | null
          horario_saida?: string | null
          id?: string
          justificativa_ausencia?: string | null
          observacoes?: string | null
          presente?: boolean | null
          reuniao_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presencas_conselheiro_id_fkey"
            columns: ["conselheiro_id"]
            isOneToOne: false
            referencedRelation: "conselheiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      presidency_delegations: {
        Row: {
          created_at: string
          delegated_at: string
          expires_at: string
          id: string
          president_id: string
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
          vice_president_id: string
        }
        Insert: {
          created_at?: string
          delegated_at?: string
          expires_at: string
          id?: string
          president_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          vice_president_id: string
        }
        Update: {
          created_at?: string
          delegated_at?: string
          expires_at?: string
          id?: string
          president_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          vice_president_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presidency_delegations_president_id_fkey"
            columns: ["president_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presidency_delegations_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presidency_delegations_vice_president_id_fkey"
            columns: ["vice_president_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          deactivated_at: string | null
          deactivated_by: string | null
          deactivation_reason: string | null
          delegation_expires_at: string | null
          delegation_granted_at: string | null
          delegation_granted_by: string | null
          email: string | null
          full_name: string | null
          id: string
          is_acting_president: boolean | null
          is_active: boolean | null
          neighborhood: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          delegation_expires_at?: string | null
          delegation_granted_at?: string | null
          delegation_granted_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_acting_president?: boolean | null
          is_active?: boolean | null
          neighborhood?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          delegation_expires_at?: string | null
          delegation_granted_at?: string | null
          delegation_granted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_acting_president?: boolean | null
          is_active?: boolean | null
          neighborhood?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_delegation_granted_by_fkey"
            columns: ["delegation_granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos_sequencia: {
        Row: {
          ano: number
          created_at: string | null
          id: string
          tipo: string
          ultimo_numero: number
          updated_at: string | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          id?: string
          tipo: string
          ultimo_numero?: number
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          id?: string
          tipo?: string
          ultimo_numero?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          admin_response: string | null
          category_id: string
          created_at: string
          description: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          photos: string[] | null
          priority: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_response?: string | null
          category_id: string
          created_at?: string
          description: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          photos?: string[] | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_response?: string | null
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          photos?: string[] | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resolucoes: {
        Row: {
          abstencoes: number | null
          artigos: Json
          assinatura_presidente: string | null
          assinatura_secretario: string | null
          ata_id: string | null
          base_legal: string
          considerandos: Json
          created_at: string | null
          created_by: string
          data_aprovacao: string | null
          data_assinatura_presidente: string | null
          data_assinatura_secretario: string | null
          data_discussao: string | null
          data_publicacao: string | null
          data_revogacao: string | null
          data_vigencia: string | null
          data_votacao: string | null
          disposicoes_finais: string | null
          ementa: string
          hash_integridade: string | null
          id: string
          motivo_revogacao: string | null
          numero: string
          pdf_gerado: boolean | null
          pdf_url: string | null
          protocolo: string | null
          quorum_presente: number | null
          referencias_legais: Json | null
          resultado_votacao: string | null
          reuniao_id: string | null
          revogada_por: string | null
          status: string | null
          template_id: string | null
          tipo: string
          titulo: string
          total_conselheiros: number | null
          updated_at: string | null
          updated_by: string | null
          votos_contra: number | null
          votos_favor: number | null
        }
        Insert: {
          abstencoes?: number | null
          artigos?: Json
          assinatura_presidente?: string | null
          assinatura_secretario?: string | null
          ata_id?: string | null
          base_legal: string
          considerandos?: Json
          created_at?: string | null
          created_by: string
          data_aprovacao?: string | null
          data_assinatura_presidente?: string | null
          data_assinatura_secretario?: string | null
          data_discussao?: string | null
          data_publicacao?: string | null
          data_revogacao?: string | null
          data_vigencia?: string | null
          data_votacao?: string | null
          disposicoes_finais?: string | null
          ementa: string
          hash_integridade?: string | null
          id?: string
          motivo_revogacao?: string | null
          numero: string
          pdf_gerado?: boolean | null
          pdf_url?: string | null
          protocolo?: string | null
          quorum_presente?: number | null
          referencias_legais?: Json | null
          resultado_votacao?: string | null
          reuniao_id?: string | null
          revogada_por?: string | null
          status?: string | null
          template_id?: string | null
          tipo: string
          titulo: string
          total_conselheiros?: number | null
          updated_at?: string | null
          updated_by?: string | null
          votos_contra?: number | null
          votos_favor?: number | null
        }
        Update: {
          abstencoes?: number | null
          artigos?: Json
          assinatura_presidente?: string | null
          assinatura_secretario?: string | null
          ata_id?: string | null
          base_legal?: string
          considerandos?: Json
          created_at?: string | null
          created_by?: string
          data_aprovacao?: string | null
          data_assinatura_presidente?: string | null
          data_assinatura_secretario?: string | null
          data_discussao?: string | null
          data_publicacao?: string | null
          data_revogacao?: string | null
          data_vigencia?: string | null
          data_votacao?: string | null
          disposicoes_finais?: string | null
          ementa?: string
          hash_integridade?: string | null
          id?: string
          motivo_revogacao?: string | null
          numero?: string
          pdf_gerado?: boolean | null
          pdf_url?: string | null
          protocolo?: string | null
          quorum_presente?: number | null
          referencias_legais?: Json | null
          resultado_votacao?: string | null
          reuniao_id?: string | null
          revogada_por?: string | null
          status?: string | null
          template_id?: string | null
          tipo?: string
          titulo?: string
          total_conselheiros?: number | null
          updated_at?: string | null
          updated_by?: string | null
          votos_contra?: number | null
          votos_favor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resolucoes_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "atas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolucoes_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolucoes_revogada_por_fkey"
            columns: ["revogada_por"]
            isOneToOne: false
            referencedRelation: "resolucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolucoes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resolucoes_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      resolucoes_publicacao: {
        Row: {
          created_at: string | null
          data_publicacao: string
          edicao: string | null
          id: string
          pagina: string | null
          publicado_por: string
          resolucao_id: string | null
          url_publicacao: string | null
          veiculo_publicacao: string
        }
        Insert: {
          created_at?: string | null
          data_publicacao: string
          edicao?: string | null
          id?: string
          pagina?: string | null
          publicado_por: string
          resolucao_id?: string | null
          url_publicacao?: string | null
          veiculo_publicacao: string
        }
        Update: {
          created_at?: string | null
          data_publicacao?: string
          edicao?: string | null
          id?: string
          pagina?: string | null
          publicado_por?: string
          resolucao_id?: string | null
          url_publicacao?: string | null
          veiculo_publicacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolucoes_publicacao_resolucao_id_fkey"
            columns: ["resolucao_id"]
            isOneToOne: false
            referencedRelation: "resolucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      resolucoes_revogacoes: {
        Row: {
          artigos_revogados: Json | null
          created_at: string | null
          created_by: string
          data_revogacao: string
          id: string
          motivo: string
          resolucao_original_id: string
          resolucao_revogadora_id: string
          tipo_revogacao: string
        }
        Insert: {
          artigos_revogados?: Json | null
          created_at?: string | null
          created_by: string
          data_revogacao: string
          id?: string
          motivo: string
          resolucao_original_id: string
          resolucao_revogadora_id: string
          tipo_revogacao: string
        }
        Update: {
          artigos_revogados?: Json | null
          created_at?: string | null
          created_by?: string
          data_revogacao?: string
          id?: string
          motivo?: string
          resolucao_original_id?: string
          resolucao_revogadora_id?: string
          tipo_revogacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolucoes_revogacoes_resolucao_original_id_fkey"
            columns: ["resolucao_original_id"]
            isOneToOne: false
            referencedRelation: "resolucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolucoes_revogacoes_resolucao_revogadora_id_fkey"
            columns: ["resolucao_revogadora_id"]
            isOneToOne: false
            referencedRelation: "resolucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      resolucoes_templates: {
        Row: {
          ativo: boolean | null
          base_legal: string | null
          campos_obrigatorios: Json
          conteudo_template: string
          created_at: string | null
          created_by: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          base_legal?: string | null
          campos_obrigatorios?: Json
          conteudo_template: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          base_legal?: string | null
          campos_obrigatorios?: Json
          conteudo_template?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resolucoes_tramitacao: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          etapa: string
          id: string
          observacoes: string | null
          prazo_estimado: number | null
          resolucao_id: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          etapa: string
          id?: string
          observacoes?: string | null
          prazo_estimado?: number | null
          resolucao_id?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          etapa?: string
          id?: string
          observacoes?: string | null
          prazo_estimado?: number | null
          resolucao_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolucoes_tramitacao_resolucao_id_fkey"
            columns: ["resolucao_id"]
            isOneToOne: false
            referencedRelation: "resolucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      resolucoes_votos: {
        Row: {
          conselheiro_id: string
          created_at: string | null
          data_voto: string | null
          id: string
          impedimento: boolean | null
          ip_address: unknown | null
          justificativa: string | null
          motivo_impedimento: string | null
          resolucao_id: string | null
          voto: string
        }
        Insert: {
          conselheiro_id: string
          created_at?: string | null
          data_voto?: string | null
          id?: string
          impedimento?: boolean | null
          ip_address?: unknown | null
          justificativa?: string | null
          motivo_impedimento?: string | null
          resolucao_id?: string | null
          voto: string
        }
        Update: {
          conselheiro_id?: string
          created_at?: string | null
          data_voto?: string | null
          id?: string
          impedimento?: boolean | null
          ip_address?: unknown | null
          justificativa?: string | null
          motivo_impedimento?: string | null
          resolucao_id?: string | null
          voto?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolucoes_votos_conselheiro_id_fkey"
            columns: ["conselheiro_id"]
            isOneToOne: false
            referencedRelation: "conselheiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolucoes_votos_resolucao_id_fkey"
            columns: ["resolucao_id"]
            isOneToOne: false
            referencedRelation: "resolucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      reunioes: {
        Row: {
          ata: string | null
          created_at: string
          data_reuniao: string
          id: string
          local: string
          pauta: string | null
          protocolo: string | null
          protocolo_ata: string | null
          protocolo_convocacao: string | null
          secretario_id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ata?: string | null
          created_at?: string
          data_reuniao: string
          id?: string
          local: string
          pauta?: string | null
          protocolo?: string | null
          protocolo_ata?: string | null
          protocolo_convocacao?: string | null
          secretario_id: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ata?: string | null
          created_at?: string
          data_reuniao?: string
          id?: string
          local?: string
          pauta?: string | null
          protocolo?: string | null
          protocolo_ata?: string | null
          protocolo_convocacao?: string | null
          secretario_id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_secretario_id_fkey"
            columns: ["secretario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      service_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          report_id: string | null
          service_type: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          report_id?: string | null
          service_type: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          report_id?: string | null
          service_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_ratings_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          address: string | null
          created_at: string | null
          created_by: string
          email: string
          expires_at: string
          full_name: string
          id: string
          invitation_token: string
          message: string | null
          neighborhood: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          address?: string | null
          created_at?: string | null
          created_by: string
          email: string
          expires_at: string
          full_name: string
          id?: string
          invitation_token: string
          message?: string | null
          neighborhood?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          address?: string | null
          created_at?: string | null
          created_by?: string
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invitation_token?: string
          message?: string | null
          neighborhood?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          location_info: Json | null
          login_at: string | null
          logout_at: string | null
          session_token: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          location_info?: Json | null
          login_at?: string | null
          logout_at?: string | null
          session_token?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          location_info?: Json | null
          login_at?: string | null
          logout_at?: string | null
          session_token?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_resultado_votacao: {
        Args: { resolucao_uuid: string }
        Returns: string
      }
      change_user_role: {
        Args: { target_user_id: string; new_role: string; reason?: string }
        Returns: undefined
      }
      check_auth_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_type: string
          issue_description: string
          affected_count: number
          details: Json
        }[]
      }
      cleanup_expired_persistent_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_inactive_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_emails: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      consultar_proximo_protocolo: {
        Args: { tipo_protocolo: string }
        Returns: string
      }
      create_persistent_session: {
        Args: {
          p_user_id: string
          p_device_id: string
          p_refresh_token: string
          p_expires_at: string
          p_device_info: string
        }
        Returns: undefined
      }
      deactivate_user: {
        Args: { target_user_id: string; reason?: string }
        Returns: undefined
      }
      delegate_presidency_to_vice: {
        Args: { vice_president_id: string; expires_at?: string }
        Returns: Json
      }
      desabilitar_cron_job: {
        Args: { job_name: string }
        Returns: boolean
      }
      generate_security_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          metric_value: string
          details: Json
        }[]
      }
      gerar_proximo_numero_ata: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gerar_proximo_numero_resolucao: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gerar_proximo_protocolo: {
        Args: { tipo_protocolo: string }
        Returns: string
      }
      get_persistent_session: {
        Args: { p_device_id: string; p_user_id: string }
        Returns: {
          user_id: string
          device_id: string
          refresh_token: string
          expires_at: string
          created_at: string
          last_used: string
          device_info: Json
        }[]
      }
      get_user_persistent_sessions: {
        Args: { p_user_id: string }
        Returns: {
          user_id: string
          device_id: string
          refresh_token: string
          expires_at: string
          created_at: string
          last_used: string
          device_info: Json
        }[]
      }
      has_admin_access: {
        Args: { user_id?: string }
        Returns: boolean
      }
      has_codema_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
      has_role: {
        Args: { required_roles: string[] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_currently_acting_president: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_vice_acting_as_president: {
        Args: { user_id?: string }
        Returns: boolean
      }
      listar_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          jobid: number
          schedule: string
          command: string
          nodename: string
          nodeport: number
          database: string
          username: string
          active: boolean
          jobname: string
        }[]
      }
      log_security_event: {
        Args: {
          event_type: string
          table_name?: string
          record_id?: string
          old_data?: Json
          new_data?: Json
          additional_context?: Json
        }
        Returns: undefined
      }
      obter_estatisticas_protocolos: {
        Args: { ano_filtro?: number }
        Returns: {
          tipo: string
          ano: number
          total_gerados: number
          ultimo_numero: number
          ultima_atualizacao: string
        }[]
      }
      process_email_queue: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      reabilitar_cron_job: {
        Args: { job_name: string; schedule_expr: string; command_sql: string }
        Returns: number
      }
      reactivate_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      resetar_sequencia_protocolo: {
        Args: { tipo_protocolo: string; novo_ano?: number }
        Returns: undefined
      }
      retry_failed_emails: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      revoke_all_user_sessions: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      revoke_persistent_session: {
        Args: { p_device_id: string }
        Returns: undefined
      }
      revoke_presidency_delegation: {
        Args: { vice_president_id: string }
        Returns: Json
      }
      secure_delegate_presidency: {
        Args: { vice_president_id: string; expires_at: string }
        Returns: Json
      }
      secure_revoke_delegation: {
        Args: { delegation_id: string }
        Returns: Json
      }
      secure_update_user_role: {
        Args: { target_user_id: string; new_role: string; reason?: string }
        Returns: Json
      }
      track_user_login: {
        Args: {
          p_user_id: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_device_info?: Json
          p_location_info?: Json
        }
        Returns: string
      }
      track_user_logout: {
        Args: { p_user_id: string; p_session_id?: string }
        Returns: undefined
      }
      update_session_last_used: {
        Args: { p_device_id: string }
        Returns: undefined
      }
    }
    Enums: {
      fma_projeto_area:
        | "educacao_ambiental"
        | "recuperacao_areas"
        | "conservacao_biodiversidade"
        | "saneamento"
        | "fiscalizacao"
        | "outros"
      fma_projeto_status:
        | "submetido"
        | "em_analise"
        | "aprovado"
        | "reprovado"
        | "em_execucao"
        | "concluido"
        | "cancelado"
      fma_receita_status: "previsto" | "recebido" | "cancelado"
      fma_receita_tipo:
        | "multa"
        | "tac"
        | "convenio"
        | "doacao"
        | "transferencia"
        | "outros"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      fma_projeto_area: [
        "educacao_ambiental",
        "recuperacao_areas",
        "conservacao_biodiversidade",
        "saneamento",
        "fiscalizacao",
        "outros",
      ],
      fma_projeto_status: [
        "submetido",
        "em_analise",
        "aprovado",
        "reprovado",
        "em_execucao",
        "concluido",
        "cancelado",
      ],
      fma_receita_status: ["previsto", "recebido", "cancelado"],
      fma_receita_tipo: [
        "multa",
        "tac",
        "convenio",
        "doacao",
        "transferencia",
        "outros",
      ],
    },
  },
} as const
