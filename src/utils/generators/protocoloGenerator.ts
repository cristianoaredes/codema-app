import { supabase } from '@/integrations/supabase/client';

export type TipoProtocolo = 
  | 'PROC'  // Processos ambientais
  | 'RES'   // Resoluções do conselho
  | 'OUV'   // Ouvidoria/Denúncias
  | 'REU'   // Reuniões
  | 'ATA'   // Atas de reunião
  | 'CONV'  // Convocações
  | 'DOC'   // Documentos gerais
  | 'PROJ'  // Projetos
  | 'REL'   // Relatórios
  | 'NOT';  // Notificações

export interface ProtocoloInfo {
  numero: string;
  tipo: TipoProtocolo;
  ano: number;
  sequencial: number;
  descricao: string;
  data_geracao: Date;
}

export const TIPOS_PROTOCOLO_INFO = {
  PROC: {
    nome: 'Processo Ambiental',
    descricao: 'Processos de licenciamento e fiscalização ambiental',
    prefixo: 'PROC'
  },
  RES: {
    nome: 'Resolução',
    descricao: 'Resoluções aprovadas pelo conselho',
    prefixo: 'RES'
  },
  OUV: {
    nome: 'Ouvidoria',
    descricao: 'Denúncias e reclamações da ouvidoria',
    prefixo: 'OUV'
  },
  REU: {
    nome: 'Reunião',
    descricao: 'Reuniões ordinárias e extraordinárias',
    prefixo: 'REU'
  },
  ATA: {
    nome: 'Ata',
    descricao: 'Atas de reuniões do conselho',
    prefixo: 'ATA'
  },
  CONV: {
    nome: 'Convocação',
    descricao: 'Convocações para reuniões',
    prefixo: 'CONV'
  },
  DOC: {
    nome: 'Documento',
    descricao: 'Documentos gerais',
    prefixo: 'DOC'
  },
  PROJ: {
    nome: 'Projeto',
    descricao: 'Projetos ambientais',
    prefixo: 'PROJ'
  },
  REL: {
    nome: 'Relatório',
    descricao: 'Relatórios diversos',
    prefixo: 'REL'
  },
  NOT: {
    nome: 'Notificação',
    descricao: 'Notificações e comunicados',
    prefixo: 'NOT'
  }
} as const;

export class ProtocoloGenerator {
  
