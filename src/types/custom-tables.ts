// Tipos customizados para tabelas que não estão no schema Supabase gerado

export interface AtasTemplate {
  id: string;
  nome: string;
  conteudo: string;
  tipo: 'ordinaria' | 'extraordinaria' | 'publica';
  created_at?: string;
  updated_at?: string;
}

export interface Conselheiro {
  id: string;
  nome_completo: string;
  mandato_inicio: string;
  mandato_fim: string;
  entidade_representada: string;
  tipo: 'titular' | 'suplente';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResolucaoTemplate {
  id: string;
  nome: string;
  conteudo: string;
  tipo: 'normativa' | 'deliberativa' | 'administrativa';
  created_at?: string;
  updated_at?: string;
}

export interface PersistentSession {
  user_id: string;
  device_id: string;
  refresh_token: string;
  expires_at: string;
  device_info: Record<string, unknown>;
  last_used: string;
  created_at?: string;
} 