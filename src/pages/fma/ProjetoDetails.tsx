import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Importar componentes da Fase 2
import PrestacaoContas from "@/components/fma/PrestacaoContas";
import FMAIndicadores from "@/components/fma/FMAIndicadores";
import FMAReuniao from "@/components/fma/FMAReuniao";
import FMADocumentos from "@/components/fma/FMADocumentos";

const ProjetoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: _user, profile } = useAuth();
  
  const [projeto, setProjeto] = useState<Record<string, unknown> | null>(null);
  const [receitas, setReceitas] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("detalhes");

  useEffect(() => {
    if (id) {
      loadProjeto();
      loadReceitas();
    }
  }, [id]);

  const loadProjeto = async () => {
    if (!id) {
      toast.error("ID do projeto não encontrado");
      navigate("/fma");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fma_projetos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProjeto(data);
      } else {
        toast.error("Projeto não encontrado");
        navigate("/fma");
      }
    } catch (error) {
      console.error("Erro ao carregar projeto:", error);
      toast.error("Erro ao carregar projeto");
      navigate("/fma");
    } finally {
      setLoading(false);
    }
  };

  const loadReceitas = async () => {
    try {
      const { data, error } = await supabase
        .from('fma_receitas')
        .select('*')
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      rascunho: { label: 'Rascunho', variant: 'outline' as const, icon: FileText },
      submetido: { label: 'Submetido', variant: 'secondary' as const, icon: Clock },
      em_analise: { label: 'Em Análise', variant: 'default' as const, icon: Users },
      aprovado: { label: 'Aprovado', variant: 'success' as const, icon: CheckCircle },
      em_execucao: { label: 'Em Execução', variant: 'default' as const, icon: TrendingUp },
      concluido: { label: 'Concluído', variant: 'success' as const, icon: CheckCircle },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' as const, icon: AlertTriangle },
      cancelado: { label: 'Cancelado', variant: 'secondary' as const, icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: Info 
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getAreaAtuacaoLabel = (area: string) => {
    const areas = {
      educacao_ambiental: "Educação Ambiental",
      recuperacao_areas: "Recuperação de Áreas",
      conservacao_biodiversidade: "Conservação da Biodiversidade",
      saneamento: "Saneamento",
      fiscalizacao: "Fiscalização",
      outros: "Outros"
    };
    return areas[area as keyof typeof areas] || area;
  };

  const canManage = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Projeto não encontrado</AlertTitle>
          <AlertDescription>
            O projeto solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/fma")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/fma")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8" />
            {projeto.titulo}
          </h1>
          <p className="text-muted-foreground mt-1">
            Proponente: {projeto.proponente} | Protocolo: {projeto.protocolo}
          </p>
        </div>
        
        <div className="flex gap-2">
          {getStatusBadge(projeto.status)}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Solicitado</p>
                <p className="text-2xl font-bold">{formatCurrency(projeto.valor_solicitado)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        {projeto.valor_aprovado && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Aprovado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(projeto.valor_aprovado)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prazo de Execução</p>
                <p className="text-2xl font-bold">{projeto.prazo_execucao} meses</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Área de Atuação</p>
                <p className="text-lg font-semibold">
                  {getAreaAtuacaoLabel(projeto.area_atuacao)}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="prestacao-contas">Prestação de Contas</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Projeto */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="mt-1">{projeto.descricao}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Objetivos</p>
                  <p className="mt-1">{projeto.objetivos}</p>
                </div>
                
                {projeto.justificativa && (
                  <div>
                    <p className="text-sm text-muted-foreground">Justificativa</p>
                    <p className="mt-1">{projeto.justificativa}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cronograma */}
            <Card>
              <CardHeader>
                <CardTitle>Cronograma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projeto.data_inicio_prevista && (
                  <div>
                    <p className="text-sm text-muted-foreground">Início Previsto</p>
                    <p className="mt-1">
                      {format(new Date(projeto.data_inicio_prevista), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
                
                {projeto.data_fim_prevista && (
                  <div>
                    <p className="text-sm text-muted-foreground">Término Previsto</p>
                    <p className="mt-1">
                      {format(new Date(projeto.data_fim_prevista), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
                
                {projeto.data_inicio_real && (
                  <div>
                    <p className="text-sm text-muted-foreground">Início Real</p>
                    <p className="mt-1">
                      {format(new Date(projeto.data_inicio_real), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
                
                {projeto.data_fim_real && (
                  <div>
                    <p className="text-sm text-muted-foreground">Término Real</p>
                    <p className="mt-1">
                      {format(new Date(projeto.data_fim_real), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Metas e Indicadores */}
          {projeto.metas && (
            <Card>
              <CardHeader>
                <CardTitle>Metas do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{projeto.metas}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prestacao-contas">
          <PrestacaoContas projeto={projeto} canManage={canManage} />
        </TabsContent>

        <TabsContent value="indicadores">
          <FMAIndicadores 
            receitas={receitas} 
            projetos={[projeto]} 
            periodo="trimestre" 
          />
        </TabsContent>

        <TabsContent value="reunioes">
          <FMAReuniao projeto={projeto} canManage={canManage} />
        </TabsContent>

        <TabsContent value="documentos">
          <FMADocumentos projeto={projeto} canManage={canManage} />
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline do Projeto</CardTitle>
              <CardDescription>
                Histórico de eventos e alterações do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">Projeto Criado</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(projeto.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {projeto.data_submissao && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Projeto Submetido</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(projeto.data_submissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {projeto.data_aprovacao && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Projeto Aprovado</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(projeto.data_aprovacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {projeto.data_inicio_real && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-orange-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Execução Iniciada</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(projeto.data_inicio_real), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {projeto.data_fim_real && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Projeto Concluído</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(projeto.data_fim_real), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjetoDetails;