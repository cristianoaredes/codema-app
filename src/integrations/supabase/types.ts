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
      audit_logs: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown | null
          registro_id: string
          tabela: string
          timestamp: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown | null
          registro_id: string
          tabela: string
          timestamp?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string
          tabela?: string
          timestamp?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          assinatura_digital: string | null
          autor_id: string
          categoria: string | null
          created_at: string
          data_assinatura: string | null
          data_publicacao: string | null
          id: string
          numero_documento: string | null
          palavras_chave: string[] | null
          processo_id: string | null
          publicado: boolean | null
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
          assinatura_digital?: string | null
          autor_id: string
          categoria?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_publicacao?: string | null
          id?: string
          numero_documento?: string | null
          palavras_chave?: string[] | null
          processo_id?: string | null
          publicado?: boolean | null
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
          assinatura_digital?: string | null
          autor_id?: string
          categoria?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_publicacao?: string | null
          id?: string
          numero_documento?: string | null
          palavras_chave?: string[] | null
          processo_id?: string | null
          publicado?: boolean | null
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
            foreignKeyName: "documentos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
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
      fma_projetos: {
        Row: {
          area_atuacao: string
          cpf_cnpj_proponente: string | null
          created_at: string
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio_prevista: string | null
          data_inicio_real: string | null
          descricao: string
          documentos_prestacao_contas: string[] | null
          documentos_projeto: string[] | null
          id: string
          objetivos: string
          observacoes: string | null
          percentual_execucao: number | null
          prazo_execucao: number
          proponente: string
          responsavel_analise_id: string | null
          reuniao_aprovacao_id: string | null
          status: string | null
          titulo: string
          updated_at: string
          valor_aprovado: number | null
          valor_solicitado: number
        }
        Insert: {
          area_atuacao: string
          cpf_cnpj_proponente?: string | null
          created_at?: string
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao: string
          documentos_prestacao_contas?: string[] | null
          documentos_projeto?: string[] | null
          id?: string
          objetivos: string
          observacoes?: string | null
          percentual_execucao?: number | null
          prazo_execucao: number
          proponente: string
          responsavel_analise_id?: string | null
          reuniao_aprovacao_id?: string | null
          status?: string | null
          titulo: string
          updated_at?: string
          valor_aprovado?: number | null
          valor_solicitado: number
        }
        Update: {
          area_atuacao?: string
          cpf_cnpj_proponente?: string | null
          created_at?: string
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string
          documentos_prestacao_contas?: string[] | null
          documentos_projeto?: string[] | null
          id?: string
          objetivos?: string
          observacoes?: string | null
          percentual_execucao?: number | null
          prazo_execucao?: number
          proponente?: string
          responsavel_analise_id?: string | null
          reuniao_aprovacao_id?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
          valor_aprovado?: number | null
          valor_solicitado?: number
        }
        Relationships: [
          {
            foreignKeyName: "fma_projetos_responsavel_analise_id_fkey"
            columns: ["responsavel_analise_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fma_projetos_reuniao_aprovacao_id_fkey"
            columns: ["reuniao_aprovacao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      fma_receitas: {
        Row: {
          created_at: string
          data_entrada: string
          descricao: string
          id: string
          numero_documento: string | null
          observacoes: string | null
          origem: string
          responsavel_cadastro_id: string
          status: string | null
          tipo_receita: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_entrada: string
          descricao: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          origem: string
          responsavel_cadastro_id: string
          status?: string | null
          tipo_receita: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          data_entrada?: string
          descricao?: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          origem?: string
          responsavel_cadastro_id?: string
          status?: string | null
          tipo_receita?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fma_receitas_responsavel_cadastro_id_fkey"
            columns: ["responsavel_cadastro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      impedimentos: {
        Row: {
          ativo: boolean | null
          conselheiro_id: string
          created_at: string
          data_impedimento: string
          descricao_impedimento: string
          id: string
          observacoes: string | null
          processo_id: string | null
          reuniao_id: string | null
          tipo_impedimento: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          conselheiro_id: string
          created_at?: string
          data_impedimento?: string
          descricao_impedimento: string
          id?: string
          observacoes?: string | null
          processo_id?: string | null
          reuniao_id?: string | null
          tipo_impedimento: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          conselheiro_id?: string
          created_at?: string
          data_impedimento?: string
          descricao_impedimento?: string
          id?: string
          observacoes?: string | null
          processo_id?: string | null
          reuniao_id?: string | null
          tipo_impedimento?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impedimentos_conselheiro_id_fkey"
            columns: ["conselheiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impedimentos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impedimentos_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      ouvidoria_denuncias: {
        Row: {
          anonima: boolean | null
          created_at: string
          data_fiscalizacao: string | null
          data_ocorrencia: string | null
          data_resposta_denunciante: string | null
          denunciante_cpf: string | null
          denunciante_email: string | null
          denunciante_nome: string | null
          denunciante_telefone: string | null
          descricao: string
          fiscal_responsavel_id: string | null
          fotos: string[] | null
          id: string
          latitude: number | null
          local_ocorrencia: string
          longitude: number | null
          observacoes: string | null
          prioridade: string | null
          protocolo: string
          providencias_tomadas: string | null
          relatorio_fiscalizacao: string | null
          resposta_denunciante: string | null
          status: string | null
          tipo_denuncia: string
          updated_at: string
        }
        Insert: {
          anonima?: boolean | null
          created_at?: string
          data_fiscalizacao?: string | null
          data_ocorrencia?: string | null
          data_resposta_denunciante?: string | null
          denunciante_cpf?: string | null
          denunciante_email?: string | null
          denunciante_nome?: string | null
          denunciante_telefone?: string | null
          descricao: string
          fiscal_responsavel_id?: string | null
          fotos?: string[] | null
          id?: string
          latitude?: number | null
          local_ocorrencia: string
          longitude?: number | null
          observacoes?: string | null
          prioridade?: string | null
          protocolo: string
          providencias_tomadas?: string | null
          relatorio_fiscalizacao?: string | null
          resposta_denunciante?: string | null
          status?: string | null
          tipo_denuncia: string
          updated_at?: string
        }
        Update: {
          anonima?: boolean | null
          created_at?: string
          data_fiscalizacao?: string | null
          data_ocorrencia?: string | null
          data_resposta_denunciante?: string | null
          denunciante_cpf?: string | null
          denunciante_email?: string | null
          denunciante_nome?: string | null
          denunciante_telefone?: string | null
          descricao?: string
          fiscal_responsavel_id?: string | null
          fotos?: string[] | null
          id?: string
          latitude?: number | null
          local_ocorrencia?: string
          longitude?: number | null
          observacoes?: string | null
          prioridade?: string | null
          protocolo?: string
          providencias_tomadas?: string | null
          relatorio_fiscalizacao?: string | null
          resposta_denunciante?: string | null
          status?: string | null
          tipo_denuncia?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ouvidoria_denuncias_fiscal_responsavel_id_fkey"
            columns: ["fiscal_responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          presente: boolean
          reuniao_id: string
          tipo_participacao: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean
          reuniao_id: string
          tipo_participacao: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          presente?: boolean
          reuniao_id?: string
          tipo_participacao?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          data_protocolo: string
          data_votacao: string | null
          descricao_atividade: string
          documentos_anexos: string[] | null
          endereco_empreendimento: string | null
          id: string
          numero_processo: string
          observacoes: string | null
          parecer_relator: string | null
          parecer_tecnico: string | null
          prazo_parecer: string | null
          prioridade: string | null
          relator_id: string | null
          requerente: string
          resultado_votacao: string | null
          status: string
          tipo_processo: string
          updated_at: string
          votos_abstencoes: number | null
          votos_contrarios: number | null
          votos_favoraveis: number | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          data_protocolo?: string
          data_votacao?: string | null
          descricao_atividade: string
          documentos_anexos?: string[] | null
          endereco_empreendimento?: string | null
          id?: string
          numero_processo: string
          observacoes?: string | null
          parecer_relator?: string | null
          parecer_tecnico?: string | null
          prazo_parecer?: string | null
          prioridade?: string | null
          relator_id?: string | null
          requerente: string
          resultado_votacao?: string | null
          status?: string
          tipo_processo: string
          updated_at?: string
          votos_abstencoes?: number | null
          votos_contrarios?: number | null
          votos_favoraveis?: number | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          data_protocolo?: string
          data_votacao?: string | null
          descricao_atividade?: string
          documentos_anexos?: string[] | null
          endereco_empreendimento?: string | null
          id?: string
          numero_processo?: string
          observacoes?: string | null
          parecer_relator?: string | null
          parecer_tecnico?: string | null
          prazo_parecer?: string | null
          prioridade?: string | null
          relator_id?: string | null
          requerente?: string
          resultado_votacao?: string | null
          status?: string
          tipo_processo?: string
          updated_at?: string
          votos_abstencoes?: number | null
          votos_contrarios?: number | null
          votos_favoraveis?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_relator_id_fkey"
            columns: ["relator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          ativo: boolean | null
          cpf: string | null
          created_at: string
          email: string | null
          entidade_representada: string | null
          fim_mandato: string | null
          full_name: string | null
          id: string
          inicio_mandato: string | null
          motivo_inativacao: string | null
          neighborhood: string | null
          phone: string | null
          role: string | null
          substituido_por: string | null
          telefone_institucional: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          entidade_representada?: string | null
          fim_mandato?: string | null
          full_name?: string | null
          id: string
          inicio_mandato?: string | null
          motivo_inativacao?: string | null
          neighborhood?: string | null
          phone?: string | null
          role?: string | null
          substituido_por?: string | null
          telefone_institucional?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          entidade_representada?: string | null
          fim_mandato?: string | null
          full_name?: string | null
          id?: string
          inicio_mandato?: string | null
          motivo_inativacao?: string | null
          neighborhood?: string | null
          phone?: string | null
          role?: string | null
          substituido_por?: string | null
          telefone_institucional?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      reunioes: {
        Row: {
          ata: string | null
          ata_aprovada: boolean | null
          created_at: string
          data_aprovacao_ata: string | null
          data_reuniao: string
          id: string
          local: string
          numero_reuniao: string | null
          pauta: string | null
          quorum_necessario: number | null
          quorum_presente: number | null
          resolucoes_geradas: string[] | null
          secretario_id: string
          status: string
          tipo: string
          tipo_reuniao: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ata?: string | null
          ata_aprovada?: boolean | null
          created_at?: string
          data_aprovacao_ata?: string | null
          data_reuniao: string
          id?: string
          local: string
          numero_reuniao?: string | null
          pauta?: string | null
          quorum_necessario?: number | null
          quorum_presente?: number | null
          resolucoes_geradas?: string[] | null
          secretario_id: string
          status?: string
          tipo: string
          tipo_reuniao?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ata?: string | null
          ata_aprovada?: boolean | null
          created_at?: string
          data_aprovacao_ata?: string | null
          data_reuniao?: string
          id?: string
          local?: string
          numero_reuniao?: string | null
          pauta?: string | null
          quorum_necessario?: number | null
          quorum_presente?: number | null
          resolucoes_geradas?: string[] | null
          secretario_id?: string
          status?: string
          tipo?: string
          tipo_reuniao?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_meeting_quorum: {
        Args: { meeting_id: string }
        Returns: boolean
      }
      generate_document_number: {
        Args: { doc_type: string; year?: number }
        Returns: string
      }
      log_audit_event: {
        Args: {
          p_acao: string
          p_tabela: string
          p_registro_id: string
          p_dados_anteriores?: Json
          p_dados_novos?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
