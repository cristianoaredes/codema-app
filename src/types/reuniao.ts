export interface Reuniao {
  id: string;
  titulo: string;
  tipo: string;
  data_reuniao: string; // Alinhado com schema real
  local: string;
  pauta: string | null;
  ata: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  secretario_id: string;
  protocolo: string | null;
  protocolo_ata: string | null;
  protocolo_convocacao: string | null;
  
  // Mantendo campos opcionais para retrocompatibilidade, se necessário
  numero_reuniao?: string;
  quorum_presente?: number;
  quorum_necessario?: number;
  ata_aprovada?: boolean;
  data_aprovacao_ata?: string;
  resolucoes_geradas?: string[];
}

export interface Convocacao {
  id: string;
  reuniao_id: string;
  conselheiro_id: string;
  enviada_em: string;
  tipo_envio: 'email' | 'whatsapp' | 'postal';
  status: 'pendente' | 'enviada' | 'entregue' | 'erro';
  confirmacao_presenca?: 'confirmada' | 'rejeitada' | 'pendente';
  data_confirmacao?: string;
  observacoes?: string;
  created_at: string;
}

export interface Presenca {
  id: string;
  reuniao_id: string;
  conselheiro_id: string;
  presente: boolean;
  horario_chegada?: string;
  horario_saida?: string;
  observacoes?: string;
  created_at: string;
}

export interface ConvocacaoTemplate {
  id: string;
  nome: string;
  tipo_reuniao: string;
  assunto_email: string; // Alinhado com schema real
  corpo_email: string;
  corpo_whatsapp: string | null;
  ativo: boolean | null;
  dias_antecedencia: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReuniaoCreateInput {
  titulo: string;
  tipo: string;
  data_reuniao: string;
  local: string;
  pauta?: string | null;
  secretario_id: string; // Campo obrigatório no schema
  protocolo?: string | null;
  status?: string;
}

export interface ReuniaoUpdateInput extends Partial<ReuniaoCreateInput> {
  status?: 'agendada' | 'realizada' | 'cancelada';
  ata?: string;
  ata_aprovada?: boolean;
  quorum_presente?: number;
  resolucoes_geradas?: string[];
}

export interface ConvocacaoCreateInput {
  reuniao_id: string;
  conselheiros_ids: string[];
  tipo_envio: 'email' | 'whatsapp' | 'ambos';
  template_id?: string;
  envio_agendado?: string; // data para envio automático
}

export interface ConfirmacaoPresencaInput {
  convocacao_id: string;
  confirmacao: 'confirmada' | 'rejeitada';
  observacoes?: string;
}