  /**
   * Gera um novo número de protocolo único
   * @param tipo - Tipo do protocolo
   * @returns Promisse com o número do protocolo formatado
   */
  static async gerarProtocolo(tipo: TipoProtocolo): Promise<string> {
    try {
      // Usar a função do banco para gerar o protocolo
      const { data, error } = await supabase
        .rpc('gerar_proximo_protocolo', { tipo_protocolo: tipo });

      if (error) {
        console.error('Erro ao gerar protocolo:', error);
        throw new Error(`Erro ao gerar protocolo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na geração de protocolo:', error);
      // Fallback para geração local em caso de erro
      return this.gerarProtocoloFallback(tipo);
    }
  }

  /**
   * Consulta o próximo número que seria gerado sem efetivamente gerar
   * @param tipo - Tipo do protocolo
   * @returns Promisse com o próximo número que seria gerado
   */
  static async consultarProximoProtocolo(tipo: TipoProtocolo): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('consultar_proximo_protocolo', { tipo_protocolo: tipo });

      if (error) {
        console.error('Erro ao consultar protocolo:', error);
        throw new Error(`Erro ao consultar protocolo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na consulta de protocolo:', error);
      return this.gerarProtocoloFallback(tipo);
    }
  }

  /**
   * Método de fallback para gerar protocolo localmente
   * @param tipo - Tipo do protocolo
   * @returns Número do protocolo formatado
   */
  private static gerarProtocoloFallback(tipo: TipoProtocolo): string {
    const ano = new Date().getFullYear();
    const timestamp = Date.now();
    const sequencial = timestamp % 1000; // Usar timestamp para evitar duplicação
    
    return `${tipo}-${sequencial.toString().padStart(3, '0')}/${ano}`;
  }

  /**
   * Extrai informações de um número de protocolo
   * @param numeroProtocolo - Número do protocolo formatado
   * @returns Informações extraídas do protocolo
   */
  static extrairInfoProtocolo(numeroProtocolo: string): ProtocoloInfo | null {
    const regex = /^([A-Z]+)-(\d{3})\/(\d{4})$/;
    const match = numeroProtocolo.match(regex);
    
    if (!match) {
      return null;
    }

    const [, tipo, sequencial, ano] = match;
    
    if (!this.isValidTipoProtocolo(tipo)) {
      return null;
    }

    return {
      numero: numeroProtocolo,
      tipo: tipo as TipoProtocolo,
      ano: parseInt(ano),
      sequencial: parseInt(sequencial),
      descricao: TIPOS_PROTOCOLO_INFO[tipo as TipoProtocolo].descricao,
      data_geracao: new Date()
    };
  }

  /**
   * Valida se um tipo de protocolo é válido
   * @param tipo - Tipo a ser validado
   * @returns True se válido, false caso contrário
   */
  private static isValidTipoProtocolo(tipo: string): tipo is TipoProtocolo {
    return Object.keys(TIPOS_PROTOCOLO_INFO).includes(tipo);
  }

  /**
   * Obter estatísticas de protocolos por tipo
   * @param ano - Ano para filtrar (padrão: ano atual)
   * @returns Promisse com as estatísticas
   */
  static async obterEstatisticas(ano?: number): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .rpc('obter_estatisticas_protocolos', { ano_filtro: ano });

      if (error) {
        console.error('Erro ao obter estatísticas:', error);
        throw new Error(`Erro ao obter estatísticas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro na obtenção de estatísticas:', error);
      return [];
    }
  }

  /**
   * Resetar sequência de um tipo de protocolo
   * @param tipo - Tipo do protocolo
   * @param ano - Ano para resetar (padrão: ano atual)
   * @returns Promisse<void>
   */
  static async resetarSequencia(tipo: TipoProtocolo, ano?: number): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('resetar_sequencia_protocolo', { 
          tipo_protocolo: tipo,
          novo_ano: ano 
        });

      if (error) {
        console.error('Erro ao resetar sequência:', error);
        throw new Error(`Erro ao resetar sequência: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no reset de sequência:', error);
      throw error;
    }
  }

  /**
   * Validar formato de número de protocolo
   * @param numeroProtocolo - Número a ser validado
   * @returns True se válido, false caso contrário
   */
  static validarFormato(numeroProtocolo: string): boolean {
    const regex = /^[A-Z]+-\d{3}\/\d{4}$/;
    return regex.test(numeroProtocolo);
  }

  /**
   * Gerar múltiplos protocolos de uma vez
   * @param tipo - Tipo do protocolo
   * @param quantidade - Quantidade de protocolos a gerar
   * @returns Promisse com array de números de protocolo
   */
  static async gerarMultiplos(tipo: TipoProtocolo, quantidade: number): Promise<string[]> {
    const protocolos: string[] = [];
    
    for (let i = 0; i < quantidade; i++) {
      const protocolo = await this.gerarProtocolo(tipo);
      protocolos.push(protocolo);
    }
    
    return protocolos;
  }

  /**
   * Buscar protocolos por tipo e ano
   * @param tipo - Tipo do protocolo
   * @param ano - Ano para filtrar
   * @returns Promisse com informações da sequência
   */
  static async buscarPorTipoAno(tipo: TipoProtocolo, ano: number): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from('protocolos_sequencia')
        .select('*')
        .eq('tipo', tipo)
        .eq('ano', ano)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é "not found"
        console.error('Erro ao buscar protocolo:', error);
        throw new Error(`Erro ao buscar protocolo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na busca por tipo e ano:', error);
      return null;
    }
  }
}

// Exportar função legacy para compatibilidade
export async function gerarNumeroProcesso(tipo: 'PROC' | 'RES' | 'OUV'): Promise<string> {
  return ProtocoloGenerator.gerarProtocolo(tipo);
}

// Exportar função principal
export const gerarProtocolo = ProtocoloGenerator.gerarProtocolo;
export const consultarProximoProtocolo = ProtocoloGenerator.consultarProximoProtocolo;
export const obterEstatisticasProtocolos = ProtocoloGenerator.obterEstatisticas;
export const validarFormatoProtocolo = ProtocoloGenerator.validarFormato;
export const extrairInfoProtocolo = ProtocoloGenerator.extrairInfoProtocolo;