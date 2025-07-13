-- CODEMA-Itanhomi Phase 1: Foundation Modules Migration
-- This migration implements the foundational database schema for CODEMA's legislative compliance system
-- Phase 1 includes: Council member registry, meeting invitations, electronic minutes, and resolutions

-- =============================================================================
-- 1. CONSELHEIROS TABLE - Council Member Registry
-- =============================================================================
CREATE TABLE public.conselheiros (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    numero_registro TEXT NOT NULL UNIQUE, -- Unique council member registration number
    tipo_conselheiro TEXT NOT NULL CHECK (tipo_conselheiro IN ('titular', 'suplente')),
    categoria TEXT NOT NULL CHECK (categoria IN ('governo', 'sociedade_civil', 'setor_produtivo')),
    entidade_representada TEXT NOT NULL, -- Organization they represent
    especializacao TEXT[], -- Array of specialization areas
    mandato_inicio DATE NOT NULL,
    mandato_fim DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'licenciado', 'encerrado')),
    observacoes TEXT,
    documento_nomeacao_url TEXT, -- URL to appointment document
    data_posse DATE,
    -- LGPD compliance fields
    consentimento_dados BOOLEAN NOT NULL DEFAULT false,
    data_consentimento TIMESTAMP WITH TIME ZONE,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 2. CONVOCACOES TABLE - Meeting Invitations with Delivery Tracking
-- =============================================================================
CREATE TABLE public.convocacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
    conselheiro_id UUID NOT NULL REFERENCES public.conselheiros(id) ON DELETE CASCADE,
    tipo_convocacao TEXT NOT NULL CHECK (tipo_convocacao IN ('primeira_convocacao', 'segunda_convocacao')),
    meio_envio TEXT NOT NULL CHECK (meio_envio IN ('email', 'correio', 'whatsapp', 'presencial')),
    data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_confirmacao TIMESTAMP WITH TIME ZONE,
    status_entrega TEXT NOT NULL DEFAULT 'enviado' CHECK (status_entrega IN ('enviado', 'entregue', 'visualizado', 'confirmado', 'recusado', 'falhou')),
    justificativa_recusa TEXT,
    -- Delivery tracking
    tentativas_envio INTEGER NOT NULL DEFAULT 1,
    ultima_tentativa TIMESTAMP WITH TIME ZONE DEFAULT now(),
    hash_rastreamento TEXT UNIQUE, -- For tracking email opens/clicks
    ip_confirmacao INET, -- IP address of confirmation
    -- Legal compliance
    prazo_antecedencia_horas INTEGER NOT NULL DEFAULT 48, -- Minimum notice period in hours
    documento_convocacao_url TEXT, -- URL to formal invitation document
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    UNIQUE(reuniao_id, conselheiro_id, tipo_convocacao)
);

