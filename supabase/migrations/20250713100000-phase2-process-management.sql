-- CODEMA-Itanhomi Phase 2: Process Management Modules Migration
-- This migration implements the process management database schema for CODEMA's workflow system
-- Phase 2 includes: Environmental processes, process routing, fund management, and financial transactions

-- =============================================================================
-- 1. PROCESSOS TABLE - Environmental Process Workflow
-- =============================================================================
CREATE TABLE public.processos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_processo TEXT NOT NULL UNIQUE, -- Official process number (e.g., "2025.001.123")
    ano INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
    -- Process identification
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo_processo TEXT NOT NULL CHECK (tipo_processo IN ('licenciamento_ambiental', 'fiscalizacao', 'autuacao', 'recurso', 'compensacao_ambiental', 'educacao_ambiental', 'outros')),
    categoria TEXT NOT NULL CHECK (categoria IN ('licenca_previa', 'licenca_instalacao', 'licenca_operacao', 'autorizacao_ambiental', 'outorga_agua', 'supressao_vegetacao', 'outros')),
    -- Stakeholders
    requerente_id UUID REFERENCES public.profiles(id), -- May be null for internal processes
    requerente_nome TEXT NOT NULL, -- Name even if not a system user
    requerente_documento TEXT NOT NULL, -- CPF/CNPJ
    requerente_contato JSONB, -- Contact information (email, phone, address)
    responsavel_atual_id UUID NOT NULL REFERENCES public.profiles(id), -- Current responsible technician
    -- Process status and timeline
    status_processo TEXT NOT NULL DEFAULT 'protocolado' CHECK (status_processo IN ('protocolado', 'em_analise', 'pendente_documentacao', 'em_vistoria', 'parecer_tecnico', 'aguardando_decisao', 'deferido', 'indeferido', 'suspenso', 'cancelado', 'arquivado')),
    prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    data_protocolo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_limite_analise DATE, -- Legal deadline for analysis
    data_limite_resposta DATE, -- Deadline for applicant response
    prazo_dias INTEGER, -- Total days allowed for process
    dias_transcorridos INTEGER GENERATED ALWAYS AS (EXTRACT(DAY FROM now() - data_protocolo)) STORED,
    -- Location and environmental data
    endereco_empreendimento TEXT,
    coordenadas_utm POINT, -- UTM coordinates
    area_empreendimento DECIMAL(12,2), -- Area in square meters
    municipio TEXT NOT NULL DEFAULT 'Itanhomi',
    bacia_hidrografica TEXT,
    bioma TEXT,
    -- Documentation
    documentos_anexos JSONB, -- Array of document references
    documentos_pendentes TEXT[], -- List of pending documents
    observacoes TEXT,
    parecer_tecnico TEXT,
    condicoes_licenca TEXT[], -- License conditions if approved
    -- Financial information
    valor_taxa DECIMAL(10,2), -- Fee amount
    taxa_paga BOOLEAN NOT NULL DEFAULT false,
    data_pagamento_taxa TIMESTAMP WITH TIME ZONE,
    valor_compensacao DECIMAL(12,2), -- Environmental compensation amount
    -- Legal compliance
    legislacao_aplicavel TEXT[], -- Applicable legislation
    base_legal TEXT,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 2. TRAMITACOES TABLE - Process Routing and Decision History
-- =============================================================================
CREATE TABLE public.tramitacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
    -- Routing information
    origem_usuario_id UUID REFERENCES public.profiles(id), -- Who sent
    destino_usuario_id UUID REFERENCES public.profiles(id), -- Who received
    origem_setor TEXT, -- Origin department/sector
    destino_setor TEXT, -- Destination department/sector
    -- Action details
    acao TEXT NOT NULL CHECK (acao IN ('protocolo', 'analise_inicial', 'solicitacao_documentos', 'vistoria_agendada', 'vistoria_realizada', 'parecer_emitido', 'decisao_tomada', 'recurso_interposto', 'encaminhamento', 'arquivamento', 'reativacao')),
    tipo_tramitacao TEXT NOT NULL CHECK (tipo_tramitacao IN ('encaminhamento', 'decisao', 'informacao', 'cobranca', 'notificacao')),
    -- Decision and workflow
    decisao TEXT CHECK (decisao IN ('aprovado', 'reprovado', 'pendente', 'requer_complementacao', 'requer_vistoria', 'em_analise')),
    justificativa TEXT,
    observacoes TEXT,
    documentos_gerados JSONB, -- Documents generated in this step
    documentos_solicitados TEXT[], -- Documents requested from applicant
    -- Timeline
    data_tramitacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    prazo_resposta_dias INTEGER, -- Days given for response
    data_limite_resposta DATE,
    respondido BOOLEAN NOT NULL DEFAULT false,
    data_resposta TIMESTAMP WITH TIME ZONE,
    -- Legal and compliance
    base_legal_decisao TEXT, -- Legal basis for decision
    numero_despacho TEXT, -- Official dispatch number
    publicacao_necessaria BOOLEAN NOT NULL DEFAULT false,
    data_publicacao TIMESTAMP WITH TIME ZONE,
    -- Notification tracking
    notificacao_enviada BOOLEAN NOT NULL DEFAULT false,
    meio_notificacao TEXT CHECK (meio_notificacao IN ('email', 'correio', 'edital', 'diario_oficial', 'presencial')),
    data_notificacao TIMESTAMP WITH TIME ZONE,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 3. FMA_FUNDOS TABLE - Environmental Fund Management
