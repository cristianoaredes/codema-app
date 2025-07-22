import { supabase } from "@/integrations/supabase/client";

interface SampleReport {
  title: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category: string;
  created_at: string;
}

interface SampleReuniao {
  titulo: string;
  descricao: string;
  data_reuniao: string;
  local: string;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  tipo: "ordinaria" | "extraordinaria";
  created_at: string;
}

interface SampleAta {
  reuniao_id: string;
  numero: string;
  conteudo: string;
  status: "rascunho" | "revisao" | "aprovada" | "publicada";
  created_at: string;
}

interface SampleResolucao {
  numero: string;
  titulo: string;
  ementa: string;
  conteudo: string;
  status: "rascunho" | "em_votacao" | "aprovada" | "rejeitada" | "publicada";
  tipo: "normativa" | "administrativa" | "deliberativa";
  created_at: string;
}

interface SampleConselheiro {
  nome: string;
  email: string;
  cargo: "presidente" | "secretario" | "conselheiro_titular" | "conselheiro_suplente";
  segmento: "poder_publico" | "sociedade_civil" | "setor_produtivo";
  entidade: string;
  status: "ativo" | "inativo" | "licenciado";
  created_at: string;
}

const sampleReports: SampleReport[] = [
  {
    title: "Descarte irregular de lixo na Rua das Flores",
    description: "Moradores estão descartando lixo em terreno baldio, causando mau cheiro e atraindo animais",
    location: "Rua das Flores, 123 - Centro",
    priority: "high",
    status: "open",
    category: "Limpeza Urbana",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    title: "Poda de árvores necessária na Av. Principal",
    description: "Galhos estão interferindo na rede elétrica e representam risco de queda",
    location: "Av. Principal, 456 - Jardim Verde",
    priority: "urgent",
    status: "in_progress",
    category: "Meio Ambiente",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    title: "Buraco na pista compromete segurança",
    description: "Buraco profundo na via principal está causando acidentes de trânsito",
    location: "Rua da Paz, 789 - Vila Nova",
    priority: "high",
    status: "resolved",
    category: "Infraestrutura",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString() // 7 days ago
  },
  {
    title: "Falta de iluminação pública",
    description: "Poste de luz queimado há mais de uma semana, comprometendo segurança dos moradores",
    location: "Rua São João, 321 - Bairro Alto",
    priority: "medium",
    status: "in_progress",
    category: "Iluminação Pública",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
  },
  {
    title: "Praça precisa de manutenção",
    description: "Equipamentos de playground danificados e gramado sem manutenção há meses",
    location: "Praça Central - Centro",
    priority: "medium",
    status: "open",
    category: "Parques e Jardins",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
  },
  {
    title: "Vazamento de água na rede pública",
    description: "Vazamento está causando desperdício de água e comprometendo o asfalto",
    location: "Rua Nova Esperança, 654 - Distrito Industrial",
    priority: "high",
    status: "resolved",
    category: "Saneamento",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago
  },
  {
    title: "Coleta seletiva irregular",
    description: "Caminhão de coleta seletiva não passa na rua há mais de 2 semanas",
    location: "Rua dos Pioneiros, 987 - Residencial Sol",
    priority: "low",
    status: "open",
    category: "Limpeza Urbana",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString() // 4 days ago
  },
  {
    title: "Animais abandonados na praça",
    description: "Vários cães e gatos abandonados precisam de cuidados veterinários",
    location: "Praça do Sol - Bairro Novo",
    priority: "medium",
    status: "in_progress",
    category: "Bem-estar Animal",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString() // 6 days ago
  }
];

const sampleReunioes: SampleReuniao[] = [
  {
    titulo: "1ª Reunião Ordinária - Janeiro 2025",
    descricao: "Reunião mensal para discussão de projetos ambientais e aprovação de atas",
    data_reuniao: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    local: "Salão Nobre da Prefeitura Municipal",
    status: "agendada",
    tipo: "ordinaria",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString() // 15 days ago
  },
  {
    titulo: "Reunião Extraordinária - Emergência Ambiental",
    descricao: "Discussão sobre medidas emergenciais para contenção de poluição no Rio Verde",
    data_reuniao: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    local: "Sala de Reuniões - Secretaria do Meio Ambiente",
    status: "agendada",
    tipo: "extraordinaria",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    titulo: "12ª Reunião Ordinária - Dezembro 2024",
    descricao: "Reunião final do ano com balanço das atividades e planejamento 2025",
    data_reuniao: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    local: "Auditório do Centro Cultural",
    status: "concluida",
    tipo: "ordinaria",
    created_at: new Date(Date.now() - 86400000 * 45).toISOString() // 45 days ago
  }
];

