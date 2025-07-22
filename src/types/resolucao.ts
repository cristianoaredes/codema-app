export type ResolucaoStatus = 'rascunho' | 'em_votacao' | 'aprovada' | 'rejeitada' | 'publicada' | 'revogada';
export type TipoVoto = 'favoravel' | 'contrario' | 'abstencao';

export interface Resolucao {
  id: string;
  numero: string;
  titulo: string;
  ementa: string;
  considerandos: string[];
  artigos: string[];
  base_legal?: string;
  status: ResolucaoStatus;
  data_aprovacao?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  revogada_em?: string;
  revogada_por?: string;
}

export interface ResolucaoTemplate {
  id: string;
  nome: string;
  estrutura: Record<string, unknown>;
  categoria: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResolucaoVoto {
  id: string;
  resolucao_id: string;
  conselheiro_id: string;
  voto: TipoVoto;
  justificativa?: string;
  created_at: string;
}

export interface ResolucaoTramitacao {
  id: string;
  resolucao_id: string;
  status_anterior: ResolucaoStatus;
  status_novo: ResolucaoStatus;
  observacoes?: string;
  created_by: string;
  created_at: string;
}

export interface ResolucaoPublicacao {
  id: string;
  resolucao_id: string;
  tipo_publicacao: 'diario_oficial' | 'portal_transparencia' | 'site_oficial';
  url_publicacao?: string;
  data_publicacao: string;
  created_at: string;
}

export interface ResolucaoRevogacao {
  id: string;
  resolucao_original_id: string;
  resolucao_revogadora_id: string;
  motivo: string;
  data_revogacao: string;
  created_at: string;
}