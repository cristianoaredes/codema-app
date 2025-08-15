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
  Archive,
  ChevronUp,
  ChevronDown,
  BarChart3,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";
import { useOuvidoriaReunioes, type VotacaoDenuncia } from "@/hooks/useOuvidoriaReunioes";
import { useReunioes } from "@/hooks/useReunioes";
import { useConselheiros } from "@/hooks/useConselheiros";

interface DenunciaReuniaoProps {
  denuncia: Denuncia;
  canManage?: boolean;
}

const DenunciaReuniao: React.FC<DenunciaReuniaoProps> = ({
  denuncia,
  canManage = false
}) => {
  const {
    loading,
    denunciasReuniao,
    adicionarDenunciaPauta,
    buscarReunioesDenuncia,
    registrarVotacao,
    atualizarParecer,
    removerDenunciaPauta,
    buscarEstatisticas
  } = useOuvidoriaReunioes();

  const { reunioes, buscarReunioes } = useReunioes();
  const { conselheiros, buscarConselheiros } = useConselheiros();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVotacaoDialog, setShowVotacaoDialog] = useState(false);
  const [showParecerDialog, setShowParecerDialog] = useState(false);
  const [selectedReuniao, setSelectedReuniao] = useState<string>("");
  const [selectedRelator, setSelectedRelator] = useState<string>("");
  const [reunioesDenuncia, setReunioesDenuncia] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [parecer, setParecer] = useState("");
  const [votacao, setVotacao] = useState<VotacaoDenuncia>({
    denuncia_id: denuncia.id,
    reuniao_id: "",
    votos_favoraveis: 0,
    votos_contrarios: 0,
    abstencoes: 0,
    decisao: 'procedente',
    justificativa: ""
  });

  useEffect(() => {
    buscarReunioes();
    buscarConselheiros();
    loadReunioesDenuncia();
    loadEstatisticas();
  }, []);

  const loadReunioesDenuncia = async () => {
    const data = await buscarReunioesDenuncia(denuncia.id);
    setReunioesDenuncia(data);
  };

  const loadEstatisticas = async () => {
    const stats = await buscarEstatisticas();
    setEstatisticas(stats);
  };

  const handleAdicionarPauta = async () => {
    if (!selectedReuniao) {
      toast.error('Selecione uma reunião');
      return;
    }

    const result = await adicionarDenunciaPauta(
      denuncia.id,
      selectedReuniao,
      undefined,
      selectedRelator || undefined
    );

    if (result) {
      setShowAddDialog(false);
      setSelectedReuniao("");
      setSelectedRelator("");
      loadReunioesDenuncia();
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

    const result = await registrarVotacao(votacao);
    if (result) {
      setShowVotacaoDialog(false);
      setVotacao({
        denuncia_id: denuncia.id,
        reuniao_id: "",
        votos_favoraveis: 0,
        votos_contrarios: 0,
        abstencoes: 0,
        decisao: 'procedente',
        justificativa: ""
      });
      loadReunioesDenuncia();
    }
  };

  const handleAtualizarParecer = async () => {
    if (!selectedReuniao || !parecer) {
      toast.error('Preencha todos os campos');
      return;
    }

    const result = await atualizarParecer(
      denuncia.id,
      selectedReuniao,
      parecer
    );

    if (result) {
      setShowParecerDialog(false);
      setParecer("");
      setSelectedReuniao("");
      loadReunioesDenuncia();
    }
  };

  const handleRemoverPauta = async (reuniao_id: string) => {
    if (confirm('Deseja remover esta denúncia da pauta?')) {
      const result = await removerDenunciaPauta(denuncia.id, reuniao_id);
      if (result) {
        loadReunioesDenuncia();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>;
      case 'discutida':
        return <Badge variant="outline" className="text-blue-600">
          <MessageSquare className="h-3 w-3 mr-1" />
          Discutida
        </Badge>;
      case 'votada':
        return <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Votada
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDecisaoBadge = (decisao: string) => {
    switch (decisao) {
      case 'procedente':
        return <Badge variant="destructive">Procedente</Badge>;
      case 'improcedente':
        return <Badge variant="outline" className="text-green-600">Improcedente</Badge>;
      case 'diligencia':
        return <Badge variant="outline" className="text-orange-600">Diligência</Badge>;
      case 'arquivada':
        return <Badge variant="secondary">Arquivada</Badge>;
      default:
        return null;
    }
  };

  // Filtrar reuniões futuras ou em andamento
  const reunioesFuturas = reunioes.filter(r => 
    new Date(r.data_reuniao) >= new Date() || r.status === 'em_andamento'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Integração com Reuniões
              </CardTitle>
              <CardDescription>
                Acompanhe a tramitação desta denúncia nas reuniões do CODEMA
              </CardDescription>
            </div>
            
            {canManage && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar à Pauta
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas Rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total em Pautas</p>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{estatisticas.pendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Votadas</p>
                  <p className="text-2xl font-bold">{estatisticas.votadas}</p>
                </div>
                <Gavel className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Procedência</p>
                  <p className="text-2xl font-bold">
                    {estatisticas.votadas > 0 
                      ? Math.round((estatisticas.procedentes / estatisticas.votadas) * 100)
                      : 0}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico de Reuniões */}
      <Tabs defaultValue="historico" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="proximas">Próximas Reuniões</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          {reunioesDenuncia.length > 0 ? (
            reunioesDenuncia.map((rd) => (
              <Card key={rd.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Reunião #{rd.reuniao?.numero_reuniao || 'N/A'}
                      </CardTitle>
                      <CardDescription>
                        {rd.reuniao?.data_reuniao && 
                          format(new Date(rd.reuniao.data_reuniao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        }
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(rd.status)}
                      {rd.decisao && getDecisaoBadge(rd.decisao)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Ordem na Pauta:</span>
                      <span className="ml-2 font-medium">{rd.ordem_pauta || 'N/A'}º item</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Relator:</span>
                      <span className="ml-2 font-medium">{rd.relator?.full_name || 'Não designado'}</span>
                    </div>
                  </div>
                  
                  {rd.parecer && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Parecer do Relator:</p>
                      <p className="text-sm text-muted-foreground">{rd.parecer}</p>
                    </div>
                  )}
                  
                  {rd.status === 'votada' && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Resultado da Votação:</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{rd.votos_favoraveis} favoráveis</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{rd.votos_contrarios} contrários</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Pause className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{rd.abstencoes} abstenções</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {rd.observacoes && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Observações</AlertTitle>
                      <AlertDescription>{rd.observacoes}</AlertDescription>
                    </Alert>
                  )}
                  
                  {canManage && rd.status === 'pendente' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedReuniao(rd.reuniao_id);
                          setParecer(rd.parecer || "");
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
                            reuniao_id: rd.reuniao_id
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
                        onClick={() => handleRemoverPauta(rd.reuniao_id)}
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
                  Esta denúncia ainda não foi incluída em nenhuma reunião
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="proximas" className="space-y-4">
          {reunioesFuturas.length > 0 ? (
            reunioesFuturas.map((reuniao) => (
              <Card key={reuniao.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">
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
                
                {canManage && (
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
            ))
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
            <DialogTitle>Adicionar Denúncia à Pauta</DialogTitle>
            <DialogDescription>
              Inclua esta denúncia na pauta de uma reunião para discussão e votação
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Votação</DialogTitle>
            <DialogDescription>
              Registre o resultado da votação desta denúncia
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
                  <SelectItem value="procedente">Procedente</SelectItem>
                  <SelectItem value="improcedente">Improcedente</SelectItem>
                  <SelectItem value="diligencia">Diligência</SelectItem>
                  <SelectItem value="arquivada">Arquivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Justificativa (opcional)</Label>
              <Textarea
                placeholder="Justificativa da decisão..."
                value={votacao.justificativa}
                onChange={(e) => setVotacao({ ...votacao, justificativa: e.target.value })}
                rows={3}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Parecer do Relator</DialogTitle>
            <DialogDescription>
              Registre o parecer técnico sobre esta denúncia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Parecer</Label>
              <Textarea
                placeholder="Digite o parecer do relator..."
                value={parecer}
                onChange={(e) => setParecer(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowParecerDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAtualizarParecer} disabled={loading}>
                Salvar Parecer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DenunciaReuniao;