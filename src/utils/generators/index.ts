// Generators - export specific functions to avoid naming conflicts
export { 
  gerarProtocolo,
  gerarNumeroProcesso as gerarNumeroProcessoFromProtocolo,
  consultarProximoProtocolo,
  obterEstatisticasProtocolos,
  validarFormatoProtocolo,
  extrairInfoProtocolo,
  TIPOS_PROTOCOLO_INFO,
  ProtocoloGenerator
} from './protocoloGenerator';

// Re-export types
export type { TipoProtocolo, ProtocoloInfo } from './protocoloGenerator';

export { 
  gerarNumeroProcesso as gerarNumeroProcessoFromNumero
} from './numeroGenerator';

export { TestAccountManager } from './createTestAccounts'; 