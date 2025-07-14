export type AtaStatus = 'rascunho' | 'em_revisao' | 'aprovada' | 'publicada';

export interface Ata {
  id: string;
  numero: string;
  titulo: string;
  conteudo: string;
  data_reuniao: string;
  status: AtaStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  reuniao_id?: string;
}

export interface AtaTemplate {
  id: string;
  nome: string;
  conteudo: string;
  tipo: 'ordinaria' | 'extraordinaria';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AtaVersao {
  id: string;
  ata_id: string;
  numero_versao: number;
  conteudo: string;
  comentario?: string;
  created_by: string;
  created_at: string;
}

export interface AtaRevisao {
  id: string;
  ata_id: string;
  revisor_id: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  comentarios?: string;
  created_at: string;
  updated_at: string;
}