-- =============================================================================
CREATE TABLE public.fma_fundos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Fund identification
    nome_fundo TEXT NOT NULL,
    sigla TEXT NOT NULL,
    codigo_fundo TEXT NOT NULL UNIQUE, -- Official fund code
    tipo_fundo TEXT NOT NULL CHECK (tipo_fundo IN ('municipal', 'estadual', 'federal', 'compensacao', 'multas', 'taxas')),
    -- Legal framework
    lei_criacao TEXT NOT NULL, -- Law that created the fund
    decreto_regulamentacao TEXT,
    finalidade TEXT NOT NULL, -- Fund purpose
    -- Financial periods
    exercicio_financeiro INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    status_periodo TEXT NOT NULL DEFAULT 'ativo' CHECK (status_periodo IN ('ativo', 'encerrado', 'suspenso')),
    -- Budget information
    orcamento_inicial DECIMAL(15,2) NOT NULL DEFAULT 0,
    orcamento_atualizado DECIMAL(15,2) NOT NULL DEFAULT 0,
    receita_realizada DECIMAL(15,2) NOT NULL DEFAULT 0,
    despesa_realizada DECIMAL(15,2) NOT NULL DEFAULT 0,
    saldo_atual DECIMAL(15,2) GENERATED ALWAYS AS (orcamento_atualizado + receita_realizada - despesa_realizada) STORED,
    -- Budget allocations by category
    alocacao_categorias JSONB, -- Budget allocation by expense categories
    limite_contingenciamento DECIMAL(15,2), -- Contingency limit
    valor_contingenciado DECIMAL(15,2) NOT NULL DEFAULT 0,
    -- Fund management
    gestor_responsavel_id UUID NOT NULL REFERENCES public.profiles(id),
    conselho_gestor JSONB, -- Council management structure
    -- Compliance and controls
    conta_bancaria TEXT, -- Bank account information
    agencia_bancaria TEXT,
    banco TEXT,
    cnpj_fundo TEXT,
    -- Reporting requirements
    relatorio_trimestral_obrigatorio BOOLEAN NOT NULL DEFAULT true,
    relatorio_anual_obrigatorio BOOLEAN NOT NULL DEFAULT true,
    prestacao_contas_obrigatoria BOOLEAN NOT NULL DEFAULT true,
    -- Audit and transparency
    auditoria_externa BOOLEAN NOT NULL DEFAULT false,
    data_ultima_auditoria DATE,
    publicacao_transparencia BOOLEAN NOT NULL DEFAULT true,
    url_transparencia TEXT,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- 4. FMA_TRANSACOES TABLE - Fund Transactions and Financial Operations
