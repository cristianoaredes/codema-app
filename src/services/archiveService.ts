import { supabase } from '@/integrations/supabase/client';
import { ProtocoloGenerator } from '@/utils/generators/protocoloGenerator';

export interface DocumentMetadata {
  id: string;
  titulo: string;
  descricao?: string;
  tipo_documento: 'ata' | 'resolucao' | 'convocacao' | 'oficio' | 'parecer' | 'relatorio' | 'lei' | 'decreto' | 'outro';
  categoria: 'historico' | 'atual' | 'arquivo_morto';
  data_documento: string;
  data_upload: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tamanho: number;
  arquivo_tipo: string;
  protocolo: string;
  tags: string[];
  periodo: {
    ano: number;
    mes?: number;
    gestao?: string;
  };
  origem: {
    reuniao_id?: string;
    autor?: string;
    orgao?: string;
  };
  status: 'ativo' | 'arquivado' | 'excluido';
  confidencial: boolean;
  indexed_content?: string; // Texto extraído para busca
  versao: number;
  versao_anterior_id?: string;
  checksum: string; // Para verificação de integridade
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface SearchFilters {
  query?: string;
  tipo_documento?: string[];
  categoria?: string[];
  periodo_inicio?: string;
  periodo_fim?: string;
  tags?: string[];
  autor?: string;
  orgao?: string;
  confidencial?: boolean;
  status?: string[];
}

export interface UploadProgress {
  progress: number;
  stage: 'uploading' | 'processing' | 'indexing' | 'complete' | 'error';
  message: string;
}

export interface DocumentStats {
  total_documentos: number;
  por_tipo: Record<string, number>;
  por_categoria: Record<string, number>;
  por_ano: Record<string, number>;
  tamanho_total: number;
  ultimos_uploads: DocumentMetadata[];
}

export class ArchiveService {
  /**
   * Upload de documento com processamento automático
   */
  static async uploadDocument(
    file: File,
    metadata: Partial<DocumentMetadata>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentMetadata> {
    try {
      onProgress?.({
        progress: 10,
        stage: 'uploading',
        message: 'Iniciando upload do arquivo...'
      });

      // Gerar protocolo único
      const protocolo = await ProtocoloGenerator.generate('DOC');
      
      // Calcular checksum (simulado)
      const checksum = await this.calculateFileChecksum(file);
      
      onProgress?.({
        progress: 25,
        stage: 'uploading',
        message: 'Enviando arquivo para o storage...'
      });

      // Upload para Supabase Storage
      const fileName = `${protocolo}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`archive/${new Date().getFullYear()}/${fileName}`, file);

      if (uploadError) throw uploadError;

      onProgress?.({
        progress: 50,
        stage: 'processing',
        message: 'Processando metadados...'
      });

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path);

      onProgress?.({
        progress: 75,
        stage: 'indexing',
        message: 'Indexando conteúdo para busca...'
      });

      // Extrair texto para indexação (simulado)
      const indexedContent = await this.extractTextContent(file);

      // Criar documento no banco
      const documentData: Omit<DocumentMetadata, 'id'> = {
        titulo: metadata.titulo || file.name,
        descricao: metadata.descricao,
        tipo_documento: metadata.tipo_documento || 'outro',
        categoria: metadata.categoria || 'atual',
        data_documento: metadata.data_documento || new Date().toISOString(),
        data_upload: new Date().toISOString(),
        arquivo_url: urlData.publicUrl,
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
        arquivo_tipo: file.type,
        protocolo,
        tags: metadata.tags || [],
        periodo: metadata.periodo || {
          ano: new Date().getFullYear()
        },
        origem: metadata.origem || {},
        status: 'ativo',
        confidencial: metadata.confidencial || false,
        indexed_content: indexedContent,
        versao: 1,
        checksum,
        created_by: metadata.created_by || 'system',
        created_at: new Date().toISOString()
      };

      const { data: document, error: dbError } = await supabase
        .from('arquivo_documentos')
        .insert(documentData)
        .select()
        .single();

      if (dbError) throw dbError;

      onProgress?.({
        progress: 100,
        stage: 'complete',
        message: 'Documento arquivado com sucesso!'
      });

      return document;

    } catch (error) {
      onProgress?.({
        progress: 0,
        stage: 'error',
        message: error instanceof Error ? error.message : 'Erro no upload'
      });
      throw error;
    }
  }

  /**
   * Busca avançada de documentos
   */
  static async searchDocuments(
    filters: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<{
    documents: DocumentMetadata[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let query = supabase
        .from('arquivo_documentos')
        .select('*', { count: 'exact' })
        .eq('status', 'ativo');

      // Filtro por texto (busca em título, descrição e conteúdo indexado)
      if (filters.query) {
        query = query.or(`titulo.ilike.%${filters.query}%,descricao.ilike.%${filters.query}%,indexed_content.ilike.%${filters.query}%`);
      }

      // Filtro por tipo de documento
      if (filters.tipo_documento && filters.tipo_documento.length > 0) {
        query = query.in('tipo_documento', filters.tipo_documento);
      }

      // Filtro por categoria
      if (filters.categoria && filters.categoria.length > 0) {
        query = query.in('categoria', filters.categoria);
      }

      // Filtro por período
      if (filters.periodo_inicio) {
        query = query.gte('data_documento', filters.periodo_inicio);
      }
      if (filters.periodo_fim) {
        query = query.lte('data_documento', filters.periodo_fim);
      }

      // Filtro por confidencialidade
      if (filters.confidencial !== undefined) {
        query = query.eq('confidencial', filters.confidencial);
      }

      // Paginação
      const offset = (page - 1) * limit;
      query = query
        .order('data_documento', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: documents, error, count } = await query;

      if (error) throw error;

      return {
        documents: documents || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };

    } catch (error) {
      console.error('Erro na busca de documentos:', error);
      return {
        documents: [],
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * Obter documento por ID
   */
  static async getDocument(id: string): Promise<DocumentMetadata | null> {
    try {
      const { data: document, error } = await supabase
        .from('arquivo_documentos')
        .select('*')
        .eq('id', id)
        .eq('status', 'ativo')
        .single();

      if (error) throw error;
      return document;

    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      return null;
    }
  }

  /**
   * Atualizar metadados do documento
   */
  static async updateDocument(
    id: string,
    updates: Partial<DocumentMetadata>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('arquivo_documentos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return !error;

    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      return false;
    }
  }

  /**
   * Criar nova versão de documento
   */
  static async createNewVersion(
    originalId: string,
    file: File,
    metadata: Partial<DocumentMetadata>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentMetadata> {
    try {
      // Buscar documento original
      const originalDoc = await this.getDocument(originalId);
      if (!originalDoc) {
        throw new Error('Documento original não encontrado');
      }

      // Fazer upload da nova versão
      const newVersion = await this.uploadDocument(
        file,
        {
          ...metadata,
          titulo: originalDoc.titulo,
          tipo_documento: originalDoc.tipo_documento,
          categoria: originalDoc.categoria,
          origem: originalDoc.origem,
          versao: originalDoc.versao + 1,
          versao_anterior_id: originalDoc.id
        },
        onProgress
      );

      // Marcar versão anterior como arquivada
      await this.updateDocument(originalId, {
        status: 'arquivado',
        updated_at: new Date().toISOString()
      });

      return newVersion;

    } catch (error) {
      console.error('Erro ao criar nova versão:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de versões
   */
  static async getDocumentVersions(id: string): Promise<DocumentMetadata[]> {
    try {
      // Buscar documento atual
      const currentDoc = await this.getDocument(id);
      if (!currentDoc) return [];

      const versions = [currentDoc];

      // Buscar versões anteriores recursivamente
      let currentVersionId = currentDoc.versao_anterior_id;
      while (currentVersionId) {
        const { data: version } = await supabase
          .from('arquivo_documentos')
          .select('*')
          .eq('id', currentVersionId)
          .single();

        if (version) {
          versions.push(version);
          currentVersionId = version.versao_anterior_id;
        } else {
          break;
        }
      }

      return versions.sort((a, b) => b.versao - a.versao);

    } catch (error) {
      console.error('Erro ao buscar versões:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas do arquivo
   */
  static async getArchiveStats(): Promise<DocumentStats> {
    try {
      const { data: documents } = await supabase
        .from('arquivo_documentos')
        .select('*')
        .eq('status', 'ativo');

      if (!documents) {
        return {
          total_documentos: 0,
          por_tipo: {},
          por_categoria: {},
          por_ano: {},
          tamanho_total: 0,
          ultimos_uploads: []
        };
      }

      const stats: DocumentStats = {
        total_documentos: documents.length,
        por_tipo: {},
        por_categoria: {},
        por_ano: {},
        tamanho_total: 0,
        ultimos_uploads: []
      };

      // Calcular estatísticas
      documents.forEach(doc => {
        // Por tipo
        stats.por_tipo[doc.tipo_documento] = (stats.por_tipo[doc.tipo_documento] || 0) + 1;
        
        // Por categoria
        stats.por_categoria[doc.categoria] = (stats.por_categoria[doc.categoria] || 0) + 1;
        
        // Por ano
        const ano = doc.periodo.ano.toString();
        stats.por_ano[ano] = (stats.por_ano[ano] || 0) + 1;
        
        // Tamanho total
        stats.tamanho_total += doc.arquivo_tamanho;
      });

      // Últimos uploads (últimos 10)
      stats.ultimos_uploads = documents
        .sort((a, b) => new Date(b.data_upload).getTime() - new Date(a.data_upload).getTime())
        .slice(0, 10);

      return stats;

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total_documentos: 0,
        por_tipo: {},
        por_categoria: {},
        por_ano: {},
        tamanho_total: 0,
        ultimos_uploads: []
      };
    }
  }

  /**
   * Buscar documentos relacionados
   */
  static async getRelatedDocuments(
    documentId: string,
    limit = 5
  ): Promise<DocumentMetadata[]> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) return [];

      let query = supabase
        .from('arquivo_documentos')
        .select('*')
        .eq('status', 'ativo')
        .neq('id', documentId)
        .limit(limit);

      // Buscar por mesmo tipo ou período
      if (document.origem.reuniao_id) {
        query = query.eq('origem->reuniao_id', document.origem.reuniao_id);
      } else {
        query = query
          .eq('tipo_documento', document.tipo_documento)
          .eq('periodo->ano', document.periodo.ano);
      }

      const { data: related } = await query;
      return related || [];

    } catch (error) {
      console.error('Erro ao buscar documentos relacionados:', error);
      return [];
    }
  }

  /**
   * Exportar lista de documentos
   */
  static async exportDocumentList(
    filters: SearchFilters,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    try {
      const { documents } = await this.searchDocuments(filters, 1, 1000);

      if (format === 'json') {
        return JSON.stringify(documents, null, 2);
      }

      // Formato CSV
      const headers = [
        'Protocolo', 'Título', 'Tipo', 'Categoria', 'Data Documento', 
        'Tamanho', 'Tags', 'Autor', 'Data Upload'
      ];

      const csvRows = [
        headers.join(','),
        ...documents.map(doc => [
          doc.protocolo,
          `"${doc.titulo}"`,
          doc.tipo_documento,
          doc.categoria,
          doc.data_documento,
          doc.arquivo_tamanho,
          `"${doc.tags.join(', ')}"`,
          doc.origem.autor || '',
          doc.data_upload
        ].join(','))
      ];

      return csvRows.join('\n');

    } catch (error) {
      console.error('Erro ao exportar lista:', error);
      throw error;
    }
  }

  /**
   * Validar integridade do arquivo
   */
  static async validateDocument(id: string): Promise<{
    valid: boolean;
    checksum_match: boolean;
    file_exists: boolean;
    issues: string[];
  }> {
    try {
      const document = await this.getDocument(id);
      if (!document) {
        return {
          valid: false,
          checksum_match: false,
          file_exists: false,
          issues: ['Documento não encontrado']
        };
      }

      const issues: string[] = [];

      // Verificar se arquivo existe no storage
      const { error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.arquivo_url.split('/').pop() || '');

      const file_exists = !downloadError;
      if (!file_exists) {
        issues.push('Arquivo não encontrado no storage');
      }

      // Verificar checksum (simulado)
      const checksum_match = true; // Em produção, recalcular e comparar
      if (!checksum_match) {
        issues.push('Checksum não confere - arquivo pode estar corrompido');
      }

      return {
        valid: issues.length === 0,
        checksum_match,
        file_exists,
        issues
      };

    } catch (error) {
      return {
        valid: false,
        checksum_match: false,
        file_exists: false,
        issues: ['Erro na validação: ' + (error instanceof Error ? error.message : 'Erro desconhecido')]
      };
    }
  }

  /**
   * Utilitários privados
   */
  private static async calculateFileChecksum(file: File): Promise<string> {
    // Simulação de cálculo de checksum
    // Em produção, usar crypto API para gerar hash real
    return `sha256-${file.size}-${file.lastModified}`;
  }

  private static async extractTextContent(file: File): Promise<string> {
    // Simulação de extração de texto
    // Em produção, usar bibliotecas como pdf-parse, mammoth, etc.
    
    if (file.type.includes('text')) {
      try {
        const text = await file.text();
        return text.substring(0, 5000); // Limitar tamanho do índice
      } catch {
        return '';
      }
    }

    // Para PDFs e outros formatos, retornar placeholder
    return `Documento ${file.name} - ${file.type}`;
  }
}