import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar cliente Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://aqvbhmpdzvdbhvxhnemi.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdmJobXBkenZkYmh2eGhuZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0MTksImV4cCI6MjA2ODAxNDQxOX0.3_l3DA0TOA8afMr-i-Hgv8TrUQYiETYFhIEVTsRHZnM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ConselheiroData {
  nome_completo: string;
  entidade_representada: string;
  telefone: string;
  observacoes: string;
  titular: boolean;
  segmento: string;
  mandato_inicio: string;
  mandato_fim: string;
  status: string;
  mandato_numero: number;
  faltas_consecutivas: number;
  total_faltas: number;
}

// Dados dos membros CODEMA extraídos do JSON fornecido
const membrosTitulares = [
  {
    nome: "Cristiano Aredes Costa",
    entidade_representada: "Maçonaria",
    telefone: "(11) 95273-2247",
    observacoes: "Presidente do CODEMA • Admin do grupo"
  },
  {
    nome: "Carlos Diogo Fontes",
    entidade_representada: "Associação do Jataí",
    telefone: "(33) 98887-2757",
    observacoes: "Representa Associação do Jataí"
  },
  {
    nome: "Mackson Santos Ribeiro",
    entidade_representada: "Câmara de Vereadores",
    telefone: "(33) 99944-5723",
    observacoes: "Representa Câmara de Vereadores"
  },
  {
    nome: "Judson Bastos",
    entidade_representada: "Emater",
    telefone: "(33) 98751-3527",
    observacoes: "Representa Emater"
  },
  {
    nome: "Lucas Silva Rodrigues",
    entidade_representada: "Igreja Batista do Calvário",
    telefone: "(33) 98849-7388",
    observacoes: "Vice-presidente do CODEMA"
  },
  {
    nome: "Talisson Pires",
    entidade_representada: "Secretaria de Esportes",
    telefone: "(33) 98816-2041",
    observacoes: "Representa Secretaria de Esportes"
  },
  {
    nome: "Joarez André Caetano",
    entidade_representada: "Secretaria do Meio Ambiente (SMMA)",
    telefone: "(33) 98731-9931",
    observacoes: "Titular da SMMA • Admin do grupo"
  },
  {
    nome: "Marcos Roberto de Souza",
    entidade_representada: "Polícia Militar",
    telefone: "(33) 99170-6134",
    observacoes: "Representa Polícia Militar"
  }
];

const membrosSuplentes = [
  {
    nome: "Antonio Luiz de Souza (Luis Gandra)",
    entidade_representada: "Maçonaria",
    telefone: "(31) 99169-5095",
    observacoes: "Suplente da Maçonaria"
  },
  {
    nome: "Luiz Pereira Neves",
    entidade_representada: "Associação do Jataí",
    telefone: "(33) 98846-1684",
    observacoes: "Suplente da Associação do Jataí"
  },
  {
    nome: "Paulo Felipe Bento Sousa",
    entidade_representada: "Câmara de Vereadores",
    telefone: "(33) 98765-3566",
    observacoes: "Suplente da Câmara de Vereadores"
  },
  {
    nome: "Belmira Carlos Pereira Justiniano",
    entidade_representada: "Emater",
    telefone: "(33) 98745-0532",
    observacoes: "No WhatsApp: \"Bel / Deus eu te amo\""
  },
  {
    nome: "Marlucelei Oliveira",
    entidade_representada: "Secretaria de Esportes",
    telefone: "(33) 98819-9212",
    observacoes: "Suplente da Secretaria de Esportes"
  },
  {
    nome: "Alberto Magno",
    entidade_representada: "Secretaria do Meio Ambiente (SMMA)",
    telefone: "(33) 98881-8614",
    observacoes: "Suplente da SMMA"
  },
  {
    nome: "Valmison Meireles",
    entidade_representada: "Polícia Militar",
    telefone: "(33) 98828-4480",
    observacoes: "Suplente da Polícia Militar"
  }
];

// Função para determinar o segmento baseado na entidade
function determinarSegmento(entidade: string): string {
  const governo = [
    'Câmara de Vereadores',
    'Secretaria de Esportes', 
    'Secretaria do Meio Ambiente (SMMA)',
    'Polícia Militar'
  ];
  
  return governo.includes(entidade) ? 'governo' : 'sociedade_civil';
}

// Função para processar os dados dos membros
function processarMembros(membros: any[], titular: boolean): ConselheiroData[] {
  return membros.map(membro => ({
    nome_completo: membro.nome,
    entidade_representada: membro.entidade_representada,
    telefone: membro.telefone,
    observacoes: membro.observacoes,
    titular,
    segmento: determinarSegmento(membro.entidade_representada),
    mandato_inicio: '2024-01-01',
    mandato_fim: '2025-12-31',
    status: 'ativo',
    mandato_numero: 1,
    faltas_consecutivas: 0,
    total_faltas: 0
  }));
}

export async function seedConselheiros() {
  try {
    console.log('🧹 Limpando dados existentes...');
    
    // Remover todos os membros existentes
    const { error: deleteError } = await supabase
      .from('conselheiros')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Erro ao limpar dados existentes:', deleteError);
      throw deleteError;
    }

    console.log('✅ Dados existentes removidos');

    // Processar dados dos membros
    const conselheirosData = [
      ...processarMembros(membrosTitulares, true),
      ...processarMembros(membrosSuplentes, false)
    ];

    console.log(`📊 Inserindo ${conselheirosData.length} conselheiros...`);
    console.log(`   - ${membrosTitulares.length} Titulares`);
    console.log(`   - ${membrosSuplentes.length} Suplentes`);

    // Inserir todos os membros
    const { data, error: insertError } = await supabase
      .from('conselheiros')
      .insert(conselheirosData)
      .select();

    if (insertError) {
      console.error('Erro ao inserir conselheiros:', insertError);
      throw insertError;
    }

    console.log(`✅ ${data?.length} conselheiros inseridos com sucesso!`);
    
    // Mostrar resumo
    const titulares = data?.filter(c => c.titular) || [];
    const suplentes = data?.filter(c => !c.titular) || [];
    
    console.log('\n📋 Resumo dos membros inseridos:');
    console.log('\n👔 MEMBROS TITULARES:');
    titulares.forEach((membro, index) => {
      const cargo = membro.observacoes?.includes('Presidente') ? ' (Presidente)' : 
                   membro.observacoes?.includes('Vice-presidente') ? ' (Vice-presidente)' : '';
      console.log(`   ${index + 1}. ${membro.nome_completo}${cargo} - ${membro.entidade_representada}`);
    });
    
    console.log('\n👥 MEMBROS SUPLENTES:');
    suplentes.forEach((membro, index) => {
      console.log(`   ${index + 1}. ${membro.nome_completo} - ${membro.entidade_representada}`);
    });

    console.log(`\n🎉 Seed completado! Total: ${data?.length} conselheiros`);
    
    return data;
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Executar o seed se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedConselheiros()
    .then(() => {
      console.log('Seed executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar seed:', error);
      process.exit(1);
    });
}