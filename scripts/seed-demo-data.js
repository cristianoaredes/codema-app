#!/usr/bin/env node

/**
 * Script para popular o banco de dados com dados de demonstração
 * Executa o SampleDataSeeder diretamente
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://aqvbhmpdzvdbhvxhnemi.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdmJobXBkenZkYmh2eGhuZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0MTksImV4cCI6MjA2ODAxNDQxOX0.3_l3DA0TOA8afMr-i-Hgv8TrUQYiETYFhIEVTsRHZnM";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Dados de exemplo para relatórios
const sampleReports = [
  {
    title: "Descarte irregular de lixo na Rua das Flores",
    description: "Moradores estão descartando lixo em terreno baldio, causando mau cheiro e atraindo animais",
    location: "Rua das Flores, 123 - Centro",
    priority: "high",
    status: "open",
    category: "Limpeza Urbana",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    title: "Poda de árvores necessária na Av. Principal",
    description: "Galhos estão interferindo na rede elétrica e representam risco de queda",
    location: "Av. Principal, 456 - Jardim Verde",
    priority: "urgent",
    status: "in_progress",
    category: "Meio Ambiente",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    title: "Buraco na pista compromete segurança",
    description: "Buraco profundo na via principal está causando acidentes de trânsito",
    location: "Rua da Paz, 789 - Vila Nova",
    priority: "high",
    status: "resolved",
    category: "Infraestrutura",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

// Dados de exemplo para reuniões
const sampleReunioes = [
  {
    titulo: "Reunião Ordinária - Janeiro 2025",
    descricao: "Primeira reunião ordinária do ano para discussão da agenda ambiental municipal",
    data_reuniao: "2025-01-15T14:00:00.000Z",
    local: "Câmara Municipal - Plenário Principal",
    status: "concluida",
    tipo: "ordinaria",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    titulo: "Reunião Extraordinária - Emergência Ambiental",
    descricao: "Discussão emergencial sobre vazamento químico no distrito industrial",
    data_reuniao: "2025-01-20T09:00:00.000Z",
    local: "Prefeitura Municipal - Sala de Reuniões",
    status: "agendada",
    tipo: "extraordinaria",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

// Dados de exemplo para conselheiros
const sampleConselheiros = [
  {
    nome: "Dr. João Silva Santos",
    email: "joao.santos@prefeitura.gov.br",
    cargo: "presidente",
    segmento: "poder_publico",
    entidade: "Secretaria Municipal de Meio Ambiente",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    nome: "Maria Oliveira Costa",
    email: "maria.costa@ong-verde.org.br",
    cargo: "conselheiro_titular",
    segmento: "sociedade_civil",
    entidade: "ONG Verde Esperança",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    nome: "Carlos Eduardo Ferreira",
    email: "carlos.ferreira@industrias-abc.com.br",
    cargo: "conselheiro_titular",
    segmento: "setor_produtivo",
    entidade: "Indústrias ABC Ltda",
    status: "ativo",
    created_at: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

// Dados de exemplo para resoluções
const sampleResolucoes = [
  {
    numero: "RES-001/2025",
    titulo: "Diretrizes para Licenciamento Ambiental Simplificado",
    ementa: "Estabelece diretrizes para o licenciamento ambiental simplificado de atividades de baixo impacto",
    conteudo: "O CONSELHO MUNICIPAL DE DEFESA DO MEIO AMBIENTE - CODEMA, no uso de suas atribuições...",
    status: "aprovada",
    tipo: "normativa",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

async function createServiceCategories() {
  console.log('📂 Criando categorias de serviço...');
  
  const categories = [
    'Limpeza Urbana', 'Meio Ambiente', 'Infraestrutura', 
    'Iluminação Pública', 'Parques e Jardins', 'Saneamento'
  ];
  
  for (const categoryName of categories) {
    const { error } = await supabase
      .from('service_categories')
      .upsert({ name: categoryName }, { onConflict: 'name' });
    
    if (error) {
      console.error(`Erro ao criar categoria ${categoryName}:`, error);
    }
  }
}

async function createSampleReports() {
  console.log('📋 Criando relatórios de exemplo...');
  
  // Buscar um usuário existente ou usar um ID padrão
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  const userId = profiles?.[0]?.id || '00000000-0000-0000-0000-000000000000';
  
  for (const report of sampleReports) {
    // Buscar categoria
    const { data: category } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', report.category)
      .single();
    
    if (category) {
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
        console.error('Erro ao criar relatório:', error);
      }
    }
  }
}

async function createSampleReunioes() {
  console.log('🏛️ Criando reuniões de exemplo...');
  
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
      console.error('Erro ao criar reunião:', error);
    }
  }
}

async function createSampleConselheiros() {
  console.log('👥 Criando conselheiros de exemplo...');
  
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
      console.error('Erro ao criar conselheiro:', error);
    }
  }
}

async function createSampleResolucoes() {
  console.log('📜 Criando resoluções de exemplo...');
  
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
      console.error('Erro ao criar resolução:', error);
    }
  }
}

async function seedAllData() {
  console.log('🌱 Iniciando população de dados de demonstração...\n');
  
  try {
    await createServiceCategories();
    console.log('✅ Categorias de serviço criadas\n');
    
    await createSampleReports();
    console.log('✅ Relatórios de exemplo criados\n');
    
    await createSampleReunioes();
    console.log('✅ Reuniões de exemplo criadas\n');
    
    await createSampleConselheiros();
    console.log('✅ Conselheiros de exemplo criados\n');
    
    await createSampleResolucoes();
    console.log('✅ Resoluções de exemplo criadas\n');
    
    console.log('🎉 Dados de demonstração populados com sucesso!');
    
    // Verificar contagens
    const { data: reportCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact' });
    
    const { data: reunioesCount } = await supabase
      .from('reunioes')
      .select('id', { count: 'exact' });
    
    const { data: conselheirosCount } = await supabase
      .from('conselheiros')
      .select('id', { count: 'exact' });
    
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`   • Relatórios: ${reportCount?.length || 0}`);
    console.log(`   • Reuniões: ${reunioesCount?.length || 0}`);
    console.log(`   • Conselheiros: ${conselheirosCount?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllData();
}

export { seedAllData };
