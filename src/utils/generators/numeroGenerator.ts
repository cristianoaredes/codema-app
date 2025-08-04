import { supabase } from '@/integrations/supabase/client';

// Only allow tables that exist in the generated types
function getTabelaPorTipo(tipo: string): "resolucoes" {
  // Only 'resolucoes' is present in the types
  return 'resolucoes';
}

export async function gerarNumeroProcesso(tipo: 'RES'): Promise<string> {
  const ano = new Date().getFullYear();
  const tabela = getTabelaPorTipo(tipo);

  // Only use allowed table names
  const { data, error } = await supabase
    .from(tabela)
    .select('numero_processo')
    .like('numero_processo', `${tipo}-%/${ano}`)
    .order('numero_processo', { ascending: false })
    .limit(1);

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return `${tipo}-001/${ano}`;
  }

  // Defensive: numero_processo may not exist
  const ultimoNumero = (data[0] as any).numero_processo as string | undefined;
  if (!ultimoNumero) return `${tipo}-001/${ano}`;
  const sequencial = parseInt(ultimoNumero.split('-')[1].split('/')[0]);
  const proximoNumero = isNaN(sequencial) ? 1 : sequencial + 1;
  return `${tipo}-${proximoNumero.toString().padStart(3, '0')}/${ano}`;
}