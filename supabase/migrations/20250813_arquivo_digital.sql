-- ================================================
-- MIGRAÇÃO: Sistema de Arquivo Digital CODEMA
-- Data: 2025-08-13
-- Descrição: Implementa sistema completo de gestão de documentos históricos
-- ================================================

-- Criar tabela para documentos do arquivo digital
CREATE TABLE IF NOT EXISTS arquivo_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo_documento TEXT NOT NULL CHECK (tipo_documento IN (
        'ata', 'resolucao', 'convocacao', 'oficio', 'parecer', 
        'relatorio', 'lei', 'decreto', 'outro'
    )),
    categoria TEXT NOT NULL CHECK (categoria IN ('historico', 'atual', 'arquivo_morto')),
    data_documento TIMESTAMPTZ NOT NULL,
    data_upload TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    arquivo_url TEXT NOT NULL,
    arquivo_nome TEXT NOT NULL,
    arquivo_tamanho BIGINT NOT NULL,
    arquivo_tipo TEXT NOT NULL,
    protocolo TEXT NOT NULL UNIQUE,
    tags TEXT[] DEFAULT '{}',
    periodo JSONB NOT NULL DEFAULT '{}', -- {ano: number, mes?: number, gestao?: string}
    origem JSONB NOT NULL DEFAULT '{}', -- {reuniao_id?: string, autor?: string, orgao?: string}
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'excluido')),
    confidencial BOOLEAN NOT NULL DEFAULT FALSE,
    indexed_content TEXT, -- Texto extraído para busca
    versao INTEGER NOT NULL DEFAULT 1,
    versao_anterior_id UUID REFERENCES arquivo_documentos(id),
    checksum TEXT NOT NULL,
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Índices para performance
    CONSTRAINT arquivo_documentos_protocolo_unique UNIQUE (protocolo),
    CONSTRAINT arquivo_documentos_versao_check CHECK (versao > 0)
);

-- Comentários para documentação
COMMENT ON TABLE arquivo_documentos IS 'Tabela para gestão de documentos históricos do CODEMA';
COMMENT ON COLUMN arquivo_documentos.titulo IS 'Título do documento';
COMMENT ON COLUMN arquivo_documentos.tipo_documento IS 'Tipo do documento (ata, resolução, etc.)';
COMMENT ON COLUMN arquivo_documentos.categoria IS 'Categoria do arquivo (histórico, atual, arquivo morto)';
COMMENT ON COLUMN arquivo_documentos.protocolo IS 'Protocolo único gerado automaticamente';
COMMENT ON COLUMN arquivo_documentos.periodo IS 'Período/gestão do documento em formato JSON';
COMMENT ON COLUMN arquivo_documentos.origem IS 'Origem do documento em formato JSON';
COMMENT ON COLUMN arquivo_documentos.indexed_content IS 'Conteúdo extraído para indexação e busca';
COMMENT ON COLUMN arquivo_documentos.versao IS 'Versão do documento para controle de versionamento';
COMMENT ON COLUMN arquivo_documentos.checksum IS 'Hash para verificação de integridade do arquivo';

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_tipo ON arquivo_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_categoria ON arquivo_documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_data ON arquivo_documentos(data_documento);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_status ON arquivo_documentos(status);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_protocolo ON arquivo_documentos(protocolo);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_tags ON arquivo_documentos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_periodo ON arquivo_documentos USING GIN(periodo);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_origem ON arquivo_documentos USING GIN(origem);
CREATE INDEX IF NOT EXISTS idx_arquivo_documentos_search ON arquivo_documentos USING GIN(to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, '') || ' ' || COALESCE(indexed_content, '')));

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_arquivo_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_arquivo_documentos_updated_at
    BEFORE UPDATE ON arquivo_documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_arquivo_documentos_updated_at();

-- Configurar RLS (Row Level Security)
ALTER TABLE arquivo_documentos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem visualizar documentos ativos e não confidenciais
CREATE POLICY "Visualizar documentos públicos" ON arquivo_documentos
    FOR SELECT
    TO authenticated
    USING (
        status = 'ativo' 
        AND (
            confidencial = FALSE 
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'presidente', 'secretario')
            )
        )
    );

-- Política: Apenas admin, presidente e secretário podem inserir documentos
CREATE POLICY "Inserir documentos" ON arquivo_documentos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Política: Apenas admin, presidente e secretário podem atualizar documentos
CREATE POLICY "Atualizar documentos" ON arquivo_documentos
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'presidente', 'secretario')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Política: Apenas admin pode deletar documentos
CREATE POLICY "Deletar documentos" ON arquivo_documentos
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Criar bucket no Supabase Storage para documentos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de storage para o bucket documents
-- Política: Usuários autenticados podem visualizar documentos
CREATE POLICY "Visualizar documentos storage" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'documents');

-- Política: Apenas admin, presidente e secretário podem fazer upload
CREATE POLICY "Upload documentos storage" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Política: Apenas admin, presidente e secretário podem atualizar arquivos
CREATE POLICY "Atualizar documentos storage" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'presidente', 'secretario')
        )
    );