const sampleAtas: SampleAta[] = [
  {
    reuniao_id: "", // Will be set after reunioes are created
    numero: "ATA-001/2025",
    conteudo: `
## Ata da 1ª Reunião Ordinária do CODEMA - Janeiro 2025

**Data:** 15 de Janeiro de 2025  
**Horário:** 14:00 às 17:00  
**Local:** Salão Nobre da Prefeitura Municipal  

### Presentes:
- João Silva (Presidente)
- Maria Santos (Secretária)
- Carlos Oliveira (Conselheiro Titular)
- Ana Costa (Conselheira Suplente)

### Pauta:
1. Aprovação da ata anterior
2. Relatório de atividades do FMA
3. Análise de projetos ambientais
4. Assuntos gerais

### Deliberações:
- Aprovado projeto de reflorestamento da mata ciliar
- Destinado R$ 50.000,00 do FMA para educação ambiental
- Criada comissão para fiscalização de áreas verdes

### Próxima Reunião:
15 de Fevereiro de 2025, às 14:00h
    `,
    status: "rascunho",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  }
];

const sampleResolucoes: SampleResolucao[] = [
  {
    numero: "001/2025",
    titulo: "Diretrizes para Licenciamento Ambiental Simplificado",
    ementa: "Estabelece procedimentos simplificados para licenciamento de atividades de baixo impacto ambiental",
    conteudo: `
## RESOLUÇÃO CODEMA Nº 001/2025

O Conselho Municipal de Defesa do Meio Ambiente - CODEMA, no uso de suas atribuições legais...

### Art. 1º 
Fica instituído o procedimento de licenciamento ambiental simplificado para atividades de baixo impacto.

### Art. 2º
São consideradas atividades de baixo impacto:
I - Pequenas reformas residenciais
II - Instalação de placas solares
III - Hortas urbanas de até 500m²

### Art. 3º
Esta resolução entra em vigor na data de sua publicação.
    `,
    status: "em_votacao",
    tipo: "normativa",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago
  },
  {
    numero: "002/2025",
    titulo: "Programa Municipal de Coleta Seletiva",
    ementa: "Institui o programa municipal de coleta seletiva e define responsabilidades",
    conteudo: `
## RESOLUÇÃO CODEMA Nº 002/2025

### Art. 1º
Fica instituído o Programa Municipal de Coleta Seletiva de Resíduos Sólidos.

### Art. 2º
O programa terá como objetivos:
I - Reduzir a quantidade de resíduos destinados ao aterro sanitário
II - Promover a educação ambiental da população
III - Gerar renda através da reciclagem

### Art. 3º
A implementação será gradual, iniciando pelos bairros centrais.
    `,
    status: "aprovada",
    tipo: "administrativa",
    created_at: new Date(Date.now() - 86400000 * 20).toISOString() // 20 days ago
  }
];

const sampleConselheiros: SampleConselheiro[] = [
  {
    nome: "João Silva",
    email: "joao.silva@prefeitura.gov.br",
    cargo: "presidente",
    segmento: "poder_publico",
    entidade: "Secretaria Municipal do Meio Ambiente",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 365).toISOString() // 1 year ago
  },
  {
    nome: "Maria Santos",
    email: "maria.santos@prefeitura.gov.br",
    cargo: "secretario",
    segmento: "poder_publico",
    entidade: "Secretaria Municipal do Meio Ambiente",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 365).toISOString() // 1 year ago
  },
  {
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@ongverde.org",
    cargo: "conselheiro_titular",
    segmento: "sociedade_civil",
    entidade: "ONG Verde Itanhomi",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 300).toISOString() // 300 days ago
  },
  {
    nome: "Ana Costa",
    email: "ana.costa@associacao.org",
    cargo: "conselheiro_suplente",
    segmento: "sociedade_civil",
    entidade: "Associação de Moradores do Centro",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 280).toISOString() // 280 days ago
  },
  {
    nome: "Roberto Empresário",
    email: "roberto@empresa.com",
    cargo: "conselheiro_titular",
    segmento: "setor_produtivo",
    entidade: "Sindicato das Indústrias",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 250).toISOString() // 250 days ago
  }
];

