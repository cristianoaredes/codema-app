-- CODEMA-Itanhomi Phase 3: Advanced Features Modules Migration
-- This migration implements the advanced features database schema for CODEMA's comprehensive system
-- Phase 3 includes: Document library, transparency portal, ombudsman system, performance indicators, conflict tracking, and audit logs

-- =============================================================================
-- 1. BIBLIOTECA_CATEGORIAS TABLE - Document Library with Hierarchical Categorization
-- =============================================================================
CREATE TABLE public.biblioteca_categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Hierarchical structure
    categoria_pai_id UUID REFERENCES public.biblioteca_categorias(id), -- Parent category for hierarchy
    nome TEXT NOT NULL,
    descricao TEXT,
    codigo_categoria TEXT NOT NULL UNIQUE, -- Hierarchical code (e.g., "01.02.03")
    nivel_hierarquia INTEGER NOT NULL DEFAULT 1, -- Depth level in hierarchy
    caminho_completo TEXT, -- Full path from root (automatically generated)
    ordem_exibicao INTEGER NOT NULL DEFAULT 0, -- Display order within parent
    -- Metadata and classification
    tipo_documento TEXT[] NOT NULL DEFAULT ARRAY['todos'], -- Document types allowed in this category
    tags_permitidas TEXT[], -- Allowed tags for documents in this category
    palavras_chave TEXT[], -- Keywords for search optimization
    -- Access control and visibility
    visibilidade TEXT NOT NULL DEFAULT 'publica' CHECK (visibilidade IN ('publica', 'interna', 'restrita', 'confidencial')),
    requer_autenticacao BOOLEAN NOT NULL DEFAULT false,
    roles_acesso TEXT[] DEFAULT ARRAY['citizen'], -- Roles that can access this category
    -- Content management
    permitir_upload BOOLEAN NOT NULL DEFAULT true,
    tipos_arquivo_permitidos TEXT[] DEFAULT ARRAY['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png'],
    tamanho_maximo_mb INTEGER DEFAULT 50,
    requer_aprovacao BOOLEAN NOT NULL DEFAULT false, -- Documents need approval before publishing
    -- Legal and compliance
    periodo_retencao_anos INTEGER, -- Document retention period
    classificacao_legal TEXT CHECK (classificacao_legal IN ('publico', 'restrito', 'confidencial', 'ultrassecreto')),
    base_legal_restricao TEXT, -- Legal basis for access restrictions
    -- Statistics and usage
    total_documentos INTEGER NOT NULL DEFAULT 0,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE,
    -- Status management
    ativa BOOLEAN NOT NULL DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_inativacao TIMESTAMP WITH TIME ZONE,
    motivo_inativacao TEXT,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 2. TRANSPARENCIA_DADOS TABLE - Transparency Portal Data with Automated Publishing
