-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  neighborhood TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar tabela de categorias de serviços
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Criar tabela de relatórios
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'rejected')),
  photos TEXT[],
  admin_response TEXT,
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Criar tabela de avaliações de serviços
CREATE TABLE public.service_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela service_ratings
ALTER TABLE public.service_ratings ENABLE ROW LEVEL SECURITY;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    'citizen'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis públicos" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Políticas RLS para service_categories
CREATE POLICY "Todos podem ver categorias de serviços" 
ON public.service_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem gerenciar categorias" 
ON public.service_categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Políticas RLS para reports
CREATE POLICY "Usuários podem ver todos os relatórios" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar relatórios" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios relatórios" 
ON public.reports 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Políticas RLS para service_ratings
CREATE POLICY "Usuários podem ver todas as avaliações" 
ON public.service_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar avaliações" 
ON public.service_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias avaliações" 
ON public.service_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Inserir categorias padrão de serviços municipais
INSERT INTO public.service_categories (name, description, icon) VALUES
('Manutenção de Ruas', 'Problemas com asfalto, buracos, calçadas e vias públicas', 'road'),
('Coleta de Lixo', 'Problemas com coleta de lixo domiciliar e limpeza urbana', 'trash-2'),
('Água e Esgoto', 'Vazamentos, falta de água, problemas no esgoto', 'droplets'),
('Iluminação Pública', 'Lâmpadas queimadas, postes danificados', 'lightbulb'),
('Parques e Praças', 'Manutenção de áreas verdes e espaços públicos', 'trees'),
('Transporte Público', 'Problemas com ônibus e pontos de parada', 'bus'),
('Segurança Pública', 'Questões relacionadas à segurança e policiamento', 'shield'),
('Saúde Pública', 'Problemas em postos de saúde e serviços médicos', 'heart'),
('Educação', 'Questões relacionadas a escolas municipais', 'graduation-cap'),
('Meio Ambiente', 'Poluição, desmatamento, questões ambientais', 'leaf'),
('Outros', 'Outros problemas não listados acima', 'help-circle');

-- Habilitar realtime para as tabelas
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.service_ratings REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;