-- =============================================================================
CREATE TABLE public.fma_transacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fma_fundo_id UUID NOT NULL REFERENCES public.fma_fundos(id) ON DELETE CASCADE,
    -- Transaction identification
    numero_transacao TEXT NOT NULL UNIQUE, -- Sequential transaction number
    numero_documento_fiscal TEXT, -- Invoice/receipt number
    -- Transaction details
    tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('receita', 'despesa', 'transferencia', 'estorno', 'ajuste')),
    categoria_receita TEXT CHECK (categoria_receita IN ('taxas_licenciamento', 'multas_ambientais', 'compensacao_ambiental', 'transferencias', 'rendimentos', 'doacao', 'outros')),
    categoria_despesa TEXT CHECK (categoria_despesa IN ('pessoal', 'custeio', 'investimento', 'transferencias', 'educacao_ambiental', 'fiscalizacao', 'recuperacao_ambiental', 'outros')),
    subcategoria TEXT,
    -- Financial amounts
    valor_bruto DECIMAL(12,2) NOT NULL,
    valor_impostos DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_liquido DECIMAL(12,2) GENERATED ALWAYS AS (valor_bruto - valor_impostos) STORED,
    -- Source/destination information
    origem_recurso TEXT, -- Source of funds
    destinatario TEXT, -- Transaction recipient
    documento_origem TEXT, -- Source document (CPF/CNPJ)
    processo_origem_id UUID REFERENCES public.processos(id), -- Related process if applicable
    -- Transaction details
    descricao TEXT NOT NULL,
    observacoes TEXT,
    finalidade TEXT, -- Purpose of transaction
    -- Banking information
    forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'boleto', 'cartao', 'cheque', 'pix')),
    banco_origem TEXT,
    banco_destino TEXT,
    numero_operacao TEXT, -- Bank operation number
    data_operacao DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Authorization and approval
    status_transacao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_transacao IN ('pendente', 'autorizada', 'processada', 'cancelada', 'estornada')),
    autorizado_por_id UUID REFERENCES public.profiles(id),
    data_autorizacao TIMESTAMP WITH TIME ZONE,
    -- Fiscal and legal compliance
    exercicio_financeiro INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
    empenho_numero TEXT, -- Budget commitment number
    liquidacao_numero TEXT, -- Liquidation number
    pagamento_numero TEXT, -- Payment order number
    nota_fiscal_url TEXT, -- Invoice document URL
    comprovante_pagamento_url TEXT, -- Payment proof URL
    -- Tax information
    retencao_ir DECIMAL(10,2) NOT NULL DEFAULT 0,
    retencao_inss DECIMAL(10,2) NOT NULL DEFAULT 0,
    retencao_iss DECIMAL(10,2) NOT NULL DEFAULT 0,
    retencao_outros DECIMAL(10,2) NOT NULL DEFAULT 0,
    -- Accounting integration
    conta_contabil_debito TEXT, -- Debit accounting account
    conta_contabil_credito TEXT, -- Credit accounting account
    historico_contabil TEXT, -- Accounting history
    -- Audit trail
    estornado BOOLEAN NOT NULL DEFAULT false,
    transacao_estorno_id UUID REFERENCES public.fma_transacoes(id), -- Reference to reversal transaction
    motivo_estorno TEXT,
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fma_fundos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fma_transacoes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Processos indexes
CREATE INDEX idx_processos_numero_processo ON public.processos(numero_processo);
CREATE INDEX idx_processos_ano ON public.processos(ano);
CREATE INDEX idx_processos_status ON public.processos(status_processo);
CREATE INDEX idx_processos_tipo ON public.processos(tipo_processo);
CREATE INDEX idx_processos_responsavel ON public.processos(responsavel_atual_id);
CREATE INDEX idx_processos_requerente ON public.processos(requerente_id);
CREATE INDEX idx_processos_data_protocolo ON public.processos(data_protocolo);
CREATE INDEX idx_processos_data_limite ON public.processos(data_limite_analise);
CREATE INDEX idx_processos_prioridade ON public.processos(prioridade);

-- Tramitacoes indexes
CREATE INDEX idx_tramitacoes_processo_id ON public.tramitacoes(processo_id);
CREATE INDEX idx_tramitacoes_origem_usuario ON public.tramitacoes(origem_usuario_id);
CREATE INDEX idx_tramitacoes_destino_usuario ON public.tramitacoes(destino_usuario_id);
CREATE INDEX idx_tramitacoes_data ON public.tramitacoes(data_tramitacao);
CREATE INDEX idx_tramitacoes_acao ON public.tramitacoes(acao);
CREATE INDEX idx_tramitacoes_status_resposta ON public.tramitacoes(respondido, data_limite_resposta);

-- FMA Fundos indexes
CREATE INDEX idx_fma_fundos_codigo ON public.fma_fundos(codigo_fundo);
CREATE INDEX idx_fma_fundos_exercicio ON public.fma_fundos(exercicio_financeiro);
CREATE INDEX idx_fma_fundos_status ON public.fma_fundos(status_periodo);
CREATE INDEX idx_fma_fundos_gestor ON public.fma_fundos(gestor_responsavel_id);
CREATE INDEX idx_fma_fundos_periodo ON public.fma_fundos(periodo_inicio, periodo_fim);

-- FMA Transacoes indexes
CREATE INDEX idx_fma_transacoes_fundo_id ON public.fma_transacoes(fma_fundo_id);
CREATE INDEX idx_fma_transacoes_numero ON public.fma_transacoes(numero_transacao);
CREATE INDEX idx_fma_transacoes_tipo ON public.fma_transacoes(tipo_transacao);
CREATE INDEX idx_fma_transacoes_data_operacao ON public.fma_transacoes(data_operacao);
CREATE INDEX idx_fma_transacoes_exercicio ON public.fma_transacoes(exercicio_financeiro);
CREATE INDEX idx_fma_transacoes_status ON public.fma_transacoes(status_transacao);
CREATE INDEX idx_fma_transacoes_processo ON public.fma_transacoes(processo_origem_id);
CREATE INDEX idx_fma_transacoes_categoria_receita ON public.fma_transacoes(categoria_receita);
CREATE INDEX idx_fma_transacoes_categoria_despesa ON public.fma_transacoes(categoria_despesa);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- PROCESSOS POLICIES
CREATE POLICY "Técnicos podem ver processos sob sua responsabilidade ou públicos"
ON public.processos FOR SELECT
USING (
    responsavel_atual_id = auth.uid() OR
    requerente_id = auth.uid() OR
    status_processo IN ('deferido', 'indeferido') OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas técnicos autorizados podem gerenciar processos"
ON public.processos FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular')
    )
);

