-- Migração para CODEMA-Itanhomi: estrutura de reuniões e documentos

-- Criar tabela de reuniões do CODEMA
CREATE TABLE public.reunioes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ordinaria', 'extraordinaria', 'audiencia_publica')),
    data_reuniao TIMESTAMP WITH TIME ZONE NOT NULL,
    local TEXT NOT NULL,
    pauta TEXT,
    ata TEXT,
    status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
    secretario_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de documentos
CREATE TABLE public.documentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ata', 'agenda', 'processo', 'parecer', 'licenca', 'resolucao')),
    arquivo_url TEXT,
    arquivo_nome TEXT,
    tamanho_arquivo INTEGER,
    reuniao_id UUID REFERENCES public.reunioes(id),
    autor_id UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
    palavras_chave TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de presença nas reuniões
CREATE TABLE public.presencas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reuniao_id UUID NOT NULL REFERENCES public.reunioes(id),
    usuario_id UUID NOT NULL REFERENCES public.profiles(id),
    tipo_participacao TEXT NOT NULL CHECK (tipo_participacao IN ('titular', 'suplente', 'convidado')),
    presente BOOLEAN NOT NULL DEFAULT false,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(reuniao_id, usuario_id)
);

-- Atualizar tabela profiles para incluir roles CODEMA específicos
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('citizen', 'admin', 'moderator', 'conselheiro_titular', 'conselheiro_suplente', 'secretario', 'presidente'));

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- Policies para reuniões
CREATE POLICY "Todos podem ver reuniões publicadas" 
ON public.reunioes FOR SELECT 
USING (status = 'realizada' OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
));

CREATE POLICY "Secretários podem gerenciar reuniões" 
ON public.reunioes FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
));

-- Policies para documentos
CREATE POLICY "Conselheiros podem ver documentos" 
ON public.documentos FOR SELECT 
USING (status = 'publicado' OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente', 'conselheiro_titular', 'conselheiro_suplente')
));

CREATE POLICY "Secretários podem gerenciar documentos" 
ON public.documentos FOR ALL 
USING (auth.uid() = autor_id OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
));

-- Policies para presenças
CREATE POLICY "Usuários podem ver presenças de reuniões que participam" 
ON public.presencas FOR SELECT 
USING (usuario_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
));

CREATE POLICY "Secretários podem gerenciar presenças" 
ON public.presencas FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'secretario', 'presidente')
));

-- Triggers para updated_at
CREATE TRIGGER update_reunioes_updated_at
    BEFORE UPDATE ON public.reunioes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at
    BEFORE UPDATE ON public.documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias específicas do CODEMA
INSERT INTO public.service_categories (name, description, icon) VALUES
('Licenciamento Ambiental', 'Processos de licenciamento ambiental municipal', 'file-check'),
('Audiência Pública', 'Audiências públicas para projetos ambientais', 'users'),
('Fiscalização Ambiental', 'Relatórios de fiscalização e monitoramento', 'shield-check'),
('Educação Ambiental', 'Programas e projetos de educação ambiental', 'book-open'),
('Resíduos Sólidos', 'Gestão de resíduos sólidos urbanos', 'recycle'),
('Recursos Hídricos', 'Proteção e gestão dos recursos hídricos', 'droplets'),
('Áreas Verdes', 'Criação e manutenção de áreas verdes urbanas', 'trees'),
('Poluição Sonora', 'Controle e fiscalização de poluição sonora', 'volume-x'),
('Arborização Urbana', 'Plantio e manutenção da arborização urbana', 'tree-pine'),
('Desenvolvimento Sustentável', 'Projetos de desenvolvimento sustentável', 'leaf')
ON CONFLICT (name) DO NOTHING;