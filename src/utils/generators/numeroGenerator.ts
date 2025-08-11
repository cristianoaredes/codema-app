import { supabase } from '@/integrations/supabase/client';

// Supported document types
type TipoDocumento = 'RES' | 'ATA' | 'REUNIAO';

// Map document types to their respective tables
type TabelaMap = {
  RES: 'resolucoes';
  ATA: 'atas';
  REUNIAO: 'reunioes';
};

function getTabelaPorTipo(tipo: TipoDocumento): TabelaMap[TipoDocumento] {
  const tabelaMap: TabelaMap = {
    RES: 'resolucoes',
    ATA: 'atas', 
    REUNIAO: 'reunioes'
  };
  
  return tabelaMap[tipo];
}

// Column mapping for number fields
type ColunaNumeroMap = {
  resolucoes: 'numero_processo';
  atas: 'numero';
  reunioes: 'numero';
};

function getColunaNumeroPorTabela(tabela: string): string {
  const colunaMap: ColunaNumeroMap = {
    resolucoes: 'numero_processo',
    atas: 'numero',
    reunioes: 'numero'
  };
  
  return colunaMap[tabela as keyof ColunaNumeroMap] || 'numero_processo';
}

export async function gerarNumeroProcesso(tipo: TipoDocumento): Promise<string> {
  const ano = new Date().getFullYear();
  const tabela = getTabelaPorTipo(tipo);
  const coluna = getColunaNumeroPorTabela(tabela);

  const { data, error } = await supabase
    .from(tabela)
    .select(coluna)
    .like(coluna, `${tipo}-%/${ano}`)
    .order(coluna, { ascending: false })
    .limit(1);

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return `${tipo}-001/${ano}`;
  }

  const ultimoNumero = (data[0] as Record<string, unknown>)[coluna] as string | undefined;
  if (!ultimoNumero || typeof ultimoNumero !== 'string') {
    return `${tipo}-001/${ano}`;
  }
  
  const partes = ultimoNumero.split('-');
  if (partes.length < 2) {
    return `${tipo}-001/${ano}`;
  }
  
  const sequencialComAno = partes[1];
  const sequencial = parseInt(sequencialComAno.split('/')[0]);
  const proximoNumero = isNaN(sequencial) ? 1 : sequencial + 1;
  
  return `${tipo}-${proximoNumero.toString().padStart(3, '0')}/${ano}`;
}

// Generate specific document numbers
export const gerarNumeroResolucao = () => gerarNumeroProcesso('RES');
export const gerarNumeroAta = () => gerarNumeroProcesso('ATA');
export const gerarNumeroReuniao = () => gerarNumeroProcesso('REUNIAO');

// Format numbers for display
export function formatarNumeroDocumento(numero: string, tipo?: TipoDocumento): string {
  if (!numero) return 'N/A';
  
  // If already formatted, return as is
  if (numero.includes('-') && numero.includes('/')) {
    return numero;
  }
  
  // Format simple numbers
  const ano = new Date().getFullYear();
  const prefix = tipo || 'DOC';
  const paddedNumber = numero.toString().padStart(3, '0');
  
  return `${prefix}-${paddedNumber}/${ano}`;
}

// Validate document number format
export function validarNumeroDocumento(numero: string): boolean {
  const regex = /^[A-Z]{2,10}-\d{3}\/\d{4}$/;
  return regex.test(numero);
}

// Extract year from document number
export function extrairAnoDocumento(numero: string): number | null {
  const match = numero.match(/\/(\d{4})$/);
  return match ? parseInt(match[1]) : null;
}

// Extract sequential number from document number
export function extrairSequencialDocumento(numero: string): number | null {
  const match = numero.match(/-(\d{3})\//); 
  return match ? parseInt(match[1]) : null;
}