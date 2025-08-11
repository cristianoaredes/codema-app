import { Database } from '../../integrations/supabase/generated-types';

// Type aliases for convenience
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];
type DocumentoInsert = Database['public']['Tables']['documentos']['Insert'];
type ReuniaoInsert = Database['public']['Tables']['reunioes']['Insert'];
type ResolucaoInsert = Database['public']['Tables']['resolucoes']['Insert'];
type ConselheiroInsert = Database['public']['Tables']['conselheiros']['Insert'];

// Include id in the sample types since it's required in the Insert types
type SampleUser = ProfileInsert;
type SampleReport = ReportInsert;
type SampleDocumento = DocumentoInsert;
type SampleReuniao = ReuniaoInsert;
type SampleResolucao = ResolucaoInsert;
type SampleConselheiro = ConselheiroInsert;

// Sample Users
export const sampleUsers: SampleUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Admin User',
    email: 'admin@codema.com',
    role: 'admin',
    is_active: true,
    phone: '+5511999999999',
    address: 'Rua Principal, 123',
    neighborhood: 'Centro',
    is_acting_president: false,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'President User',
    email: 'president@codema.com',
    role: 'presidente',
    is_active: true,
    phone: '+5511999999998',
    address: 'Av. República, 456',
    neighborhood: 'Jardins',
    is_acting_president: false,
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Secretary User',
    email: 'secretary@codema.com',
    role: 'secretario',
    is_active: true,
    phone: '+5511999999997',
    address: 'Rua das Flores, 789',
    neighborhood: 'Vila Madalena',
    is_acting_president: false,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Council Member 1',
    email: 'council1@codema.com',
    role: 'conselheiro_titular',
    is_active: true,
    phone: '+5511999999996',
    address: 'Rua dos Pinheiros, 101',
    neighborhood: 'Pinheiros',
    is_acting_president: false,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    full_name: 'Council Member 2',
    email: 'council2@codema.com',
    role: 'conselheiro_suplente',
    is_active: true,
    phone: '+5511999999995',
    address: 'Av. Paulista, 202',
    neighborhood: 'Bela Vista',
    is_acting_president: false,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Sample Reports
export const sampleReports: SampleReport[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    title: 'Descarte irregular de lixo na Rua das Flores',
    description: 'Moradores estão descartando lixo em terreno baldio, causando mau cheiro e atraindo animais',
    location: 'Rua das Flores, 123 - Centro',
    priority: 'high',
    status: 'open',
    category_id: 'categoria-1',
    user_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    title: 'Poda de árvores necessária na Av. Principal',
    description: 'Galhos estão interferindo na rede elétrica e representam risco de queda',
    location: 'Av. Principal, 456 - Jardim Verde',
    priority: 'urgent',
    status: 'in_progress',
    category_id: 'categoria-2',
    user_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    title: 'Buraco na pista compromete segurança',
    description: 'Buraco profundo na via principal está causando acidentes de trânsito',
    location: 'Rua Secundária, 789 - Bairro Novo',
    priority: 'medium',
    status: 'resolved',
    category_id: 'categoria-3',
    user_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Sample Documents
export const sampleDocuments: SampleDocumento[] = [
  {
    id: '00000000-0000-0000-0000-000000000201',
    titulo: 'Relatório de Atividades Trimestral',
    tipo: 'relatorio',
    status: 'publicado',
    arquivo_url: 'https://example.com/documentos/relatorio-trimestral.pdf',
    autor_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    titulo: 'Plano de Ação Anual',
    tipo: 'plano',
    status: 'rascunho',
    arquivo_url: 'https://example.com/documentos/plano-acao-anual.pdf',
    autor_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Sample Meetings
export const sampleMeetings: SampleReuniao[] = [
  {
    id: '00000000-0000-0000-0000-000000000301',
    titulo: 'Reunião Ordinária do Mês',
    data_reuniao: new Date(Date.now() + 86400000 * 7).toISOString(),
    local: 'Sala de Reuniões do CODEMA',
    status: 'agendada',
    tipo: 'ordinaria',
    secretario_id: '', // Will be populated during seeding
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000302',
    titulo: 'Reunião Extraordinária de Emergência',
    data_reuniao: new Date(Date.now() + 86400000 * 2).toISOString(),
    local: 'Auditório Municipal',
    status: 'agendada',
    tipo: 'extraordinaria',
    secretario_id: '', // Will be populated during seeding
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Sample Resolutions
export const sampleResolutions: SampleResolucao[] = [
  {
    id: '00000000-0000-0000-0000-000000000401',
    numero: '001/2025',
    titulo: 'Normas para Descarte de Resíduos Eletrônicos',
    ementa: 'Estabelece normas e procedimentos para o descarte adequado de resíduos eletrônicos no município',
    disposicoes_finais: 'Esta resolução entra em vigor na data de sua publicação',
    status: 'aprovada',
    tipo: 'normativa',
    created_by: '', // Will be populated during seeding
    base_legal: 'Lei Municipal nº 123/2020',
    artigos: [],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000402',
    numero: '002/2025',
    titulo: 'Criação do Comitê de Educação Ambiental',
    ementa: 'Cria o Comitê de Educação Ambiental vinculado ao CODEMA',
    disposicoes_finais: 'O Comitê terá duração de dois anos, podendo ser renovado',
    status: 'rascunho',
    tipo: 'administrativa',
    created_by: '', // Will be populated during seeding
    base_legal: '',
    artigos: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Sample Council Members
export const sampleCouncilMembers: SampleConselheiro[] = [
  {
    id: '00000000-0000-0000-0000-000000000501',
    nome_completo: 'João Silva',
    email: 'joao.silva@codema.com',
    telefone: '+5511999999999',
    endereco: 'Rua Principal, 123',
    entidade_representada: 'Associação de Moradores do Centro',
    segmento: 'sociedade_civil',
    titular: true,
    status: 'ativo',
    cpf: '123.456.789-00',
    mandato_inicio: new Date(Date.now() - 86400000 * 365).toISOString(),
    mandato_fim: new Date(Date.now() + 86400000 * 365).toISOString(),
    mandato_numero: 1,
    faltas_consecutivas: 0,
    total_faltas: 0,
    observacoes: 'Membro ativo e participativo',
    profile_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000502',
    nome_completo: 'Maria Santos',
    email: 'maria.santos@codema.com',
    telefone: '+5511999999998',
    endereco: 'Av. República, 456',
    entidade_representada: 'Câmara de Vereadores',
    segmento: 'poder_publico',
    titular: false,
    status: 'ativo',
    cpf: '987.654.321-00',
    mandato_inicio: new Date(Date.now() - 86400000 * 180).toISOString(),
    mandato_fim: new Date(Date.now() + 86400000 * 180).toISOString(),
    mandato_numero: 1,
    faltas_consecutivas: 1,
    total_faltas: 2,
    observacoes: 'Suplente atuando como titular',
    profile_id: '', // Will be populated during seeding
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
];