-- Política: Apenas admin pode deletar arquivos
CREATE POLICY "Deletar documentos storage" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Criar função para busca avançada de documentos
CREATE OR REPLACE FUNCTION buscar_documentos(
    texto_busca TEXT DEFAULT NULL,
    tipos_documento TEXT[] DEFAULT NULL,
    categorias TEXT[] DEFAULT NULL,
    data_inicio DATE DEFAULT NULL,
    data_fim DATE DEFAULT NULL,
    incluir_confidencial BOOLEAN DEFAULT FALSE,
    limite INTEGER DEFAULT 20,
    deslocamento INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    titulo TEXT,
    tipo_documento TEXT,
    categoria TEXT,
    data_documento TIMESTAMPTZ,
    protocolo TEXT,
    confidencial BOOLEAN,
    origem JSONB,
    tags TEXT[],
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.titulo,
        d.tipo_documento,
        d.categoria,
        d.data_documento,
        d.protocolo,
        d.confidencial,
        d.origem,
        d.tags,
        CASE 
            WHEN texto_busca IS NOT NULL THEN
                ts_rank(
                    to_tsvector('portuguese', d.titulo || ' ' || COALESCE(d.descricao, '') || ' ' || COALESCE(d.indexed_content, '')),
                    plainto_tsquery('portuguese', texto_busca)
                )
            ELSE 1.0
        END as rank
    FROM arquivo_documentos d
    WHERE 
        d.status = 'ativo'
        AND (incluir_confidencial OR d.confidencial = FALSE)
        AND (texto_busca IS NULL OR to_tsvector('portuguese', d.titulo || ' ' || COALESCE(d.descricao, '') || ' ' || COALESCE(d.indexed_content, '')) @@ plainto_tsquery('portuguese', texto_busca))
        AND (tipos_documento IS NULL OR d.tipo_documento = ANY(tipos_documento))
        AND (categorias IS NULL OR d.categoria = ANY(categorias))
        AND (data_inicio IS NULL OR d.data_documento >= data_inicio)
        AND (data_fim IS NULL OR d.data_documento <= data_fim)
    ORDER BY 
        CASE WHEN texto_busca IS NOT NULL THEN rank END DESC,
        d.data_documento DESC
    LIMIT limite
    OFFSET deslocamento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para estatísticas do arquivo
CREATE OR REPLACE FUNCTION estatisticas_arquivo()
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'total_documentos', COUNT(*),
        'tamanho_total', SUM(arquivo_tamanho),
        'por_tipo', json_object_agg(tipo_documento, count_tipo),
        'por_categoria', json_object_agg(categoria, count_categoria),
        'por_ano', json_object_agg(ano, count_ano),
        'ultimos_uploads', array_agg(
            json_build_object(
                'id', id,
                'titulo', titulo,
                'tipo_documento', tipo_documento,
                'data_upload', data_upload,
                'arquivo_tamanho', arquivo_tamanho
            ) ORDER BY data_upload DESC
        ) FILTER (WHERE row_number() OVER (ORDER BY data_upload DESC) <= 10)
    ) INTO resultado
    FROM (
        SELECT 
            id, titulo, tipo_documento, categoria, data_upload, arquivo_tamanho,
            EXTRACT(YEAR FROM data_documento) as ano,
            COUNT(*) OVER (PARTITION BY tipo_documento) as count_tipo,
            COUNT(*) OVER (PARTITION BY categoria) as count_categoria,
            COUNT(*) OVER (PARTITION BY EXTRACT(YEAR FROM data_documento)) as count_ano
        FROM arquivo_documentos
        WHERE status = 'ativo'
    ) stats;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário final
COMMENT ON FUNCTION buscar_documentos IS 'Função para busca avançada de documentos no arquivo digital';
COMMENT ON FUNCTION estatisticas_arquivo IS 'Função para obter estatísticas gerais do arquivo digital';

-- Inserir alguns dados de exemplo (opcional - apenas para desenvolvimento)
-- Remover em produção
DO $$
BEGIN
    -- Verificar se estamos em ambiente de desenvolvimento
    IF EXISTS (SELECT 1 FROM pg_settings WHERE name = 'cluster_name' AND setting LIKE '%local%') THEN
        INSERT INTO arquivo_documentos (
            titulo, tipo_documento, categoria, data_documento, arquivo_url, 
            arquivo_nome, arquivo_tamanho, arquivo_tipo, protocolo, tags,
            periodo, origem, created_by, checksum
        ) VALUES 
        (
            'Ata da 1ª Reunião Ordinária de 2025',
            'ata',
            'atual',
            '2025-01-15 14:00:00-03',
            'https://example.com/ata-01-2025.pdf',
            'ata-01-2025.pdf',
            1024000,
            'application/pdf',
            'ATA-001/2025',
            ARRAY['reunião', 'ordinária', '2025'],
            '{"ano": 2025, "mes": 1}'::jsonb,
            '{"autor": "Secretário CODEMA", "orgao": "CODEMA Itanhomi"}'::jsonb,
            'sistema',
            'sha256-exemplo-checksum-123'
        ),
        (
            'Resolução nº 001/2025 - Normas Ambientais',
            'resolucao',
            'atual',
            '2025-01-20 10:00:00-03',
            'https://example.com/resolucao-001-2025.pdf',
            'resolucao-001-2025.pdf',
            512000,
            'application/pdf',
            'RES-001/2025',
            ARRAY['resolução', 'normas', 'ambiental'],
            '{"ano": 2025, "mes": 1}'::jsonb,
            '{"autor": "Presidente CODEMA", "orgao": "CODEMA Itanhomi"}'::jsonb,
            'sistema',
            'sha256-exemplo-checksum-456'
        ) ON CONFLICT (protocolo) DO NOTHING;
    END IF;
END $$;