import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  FileText,
  Upload,
  Download,
  Check,
  X,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileCheck,
  FileX,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  Calculator,
  FileSpreadsheet
} from "lucide-react";
import { format, differenceInDays, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Despesa {
  id?: string;
  projeto_id: string;
  tipo_despesa: 'material' | 'servico' | 'pessoal' | 'equipamento' | 'outros';
  fornecedor: string;
  cnpj_fornecedor?: string;
  descricao: string;
  valor: number;
  data_despesa: string;
  numero_nota_fiscal?: string;
  comprovante_url?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'em_analise';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

interface PrestacaoContasData {
  id?: string;
  projeto_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  valor_executado: number;
  saldo_periodo: number;
  percentual_execucao: number;
  status: 'em_elaboracao' | 'submetida' | 'em_analise' | 'aprovada' | 'rejeitada' | 'com_ressalvas';
  relatorio_narrativo?: string;
  justificativas?: string;
  parecer_tecnico?: string;
  parecer_financeiro?: string;
  data_submissao?: string;
  data_analise?: string;
  data_aprovacao?: string;
  responsavel_analise_id?: string;
  anexos?: string[];
  despesas?: Despesa[];
  created_at?: string;
  updated_at?: string;
}

interface PrestacaoContasProps {
  projeto: any;
  canManage?: boolean;
}

const PrestacaoContas: React.FC<PrestacaoContasProps> = ({ projeto, canManage = false }) => {
  const [prestacoes, setPrestacoes] = useState<PrestacaoContasData[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewPrestacao, setShowNewPrestacao] = useState(false);
  const [showNewDespesa, setShowNewDespesa] = useState(false);
  const [selectedPrestacao, setSelectedPrestacao] = useState<PrestacaoContasData | null>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");

  const [newPrestacao, setNewPrestacao] = useState<PrestacaoContasData>({
    projeto_id: projeto.id,
    periodo_inicio: "",
    periodo_fim: "",
    valor_executado: 0,
    saldo_periodo: 0,
    percentual_execucao: 0,
    status: 'em_elaboracao'
  });

  const [newDespesa, setNewDespesa] = useState<Despesa>({
    projeto_id: projeto.id,
    tipo_despesa: 'material',
    fornecedor: "",
    descricao: "",
    valor: 0,
    data_despesa: "",
    status: 'pendente'
  });

  useEffect(() => {
    fetchPrestacoes();
    fetchDespesas();
  }, [projeto.id]);

  const fetchPrestacoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fma_prestacao_contas')
        .select('*')
        .eq('projeto_id', projeto.id)
        .order('periodo_inicio', { ascending: false });

      if (error) throw error;
      setPrestacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar prestações de contas:', error);
      toast.error('Erro ao carregar prestações de contas');
    } finally {
      setLoading(false);
    }
  };

  const fetchDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('fma_despesas')
        .select('*')
        .eq('projeto_id', projeto.id)
        .order('data_despesa', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    }
  };

  const handleSubmitPrestacao = async () => {
    try {
      const valorExecutado = despesas
        .filter(d => d.status === 'aprovada')
        .reduce((sum, d) => sum + d.valor, 0);

      const prestacaoData = {
        ...newPrestacao,
        valor_executado: valorExecutado,
        saldo_periodo: (projeto.valor_aprovado || 0) - valorExecutado,
        percentual_execucao: ((valorExecutado / (projeto.valor_aprovado || 1)) * 100),
        data_submissao: new Date().toISOString()
      };

      const { error } = await supabase
        .from('fma_prestacao_contas')
        .insert(prestacaoData);

      if (error) throw error;

      toast.success('Prestação de contas submetida com sucesso!');
      setShowNewPrestacao(false);
      fetchPrestacoes();
    } catch (error) {
      console.error('Erro ao submeter prestação:', error);
      toast.error('Erro ao submeter prestação de contas');
    }
  };

  const handleSubmitDespesa = async () => {
    try {
      const { error } = await supabase
        .from('fma_despesas')
        .insert(newDespesa);

      if (error) throw error;

      toast.success('Despesa registrada com sucesso!');
      setShowNewDespesa(false);
      setNewDespesa({
        projeto_id: projeto.id,
        tipo_despesa: 'material',
        fornecedor: "",
        descricao: "",
        valor: 0,
        data_despesa: "",
        status: 'pendente'
      });
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      toast.error('Erro ao registrar despesa');
    }
  };

  const handleApproveDespesa = async (despesaId: string) => {
    try {
      const { error } = await supabase
        .from('fma_despesas')
        .update({ status: 'aprovada' })
        .eq('id', despesaId);

      if (error) throw error;
      toast.success('Despesa aprovada');
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao aprovar despesa:', error);
      toast.error('Erro ao aprovar despesa');
    }
  };

  const handleRejectDespesa = async (despesaId: string) => {
    try {
      const { error } = await supabase
        .from('fma_despesas')
        .update({ status: 'rejeitada' })
        .eq('id', despesaId);

      if (error) throw error;
      toast.success('Despesa rejeitada');
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao rejeitar despesa:', error);
      toast.error('Erro ao rejeitar despesa');
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
      em_elaboracao: { label: 'Em Elaboração', variant: 'secondary' as const, icon: Edit },
      submetida: { label: 'Submetida', variant: 'default' as const, icon: FileText },
      em_analise: { label: 'Em Análise', variant: 'default' as const, icon: Eye },
      aprovada: { label: 'Aprovada', variant: 'success' as const, icon: CheckCircle },
      rejeitada: { label: 'Rejeitada', variant: 'destructive' as const, icon: XCircle },
      com_ressalvas: { label: 'Com Ressalvas', variant: 'warning' as const, icon: AlertTriangle }
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

  const getTipoDespesaLabel = (tipo: string) => {
    const tipos = {
      material: 'Material',
      servico: 'Serviço',
      pessoal: 'Pessoal',
      equipamento: 'Equipamento',
      outros: 'Outros'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  // Calcular métricas
  const totalExecutado = despesas
    .filter(d => d.status === 'aprovada')
    .reduce((sum, d) => sum + d.valor, 0);

  const totalPendente = despesas
    .filter(d => d.status === 'pendente')
    .reduce((sum, d) => sum + d.valor, 0);

  const percentualGasto = projeto.valor_aprovado 
    ? (totalExecutado / projeto.valor_aprovado) * 100 
    : 0;

  const saldoDisponivel = (projeto.valor_aprovado || 0) - totalExecutado;

  // Calcular prazo restante
  const prazoRestante = projeto.data_fim_prevista 
    ? differenceInDays(new Date(projeto.data_fim_prevista), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Prestação de Contas
              </CardTitle>
              <CardDescription>
                Acompanhamento financeiro e prestação de contas do projeto
              </CardDescription>
            </div>
            
            {canManage && (
              <div className="flex gap-2">
                <Button onClick={() => setShowNewDespesa(true)} variant="outline">
                  <Receipt className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
                <Button onClick={() => setShowNewPrestacao(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Prestação
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Aprovado</p>
                <p className="text-2xl font-bold">{formatCurrency(projeto.valor_aprovado || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExecutado)}</p>
                <Progress value={percentualGasto} className="mt-2" />
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(saldoDisponivel)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prazo Restante</p>
                <p className="text-2xl font-bold">
                  {prazoRestante !== null ? `${prazoRestante} dias` : 'N/A'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="prestacoes">Prestações</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4">
          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas Aprovadas</p>
                    <p className="text-lg font-semibold text-green-600">
                      {despesas.filter(d => d.status === 'aprovada').length} itens
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas Pendentes</p>
                    <p className="text-lg font-semibold text-yellow-600">
                      {despesas.filter(d => d.status === 'pendente').length} itens
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Distribuição por Tipo de Despesa</p>
                  <div className="space-y-2">
                    {['material', 'servico', 'pessoal', 'equipamento', 'outros'].map(tipo => {
                      const totalTipo = despesas
                        .filter(d => d.tipo_despesa === tipo && d.status === 'aprovada')
                        .reduce((sum, d) => sum + d.valor, 0);
                      const percentTipo = totalExecutado > 0 ? (totalTipo / totalExecutado) * 100 : 0;
                      
                      return (
                        <div key={tipo} className="flex items-center justify-between">
                          <span className="text-sm">{getTipoDespesaLabel(tipo)}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={percentTipo} className="w-24" />
                            <span className="text-sm font-medium w-20 text-right">
                              {formatCurrency(totalTipo)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alertas */}
                {percentualGasto > 80 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção ao Orçamento</AlertTitle>
                    <AlertDescription>
                      Já foram executados {percentualGasto.toFixed(1)}% do valor aprovado.
                    </AlertDescription>
                  </Alert>
                )}

                {prazoRestante !== null && prazoRestante < 30 && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Prazo Próximo</AlertTitle>
                    <AlertDescription>
                      Restam apenas {prazoRestante} dias para conclusão do projeto.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>NF</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell>
                        {format(new Date(despesa.data_despesa), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getTipoDespesaLabel(despesa.tipo_despesa)}</TableCell>
                      <TableCell>{despesa.fornecedor}</TableCell>
                      <TableCell className="max-w-xs truncate">{despesa.descricao}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(despesa.valor)}</TableCell>
                      <TableCell>{despesa.numero_nota_fiscal || '-'}</TableCell>
                      <TableCell>{getStatusBadge(despesa.status)}</TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-1">
                            {despesa.status === 'pendente' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveDespesa(despesa.id!)}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectDespesa(despesa.id!)}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prestacoes" className="space-y-4">
          {prestacoes.map((prestacao) => (
            <Card key={prestacao.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Período: {format(new Date(prestacao.periodo_inicio), "dd/MM/yyyy")} a{" "}
                      {format(new Date(prestacao.periodo_fim), "dd/MM/yyyy")}
                    </CardTitle>
                    <CardDescription>
                      Prestação de contas do período
                    </CardDescription>
                  </div>
                  {getStatusBadge(prestacao.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Executado</p>
                    <p className="text-lg font-semibold">{formatCurrency(prestacao.valor_executado)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo do Período</p>
                    <p className="text-lg font-semibold">{formatCurrency(prestacao.saldo_periodo)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Execução</p>
                    <div className="flex items-center gap-2">
                      <Progress value={prestacao.percentual_execucao} className="flex-1" />
                      <span className="text-sm font-semibold">{prestacao.percentual_execucao.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {prestacao.relatorio_narrativo && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Relatório Narrativo</p>
                    <p className="text-sm text-muted-foreground">{prestacao.relatorio_narrativo}</p>
                  </div>
                )}

                {canManage && prestacao.status === 'submetida' && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileCheck className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileX className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Solicitar Ajustes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {prestacoes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma prestação de contas registrada
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Nova Despesa */}
      <Dialog open={showNewDespesa} onOpenChange={setShowNewDespesa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nova Despesa</DialogTitle>
            <DialogDescription>
              Registre uma despesa realizada no projeto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Despesa</Label>
                <Select 
                  value={newDespesa.tipo_despesa}
                  onValueChange={(value: any) => setNewDespesa({...newDespesa, tipo_despesa: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                    <SelectItem value="equipamento">Equipamento</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data da Despesa</Label>
                <Input
                  type="date"
                  value={newDespesa.data_despesa}
                  onChange={(e) => setNewDespesa({...newDespesa, data_despesa: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fornecedor</Label>
                <Input
                  value={newDespesa.fornecedor}
                  onChange={(e) => setNewDespesa({...newDespesa, fornecedor: e.target.value})}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <Label>CNPJ/CPF</Label>
                <Input
                  value={newDespesa.cnpj_fornecedor || ''}
                  onChange={(e) => setNewDespesa({...newDespesa, cnpj_fornecedor: e.target.value})}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newDespesa.valor}
                  onChange={(e) => setNewDespesa({...newDespesa, valor: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Número da NF</Label>
                <Input
                  value={newDespesa.numero_nota_fiscal || ''}
                  onChange={(e) => setNewDespesa({...newDespesa, numero_nota_fiscal: e.target.value})}
                  placeholder="Número da nota fiscal"
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={newDespesa.descricao}
                onChange={(e) => setNewDespesa({...newDespesa, descricao: e.target.value})}
                placeholder="Descrição detalhada da despesa"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewDespesa(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitDespesa}>
                Registrar Despesa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Prestação */}
      <Dialog open={showNewPrestacao} onOpenChange={setShowNewPrestacao}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Prestação de Contas</DialogTitle>
            <DialogDescription>
              Submeta a prestação de contas do período
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Período Início</Label>
                <Input
                  type="date"
                  value={newPrestacao.periodo_inicio}
                  onChange={(e) => setNewPrestacao({...newPrestacao, periodo_inicio: e.target.value})}
                />
              </div>

              <div>
                <Label>Período Fim</Label>
                <Input
                  type="date"
                  value={newPrestacao.periodo_fim}
                  onChange={(e) => setNewPrestacao({...newPrestacao, periodo_fim: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Relatório Narrativo</Label>
              <Textarea
                value={newPrestacao.relatorio_narrativo || ''}
                onChange={(e) => setNewPrestacao({...newPrestacao, relatorio_narrativo: e.target.value})}
                placeholder="Descreva as atividades realizadas no período..."
                rows={6}
              />
            </div>

            <div>
              <Label>Justificativas (se houver desvios)</Label>
              <Textarea
                value={newPrestacao.justificativas || ''}
                onChange={(e) => setNewPrestacao({...newPrestacao, justificativas: e.target.value})}
                placeholder="Justifique eventuais desvios do planejado..."
                rows={4}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informação</AlertTitle>
              <AlertDescription>
                Ao submeter esta prestação, todas as despesas do período serão incluídas automaticamente.
                Valor total a ser reportado: {formatCurrency(totalExecutado)}
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewPrestacao(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitPrestacao}>
                Submeter Prestação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrestacaoContas;