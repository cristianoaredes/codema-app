// Modo demonstração para contornar problemas de conectividade
export const DEMO_MODE = true;

// Dados mock para demonstração
export const demoUser = {
  id: 'demo-user-1',
  email: 'cristianoaredes@icloud.com',
  name: 'Cristiano Aredes',
  role: 'admin',
  created_at: new Date().toISOString()
};

export const demoData = {
  conselheiros: [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      cargo: 'Presidente',
      status: 'ativo',
      mandato_inicio: '2023-01-01',
      mandato_fim: '2025-12-31'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      cargo: 'Vice-Presidente',
      status: 'ativo',
      mandato_inicio: '2023-01-01',
      mandato_fim: '2025-12-31'
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      cargo: 'Secretário',
      status: 'inativo',
      mandato_inicio: '2022-01-01',
      mandato_fim: '2024-12-31'
    }
  ],
  reunioes: [
    {
      id: 1,
      titulo: 'Reunião Ordinária - Janeiro 2025',
      data: '2025-01-15',
      hora: '14:00',
      local: 'Câmara Municipal',
      status: 'agendada',
      pauta: 'Discussão sobre projetos ambientais'
    },
    {
      id: 2,
      titulo: 'Reunião Extraordinária - Dezembro 2024',
      data: '2024-12-20',
      hora: '10:00',
      local: 'Prefeitura',
      status: 'concluida',
      pauta: 'Aprovação do orçamento ambiental'
    }
  ],
  protocolos: [
    {
      id: 1,
      numero: 'PROT-2025-001',
      tipo: 'Licença Ambiental',
      status: 'gerado',
      data_criacao: '2025-01-10',
      requerente: 'Empresa ABC Ltda'
    },
    {
      id: 2,
      numero: 'PROT-2025-002',
      tipo: 'Denúncia Ambiental',
      status: 'processando',
      data_criacao: '2025-01-12',
      requerente: 'João Cidadão'
    }
  ],
  resolucoes: [
    {
      id: 1,
      numero: 'RES-2024-015',
      titulo: 'Normas para Licenciamento Ambiental',
      status: 'aprovada',
      data_aprovacao: '2024-12-15',
      resumo: 'Estabelece normas para licenciamento ambiental no município'
    },
    {
      id: 2,
      numero: 'RES-2025-001',
      titulo: 'Diretrizes para Áreas Verdes',
      status: 'em_votacao',
      data_criacao: '2025-01-05',
      resumo: 'Define diretrizes para criação e manutenção de áreas verdes'
    }
  ]
};

// Simulação de operações assíncronas
export const demoAPI = {
  // Autenticação
  signIn: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay
    
    if (email === 'cristianoaredes@icloud.com' && password === 'demo123') {
      return { user: demoUser, error: null };
    }
    
    return { 
      user: null, 
      error: { message: 'Email ou senha incorretos' }
    };
  },

  signInWithOtp: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: null };
  },

  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { error: null };
  },

  // Operações CRUD
  getConselheiros: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: demoData.conselheiros, error: null };
  },

  getReunioes: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: demoData.reunioes, error: null };
  },

  getProtocolos: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: demoData.protocolos, error: null };
  },

  getResolucoes: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: demoData.resolucoes, error: null };
  },

  // Operações de criação/edição
  createConselheiro: async (data: Partial<typeof demoData.conselheiros[0]>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newConselheiro = {
      id: Date.now(),
      nome: data.nome || 'Novo Conselheiro',
      email: data.email || 'conselheiro@example.com',
      cargo: data.cargo || 'Conselheiro',
      mandato_inicio: data.mandato_inicio || new Date().toISOString().split('T')[0],
      mandato_fim: data.mandato_fim || new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ativo'
    };
    demoData.conselheiros.push(newConselheiro);
    return { data: newConselheiro, error: null };
  },

  updateConselheiro: async (id: number, data: Partial<typeof demoData.conselheiros[0]>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = demoData.conselheiros.findIndex(c => c.id === id);
    if (index !== -1) {
      demoData.conselheiros[index] = { ...demoData.conselheiros[index], ...data };
      return { data: demoData.conselheiros[index], error: null };
    }
    return { data: null, error: { message: 'Conselheiro não encontrado' } };
  },

  deleteConselheiro: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = demoData.conselheiros.findIndex(c => c.id === id);
    if (index !== -1) {
      demoData.conselheiros.splice(index, 1);
      return { error: null };
    }
    return { error: { message: 'Conselheiro não encontrado' } };
  }
};

// Hook para verificar se está em modo demo
export const useDemoMode = () => {
  return {
    isDemoMode: DEMO_MODE,
    demoUser,
    demoData,
    demoAPI
  };
};
