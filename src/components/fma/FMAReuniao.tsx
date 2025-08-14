import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Calendar,
  Users,
  FileText,
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Plus,
  Trash,
  Edit,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Pause,
  DollarSign,
  Briefcase,
  ChevronRight,
  Info,
  Send,
  FileCheck,
  Vote
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useReunioes } from "@/hooks/useReunioes";
import { useConselheiros } from "@/hooks/useConselheiros";

interface ProjetoReuniao {
  id?: string;
  projeto_id: string;
  reuniao_id: string;
  ordem_pauta?: number;
  relator_id?: string;
  parecer_tecnico?: string;
  parecer_financeiro?: string;
  recomendacoes?: string;
  status: 'pendente' | 'em_analise' | 'discutido' | 'votado';
  decisao?: 'aprovado' | 'aprovado_ressalvas' | 'rejeitado' | 'devolvido_ajustes';
  votos_favoraveis?: number;
  votos_contrarios?: number;
  abstencoes?: number;
  valor_aprovado?: number;
  prazo_aprovado?: number;
  condicoes_aprovacao?: string;
  justificativa_decisao?: string;
  data_discussao?: string;
  ata_referencia?: string;
  created_at?: string;
  updated_at?: string;
}

interface FMAReuniaoProps {
  projeto: any;
  canManage?: boolean;
}

