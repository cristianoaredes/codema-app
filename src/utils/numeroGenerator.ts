import { supabase } from '@/integrations/supabase/client';

export async function gerarNumeroProcesso(tipo: 'PROC' | 'RES' | 'OUV'): Promise<string> {
  const ano = new Date().getFullYear();
  
  // Buscar último número do tipo no ano
  const { data, error } = await supabase
    .from(getTabelaPorTipo(tipo))
    .select('numero_processo')
    .like('numero_processo', `${tipo}-%/${ano}`)
    .order('numero_processo', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Erro ao gerar número:', error);
    return `${tipo}-001/${ano}`;
  }
  
  let proximoNumero = 1;
  if (data && data.length > 0) {
    const ultimoNumero = data[0].numero_processo;
    const sequencial = parseInt(ultimoNumero.split('-')[1].split('/')[0]);
    proximoNumero = sequencial + 1;
  }
  
  return `${tipo}-${proximoNumero.toString().padStart(3, '0')}/${ano}`;
}

function getTabelaPorTipo(tipo: string): string {
  switch (tipo) {
    case 'PROC': return 'processos';
    case 'RES': return 'resolucoes';
    case 'OUV': return 'ouvidoria_denuncias';
    default: return 'processos';
  }
}