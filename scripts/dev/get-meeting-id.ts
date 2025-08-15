import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar cliente Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://aqvbhmpdzvdbhvxhnemi.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdmJobXBkenZkYmh2eGhuZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0MTksImV4cCI6MjA2ODAxNDQxOX0.3_l3DA0TOA8afMr-i-Hgv8TrUQYiETYFhIEVTsRHZnM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getMeetingId() {
  try {
    const { data, error } = await supabase
      .from('reunioes')
      .select('id, titulo, data_reuniao')
      .eq('titulo', 'REUNIÃO DE POSSE CODEMA 2025-2027')
      .single();

    if (error) {
      console.error('Erro ao buscar reunião:', error);
      return;
    }

    console.log('🎯 Reunião encontrada:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Título: ${data.titulo}`);
    console.log(`   Data: ${data.data_reuniao}`);
    console.log('');
    console.log(`🔗 URL para testar: http://localhost:8083/reunioes/${data.id}`);

  } catch (error) {
    console.error('Erro:', error);
  }
}

getMeetingId();