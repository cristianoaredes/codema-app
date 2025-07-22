import { useEffect, useState, useCallback } from "react";
import { useAuth, useToast } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Tabs, TabsContent, TabsList, TabsTrigger, Label, Progress } from "@/components/ui";
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FMAReceita {
  id: string;
  tipo_receita: string;
  descricao: string;
  valor: number;
  data_entrada: string;
  origem: string;
  status: string;
}

interface FMAProjeto {
  id: string;
  titulo: string;
  descricao: string;
  valor_solicitado: number;
  valor_aprovado: number | null;
  proponente: string;
  area_atuacao: string;
  status: string;
  percentual_execucao: number;
  data_inicio_prevista: string | null;
  data_fim_prevista: string | null;
  prazo_execucao: number;
}

const FMA = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [receitas, setReceitas] = useState<FMAReceita[]>([]);
  const [projetos, setProjetos] = useState<FMAProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewReceita, setShowNewReceita] = useState(false);
  const [showNewProjeto, setShowNewProjeto] = useState(false);

  const [newReceita, setNewReceita] = useState({
    tipo_receita: "",
    descricao: "",
    valor: "",
    data_entrada: "",
    origem: "",
    numero_documento: ""
  });

  const [newProjeto, setNewProjeto] = useState({
    titulo: "",
    descricao: "",
    objetivos: "",
    valor_solicitado: "",
    proponente: "",
    cpf_cnpj_proponente: "",
    area_atuacao: "",
    prazo_execucao: ""
  });

  const isSecretary = profile?.role && ['admin', 'secretario', 'presidente'].includes(profile.role);

  const fetchFMAData = useCallback(async () => {
    try {
      const [receitasData, projetosData] = await Promise.all([
        supabase.from("fma_receitas").select("*").order("data_entrada", { ascending: false }),
        supabase.from("fma_projetos").select("*").order("created_at", { ascending: false })
      ]);

      if (receitasData.error) throw receitasData.error;
      if (projetosData.error) throw projetosData.error;

      setReceitas(receitasData.data || []);
      setProjetos(projetosData.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados do FMA:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do FMA.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchFMAData();
  }, [fetchFMAData]);

  const createReceita = async () => {
    try {
      const { error } = await supabase
        .from("fma_receitas")
        .insert({
          ...newReceita,
          valor: parseFloat(newReceita.valor),
          responsavel_cadastro_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Receita registrada com sucesso!",
      });

      setShowNewReceita(false);
      setNewReceita({
        tipo_receita: "",
        descricao: "",
        valor: "",
        data_entrada: "",
        origem: "",
        numero_documento: ""
      });
      fetchFMAData();
    } catch (error) {
      console.error("Erro ao registrar receita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a receita.",
        variant: "destructive"
      });
    }
  };

  const createProjeto = async () => {
    try {
      const { error } = await supabase
        .from("fma_projetos")
        .insert({
          ...newProjeto,
          valor_solicitado: parseFloat(newProjeto.valor_solicitado),
          prazo_execucao: parseInt(newProjeto.prazo_execucao)
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Projeto submetido com sucesso!",
      });

      setShowNewProjeto(false);
      setNewProjeto({
        titulo: "",
        descricao: "",
        objetivos: "",
        valor_solicitado: "",
        proponente: "",
        cpf_cnpj_proponente: "",
        area_atuacao: "",
        prazo_execucao: ""
      });
      fetchFMAData();
    } catch (error) {
      console.error("Erro ao submeter projeto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível submeter o projeto.",
        variant: "destructive"
      });
    }
  };

  const calcularEstatisticas = () => {
    const totalReceitas = receitas.reduce((sum, r) => sum + (r.status === 'recebido' ? r.valor : 0), 0);
    const totalSolicitado = projetos.reduce((sum, p) => sum + p.valor_solicitado, 0);
    const totalAprovado = projetos.reduce((sum, p) => sum + (p.valor_aprovado || 0), 0);
    const saldoDisponivel = totalReceitas - totalAprovado;
    
    const projetosEmExecucao = projetos.filter(p => p.status === 'em_execucao').length;
    const projetosConcluidos = projetos.filter(p => p.status === 'concluido').length;

    return {
      totalReceitas,
      totalSolicitado,
      totalAprovado,
      saldoDisponivel,
      projetosEmExecucao,
      projetosConcluidos
    };
  };

  const stats = calcularEstatisticas();

  const getStatusBadge = (status: string, type: 'receita' | 'projeto') => {
    if (type === 'receita') {
      const statusConfig = {
        previsto: { label: "Previsto", variant: "outline" as const },
        recebido: { label: "Recebido", variant: "default" as const },
        cancelado: { label: "Cancelado", variant: "destructive" as const },
      };
      return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
    } else {
      const statusConfig = {
        submetido: { label: "Submetido", variant: "outline" as const },
        em_analise: { label: "Em Análise", variant: "secondary" as const },
        aprovado: { label: "Aprovado", variant: "default" as const },
        reprovado: { label: "Reprovado", variant: "destructive" as const },
        em_execucao: { label: "Em Execução", variant: "default" as const },
        concluido: { label: "Concluído", variant: "default" as const },
        cancelado: { label: "Cancelado", variant: "destructive" as const },
      };
      return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão do FMA</h1>
          <p className="text-muted-foreground">
            Fundo Municipal do Meio Ambiente - Conforme Lei 1.234/2002, arts. 17-20
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {stats.totalReceitas.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.saldoDisponivel.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Para novos projetos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Aprovados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalAprovado.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {projetos.filter(p => ['aprovado', 'em_execucao', 'concluido'].includes(p.status)).length} projetos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projetosEmExecucao}</div>
                <p className="text-xs text-muted-foreground">
                  Projetos ativos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receitas.slice(0, 5).map((receita) => (
                    <div key={receita.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{receita.descricao}</p>
                        <p className="text-sm text-muted-foreground">{receita.origem}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">
                          {receita.valor.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(receita.data_entrada), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projetos em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projetos.filter(p => p.status === 'em_execucao').slice(0, 5).map((projeto) => (
                    <div key={projeto.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{projeto.titulo}</p>
                        <Badge variant="outline">{projeto.percentual_execucao}%</Badge>
                      </div>
                      <Progress value={projeto.percentual_execucao} className="h-2" />
                      <p className="text-xs text-muted-foreground">{projeto.proponente}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receitas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Receitas do FMA</h2>
            {isSecretary && (
              <Dialog open={showNewReceita} onOpenChange={setShowNewReceita}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Receita
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Receita</DialogTitle>
                    <DialogDescription>
                      Registre uma nova entrada de recurso no FMA
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo_receita">Tipo de Receita *</Label>
                        <Select
                          value={newReceita.tipo_receita}
                          onValueChange={(value) => setNewReceita({...newReceita, tipo_receita: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multa">Multa</SelectItem>
                            <SelectItem value="tac">TAC</SelectItem>
                            <SelectItem value="convenio">Convênio</SelectItem>
                            <SelectItem value="doacao">Doação</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="valor">Valor *</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          value={newReceita.valor}
                          onChange={(e) => setNewReceita({...newReceita, valor: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Textarea
                        id="descricao"
                        value={newReceita.descricao}
                        onChange={(e) => setNewReceita({...newReceita, descricao: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origem">Origem *</Label>
                        <Input
                          id="origem"
                          value={newReceita.origem}
                          onChange={(e) => setNewReceita({...newReceita, origem: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="data_entrada">Data de Entrada *</Label>
                        <Input
                          id="data_entrada"
                          type="date"
                          value={newReceita.data_entrada}
                          onChange={(e) => setNewReceita({...newReceita, data_entrada: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="numero_documento">Número do Documento</Label>
                      <Input
                        id="numero_documento"
                        value={newReceita.numero_documento}
                        onChange={(e) => setNewReceita({...newReceita, numero_documento: e.target.value})}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewReceita(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={createReceita}
                        disabled={!newReceita.tipo_receita || !newReceita.descricao || !newReceita.valor || !newReceita.origem || !newReceita.data_entrada}
                      >
                        Registrar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-4">
            {receitas.map((receita) => {
              const statusBadge = getStatusBadge(receita.status, 'receita');
              
              return (
                <Card key={receita.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          {receita.descricao}
                        </CardTitle>
                        <CardDescription>{receita.origem}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-success">
                          {receita.valor.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Tipo: {receita.tipo_receita.charAt(0).toUpperCase() + receita.tipo_receita.slice(1)}</span>
                      <span>Data: {format(new Date(receita.data_entrada), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="projetos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Projetos do FMA</h2>
            <Dialog open={showNewProjeto} onOpenChange={setShowNewProjeto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Submeter Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submeter Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Submeta uma proposta de projeto para o FMA
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="titulo">Título do Projeto *</Label>
                    <Input
                      id="titulo"
                      value={newProjeto.titulo}
                      onChange={(e) => setNewProjeto({...newProjeto, titulo: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao_projeto">Descrição *</Label>
                    <Textarea
                      id="descricao_projeto"
                      value={newProjeto.descricao}
                      onChange={(e) => setNewProjeto({...newProjeto, descricao: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="objetivos">Objetivos *</Label>
                    <Textarea
                      id="objetivos"
                      value={newProjeto.objetivos}
                      onChange={(e) => setNewProjeto({...newProjeto, objetivos: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="proponente">Proponente *</Label>
                      <Input
                        id="proponente"
                        value={newProjeto.proponente}
                        onChange={(e) => setNewProjeto({...newProjeto, proponente: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf_cnpj_proponente">CPF/CNPJ</Label>
                      <Input
                        id="cpf_cnpj_proponente"
                        value={newProjeto.cpf_cnpj_proponente}
                        onChange={(e) => setNewProjeto({...newProjeto, cpf_cnpj_proponente: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valor_solicitado">Valor Solicitado *</Label>
                      <Input
                        id="valor_solicitado"
                        type="number"
                        step="0.01"
                        value={newProjeto.valor_solicitado}
                        onChange={(e) => setNewProjeto({...newProjeto, valor_solicitado: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prazo_execucao">Prazo de Execução (meses) *</Label>
                      <Input
                        id="prazo_execucao"
                        type="number"
                        value={newProjeto.prazo_execucao}
                        onChange={(e) => setNewProjeto({...newProjeto, prazo_execucao: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="area_atuacao">Área de Atuação *</Label>
                    <Select
                      value={newProjeto.area_atuacao}
                      onValueChange={(value) => setNewProjeto({...newProjeto, area_atuacao: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educacao_ambiental">Educação Ambiental</SelectItem>
                        <SelectItem value="recuperacao_areas">Recuperação de Áreas</SelectItem>
                        <SelectItem value="conservacao_biodiversidade">Conservação da Biodiversidade</SelectItem>
                        <SelectItem value="saneamento">Saneamento</SelectItem>
                        <SelectItem value="fiscalizacao">Fiscalização</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewProjeto(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={createProjeto}
                      disabled={!newProjeto.titulo || !newProjeto.descricao || !newProjeto.objetivos || !newProjeto.proponente || !newProjeto.valor_solicitado || !newProjeto.area_atuacao || !newProjeto.prazo_execucao}
                    >
                      Submeter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {projetos.map((projeto) => {
              const statusBadge = getStatusBadge(projeto.status, 'projeto');
              
              return (
                <Card key={projeto.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          {projeto.titulo}
                        </CardTitle>
                        <CardDescription>{projeto.proponente}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {projeto.valor_solicitado.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{projeto.descricao}</p>
                      
                      {projeto.status === 'em_execucao' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{projeto.percentual_execucao}%</span>
                          </div>
                          <Progress value={projeto.percentual_execucao} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Área: {projeto.area_atuacao.replace('_', ' ').toUpperCase()}</span>
                        <span>Prazo: {projeto.prazo_execucao} meses</span>
                        {projeto.valor_aprovado && (
                          <span className="text-success font-medium">
                            Aprovado: {projeto.valor_aprovado.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Trimestrais</CardTitle>
              <CardDescription>
                Relatórios de execução conforme exigência do TCE-MG
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Relatórios em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Funcionalidade de geração de relatórios será implementada na próxima versão
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FMA;