-- =============================================================================
-- 3. ATAS_ELETRONICAS TABLE - Electronic Minutes with Digital Signatures
-- =============================================================================
CREATE TABLE public.atas_eletronicas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
    numero_ata TEXT NOT NULL UNIQUE, -- Sequential numbering system
    -- Content fields
    conteudo_completo TEXT NOT NULL, -- Full meeting minutes content
    resumo_executivo TEXT, -- Executive summary
    decisoes_tomadas JSONB, -- Structured decisions with voting results
    pauta_discutida JSONB, -- Structured agenda items discussed
    proximos_passos JSONB, -- Action items and next steps
    -- Legal status and workflow
    status_ata TEXT NOT NULL DEFAULT 'rascunho' CHECK (status_ata IN ('rascunho', 'revisao', 'aprovada', 'publicada', 'retificada')),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_publicacao TIMESTAMP WITH TIME ZONE,
    -- Digital signature system
    hash_documento TEXT UNIQUE, -- Document hash for integrity verification
    assinatura_digital JSONB, -- Digital signature metadata
    certificado_digital TEXT, -- Digital certificate information
    timestamp_assinatura TIMESTAMP WITH TIME ZONE, -- RFC 3161 timestamp
    -- Version control
    versao INTEGER NOT NULL DEFAULT 1,
    ata_original_id UUID REFERENCES public.atas_eletronicas(id), -- For amendments/corrections
    motivo_retificacao TEXT,
    -- Legal compliance
    validade_juridica BOOLEAN NOT NULL DEFAULT false,
    data_validade_juridica TIMESTAMP WITH TIME ZONE,
    autoridade_validadora TEXT, -- Who validated legal validity
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 4. RESOLUCOES TABLE - Council Resolutions with Legal Tracking
-- =============================================================================
CREATE TABLE public.resolucoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reuniao_id UUID REFERENCES public.reunioes(id), -- May not be tied to a specific meeting
    ata_eletronica_id UUID REFERENCES public.atas_eletronicas(id), -- Link to meeting minutes
    -- Resolution identification
    numero_resolucao TEXT NOT NULL UNIQUE, -- Official resolution number (e.g., "001/2025")
    ano INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
    titulo TEXT NOT NULL,
    ementa TEXT NOT NULL, -- Brief summary/abstract
    conteudo_completo TEXT NOT NULL, -- Full resolution text
    -- Legal classification
    tipo_resolucao TEXT NOT NULL CHECK (tipo_resolucao IN ('normativa', 'administrativa', 'deliberativa', 'recomendacao')),
    categoria_juridica TEXT NOT NULL CHECK (categoria_juridica IN ('licenciamento', 'fiscalizacao', 'educacao_ambiental', 'recursos_hidricos', 'residuos_solidos', 'areas_verdes', 'outros')),
    fundamentacao_legal TEXT NOT NULL, -- Legal basis for the resolution
    -- Status and publication
    status_resolucao TEXT NOT NULL DEFAULT 'em_elaboracao' CHECK (status_resolucao IN ('em_elaboracao', 'em_votacao', 'aprovada', 'rejeitada', 'publicada', 'revogada', 'suspensa')),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_publicacao TIMESTAMP WITH TIME ZONE,
    data_vigencia_inicio DATE,
    data_vigencia_fim DATE, -- May be null for permanent resolutions
    -- Voting records
    votacao_resultado JSONB, -- Detailed voting results by councilor
    quorum_presente INTEGER,
    quorum_necessario INTEGER,
    votacao_tipo TEXT CHECK (votacao_tipo IN ('simbolica', 'nominal', 'secreta')),
    -- Publication and legal effects
    publicacao_oficial TEXT, -- Official publication reference
    numero_publicacao TEXT, -- Publication number in official gazette
    url_publicacao TEXT, -- URL to published resolution
    efeitos_juridicos TEXT, -- Legal effects description
    -- Amendment and revocation
    resolucao_alterada_id UUID REFERENCES public.resolucoes(id), -- If this amends another resolution
    resolucao_revogadora_id UUID REFERENCES public.resolucoes(id), -- If this revokes another resolution
    observacoes TEXT,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.conselheiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atas_eletronicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolucoes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Conselheiros indexes
CREATE INDEX idx_conselheiros_profile_id ON public.conselheiros(profile_id);
CREATE INDEX idx_conselheiros_numero_registro ON public.conselheiros(numero_registro);
CREATE INDEX idx_conselheiros_status ON public.conselheiros(status);
CREATE INDEX idx_conselheiros_mandato ON public.conselheiros(mandato_inicio, mandato_fim);
CREATE INDEX idx_conselheiros_categoria ON public.conselheiros(categoria);

-- Convocacoes indexes
CREATE INDEX idx_convocacoes_reuniao_id ON public.convocacoes(reuniao_id);
CREATE INDEX idx_convocacoes_conselheiro_id ON public.convocacoes(conselheiro_id);
CREATE INDEX idx_convocacoes_data_envio ON public.convocacoes(data_envio);
CREATE INDEX idx_convocacoes_status_entrega ON public.convocacoes(status_entrega);

-- Atas eletrônicas indexes
CREATE INDEX idx_atas_eletronicas_reuniao_id ON public.atas_eletronicas(reuniao_id);
CREATE INDEX idx_atas_eletronicas_numero_ata ON public.atas_eletronicas(numero_ata);
CREATE INDEX idx_atas_eletronicas_status ON public.atas_eletronicas(status_ata);
CREATE INDEX idx_atas_eletronicas_data_aprovacao ON public.atas_eletronicas(data_aprovacao);
CREATE INDEX idx_atas_eletronicas_data_publicacao ON public.atas_eletronicas(data_publicacao);

-- Resoluções indexes
CREATE INDEX idx_resolucoes_numero_resolucao ON public.resolucoes(numero_resolucao);
CREATE INDEX idx_resolucoes_ano ON public.resolucoes(ano);
CREATE INDEX idx_resolucoes_status ON public.resolucoes(status_resolucao);
CREATE INDEX idx_resolucoes_tipo ON public.resolucoes(tipo_resolucao);
CREATE INDEX idx_resolucoes_categoria ON public.resolucoes(categoria_juridica);
CREATE INDEX idx_resolucoes_data_aprovacao ON public.resolucoes(data_aprovacao);
CREATE INDEX idx_resolucoes_data_publicacao ON public.resolucoes(data_publicacao);
CREATE INDEX idx_resolucoes_vigencia ON public.resolucoes(data_vigencia_inicio, data_vigencia_fim);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- CONSELHEIROS POLICIES
CREATE POLICY "Conselheiros podem ver informações básicas de todos os conselheiros"
ON public.conselheiros FOR SELECT
USING (
    -- Public basic information access
    TRUE
);

