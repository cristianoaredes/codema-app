import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar cliente Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://aqvbhmpdzvdbhvxhnemi.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdmJobXBkenZkYmh2eGhuZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0MTksImV4cCI6MjA2ODAxNDQxOX0.3_l3DA0TOA8afMr-i-Hgv8TrUQYiETYFhIEVTsRHZnM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ReuniaoData {
  titulo: string;
  data_reuniao: string;
  local: string;
  tipo: string;
  status: string;
  pauta: string;
  secretario_id: string;
  protocolo: string;
}

// Dados da reunião de posse baseados na convocação oficial
const reuniaoPosseData = {
  titulo: "REUNIÃO DE POSSE CODEMA 2025-2027",
  data_reuniao: "2025-08-12", // Hoje - 12 de agosto de 2025
  local: "Plenário da Câmara Municipal de Itanhomi-MG\nAvenida JK, 91 - Centro\nItanhomi - MG\nTelefone: (33) 3231-1129",
  tipo: "extraordinaria", // Reunião especial de posse
  status: "agendada",
  pauta: JSON.stringify({
    "horario_inicio": "16:00",
    "tipo_reuniao": "Reunião de Posse - Gestão 2025-2027",
    "presenca_obrigatoria": true,
    "itens": [
      {
        "numero": 1,
        "titulo": "Abertura da sessão",
        "descricao": "Verificação de quorum e abertura dos trabalhos",
        "responsavel": "Presidente"
      },
      {
        "numero": 2,
        "titulo": "Apresentação do CODEMA",
        "descricao": "Apresentação dos aspectos funcionais e estruturais do CODEMA",
        "responsavel": "Presidente",
        "detalhes": "Estrutura organizacional, competências, funcionamento interno"
      },
      {
        "numero": 3,
        "titulo": "Posse dos Conselheiros",
        "descricao": "Posse oficial dos novos integrantes da gestão 2025-2027",
        "responsavel": "Presidente",
        "detalhes": "Titulares e suplentes - presença obrigatória para legitimidade"
      },
      {
        "numero": 4,
        "titulo": "Início dos trabalhos",
        "descricao": "Demonstração de compromisso e fortalecimento institucional",
        "responsavel": "Todos os conselheiros"
      }
    ],
    "observacoes": [
      "Presença OBRIGATÓRIA de todos os conselheiros (titulares e suplentes)",
      "Em caso de impossibilidade, comunicar antecipadamente à presidência",
      "Reunião de caráter oficial e obrigatório"
    ]
  })
};

export async function seedReuniaoPosse() {
  try {
    console.log('🏛️ Iniciando seed da Reunião de Posse CODEMA...');

    // 1. Buscar um usuário na tabela profiles para ser o secretário
    console.log('👤 Buscando secretário da reunião...');
    
    const { data: secretario, error: secretarioError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (secretarioError || !secretario) {
      console.error('❌ Erro ao encontrar secretário:', secretarioError);
      throw new Error('Nenhum usuário admin encontrado para ser secretário da reunião');
    }

    console.log(`✅ Secretário encontrado: ${secretario.full_name || 'Admin'} (${secretario.email})`);

    // 2. Verificar se já existe uma reunião para esta data
    const { data: reuniaoExistente } = await supabase
      .from('reunioes')
      .select('id, titulo')
      .eq('data_reuniao', reuniaoPosseData.data_reuniao)
      .eq('titulo', reuniaoPosseData.titulo)
      .single();

    if (reuniaoExistente) {
      console.log('ℹ️ Reunião já existe na base de dados:', reuniaoExistente.titulo);
      return reuniaoExistente;
    }

    // 3. Gerar protocolo para a reunião
    console.log('📋 Gerando protocolo da reunião...');
    
    // Gerar protocolo simples para a reunião
    const ano = new Date().getFullYear();
    const protocolo = `REU-001/${ano}`; // Primeira reunião do ano
    
    console.log(`📋 Protocolo gerado: ${protocolo}`);

    // 4. Preparar dados para inserção
    const dadosReuniao: ReuniaoData = {
      ...reuniaoPosseData,
      secretario_id: secretario.id,
      protocolo
    };

    // 5. Inserir reunião na base de dados
    console.log('💾 Inserindo reunião na base de dados...');
    
    const { data: novaReuniao, error: insertError } = await supabase
      .from('reunioes')
      .insert([dadosReuniao])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir reunião:', insertError);
      throw insertError;
    }

    console.log('✅ Reunião de posse criada com sucesso!');
    
    // 6. Mostrar resumo
    console.log('\n📋 RESUMO DA REUNIÃO CRIADA:');
    console.log(`   📅 Data: ${new Date(novaReuniao.data_reuniao).toLocaleDateString('pt-BR')}`);
    console.log(`   🕐 Horário: 16:00h`);
    console.log(`   🏛️ Local: Plenário da Câmara Municipal`);
    console.log(`   📋 Protocolo: ${novaReuniao.protocolo}`);
    console.log(`   👤 Secretário: ${secretario.full_name || 'Admin'}`);
    console.log(`   📊 Status: ${novaReuniao.status}`);
    console.log(`   🎯 Tipo: ${novaReuniao.tipo}`);
    
    console.log('\n🎯 FINALIDADES DA REUNIÃO:');
    const pauta = JSON.parse(novaReuniao.pauta);
    pauta.itens.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ${item.titulo}`);
      console.log(`      ${item.descricao}`);
    });

    console.log('\n🎉 Reunião de Posse CODEMA 2025-2027 cadastrada!');
    console.log('💡 A reunião está disponível no sistema para controle de presença.');
    
    return novaReuniao;

  } catch (error) {
    console.error('❌ Erro durante o seed da reunião:', error);
    throw error;
  }
}

// Executar o seed se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedReuniaoPosse()
    .then(() => {
      console.log('Seed da reunião executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar seed da reunião:', error);
      process.exit(1);
    });
}