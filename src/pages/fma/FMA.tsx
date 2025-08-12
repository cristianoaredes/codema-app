import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown, DollarSign, Briefcase, FileText, Download, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface FMAReceita {
  id?: string;
  tipo_receita: "multa" | "tac" | "convenio" | "doacao" | "transferencia" | "outros";
  origem: string;
  valor: number;
  descricao: string;
  data_entrada: string;
  numero_documento?: string;
  observacoes?: string;
  status?: string;
  responsavel_cadastro_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface FMAProjeto {
  id?: string;
  titulo: string;
  proponente: string;
  cpf_cnpj_proponente?: string;
  area_atuacao: "educacao_ambiental" | "recuperacao_areas" | "conservacao_biodiversidade" | "saneamento" | "fiscalizacao" | "outros";
  valor_solicitado: number;
  valor_aprovado?: number;
  prazo_execucao: number;
  descricao: string;
  objetivos: string;
  status?: string;
  percentual_execucao?: number;
  data_inicio_prevista?: string;
  data_fim_prevista?: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  observacoes?: string;
  responsavel_analise_id?: string;
  reuniao_aprovacao_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface DashboardData {
  totalReceitas: number;
  totalProjetos: number;
  saldoDisponivel: number;
  projetosEmAndamento: number;
  receitasMes: number;
  gastosMes: number;
}

const FMA = () => {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<FMAReceita[]>([]);
  const [projetos, setProjetos] = useState<FMAProjeto[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalReceitas: 0,
    totalProjetos: 0,
    saldoDisponivel: 0,
    projetosEmAndamento: 0,
    receitasMes: 0,
    gastosMes: 0
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projetoDialogOpen, setProjetoDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<FMAReceita | null>(null);
  const [editingProjeto, setEditingProjeto] = useState<FMAProjeto | null>(null);
  
  const [newReceita, setNewReceita] = useState<FMAReceita>({
    tipo_receita: "multa",
    origem: "",
    valor: 0,
    descricao: "",
    data_entrada: new Date().toISOString().split('T')[0]
  });

  const [newProjeto, setNewProjeto] = useState<FMAProjeto>({
    titulo: "",
    proponente: "",
    area_atuacao: "educacao_ambiental",
    valor_solicitado: 0,
    prazo_execucao: 12,
    descricao: "",
    objetivos: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar receitas
      const { data: receitasData, error: receitasError } = await supabase
        .from("fma_receitas")
        .select("*")
        .order("created_at", { ascending: false });

      if (receitasError) throw receitasError;
      setReceitas(receitasData || []);

      // Buscar projetos
      const { data: projetosData, error: projetosError } = await supabase
        .from("fma_projetos")
        .select("*")
        .order("created_at", { ascending: false });

      if (projetosError) throw projetosError;
      setProjetos(projetosData || []);

      // Calcular dados do dashboard
      calculateDashboard(receitasData || [], projetosData || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados do FMA");
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboard = (receitasData: FMAReceita[], projetosData: FMAProjeto[]) => {
    const totalReceitas = receitasData.reduce((sum, r) => sum + (r.valor || 0), 0);
    const totalProjetos = projetosData
      .filter(p => p.status === "aprovado" || p.status === "em_execucao")
      .reduce((sum, p) => sum + (p.valor_aprovado || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const receitasMes = receitasData
      .filter(r => {
        const date = new Date(r.data_entrada);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + (r.valor || 0), 0);

    const projetosEmAndamento = projetosData.filter(p => p.status === "em_execucao").length;

    setDashboardData({
      totalReceitas,
      totalProjetos,
      saldoDisponivel: totalReceitas - totalProjetos,
      projetosEmAndamento,
      receitasMes,
      gastosMes: totalProjetos / 12 // Estimativa simplificada
    });
  };

  const handleSubmitReceita = async () => {
    try {
      const receitaData = {
        ...newReceita,
        responsavel_cadastro_id: user?.id,
        status: "confirmada"
      };

      if (editingReceita?.id) {
        const { error } = await supabase
          .from("fma_receitas")
          .update(receitaData)
          .eq("id", editingReceita.id);

        if (error) throw error;
        toast.success("Receita atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("fma_receitas")
          .insert(receitaData);

        if (error) throw error;
        toast.success("Receita cadastrada com sucesso!");
      }

      setDialogOpen(false);
      setEditingReceita(null);
      setNewReceita({
        tipo_receita: "multa",
        origem: "",
        valor: 0,
        descricao: "",
        data_entrada: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      toast.error("Erro ao salvar receita");
    }
  };

  const handleSubmitProjeto = async () => {
    try {
      const projetoData = {
        ...newProjeto,
        responsavel_analise_id: user?.id,
        status: "em_analise"
      };

      if (editingProjeto?.id) {
        const { error } = await supabase
          .from("fma_projetos")
          .update(projetoData)
          .eq("id", editingProjeto.id);

        if (error) throw error;
        toast.success("Projeto atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("fma_projetos")
          .insert(projetoData);

        if (error) throw error;
        toast.success("Projeto cadastrado com sucesso!");
      }

      setProjetoDialogOpen(false);
      setEditingProjeto(null);
      setNewProjeto({
        titulo: "",
        proponente: "",
        area_atuacao: "educacao_ambiental",
        valor_solicitado: 0,
        prazo_execucao: 12,
        descricao: "",
        objetivos: ""
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      toast.error("Erro ao salvar projeto");
    }
  };

  const handleDeleteReceita = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
      const { error } = await supabase
        .from("fma_receitas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Receita excluída com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      toast.error("Erro ao excluir receita");
    }
  };

  const handleDeleteProjeto = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    try {
      const { error } = await supabase
        .from("fma_projetos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Projeto excluído com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      toast.error("Erro ao excluir projeto");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const getTipoReceitaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      multa: "Multa Ambiental",
      tac: "TAC - Termo de Ajustamento",
      convenio: "Convênio",
      doacao: "Doação",
      transferencia: "Transferência",
      outros: "Outros"
    };
    return labels[tipo] || tipo;
  };

  const getAreaAtuacaoLabel = (area: string) => {
    const labels: Record<string, string> = {
      educacao_ambiental: "Educação Ambiental",
      recuperacao_areas: "Recuperação de Áreas",
      conservacao_biodiversidade: "Conservação da Biodiversidade",
      saneamento: "Saneamento",
      fiscalizacao: "Fiscalização",
      outros: "Outros"
    };
    return labels[area] || area;
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
      confirmada: { label: "Confirmada", variant: "success" },
      pendente: { label: "Pendente", variant: "warning" },
      em_analise: { label: "Em Análise", variant: "warning" },
      aprovado: { label: "Aprovado", variant: "success" },
      em_execucao: { label: "Em Execução", variant: "default" },
      concluido: { label: "Concluído", variant: "success" },
      cancelado: { label: "Cancelado", variant: "destructive" }
    };

    const config = statusConfig[status || ""] || { label: status || "Indefinido", variant: "default" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fundo Municipal do Meio Ambiente</h1>
          <p className="text-muted-foreground">Gestão financeira de recursos ambientais</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData.saldoDisponivel)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de recursos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.receitasMes)}</div>
            <p className="text-xs text-muted-foreground">
              +20% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos em Andamento</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.projetosEmAndamento}</div>
            <p className="text-xs text-muted-foreground">
              Projetos ativos no momento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Receitas and Projetos */}
      <Tabs defaultValue="receitas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* Receitas Tab */}
        <TabsContent value="receitas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestão de Receitas</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingReceita(null);
                  setNewReceita({
                    tipo_receita: "multa",
                    origem: "",
                    valor: 0,
                    descricao: "",
                    data_entrada: new Date().toISOString().split('T')[0]
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingReceita ? "Editar Receita" : "Cadastrar Nova Receita"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados abaixo para {editingReceita ? "atualizar a" : "registrar uma nova"} receita no Fundo Municipal do Meio Ambiente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Receita</Label>
                      <Select
                        value={newReceita.tipo_receita}
                        onValueChange={(value) => setNewReceita({ ...newReceita, tipo_receita: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multa">Multa Ambiental</SelectItem>
                          <SelectItem value="tac">TAC - Termo de Ajustamento</SelectItem>
                          <SelectItem value="convenio">Convênio</SelectItem>
                          <SelectItem value="doacao">Doação</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data">Data de Entrada</Label>
                      <Input
                        type="date"
                        value={newReceita.data_entrada}
                        onChange={(e) => setNewReceita({ ...newReceita, data_entrada: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origem">Origem</Label>
                      <Input
                        placeholder="Ex: Empresa XYZ, Pessoa Física"
                        value={newReceita.origem}
                        onChange={(e) => setNewReceita({ ...newReceita, origem: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newReceita.valor}
                        onChange={(e) => setNewReceita({ ...newReceita, valor: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">Número do Documento</Label>
                    <Input
                      placeholder="Número do processo, auto de infração, etc."
                      value={newReceita.numero_documento || ""}
                      onChange={(e) => setNewReceita({ ...newReceita, numero_documento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      placeholder="Descreva a origem e natureza da receita"
                      value={newReceita.descricao}
                      onChange={(e) => setNewReceita({ ...newReceita, descricao: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      placeholder="Observações adicionais (opcional)"
                      value={newReceita.observacoes || ""}
                      onChange={(e) => setNewReceita({ ...newReceita, observacoes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitReceita}>
                    {editingReceita ? "Salvar Alterações" : "Cadastrar Receita"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitas.map((receita) => (
                      <TableRow key={receita.id}>
                        <TableCell>
                          {format(new Date(receita.data_entrada), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{getTipoReceitaLabel(receita.tipo_receita)}</TableCell>
                        <TableCell>{receita.origem}</TableCell>
                        <TableCell className="max-w-xs truncate">{receita.descricao}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(receita.valor)}</TableCell>
                        <TableCell>{getStatusBadge(receita.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingReceita(receita);
                                setNewReceita(receita);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReceita(receita.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projetos Tab */}
        <TabsContent value="projetos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestão de Projetos</h2>
            <Dialog open={projetoDialogOpen} onOpenChange={setProjetoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingProjeto(null);
                  setNewProjeto({
                    titulo: "",
                    proponente: "",
                    area_atuacao: "educacao_ambiental",
                    valor_solicitado: 0,
                    prazo_execucao: 12,
                    descricao: "",
                    objetivos: ""
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProjeto ? "Editar Projeto" : "Cadastrar Novo Projeto"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha as informações do projeto ambiental para análise e aprovação do CODEMA.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Projeto</Label>
                    <Input
                      placeholder="Nome do projeto"
                      value={newProjeto.titulo}
                      onChange={(e) => setNewProjeto({ ...newProjeto, titulo: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proponente">Proponente</Label>
                      <Input
                        placeholder="Nome da pessoa ou organização"
                        value={newProjeto.proponente}
                        onChange={(e) => setNewProjeto({ ...newProjeto, proponente: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                      <Input
                        placeholder="000.000.000-00"
                        value={newProjeto.cpf_cnpj_proponente || ""}
                        onChange={(e) => setNewProjeto({ ...newProjeto, cpf_cnpj_proponente: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Área de Atuação</Label>
                      <Select
                        value={newProjeto.area_atuacao}
                        onValueChange={(value) => setNewProjeto({ ...newProjeto, area_atuacao: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor Solicitado (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newProjeto.valor_solicitado}
                        onChange={(e) => setNewProjeto({ ...newProjeto, valor_solicitado: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prazo">Prazo (meses)</Label>
                      <Input
                        type="number"
                        placeholder="12"
                        value={newProjeto.prazo_execucao}
                        onChange={(e) => setNewProjeto({ ...newProjeto, prazo_execucao: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="objetivos">Objetivos</Label>
                    <Textarea
                      placeholder="Descreva os objetivos do projeto"
                      rows={3}
                      value={newProjeto.objetivos}
                      onChange={(e) => setNewProjeto({ ...newProjeto, objetivos: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição Detalhada</Label>
                    <Textarea
                      placeholder="Descreva detalhadamente o projeto"
                      rows={4}
                      value={newProjeto.descricao}
                      onChange={(e) => setNewProjeto({ ...newProjeto, descricao: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_inicio">Data de Início Prevista</Label>
                      <Input
                        type="date"
                        value={newProjeto.data_inicio_prevista || ""}
                        onChange={(e) => setNewProjeto({ ...newProjeto, data_inicio_prevista: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_fim">Data de Término Prevista</Label>
                      <Input
                        type="date"
                        value={newProjeto.data_fim_prevista || ""}
                        onChange={(e) => setNewProjeto({ ...newProjeto, data_fim_prevista: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      placeholder="Observações adicionais (opcional)"
                      value={newProjeto.observacoes || ""}
                      onChange={(e) => setNewProjeto({ ...newProjeto, observacoes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setProjetoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitProjeto}>
                    {editingProjeto ? "Salvar Alterações" : "Cadastrar Projeto"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {projetos.map((projeto) => (
              <Card key={projeto.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
                      <CardDescription>
                        Proponente: {projeto.proponente} | Área: {getAreaAtuacaoLabel(projeto.area_atuacao)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(projeto.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProjeto(projeto);
                          setNewProjeto(projeto);
                          setProjetoDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProjeto(projeto.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Valor Solicitado</p>
                      <p className="text-lg font-bold">{formatCurrency(projeto.valor_solicitado)}</p>
                    </div>
                    {projeto.valor_aprovado && (
                      <div>
                        <p className="text-sm font-medium">Valor Aprovado</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(projeto.valor_aprovado)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Prazo</p>
                      <p className="text-lg font-bold">{projeto.prazo_execucao} meses</p>
                    </div>
                    {projeto.percentual_execucao !== undefined && (
                      <div>
                        <p className="text-sm font-medium">Execução</p>
                        <div className="flex items-center gap-2">
                          <Progress value={projeto.percentual_execucao} className="w-20" />
                          <span className="text-sm font-bold">{projeto.percentual_execucao}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Visualize e exporte relatórios detalhados do FMA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de Receitas:</span>
                      <span className="font-semibold">{formatCurrency(dashboardData.totalReceitas)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Comprometido:</span>
                      <span className="font-semibold">{formatCurrency(dashboardData.totalProjetos)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Saldo Disponível:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(dashboardData.saldoDisponivel)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Distribuição por Tipo de Receita</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(
                      receitas.reduce((acc, r) => {
                        const tipo = getTipoReceitaLabel(r.tipo_receita);
                        acc[tipo] = (acc[tipo] || 0) + r.valor;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([tipo, valor]) => (
                      <div key={tipo} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{tipo}:</span>
                        <span className="font-semibold">{formatCurrency(valor)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório Mensal
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório Anual
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar para Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FMA;