-- TRAMITACOES POLICIES
CREATE POLICY "Usuários podem ver tramitações de seus processos"
ON public.tramitacoes FOR SELECT
USING (
    origem_usuario_id = auth.uid() OR
    destino_usuario_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.processos p 
        WHERE p.id = tramitacoes.processo_id AND (p.responsavel_atual_id = auth.uid() OR p.requerente_id = auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas técnicos podem inserir tramitações"
ON public.tramitacoes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular')
    )
);

-- FMA FUNDOS POLICIES
CREATE POLICY "Todos podem ver informações básicas dos fundos"
ON public.fma_fundos FOR SELECT
USING (TRUE);

CREATE POLICY "Apenas gestores financeiros podem gerenciar fundos"
ON public.fma_fundos FOR ALL
USING (
    gestor_responsavel_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

-- FMA TRANSACOES POLICIES
CREATE POLICY "Gestores podem ver transações de seus fundos"
ON public.fma_transacoes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.fma_fundos f 
        WHERE f.id = fma_transacoes.fma_fundo_id AND f.gestor_responsavel_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
    )
);

CREATE POLICY "Apenas gestores financeiros autorizados podem inserir transações"
ON public.fma_transacoes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.fma_fundos f 
        WHERE f.id = fma_fundo_id AND f.gestor_responsavel_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'secretario')
    )
);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fma_fundos_updated_at
    BEFORE UPDATE ON public.fma_fundos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fma_transacoes_updated_at
    BEFORE UPDATE ON public.fma_transacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to generate next process number
CREATE OR REPLACE FUNCTION public.generate_process_number(process_year INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    target_year INTEGER;
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    target_year := COALESCE(process_year, EXTRACT(YEAR FROM now()));
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_processo, '.', 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.processos
    WHERE ano = target_year;
    
    formatted_number := target_year::TEXT || '.001.' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update fund balance after transaction
CREATE OR REPLACE FUNCTION public.update_fund_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_transacao = 'processada' AND NEW.tipo_transacao = 'receita' THEN
        UPDATE public.fma_fundos 
        SET receita_realizada = receita_realizada + NEW.valor_liquido
        WHERE id = NEW.fma_fundo_id;
    ELSIF NEW.status_transacao = 'processada' AND NEW.tipo_transacao = 'despesa' THEN
        UPDATE public.fma_fundos 
        SET despesa_realizada = despesa_realizada + NEW.valor_liquido
        WHERE id = NEW.fma_fundo_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fund_balance_trigger
    AFTER UPDATE ON public.fma_transacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fund_balance();

-- Function to validate process deadlines
CREATE OR REPLACE FUNCTION public.validate_process_deadlines()
RETURNS TRIGGER AS $$
BEGIN
    -- Set analysis deadline based on process type
    IF NEW.tipo_processo = 'licenciamento_ambiental' THEN
        NEW.data_limite_analise := NEW.data_protocolo + INTERVAL '60 days';
        NEW.prazo_dias := 60;
    ELSIF NEW.tipo_processo = 'fiscalizacao' THEN
        NEW.data_limite_analise := NEW.data_protocolo + INTERVAL '30 days';
        NEW.prazo_dias := 30;
    ELSE
        NEW.data_limite_analise := NEW.data_protocolo + INTERVAL '45 days';
        NEW.prazo_dias := 45;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_process_deadlines_trigger
    BEFORE INSERT ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_process_deadlines();

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE public.processos IS 'Environmental process workflow with status tracking, deadlines, and responsible parties';
COMMENT ON TABLE public.tramitacoes IS 'Process routing, approvals, decision history, and workflow states';
COMMENT ON TABLE public.fma_fundos IS 'Environmental fund management with budget tracking, allocations, and fiscal periods';
COMMENT ON TABLE public.fma_transacoes IS 'Fund transactions, financial operations, and audit trail';

-- Key column comments
COMMENT ON COLUMN public.processos.numero_processo IS 'Official process number following format: YYYY.001.### for environmental processes';
COMMENT ON COLUMN public.processos.dias_transcorridos IS 'Automatically calculated days since process protocol';
COMMENT ON COLUMN public.tramitacoes.acao IS 'Specific action taken in the process workflow';
COMMENT ON COLUMN public.fma_fundos.saldo_atual IS 'Automatically calculated current fund balance';
COMMENT ON COLUMN public.fma_transacoes.valor_liquido IS 'Net amount after taxes and deductions';