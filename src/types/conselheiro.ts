export interface Conselheiro {
  id: string;
  profile_id?: string;
  nome_completo: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  
  // Mandate information
  mandato_inicio: string; // ISO date string
  mandato_fim: string; // ISO date string
  mandato_numero?: number;
  
  // Representation
  entidade_representada: string;
  segmento: 'governo' | 'sociedade_civil' | 'setor_produtivo';
  titular: boolean;
  
  // Status and control
  status: 'ativo' | 'inativo' | 'licenciado' | 'afastado';
  faltas_consecutivas: number;
  total_faltas: number;
  
  // Metadata
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImpedimentoConselheiro {
  id: string;
  conselheiro_id: string;
  reuniao_id?: string;
  processo_id?: string;
  
  // Impediment details
  tipo_impedimento: 'interesse_pessoal' | 'parentesco' | 'interesse_profissional' | 'outros';
  motivo: string;
  declarado_em: string;
  
  // Status
  ativo: boolean;
  
  created_at: string;
}

export interface ConselheiroCreateInput {
  nome_completo: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  mandato_inicio: string;
  mandato_fim: string;
  mandato_numero?: number;
  entidade_representada: string;
  segmento: 'governo' | 'sociedade_civil' | 'setor_produtivo';
  titular: boolean;
  observacoes?: string;
}

export interface ConselheiroUpdateInput extends Partial<ConselheiroCreateInput> {
  status?: 'ativo' | 'inativo' | 'licenciado' | 'afastado';
}

export interface ImpedimentoCreateInput {
  conselheiro_id: string;
  reuniao_id?: string;
  processo_id?: string;
  tipo_impedimento: 'interesse_pessoal' | 'parentesco' | 'interesse_profissional' | 'outros';
  motivo: string;
}