export class SampleDataSeeder {
  private static async createServiceCategories() {
    const categories = [
      { name: "Limpeza Urbana", icon: "🧹" },
      { name: "Meio Ambiente", icon: "🌱" },
      { name: "Infraestrutura", icon: "🏗️" },
      { name: "Iluminação Pública", icon: "💡" },
      { name: "Parques e Jardins", icon: "🌳" },
      { name: "Saneamento", icon: "🚰" },
      { name: "Bem-estar Animal", icon: "🐕" }
    ];

    const { data: existingCategories } = await supabase
      .from('service_categories')
      .select('name');

    const existingNames = existingCategories?.map(c => c.name) || [];

    for (const category of categories) {
      if (!existingNames.includes(category.name)) {
        await supabase
          .from('service_categories')
          .insert(category);
      }
    }
  }

  private static async createSampleReports() {
    // First create service categories
    await this.createServiceCategories();

    // Get category IDs
    const { data: categories } = await supabase
      .from('service_categories')
      .select('id, name');

    if (!categories) return;

    // Create a default user for reports if needed
    const { data: defaultUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'cristiano@aredes.me')
      .single();

    const userId = defaultUser?.id || 'default-user-id';

    for (const report of sampleReports) {
      const category = categories.find(c => c.name === report.category);
      if (!category) continue;

      const { error } = await supabase
        .from('reports')
        .insert({
          title: report.title,
          description: report.description,
          location: report.location,
          priority: report.priority,
          status: report.status,
          category_id: category.id,
          user_id: userId,
          created_at: report.created_at
        });

      if (error) {
        console.error('Error creating report:', error);
      }
    }
  }

  private static async createSampleReunioes() {
    for (const reuniao of sampleReunioes) {
      const { error } = await supabase
        .from('reunioes')
        .insert({
          titulo: reuniao.titulo,
          descricao: reuniao.descricao,
          data_reuniao: reuniao.data_reuniao,
          local: reuniao.local,
          status: reuniao.status,
          tipo: reuniao.tipo,
          created_at: reuniao.created_at
        });

      if (error) {
        console.error('Error creating reuniao:', error);
      }
    }
  }

  private static async createSampleAtas() {
    // Get the first reuniao to link the ata
    const { data: reunioes } = await supabase
      .from('reunioes')
      .select('id')
      .limit(1);

    if (!reunioes || reunioes.length === 0) return;

    const reuniaoId = reunioes[0].id;

    for (const ata of sampleAtas) {
      const { error } = await supabase
        .from('atas')
        .insert({
          reuniao_id: reuniaoId,
          numero: ata.numero,
          conteudo: ata.conteudo,
          status: ata.status,
          created_at: ata.created_at
        });

      if (error) {
        console.error('Error creating ata:', error);
      }
    }
  }

  private static async createSampleResolucoes() {
    for (const resolucao of sampleResolucoes) {
      const { error } = await supabase
        .from('resolucoes')
        .insert({
          numero: resolucao.numero,
          titulo: resolucao.titulo,
          ementa: resolucao.ementa,
          conteudo: resolucao.conteudo,
          status: resolucao.status,
          tipo: resolucao.tipo,
          created_at: resolucao.created_at
        });

      if (error) {
        console.error('Error creating resolucao:', error);
      }
    }
  }

  private static async createSampleConselheiros() {
    for (const conselheiro of sampleConselheiros) {
      const { error } = await supabase
        .from('conselheiros')
        .insert({
          nome: conselheiro.nome,
          email: conselheiro.email,
          cargo: conselheiro.cargo,
          segmento: conselheiro.segmento,
          entidade: conselheiro.entidade,
          status: conselheiro.status,
          created_at: conselheiro.created_at
        });

      if (error) {
        console.error('Error creating conselheiro:', error);
      }
    }
  }

  static async seedAllData() {
    console.log('🌱 Iniciando população de dados de exemplo...');

    try {
      await this.createSampleReports();
      console.log('✅ Relatórios de exemplo criados');

      await this.createSampleReunioes();
      console.log('✅ Reuniões de exemplo criadas');

      await this.createSampleAtas();
      console.log('✅ Atas de exemplo criadas');

      await this.createSampleResolucoes();
      console.log('✅ Resoluções de exemplo criadas');

      await this.createSampleConselheiros();
      console.log('✅ Conselheiros de exemplo criados');

      console.log('🎉 Dados de exemplo populados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao popular dados:', error);
    }
  }

  static async clearAllData() {
    console.log('🧹 Limpando dados de exemplo...');

    try {
      await supabase.from('reports').delete().neq('id', '');
      await supabase.from('reunioes').delete().neq('id', '');
      await supabase.from('atas').delete().neq('id', '');
      await supabase.from('resolucoes').delete().neq('id', '');
      await supabase.from('conselheiros').delete().neq('id', '');
      
      console.log('✅ Dados de exemplo removidos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }
}