-- =============================================================================
CREATE TABLE public.transparencia_dados (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Data identification and classification
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria_transparencia TEXT NOT NULL CHECK (categoria_transparencia IN ('receitas', 'despesas', 'contratos', 'licitacoes', 'servidores', 'obras', 'convenios', 'subsidios', 'transferencias', 'outros')),
    subcategoria TEXT,
    -- Data source and content
    fonte_dados TEXT NOT NULL, -- Data source system/table
    query_sql TEXT, -- SQL query for automated data extraction
    dados_json JSONB, -- Structured data content
    arquivo_dados_url TEXT, -- URL to data file (CSV, Excel, etc.)
    formato_dados TEXT CHECK (formato_dados IN ('json', 'csv', 'xlsx', 'pdf', 'xml')),
    -- Publication and scheduling
    status_publicacao TEXT NOT NULL DEFAULT 'rascunho' CHECK (status_publicacao IN ('rascunho', 'pendente_aprovacao', 'aprovado', 'publicado', 'despublicado', 'arquivado')),
    data_publicacao TIMESTAMP WITH TIME ZONE,
    data_ultima_atualizacao TIMESTAMP WITH TIME ZONE,
    frequencia_atualizacao TEXT CHECK (frequencia_atualizacao IN ('diaria', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual', 'sob_demanda')),
    proxima_atualizacao TIMESTAMP WITH TIME ZONE,
    -- Legal compliance and requirements
    lei_base TEXT NOT NULL DEFAULT 'Lei 12.527/2011 - LAI', -- Legal basis for transparency
    prazo_atualizacao_dias INTEGER NOT NULL DEFAULT 30,
    obrigatorio BOOLEAN NOT NULL DEFAULT true, -- Required by law
    nivel_detalhamento TEXT CHECK (nivel_detalhamento IN ('minimo', 'basico', 'detalhado', 'completo')),
    -- Access and downloads
    publico_alvo TEXT[] DEFAULT ARRAY['cidadao'], -- Target audience
    total_visualizacoes INTEGER NOT NULL DEFAULT 0,
    total_downloads INTEGER NOT NULL DEFAULT 0,
    ultima_visualizacao TIMESTAMP WITH TIME ZONE,
    ultimo_download TIMESTAMP WITH TIME ZONE,
    -- Data quality and validation
    hash_dados TEXT, -- Hash for data integrity verification
    validado BOOLEAN NOT NULL DEFAULT false,
    data_validacao TIMESTAMP WITH TIME ZONE,
    validado_por_id UUID REFERENCES public.profiles(id),
    inconsistencias_detectadas TEXT[],
    -- Metadata and search
    palavras_chave TEXT[],
    tags TEXT[],
    periodo_inicio DATE, -- Period covered by the data
    periodo_fim DATE,
    exercicio_fiscal INTEGER DEFAULT EXTRACT(YEAR FROM now()),
    -- Automation settings
    atualizacao_automatica BOOLEAN NOT NULL DEFAULT false,
    script_atualizacao TEXT, -- Script for automated updates
    ultima_execucao_automatica TIMESTAMP WITH TIME ZONE,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 3. OUVIDORIA_MANIFESTACOES TABLE - Ombudsman System with Complaint Tracking
-- =============================================================================
CREATE TABLE public.ouvidoria_manifestacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Protocol and identification
    numero_protocolo TEXT NOT NULL UNIQUE, -- Sequential protocol number
    numero_sic TEXT, -- SIC (Information Access Service) number if applicable
    -- Manifestation details
    tipo_manifestacao TEXT NOT NULL CHECK (tipo_manifestacao IN ('denencia', 'reclamacao', 'sugestao', 'elogio', 'solicitacao_informacao', 'recurso')),
    assunto TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria_assunto TEXT CHECK (categoria_assunto IN ('meio_ambiente', 'licenciamento', 'fiscalizacao', 'transparencia', 'atendimento', 'funcionarios', 'servicos', 'outros')),
    -- Complainant information (may be anonymous)
    manifestante_nome TEXT,
    manifestante_email TEXT,
    manifestante_telefone TEXT,
    manifestante_endereco TEXT,
    manifestante_cpf TEXT,
    anonima BOOLEAN NOT NULL DEFAULT false,
    -- LGPD consent for personal data
    consentimento_dados BOOLEAN NOT NULL DEFAULT false,
    finalidade_dados TEXT DEFAULT 'Processamento da manifestação e resposta',
    -- Geographic and administrative data
    municipio_fato TEXT DEFAULT 'Itanhomi',
    bairro_fato TEXT,
    endereco_fato TEXT,
    orgao_responsavel TEXT DEFAULT 'CODEMA',
    setor_responsavel TEXT,
    -- Processing and workflow
    status_manifestacao TEXT NOT NULL DEFAULT 'recebida' CHECK (status_manifestacao IN ('recebida', 'em_analise', 'encaminhada', 'em_apuracao', 'aguardando_informacoes', 'respondida', 'arquivada', 'improcedente')),
    prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    responsavel_analise_id UUID REFERENCES public.profiles(id),
    data_atribuicao TIMESTAMP WITH TIME ZONE,
    -- Deadlines and timelines
    prazo_resposta_dias INTEGER NOT NULL DEFAULT 20, -- Default 20 days for response
    data_limite_resposta DATE,
    dias_para_vencimento INTEGER GENERATED ALWAYS AS (EXTRACT(DAY FROM data_limite_resposta - CURRENT_DATE)) STORED,
    -- Response and resolution
    resposta_oficial TEXT,
    medidas_adotadas TEXT,
    data_resposta TIMESTAMP WITH TIME ZONE,
    respondido_por_id UUID REFERENCES public.profiles(id),
    canal_resposta TEXT CHECK (canal_resposta IN ('email', 'telefone', 'correio', 'presencial', 'sistema')),
    -- Related processes and documents
    processo_relacionado_id UUID REFERENCES public.processos(id),
    documentos_anexos JSONB, -- Attached documents
    evidencias TEXT[], -- Evidence or supporting documents
    -- Satisfaction and follow-up
    satisfacao_manifestante INTEGER CHECK (satisfacao_manifestante >= 1 AND satisfacao_manifestante <= 5),
    comentario_satisfacao TEXT,
    data_avaliacao_satisfacao TIMESTAMP WITH TIME ZONE,
    permite_contato_posterior BOOLEAN NOT NULL DEFAULT true,
    -- Legal and compliance tracking
    recurso_apresentado BOOLEAN NOT NULL DEFAULT false,
    data_recurso TIMESTAMP WITH TIME ZONE,
    instancia_recurso TEXT,
    resultado_recurso TEXT,
    -- Internal analysis
    procedencia TEXT CHECK (procedencia IN ('procedente', 'parcialmente_procedente', 'improcedente', 'em_analise')),
    providencias_internas TEXT,
    recomendacoes TEXT,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 4. INDICADORES_METRICAS TABLE - Performance Indicators and KPI Monitoring
-- =============================================================================
CREATE TABLE public.indicadores_metricas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Indicator identification
    nome_indicador TEXT NOT NULL,
    codigo_indicador TEXT NOT NULL UNIQUE, -- Unique code for the indicator
    descricao TEXT NOT NULL,
    categoria_indicador TEXT NOT NULL CHECK (categoria_indicador IN ('eficiencia', 'eficacia', 'qualidade', 'transparencia', 'sustentabilidade', 'inovacao', 'satisfacao')),
    area_responsavel TEXT NOT NULL CHECK (area_responsavel IN ('licenciamento', 'fiscalizacao', 'educacao_ambiental', 'gestao_fundos', 'transparencia', 'ouvidoria', 'geral')),
    -- Measurement configuration
    unidade_medida TEXT NOT NULL, -- Unit of measurement (%, days, number, etc.)
    tipo_calculo TEXT NOT NULL CHECK (tipo_calculo IN ('percentual', 'soma', 'media', 'contagem', 'razao', 'tempo_medio')),
    formula_calculo TEXT, -- Formula for calculating the indicator
    fonte_dados TEXT NOT NULL, -- Data source for calculation
    query_calculo TEXT, -- SQL query for automated calculation
    -- Value tracking
    valor_atual DECIMAL(15,4),
    valor_anterior DECIMAL(15,4),
    valor_meta DECIMAL(15,4), -- Target value
    valor_minimo DECIMAL(15,4), -- Minimum acceptable value
    valor_maximo DECIMAL(15,4), -- Maximum value (if applicable)
    -- Trend analysis
    tendencia TEXT CHECK (tendencia IN ('crescente', 'decrescente', 'estavel', 'volatil')),
    percentual_variacao DECIMAL(8,4), -- Percentage change from previous period
    atingiu_meta BOOLEAN,
    desvio_meta DECIMAL(15,4), -- Deviation from target
    -- Time periods
    periodo_referencia TEXT NOT NULL CHECK (periodo_referencia IN ('diario', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual')),
    data_referencia DATE NOT NULL,
    exercicio INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
    -- Status and automation
    status_indicador TEXT NOT NULL DEFAULT 'ativo' CHECK (status_indicador IN ('ativo', 'inativo', 'em_revisao', 'descontinuado')),
    calculo_automatico BOOLEAN NOT NULL DEFAULT false,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE,
    proxima_atualizacao TIMESTAMP WITH TIME ZONE,
    -- Performance classification
    classificacao_desempenho TEXT CHECK (classificacao_desempenho IN ('excelente', 'bom', 'regular', 'ruim', 'critico')),
    cor_semaforo TEXT CHECK (cor_semaforo IN ('verde', 'amarelo', 'vermelho')),
    -- Strategic alignment
    objetivo_estrategico TEXT,
    plano_origem TEXT, -- Origin plan (PPA, PDE, etc.)
    ods_relacionado TEXT[], -- Related Sustainable Development Goals
    -- Responsible parties
    responsavel_coleta_id UUID REFERENCES public.profiles(id),
    responsavel_analise_id UUID REFERENCES public.profiles(id),
    -- Visibility and reporting
    publico BOOLEAN NOT NULL DEFAULT false, -- Visible in transparency portal
    incluir_relatorio_mensal BOOLEAN NOT NULL DEFAULT false,
    incluir_dashboard BOOLEAN NOT NULL DEFAULT true,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 5. IMPEDIMENTOS TABLE - Conflict of Interest Tracking and Compliance Monitoring
-- =============================================================================
CREATE TABLE public.impedimentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Subject of impediment
    conselheiro_id UUID NOT NULL REFERENCES public.conselheiros(id) ON DELETE CASCADE,
    perfil_afetado_id UUID REFERENCES public.profiles(id), -- Additional affected profile if different
    -- Impediment details
    tipo_impedimento TEXT NOT NULL CHECK (tipo_impedimento IN ('conflito_interesse', 'parentesco', 'relacao_comercial', 'relacao_trabalhista', 'impedimento_legal', 'suspeicao', 'outros')),
    natureza_impedimento TEXT NOT NULL CHECK (natureza_impedimento IN ('direto', 'indireto', 'potencial', 'aparente')),
    descricao TEXT NOT NULL,
    base_legal TEXT NOT NULL, -- Legal basis for the impediment
    -- Related entities and context
    processo_relacionado_id UUID REFERENCES public.processos(id),
    reuniao_relacionada_id UUID REFERENCES public.reunioes(id),
    resolucao_relacionada_id UUID REFERENCES public.resolucoes(id),
    entidade_conflito TEXT, -- Entity causing the conflict
    relacao_detalhada TEXT, -- Detailed description of the relationship
    -- Financial interests
    interesse_financeiro BOOLEAN NOT NULL DEFAULT false,
    valor_estimado DECIMAL(12,2), -- Estimated financial value involved
    participacao_societaria BOOLEAN NOT NULL DEFAULT false,
    percentual_participacao DECIMAL(5,2), -- Percentage of participation
    -- Timeline and duration
    data_inicio_impedimento DATE NOT NULL,
    data_fim_impedimento DATE,
    permanente BOOLEAN NOT NULL DEFAULT false,
    -- Disclosure and transparency
    auto_declarado BOOLEAN NOT NULL DEFAULT false, -- Self-declared by the councilor
    data_declaracao TIMESTAMP WITH TIME ZONE,
    identificado_por_terceiro BOOLEAN NOT NULL DEFAULT false,
    identificado_por_id UUID REFERENCES public.profiles(id),
    -- Status and processing
    status_impedimento TEXT NOT NULL DEFAULT 'declarado' CHECK (status_impedimento IN ('declarado', 'em_analise', 'confirmado', 'rejeitado', 'suspenso', 'resolvido')),
    analisado_por_id UUID REFERENCES public.profiles(id),
    data_analise TIMESTAMP WITH TIME ZONE,
    parecer_juridico TEXT,
    -- Actions taken
    medidas_adotadas TEXT,
    afastamento_necessario BOOLEAN NOT NULL DEFAULT false,
    afastamento_efetivado BOOLEAN NOT NULL DEFAULT false,
    data_afastamento TIMESTAMP WITH TIME ZONE,
    substituicao_necessaria BOOLEAN NOT NULL DEFAULT false,
    substituto_designado_id UUID REFERENCES public.conselheiros(id),
    -- Legal proceedings
    processo_administrativo TEXT, -- Administrative process number
    processo_judicial TEXT, -- Judicial process if applicable
    decisao_final TEXT,
    data_decisao_final TIMESTAMP WITH TIME ZONE,
    -- Monitoring and follow-up
    requer_monitoramento BOOLEAN NOT NULL DEFAULT true,
    periodicidade_revisao TEXT CHECK (periodicidade_revisao IN ('mensal', 'trimestral', 'semestral', 'anual')),
    proxima_revisao DATE,
    -- Documentation
    documentos_comprobatorios JSONB, -- Supporting documents
    declaracao_interesses_url TEXT, -- URL to interests declaration
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 6. AUDIT_LOGS TABLE - Comprehensive Audit Trail with LGPD Compliance
-- =============================================================================
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Event identification
    evento_id UUID NOT NULL DEFAULT gen_random_uuid(), -- Unique event identifier
    timestamp_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approval', 'rejection', 'system')),
    categoria_evento TEXT NOT NULL CHECK (categoria_evento IN ('autenticacao', 'dados_pessoais', 'processos', 'financeiro', 'documentos', 'configuracao', 'relatorios', 'sistema')),
    -- User and session information
    usuario_id UUID REFERENCES public.profiles(id), -- May be null for system events
    usuario_email TEXT,
    usuario_role TEXT,
    sessao_id TEXT, -- Session identifier
    ip_address INET,
    user_agent TEXT,
    dispositivo TEXT, -- Device information
    -- Action details
    acao_realizada TEXT NOT NULL, -- Description of action performed
    tabela_afetada TEXT, -- Database table affected
    registro_id UUID, -- ID of the affected record
    campos_alterados JSONB, -- Changed fields with before/after values
    valores_anteriores JSONB, -- Previous values
    valores_novos JSONB, -- New values
    -- Context and metadata
    contexto_aplicacao TEXT, -- Application context (web, mobile, api)
    modulo_sistema TEXT, -- System module where action occurred
    funcionalidade TEXT, -- Specific functionality used
    url_requisicao TEXT, -- Request URL
    metodo_http TEXT, -- HTTP method (GET, POST, etc.)
    -- Business context
    processo_negocio TEXT, -- Business process context
    justificativa TEXT, -- Justification for the action
    aprovacao_necessaria BOOLEAN NOT NULL DEFAULT false,
    aprovado_por_id UUID REFERENCES public.profiles(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    -- LGPD compliance tracking
    categoria_dados_lgpd TEXT CHECK (categoria_dados_lgpd IN ('dados_pessoais', 'dados_sensiveis', 'dados_publicos', 'dados_anonimos')),
    base_legal_lgpd TEXT, -- Legal basis for data processing
    finalidade_tratamento TEXT, -- Purpose of data processing
    consentimento_necessario BOOLEAN NOT NULL DEFAULT false,
    consentimento_obtido BOOLEAN,
    prazo_retencao_dias INTEGER, -- Data retention period
    -- Error and exception handling
    sucesso BOOLEAN NOT NULL DEFAULT true,
    codigo_erro TEXT, -- Error code if action failed
    mensagem_erro TEXT, -- Error message
    stack_trace TEXT, -- Technical error details
    -- Performance monitoring
    tempo_execucao_ms INTEGER, -- Execution time in milliseconds
    tamanho_resposta_bytes INTEGER, -- Response size
    -- Risk and security
    nivel_risco TEXT CHECK (nivel_risco IN ('baixo', 'medio', 'alto', 'critico')),
    evento_suspeito BOOLEAN NOT NULL DEFAULT false,
    motivo_suspeita TEXT,
    investigacao_necessaria BOOLEAN NOT NULL DEFAULT false,
    -- Data classification
    sensibilidade_dados TEXT CHECK (sensibilidade_dados IN ('publico', 'interno', 'confidencial', 'restrito')),
    impacto_seguranca TEXT CHECK (impacto_seguranca IN ('nenhum', 'baixo', 'medio', 'alto')),
    -- Retention and archival
    data_expiracao TIMESTAMP WITH TIME ZONE, -- When this log expires
    arquivado BOOLEAN NOT NULL DEFAULT false,
    data_arquivamento TIMESTAMP WITH TIME ZONE,
    hash_integridade TEXT, -- Hash for log integrity verification
    -- Additional metadata
    tags TEXT[], -- Tags for categorization and search
    metadados_extras JSONB -- Additional metadata
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.biblioteca_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparencia_dados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ouvidoria_manifestacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Biblioteca categorias indexes
CREATE INDEX idx_biblioteca_categorias_pai ON public.biblioteca_categorias(categoria_pai_id);
CREATE INDEX idx_biblioteca_categorias_codigo ON public.biblioteca_categorias(codigo_categoria);
CREATE INDEX idx_biblioteca_categorias_nivel ON public.biblioteca_categorias(nivel_hierarquia);
CREATE INDEX idx_biblioteca_categorias_visibilidade ON public.biblioteca_categorias(visibilidade);
CREATE INDEX idx_biblioteca_categorias_ativa ON public.biblioteca_categorias(ativa);

-- Transparencia dados indexes
CREATE INDEX idx_transparencia_dados_categoria ON public.transparencia_dados(categoria_transparencia);
CREATE INDEX idx_transparencia_dados_status ON public.transparencia_dados(status_publicacao);
CREATE INDEX idx_transparencia_dados_publicacao ON public.transparencia_dados(data_publicacao);
CREATE INDEX idx_transparencia_dados_atualizacao ON public.transparencia_dados(data_ultima_atualizacao);
CREATE INDEX idx_transparencia_dados_exercicio ON public.transparencia_dados(exercicio_fiscal);

-- Ouvidoria manifestacoes indexes
CREATE INDEX idx_ouvidoria_manifestacoes_protocolo ON public.ouvidoria_manifestacoes(numero_protocolo);
CREATE INDEX idx_ouvidoria_manifestacoes_tipo ON public.ouvidoria_manifestacoes(tipo_manifestacao);
CREATE INDEX idx_ouvidoria_manifestacoes_status ON public.ouvidoria_manifestacoes(status_manifestacao);
CREATE INDEX idx_ouvidoria_manifestacoes_responsavel ON public.ouvidoria_manifestacoes(responsavel_analise_id);
CREATE INDEX idx_ouvidoria_manifestacoes_data_limite ON public.ouvidoria_manifestacoes(data_limite_resposta);
CREATE INDEX idx_ouvidoria_manifestacoes_categoria ON public.ouvidoria_manifestacoes(categoria_assunto);

-- Indicadores metricas indexes
CREATE INDEX idx_indicadores_metricas_codigo ON public.indicadores_metricas(codigo_indicador);
CREATE INDEX idx_indicadores_metricas_categoria ON public.indicadores_metricas(categoria_indicador);
CREATE INDEX idx_indicadores_metricas_area ON public.indicadores_metricas(area_responsavel);
CREATE INDEX idx_indicadores_metricas_periodo ON public.indicadores_metricas(periodo_referencia, data_referencia);
CREATE INDEX idx_indicadores_metricas_status ON public.indicadores_metricas(status_indicador);
CREATE INDEX idx_indicadores_metricas_exercicio ON public.indicadores_metricas(exercicio);

-- Impedimentos indexes
CREATE INDEX idx_impedimentos_conselheiro ON public.impedimentos(conselheiro_id);
CREATE INDEX idx_impedimentos_tipo ON public.impedimentos(tipo_impedimento);
CREATE INDEX idx_impedimentos_status ON public.impedimentos(status_impedimento);
CREATE INDEX idx_impedimentos_processo ON public.impedimentos(processo_relacionado_id);
CREATE INDEX idx_impedimentos_reuniao ON public.impedimentos(reuniao_relacionada_id);
CREATE INDEX idx_impedimentos_data_inicio ON public.impedimentos(data_inicio_impedimento);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp_evento);
CREATE INDEX idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_tipo_evento ON public.audit_logs(tipo_evento);
CREATE INDEX idx_audit_logs_categoria ON public.audit_logs(categoria_evento);
CREATE INDEX idx_audit_logs_tabela ON public.audit_logs(tabela_afetada);
CREATE INDEX idx_audit_logs_registro ON public.audit_logs(registro_id);
CREATE INDEX idx_audit_logs_ip ON public.audit_logs(ip_address);
CREATE INDEX idx_audit_logs_sessao ON public.audit_logs(sessao_id);
CREATE INDEX idx_audit_logs_lgpd ON public.audit_logs(categoria_dados_lgpd);
CREATE INDEX idx_audit_logs_expiracao ON public.audit_logs(data_expiracao);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- BIBLIOTECA CATEGORIAS POLICIES
CREATE POLICY "Todos podem ver categorias públicas ativas"
ON public.biblioteca_categorias FOR SELECT
USING (
    ativa = true AND (
        visibilidade = 'publica' OR
        (visibilidade = 'interna' AND auth.uid() IS NOT NULL) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
        )
    )
);

CREATE POLICY "Apenas administradores podem gerenciar categorias"
ON public.biblioteca_categorias FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario')
    )
);

-- TRANSPARENCIA DADOS POLICIES
CREATE POLICY "Todos podem ver dados de transparência publicados"
ON public.transparencia_dados FOR SELECT
USING (
    status_publicacao = 'publicado' OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas administradores podem gerenciar dados de transparência"
ON public.transparencia_dados FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario')
    )
);

-- OUVIDORIA MANIFESTACOES POLICIES
CREATE POLICY "Usuários podem ver suas próprias manifestações"
ON public.ouvidoria_manifestacoes FOR SELECT
USING (
    created_by = auth.uid() OR
    responsavel_analise_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Qualquer pessoa pode criar manifestações"
ON public.ouvidoria_manifestacoes FOR INSERT
WITH CHECK (true); -- Anonymous submissions allowed

CREATE POLICY "Apenas responsáveis podem atualizar manifestações"
ON public.ouvidoria_manifestacoes FOR UPDATE
USING (
    responsavel_analise_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- INDICADORES METRICAS POLICIES
CREATE POLICY "Todos podem ver indicadores públicos"
ON public.indicadores_metricas FOR SELECT
USING (
    publico = true OR
    responsavel_coleta_id = auth.uid() OR
    responsavel_analise_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular')
    )
);

CREATE POLICY "Apenas responsáveis podem gerenciar indicadores"
ON public.indicadores_metricas FOR ALL
USING (
    responsavel_coleta_id = auth.uid() OR
    responsavel_analise_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario')
    )
);

-- IMPEDIMENTOS POLICIES
CREATE POLICY "Conselheiros podem ver impedimentos relacionados a eles"
ON public.impedimentos FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conselheiros c 
        WHERE c.id = impedimentos.conselheiro_id AND c.profile_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas administradores podem gerenciar impedimentos"
ON public.impedimentos FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- AUDIT LOGS POLICIES
CREATE POLICY "Apenas administradores podem ver logs de auditoria"
ON public.audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Sistema pode inserir logs de auditoria"
ON public.audit_logs FOR INSERT
WITH CHECK (true); -- System can always insert audit logs

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE TRIGGER update_biblioteca_categorias_updated_at
    BEFORE UPDATE ON public.biblioteca_categorias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transparencia_dados_updated_at
    BEFORE UPDATE ON public.transparencia_dados
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ouvidoria_manifestacoes_updated_at
    BEFORE UPDATE ON public.ouvidoria_manifestacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicadores_metricas_updated_at
    BEFORE UPDATE ON public.indicadores_metricas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_impedimentos_updated_at
    BEFORE UPDATE ON public.impedimentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to generate next manifestation protocol number
CREATE OR REPLACE FUNCTION public.generate_manifestation_protocol(manifestation_year INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    target_year INTEGER;
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    target_year := COALESCE(manifestation_year, EXTRACT(YEAR FROM now()));
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_protocolo FROM '(\d+)$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.ouvidoria_manifestacoes
    WHERE EXTRACT(YEAR FROM created_at) = target_year;
    
    formatted_number := target_year::TEXT || LPAD(next_number::TEXT, 6, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update category hierarchy path
CREATE OR REPLACE FUNCTION public.update_category_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
BEGIN
    IF NEW.categoria_pai_id IS NULL THEN
        NEW.caminho_completo := NEW.nome;
        NEW.nivel_hierarquia := 1;
    ELSE
        SELECT caminho_completo, nivel_hierarquia + 1 
        INTO parent_path, NEW.nivel_hierarquia
        FROM public.biblioteca_categorias 
        WHERE id = NEW.categoria_pai_id;
        
        NEW.caminho_completo := parent_path || ' > ' || NEW.nome;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_path_trigger
    BEFORE INSERT OR UPDATE ON public.biblioteca_categorias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_category_path();

-- Function to set manifestation response deadline
CREATE OR REPLACE FUNCTION public.set_manifestation_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- Set response deadline based on manifestation type
    IF NEW.tipo_manifestacao = 'solicitacao_informacao' THEN
        NEW.prazo_resposta_dias := 20; -- LAI requirement
    ELSIF NEW.tipo_manifestacao = 'recurso' THEN
        NEW.prazo_resposta_dias := 10; -- Shorter deadline for appeals
    ELSE
        NEW.prazo_resposta_dias := 30; -- Default for other types
    END IF;
    
    NEW.data_limite_resposta := (NEW.created_at::date + (NEW.prazo_resposta_dias || ' days')::interval)::date;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_manifestation_deadline_trigger
    BEFORE INSERT ON public.ouvidoria_manifestacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_manifestation_deadline();

-- =============================================================================
-- AUDIT TRIGGER FUNCTION
-- =============================================================================

-- Function to create audit logs automatically
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        tipo_evento,
        categoria_evento,
        usuario_id,
        acao_realizada,
        tabela_afetada,
        registro_id,
        campos_alterados,
        valores_anteriores,
        valores_novos
    ) VALUES (
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        'dados_pessoais', -- Default category, can be customized per table
        auth.uid(),
        TG_OP || ' on ' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) - to_jsonb(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW)
            ELSE NULL
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE public.biblioteca_categorias IS 'Document library with hierarchical categorization and metadata management';
COMMENT ON TABLE public.transparencia_dados IS 'Transparency portal data with automated publishing and compliance tracking';
COMMENT ON TABLE public.ouvidoria_manifestacoes IS 'Ombudsman system with complaint tracking, responses, and satisfaction surveys';
COMMENT ON TABLE public.indicadores_metricas IS 'Performance indicators, KPI monitoring, and dashboard data';
COMMENT ON TABLE public.impedimentos IS 'Conflict of interest tracking, disclosure requirements, and compliance monitoring';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all system actions with LGPD compliance';

-- Key column comments
COMMENT ON COLUMN public.biblioteca_categorias.caminho_completo IS 'Automatically generated full hierarchical path from root';
COMMENT ON COLUMN public.transparencia_dados.hash_dados IS 'SHA-256 hash for data integrity verification and change detection';
COMMENT ON COLUMN public.ouvidoria_manifestacoes.numero_protocolo IS 'Sequential protocol number for manifestation tracking';
COMMENT ON COLUMN public.indicadores_metricas.valor_atual IS 'Current calculated value of the performance indicator';
COMMENT ON COLUMN public.impedimentos.auto_declarado IS 'Flag indicating if impediment was self-declared by councilor';
COMMENT ON COLUMN public.audit_logs.categoria_dados_lgpd IS 'LGPD data category classification for compliance tracking';