CREATE POLICY "Conselheiros podem atualizar seus próprios dados"
ON public.conselheiros FOR UPDATE
USING (
    profile_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas secretários podem inserir novos conselheiros"
ON public.conselheiros FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- CONVOCACOES POLICIES
CREATE POLICY "Conselheiros podem ver suas próprias convocações"
ON public.convocacoes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conselheiros 
        WHERE id = convocacoes.conselheiro_id AND profile_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas secretários podem gerenciar convocações"
ON public.convocacoes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- ATAS ELETRÔNICAS POLICIES
CREATE POLICY "Todos podem ver atas publicadas"
ON public.atas_eletronicas FOR SELECT
USING (
    status_ata = 'publicada' OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
    )
);

CREATE POLICY "Apenas secretários podem gerenciar atas eletrônicas"
ON public.atas_eletronicas FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- RESOLUÇÕES POLICIES
CREATE POLICY "Todos podem ver resoluções publicadas"
ON public.resolucoes FOR SELECT
USING (
    status_resolucao = 'publicada' OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
    )
);

CREATE POLICY "Apenas secretários podem gerenciar resoluções"
ON public.resolucoes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE TRIGGER update_conselheiros_updated_at
    BEFORE UPDATE ON public.conselheiros
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_convocacoes_updated_at
    BEFORE UPDATE ON public.convocacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atas_eletronicas_updated_at
    BEFORE UPDATE ON public.atas_eletronicas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resolucoes_updated_at
    BEFORE UPDATE ON public.resolucoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to generate next resolution number
CREATE OR REPLACE FUNCTION public.generate_resolution_number(resolution_year INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    target_year INTEGER;
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    target_year := COALESCE(resolution_year, EXTRACT(YEAR FROM now()));
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_resolucao FROM '^(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.resolucoes
    WHERE ano = target_year;
    
    formatted_number := LPAD(next_number::TEXT, 3, '0') || '/' || target_year::TEXT;
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate councilor term
CREATE OR REPLACE FUNCTION public.validate_councilor_term()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure term end is after term start
    IF NEW.mandato_fim <= NEW.mandato_inicio THEN
        RAISE EXCEPTION 'Term end date must be after term start date';
    END IF;
    
    -- Set status based on term dates
    IF NEW.mandato_fim < CURRENT_DATE THEN
        NEW.status := 'encerrado';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_conselheiros_term
    BEFORE INSERT OR UPDATE ON public.conselheiros
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_councilor_term();

-- =============================================================================
-- LGPD COMPLIANCE FUNCTIONS
-- =============================================================================

-- Function to anonymize councilor data (LGPD compliance)
CREATE OR REPLACE FUNCTION public.anonymize_councilor_data(councilor_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.conselheiros
    SET 
        observacoes = '[DADOS ANONIMIZADOS - LGPD]',
        documento_nomeacao_url = NULL,
        updated_at = now(),
        updated_by = auth.uid()
    WHERE id = councilor_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE public.conselheiros IS 'Registry of council members with mandate tracking, specializations, and LGPD compliance';
COMMENT ON TABLE public.convocacoes IS 'Meeting invitations with delivery tracking, confirmations, and notification history';
COMMENT ON TABLE public.atas_eletronicas IS 'Electronic meeting minutes with digital signatures, approval workflow, and legal validity';
COMMENT ON TABLE public.resolucoes IS 'Council resolutions with numbering system, legal tracking, publication status, and voting records';

-- Key column comments
COMMENT ON COLUMN public.conselheiros.numero_registro IS 'Unique council member registration number for official identification';
COMMENT ON COLUMN public.conselheiros.consentimento_dados IS 'LGPD data processing consent flag';
COMMENT ON COLUMN public.convocacoes.hash_rastreamento IS 'Unique hash for tracking email delivery and opens';
COMMENT ON COLUMN public.atas_eletronicas.hash_documento IS 'SHA-256 hash for document integrity verification';
COMMENT ON COLUMN public.atas_eletronicas.validade_juridica IS 'Legal validity flag for electronic signatures compliance';
COMMENT ON COLUMN public.resolucoes.numero_resolucao IS 'Official resolution number following format: 001/2025';
COMMENT ON COLUMN public.resolucoes.votacao_resultado IS 'JSON object containing detailed voting results by councilor';