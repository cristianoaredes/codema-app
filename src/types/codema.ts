export interface Councillor {
  id: string;
  nome: string;
  tipo: 'titular' | 'suplente';
  entidade_representada: string;
  segmento: 'poder_publico' | 'sociedade_civil' | 'setor_produtivo' | 'instituicao_ensino';
  especializacao?: string;
  email: string;
  telefone: string;
  mandato_inicio: string;
  mandato_fim: string;
  ativo: boolean;
  faltas_consecutivas: number;
  impedimentos?: string[];
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  tipo: 'ordinaria' | 'extraordinaria';
  data_hora: string;
  local: string;
  pauta: any;
  quorum_minimo: number;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Convocation {
  id: string;
  reuniao_id: string;
  data_envio: string;
  prazo_confirmacao: string;
  canal_envio: 'email' | 'whatsapp' | 'ambos';
  template_usado: string;
  created_at: string;
}

export interface ElectronicMinutes {
  id: string;
  reuniao_id: string;
  numero_ata: string;
  conteudo: any;
  status: 'rascunho' | 'revisao' | 'aprovada' | 'assinada' | 'publicada';
  hash_documento?: string;
  assinatura_presidente?: any;
  assinatura_secretario?: any;
  data_aprovacao?: string;
  data_publicacao?: string;
  versao: number;
  created_at: string;
  updated_at: string;
}

export interface Resolution {
  id: string;
  numero: string;
  ano: number;
  titulo: string;
  ementa: string;
  conteudo_completo: string;
  data_aprovacao: string;
  votos_favor: number;
  votos_contra: number;
  abstencoes: number;
  status: 'rascunho' | 'em_votacao' | 'aprovada' | 'publicada' | 'revogada';
  base_legal: string[];
  hash_documento?: string;
  assinatura_digital?: any;
  data_publicacao?: string;
  revogada_por?: string;
  created_at: string;
  updated_at: string;
}