const FMAReuniao: React.FC<FMAReuniaoProps> = ({ projeto, canManage = false }) => {
  const { reunioes, buscarReunioes } = useReunioes();
  const { conselheiros, buscarConselheiros } = useConselheiros();
  
  const [projetosReuniao, setProjetosReuniao] = useState<ProjetoReuniao[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVotacaoDialog, setShowVotacaoDialog] = useState(false);
  const [showParecerDialog, setShowParecerDialog] = useState(false);
  const [selectedReuniao, setSelectedReuniao] = useState<string>("");
  const [selectedRelator, setSelectedRelator] = useState<string>("");
  const [activeTab, setActiveTab] = useState("historico");

  const [novoProjeto, setNovoProjeto] = useState<ProjetoReuniao>({
    projeto_id: projeto.id,
    reuniao_id: "",
    status: 'pendente'
  });

  const [votacao, setVotacao] = useState({
    reuniao_id: "",
    votos_favoraveis: 0,
    votos_contrarios: 0,
    abstencoes: 0,
    decisao: 'aprovado' as const,
    valor_aprovado: projeto.valor_solicitado,
    prazo_aprovado: projeto.prazo_execucao,
    justificativa_decisao: "",
    condicoes_aprovacao: ""
  });

  const [parecer, setParecer] = useState({
    reuniao_id: "",
    parecer_tecnico: "",
    parecer_financeiro: "",
    recomendacoes: ""
  });

  useEffect(() => {
    buscarReunioes();
    buscarConselheiros();
    fetchProjetosReuniao();
  }, [projeto.id]);

  const fetchProjetosReuniao = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fma_projetos_reunioes')
        .select(`
          *,
          reuniao:reunioes(*),
          relator:profiles(*)
        `)
        .eq('projeto_id', projeto.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetosReuniao(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos em reuniões:', error);
      toast.error('Erro ao carregar histórico de reuniões');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarPauta = async () => {
    if (!selectedReuniao) {
      toast.error('Selecione uma reunião');
      return;
    }

    try {
      const projetoData = {
        ...novoProjeto,
        reuniao_id: selectedReuniao,
        relator_id: selectedRelator || null
      };

      const { error } = await supabase
        .from('fma_projetos_reunioes')
        .insert(projetoData);

      if (error) throw error;

      toast.success('Projeto adicionado à pauta');
      setShowAddDialog(false);
      setSelectedReuniao("");
      setSelectedRelator("");
      fetchProjetosReuniao();
    } catch (error) {
      console.error('Erro ao adicionar projeto à pauta:', error);
      toast.error('Erro ao adicionar projeto à pauta');
    }
  };

  const handleRegistrarVotacao = async () => {
    if (!votacao.reuniao_id) {
      toast.error('Selecione a reunião');
      return;
    }

    const total = votacao.votos_favoraveis + votacao.votos_contrarios + votacao.abstencoes;
    if (total === 0) {
      toast.error('Registre pelo menos um voto');
      return;
    }

    try {
      // Atualizar projeto na reunião
      const { error: reuniaoError } = await supabase
        .from('fma_projetos_reunioes')
        .update({
          status: 'votado',
          decisao: votacao.decisao,
          votos_favoraveis: votacao.votos_favoraveis,
          votos_contrarios: votacao.votos_contrarios,
          abstencoes: votacao.abstencoes,
          valor_aprovado: votacao.valor_aprovado,
          prazo_aprovado: votacao.prazo_aprovado,
          justificativa_decisao: votacao.justificativa_decisao,
          condicoes_aprovacao: votacao.condicoes_aprovacao,
          data_discussao: new Date().toISOString()
        })
        .eq('projeto_id', projeto.id)
        .eq('reuniao_id', votacao.reuniao_id);

      if (reuniaoError) throw reuniaoError;

      // Atualizar status do projeto principal
      if (votacao.decisao === 'aprovado' || votacao.decisao === 'aprovado_ressalvas') {
        const { error: projetoError } = await supabase
          .from('fma_projetos')
          .update({
            status: 'aprovado',
            valor_aprovado: votacao.valor_aprovado,
            reuniao_aprovacao_id: votacao.reuniao_id
          })
          .eq('id', projeto.id);

        if (projetoError) throw projetoError;
      } else if (votacao.decisao === 'rejeitado') {
        const { error: projetoError } = await supabase
          .from('fma_projetos')
          .update({
            status: 'rejeitado',
            reuniao_aprovacao_id: votacao.reuniao_id
          })
          .eq('id', projeto.id);

        if (projetoError) throw projetoError;
      }

      toast.success('Votação registrada com sucesso');
      setShowVotacaoDialog(false);
      setVotacao({
        reuniao_id: "",
        votos_favoraveis: 0,
        votos_contrarios: 0,
        abstencoes: 0,
        decisao: 'aprovado',
        valor_aprovado: projeto.valor_solicitado,
        prazo_aprovado: projeto.prazo_execucao,
        justificativa_decisao: "",
        condicoes_aprovacao: ""
      });
      fetchProjetosReuniao();
    } catch (error) {
      console.error('Erro ao registrar votação:', error);
      toast.error('Erro ao registrar votação');
    }
  };

  const handleSalvarParecer = async () => {
    if (!parecer.reuniao_id) {
      toast.error('Selecione a reunião');
      return;
    }

    try {
      const { error } = await supabase
        .from('fma_projetos_reunioes')
        .update({
          parecer_tecnico: parecer.parecer_tecnico,
          parecer_financeiro: parecer.parecer_financeiro,
          recomendacoes: parecer.recomendacoes,
          status: 'em_analise'
        })
        .eq('projeto_id', projeto.id)
        .eq('reuniao_id', parecer.reuniao_id);

      if (error) throw error;

      toast.success('Parecer salvo com sucesso');
      setShowParecerDialog(false);
      setParecer({
        reuniao_id: "",
        parecer_tecnico: "",
        parecer_financeiro: "",
        recomendacoes: ""
      });
      fetchProjetosReuniao();
    } catch (error) {
      console.error('Erro ao salvar parecer:', error);
      toast.error('Erro ao salvar parecer');
    }
  };

  const handleRemoverPauta = async (reuniao_id: string) => {
    if (!confirm('Deseja remover este projeto da pauta?')) return;

    try {
      const { error } = await supabase
        .from('fma_projetos_reunioes')
        .delete()
        .eq('projeto_id', projeto.id)
        .eq('reuniao_id', reuniao_id);

      if (error) throw error;

      toast.success('Projeto removido da pauta');
      fetchProjetosReuniao();
    } catch (error) {
      console.error('Erro ao remover projeto da pauta:', error);
      toast.error('Erro ao remover projeto da pauta');
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
      pendente: { label: 'Pendente', variant: 'outline' as const, icon: Clock },
      em_analise: { label: 'Em Análise', variant: 'default' as const, icon: Eye },
      discutido: { label: 'Discutido', variant: 'secondary' as const, icon: MessageSquare },
      votado: { label: 'Votado', variant: 'success' as const, icon: CheckCircle }
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

  const getDecisaoBadge = (decisao: string) => {
    const decisaoConfig = {
      aprovado: { label: 'Aprovado', variant: 'success' as const, icon: CheckCircle },
      aprovado_ressalvas: { label: 'Aprovado com Ressalvas', variant: 'warning' as const, icon: AlertTriangle },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
      devolvido_ajustes: { label: 'Devolvido para Ajustes', variant: 'secondary' as const, icon: Edit }
    };

    const config = decisaoConfig[decisao as keyof typeof decisaoConfig] || { 
      label: decisao, 
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

  // Filtrar reuniões futuras ou em andamento
  const reunioesFuturas = reunioes.filter(r => 
    new Date(r.data_reuniao) >= new Date() || r.status === 'em_andamento'
  );

  // Verificar se projeto já está aprovado
  const isAprovado = projeto.status === 'aprovado' || projeto.status === 'em_execucao' || projeto.status === 'concluido';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tramitação em Reuniões
              </CardTitle>
              <CardDescription>
                Acompanhamento do projeto nas reuniões do CODEMA
              </CardDescription>
            </div>
            
            {canManage && !isAprovado && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar à Pauta
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Status do Projeto */}
      {isAprovado && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Projeto Aprovado</AlertTitle>
          <AlertDescription>
            Este projeto foi aprovado em reunião do CODEMA com valor de {formatCurrency(projeto.valor_aprovado || 0)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="proximas">Próximas Reuniões</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          {projetosReuniao.length > 0 ? (
            projetosReuniao.map((pr) => (
              <Card key={pr.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Reunião #{pr.reuniao?.numero_reuniao || 'N/A'}
                      </CardTitle>
                      <CardDescription>
                        {pr.reuniao?.data_reuniao && 
                          format(new Date(pr.reuniao.data_reuniao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        }
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(pr.status)}
                      {pr.decisao && getDecisaoBadge(pr.decisao)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Ordem na Pauta:</span>
                      <span className="ml-2 font-medium">{pr.ordem_pauta || 'N/A'}º item</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Relator:</span>
                      <span className="ml-2 font-medium">{pr.relator?.full_name || 'Não designado'}</span>
                    </div>
                  </div>
                  
                  {pr.parecer_tecnico && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Parecer Técnico:</p>
                      <p className="text-sm text-muted-foreground">{pr.parecer_tecnico}</p>
                    </div>
                  )}
                  
                  {pr.parecer_financeiro && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Parecer Financeiro:</p>
                      <p className="text-sm text-muted-foreground">{pr.parecer_financeiro}</p>
                    </div>
                  )}
                  
                  {pr.recomendacoes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Recomendações:</p>
                      <p className="text-sm text-blue-900">{pr.recomendacoes}</p>
                    </div>
                  )}
                  
                  {pr.status === 'votado' && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Resultado da Votação:</p>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{pr.votos_favoraveis} favoráveis</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{pr.votos_contrarios} contrários</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Pause className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{pr.abstencoes} abstenções</span>
                        </div>
                      </div>
                      
                      {pr.valor_aprovado && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Valor Aprovado:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              {formatCurrency(pr.valor_aprovado)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prazo Aprovado:</span>
                            <span className="ml-2 font-medium">{pr.prazo_aprovado} meses</span>
                          </div>
                        </div>
                      )}
                      
                      {pr.justificativa_decisao && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Justificativa da Decisão:</p>
                          <p className="text-sm">{pr.justificativa_decisao}</p>
                        </div>
                      )}
                      
                      {pr.condicoes_aprovacao && (
                        <Alert className="mt-3">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Condições de Aprovação</AlertTitle>
                          <AlertDescription>{pr.condicoes_aprovacao}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  
                  {canManage && pr.status === 'pendente' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setParecer({
                            reuniao_id: pr.reuniao_id,
                            parecer_tecnico: pr.parecer_tecnico || "",
                            parecer_financeiro: pr.parecer_financeiro || "",
                            recomendacoes: pr.recomendacoes || ""
                          });
                          setShowParecerDialog(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Adicionar Parecer
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setVotacao({
                            ...votacao,
                            reuniao_id: pr.reuniao_id,
                            valor_aprovado: projeto.valor_solicitado,
                            prazo_aprovado: projeto.prazo_execucao
                          });
                          setShowVotacaoDialog(true);
                        }}
                      >
                        <Gavel className="h-3 w-3 mr-1" />
                        Registrar Votação
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoverPauta(pr.reuniao_id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Este projeto ainda não foi incluído em nenhuma reunião
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="proximas" className="space-y-4">
          {reunioesFuturas.length > 0 ? (
            <div className="space-y-4">
              {reunioesFuturas.map((reuniao) => (
                <Card key={reuniao.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">
                          Reunião #{reuniao.numero_reuniao}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(reuniao.data_reuniao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {reuniao.tipo === 'ordinaria' ? 'Ordinária' : 'Extraordinária'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {canManage && !isAprovado && (
                    <CardContent>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedReuniao(reuniao.id);
                          setShowAddDialog(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar a Esta Reunião
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma reunião futura agendada
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Adicionar à Pauta */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Projeto à Pauta</DialogTitle>
            <DialogDescription>
              Inclua este projeto na pauta de uma reunião para aprovação
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reunião</Label>
              <Select value={selectedReuniao} onValueChange={setSelectedReuniao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a reunião" />
                </SelectTrigger>
                <SelectContent>
                  {reunioesFuturas.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      Reunião #{r.numero_reuniao} - {format(new Date(r.data_reuniao), "dd/MM/yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Relator (opcional)</Label>
              <Select value={selectedRelator} onValueChange={setSelectedRelator}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o relator" />
                </SelectTrigger>
                <SelectContent>
                  {conselheiros
                    .filter(c => c.status === 'ativo')
                    .map(c => (
                      <SelectItem key={c.id} value={c.user_id || c.id}>
                        {c.nome} - {c.tipo === 'titular' ? 'Titular' : 'Suplente'}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informações do Projeto</AlertTitle>
              <AlertDescription>
                Valor Solicitado: {formatCurrency(projeto.valor_solicitado)}<br />
                Prazo de Execução: {projeto.prazo_execucao} meses<br />
                Área de Atuação: {projeto.area_atuacao}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionarPauta} disabled={loading}>
                Adicionar à Pauta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Registrar Votação */}
      <Dialog open={showVotacaoDialog} onOpenChange={setShowVotacaoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Votação</DialogTitle>
            <DialogDescription>
              Registre o resultado da votação do projeto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Favoráveis</Label>
                <Input
                  type="number"
                  min="0"
                  value={votacao.votos_favoraveis}
                  onChange={(e) => setVotacao({
                    ...votacao,
                    votos_favoraveis: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div>
                <Label>Contrários</Label>
                <Input
                  type="number"
                  min="0"
                  value={votacao.votos_contrarios}
                  onChange={(e) => setVotacao({
                    ...votacao,
                    votos_contrarios: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div>
                <Label>Abstenções</Label>
                <Input
                  type="number"
                  min="0"
                  value={votacao.abstencoes}
                  onChange={(e) => setVotacao({
                    ...votacao,
                    abstencoes: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label>Decisão</Label>
              <Select 
                value={votacao.decisao} 
                onValueChange={(value: any) => setVotacao({ ...votacao, decisao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="aprovado_ressalvas">Aprovado com Ressalvas</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="devolvido_ajustes">Devolvido para Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(votacao.decisao === 'aprovado' || votacao.decisao === 'aprovado_ressalvas') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Aprovado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={votacao.valor_aprovado}
                    onChange={(e) => setVotacao({
                      ...votacao,
                      valor_aprovado: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div>
                  <Label>Prazo Aprovado (meses)</Label>
                  <Input
                    type="number"
                    value={votacao.prazo_aprovado}
                    onChange={(e) => setVotacao({
                      ...votacao,
                      prazo_aprovado: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            )}
            
            {votacao.decisao === 'aprovado_ressalvas' && (
              <div>
                <Label>Condições de Aprovação</Label>
                <Textarea
                  placeholder="Descreva as condições para aprovação..."
                  value={votacao.condicoes_aprovacao}
                  onChange={(e) => setVotacao({ ...votacao, condicoes_aprovacao: e.target.value })}
                  rows={3}
                />
              </div>
            )}
            
            <div>
              <Label>Justificativa da Decisão</Label>
              <Textarea
                placeholder="Justifique a decisão tomada..."
                value={votacao.justificativa_decisao}
                onChange={(e) => setVotacao({ ...votacao, justificativa_decisao: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVotacaoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegistrarVotacao} disabled={loading}>
                Registrar Votação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar Parecer */}
      <Dialog open={showParecerDialog} onOpenChange={setShowParecerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Pareceres</DialogTitle>
            <DialogDescription>
              Registre os pareceres técnico e financeiro sobre o projeto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Parecer Técnico</Label>
              <Textarea
                placeholder="Análise técnica do projeto..."
                value={parecer.parecer_tecnico}
                onChange={(e) => setParecer({ ...parecer, parecer_tecnico: e.target.value })}
                rows={4}
              />
            </div>
            
            <div>
              <Label>Parecer Financeiro</Label>
              <Textarea
                placeholder="Análise financeira e orçamentária..."
                value={parecer.parecer_financeiro}
                onChange={(e) => setParecer({ ...parecer, parecer_financeiro: e.target.value })}
                rows={4}
              />
            </div>
            
            <div>
              <Label>Recomendações</Label>
              <Textarea
                placeholder="Recomendações e observações..."
                value={parecer.recomendacoes}
                onChange={(e) => setParecer({ ...parecer, recomendacoes: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowParecerDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarParecer} disabled={loading}>
                Salvar Pareceres
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FMAReuniao;