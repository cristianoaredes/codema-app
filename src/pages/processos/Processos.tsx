import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProcessos } from "@/hooks/useProcessos";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle as _CheckCircle,
  Eye,
  Edit,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProtocoloGenerator } from "@/utils/generators/protocoloGenerator";

const Processos = () => {
  const { user: _user, profile } = useAuth();
  const { toast } = useToast();
  const { processos, loading, createProcesso: createProcessoHook } = useProcessos();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showNewProcesso, setShowNewProcesso] = useState(false);
  const [conselheiros, setConselheiros] = useState<{ id: string; full_name: string; role: string }[]>([]);
  const [relatoresMap, setRelatoresMap] = useState<Record<string, string>>({});

  const [newProcesso, setNewProcesso] = useState({
    tipo_processo: "",
    requerente: "",
    cpf_cnpj: "",
    endereco_empreendimento: "",
    descricao_atividade: "",
    prioridade: "normal",
    relator_id: ""
  });

  const isSecretary = profile?.role && ['admin', 'secretario', 'vice_presidente', 'presidente'].includes(profile.role);

  const fetchConselheiros = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['conselheiro_titular', 'conselheiro_suplente'])
        .order("full_name");

      if (error) throw error;
      setConselheiros(data || []);
      
      // Create a map of relator_id to full_name for display
      const map: Record<string, string> = {};
      data?.forEach(c => {
        map[c.id] = c.full_name;
      });
      setRelatoresMap(map);
    } catch (error) {
      console.error("Erro ao carregar conselheiros:", error);
    }
  };

  useEffect(() => {
    fetchConselheiros();
  }, []);

  const createProcesso = async () => {
    try {
      // Generate protocol number
      const numero_processo = await ProtocoloGenerator.gerarProtocolo('PROC');

      const prazo = new Date();
      prazo.setDate(prazo.getDate() + 30); // 30 days deadline

      const result = await createProcessoHook({
        numero_processo,
        ...newProcesso,
        data_protocolo: new Date().toISOString(),
        prazo_parecer: prazo.toISOString(),
        status: 'protocolado'
      });

      if (!result.error) {
        toast({
          title: "Sucesso",
          description: `Processo ${numero_processo} protocolado com sucesso!`,
        });

        setShowNewProcesso(false);
        setNewProcesso({
          tipo_processo: "",
          requerente: "",
          cpf_cnpj: "",
          endereco_empreendimento: "",
          descricao_atividade: "",
          prioridade: "normal",
          relator_id: ""
        });
      }
    } catch (error) {
      console.error("Erro ao criar processo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível protocolar o processo.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      protocolado: { label: "Protocolado", variant: "secondary" as const },
      em_analise_tecnica: { label: "Em Análise Técnica", variant: "default" as const },
      em_relatoria: { label: "Em Relatoria", variant: "outline" as const },
      em_votacao: { label: "Em Votação", variant: "destructive" as const },
      aprovado: { label: "Aprovado", variant: "default" as const },
      reprovado: { label: "Reprovado", variant: "destructive" as const },
      arquivado: { label: "Arquivado", variant: "secondary" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
  };

  const getPriorityBadge = (prioridade: string) => {
    const priorityConfig = {
      baixa: { label: "Baixa", variant: "secondary" as const },
      normal: { label: "Normal", variant: "outline" as const },
      alta: { label: "Alta", variant: "destructive" as const },
      urgente: { label: "Urgente", variant: "destructive" as const },
    };
    return priorityConfig[prioridade as keyof typeof priorityConfig] || { label: prioridade, variant: "secondary" as const };
  };

  const filteredProcessos = processos.filter(processo => {
    const matchesSearch = processo.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         processo.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         processo.descricao_atividade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || processo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Protocolo e Tramitação de Processos</h1>
          <p className="text-muted-foreground">
            Gestão de processos ambientais conforme Res. CONAMA 237/1997
          </p>
        </div>

        {isSecretary && (
          <Dialog open={showNewProcesso} onOpenChange={setShowNewProcesso}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Protocolar Processo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Protocolar Novo Processo</DialogTitle>
                <DialogDescription>
                  Registre um novo processo ambiental no sistema
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_processo">Tipo de Processo *</Label>
                    <Select
                      value={newProcesso.tipo_processo}
                      onValueChange={(value) => setNewProcesso({...newProcesso, tipo_processo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="licenciamento">Licenciamento</SelectItem>
                        <SelectItem value="denuncia">Denúncia</SelectItem>
                        <SelectItem value="audiencia_publica">Audiência Pública</SelectItem>
                        <SelectItem value="estudo_impacto">Estudo de Impacto</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={newProcesso.prioridade}
                      onValueChange={(value) => setNewProcesso({...newProcesso, prioridade: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requerente">Requerente *</Label>
                    <Input
                      id="requerente"
                      value={newProcesso.requerente}
                      onChange={(e) => setNewProcesso({...newProcesso, requerente: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpf_cnpj"
                      value={newProcesso.cpf_cnpj}
                      onChange={(e) => setNewProcesso({...newProcesso, cpf_cnpj: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco_empreendimento">Endereço do Empreendimento</Label>
                  <Input
                    id="endereco_empreendimento"
                    value={newProcesso.endereco_empreendimento}
                    onChange={(e) => setNewProcesso({...newProcesso, endereco_empreendimento: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_atividade">Descrição da Atividade *</Label>
                  <Textarea
                    id="descricao_atividade"
                    value={newProcesso.descricao_atividade}
                    onChange={(e) => setNewProcesso({...newProcesso, descricao_atividade: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="relator_id">Designar Relator</Label>
                  <Select
                    value={newProcesso.relator_id}
                    onValueChange={(value) => setNewProcesso({...newProcesso, relator_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um conselheiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {conselheiros.map((conselheiro) => (
                        <SelectItem key={conselheiro.id} value={conselheiro.id}>
                          {conselheiro.full_name} ({conselheiro.role === 'conselheiro_titular' ? 'Titular' : 'Suplente'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewProcesso(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createProcesso}
                    disabled={!newProcesso.tipo_processo || !newProcesso.requerente || !newProcesso.descricao_atividade}
                  >
                    Protocolar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por número, requerente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="protocolado">Protocolado</SelectItem>
            <SelectItem value="em_analise_tecnica">Em Análise Técnica</SelectItem>
            <SelectItem value="em_relatoria">Em Relatoria</SelectItem>
            <SelectItem value="em_votacao">Em Votação</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="reprovado">Reprovado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Processes List */}
      <div className="grid gap-4">
        {filteredProcessos.map((processo) => {
          const statusBadge = getStatusBadge(processo.status);
          const priorityBadge = getPriorityBadge(processo.prioridade);
          const isOverdue = new Date(processo.prazo_parecer) < new Date() && !['aprovado', 'reprovado', 'arquivado'].includes(processo.status);

          return (
            <Card key={processo.id} className={isOverdue ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {processo.numero_processo}
                      {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </CardTitle>
                    <CardDescription>{processo.requerente}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{processo.descricao_atividade}</p>
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Protocolado em {format(new Date(processo.data_protocolo), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {processo.relator_id && relatoresMap[processo.relator_id] && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          Relator: {relatoresMap[processo.relator_id]}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {isSecretary && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>

                  {isOverdue && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Prazo para parecer vencido em {format(new Date(processo.prazo_parecer), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredProcessos.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum processo encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "todos" 
                    ? "Tente ajustar os filtros de busca" 
                    : isSecretary 
                      ? "Clique em 'Protocolar Processo' para registrar o primeiro processo"
                      : "Nenhum processo foi protocolado ainda"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Processos;