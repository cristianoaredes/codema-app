import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  AlertTriangle, 
  Eye,
  MapPin,
  Calendar,
  User,
  Shield,
  CheckCircle,
  Clock,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Denuncia {
  id: string;
  protocolo: string;
  tipo_denuncia: string;
  descricao: string;
  local_ocorrencia: string;
  latitude: number | null;
  longitude: number | null;
  data_ocorrencia: string | null;
  denunciante_nome: string | null;
  denunciante_telefone: string | null;
  denunciante_email: string | null;
  anonima: boolean;
  status: string;
  prioridade: string;
  fiscal_responsavel: {
    full_name: string;
  } | null;
  relatorio_fiscalizacao: string | null;
  data_fiscalizacao: string | null;
  created_at: string;
}

const Ouvidoria = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showNewDenuncia, setShowNewDenuncia] = useState(false);
  const [fiscais, setFiscais] = useState<any[]>([]);

  const [newDenuncia, setNewDenuncia] = useState({
    tipo_denuncia: "",
    descricao: "",
    local_ocorrencia: "",
    latitude: "",
    longitude: "",
    data_ocorrencia: "",
    denunciante_nome: "",
    denunciante_cpf: "",
    denunciante_telefone: "",
    denunciante_email: "",
    anonima: false,
    prioridade: "normal"
  });

  const isFiscal = profile?.role && ['admin', 'secretario', 'presidente', 'fiscal'].includes(profile.role);

  useEffect(() => {
    fetchDenuncias();
    fetchFiscais();
  }, []);

  const fetchDenuncias = async () => {
    try {
      const { data, error } = await supabase
        .from("ouvidoria_denuncias")
        .select(`
          *,
          fiscal_responsavel:profiles!fiscal_responsavel_id(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDenuncias(data || []);
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as denúncias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFiscais = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("role", ["admin", "fiscal"])
        .order("full_name");

      if (error) throw error;
      setFiscais(data || []);
    } catch (error) {
      console.error("Erro ao carregar fiscais:", error);
    }
  };

  const createDenuncia = async () => {
    try {
      // Generate protocol number
      const { data: protocolData, error: protocolError } = await supabase
        .rpc('generate_document_number', { doc_type: 'ouvidoria' });

      if (protocolError) throw protocolError;

      const denunciaData = {
        protocolo: protocolData,
        ...newDenuncia,
        latitude: newDenuncia.latitude ? parseFloat(newDenuncia.latitude) : null,
        longitude: newDenuncia.longitude ? parseFloat(newDenuncia.longitude) : null
      };

      // Remove empty fields for anonymous complaints
      if (newDenuncia.anonima) {
        denunciaData.denunciante_nome = null;
        denunciaData.denunciante_cpf = null;
        denunciaData.denunciante_telefone = null;
        denunciaData.denunciante_email = null;
      }

      const { error } = await supabase
        .from("ouvidoria_denuncias")
        .insert(denunciaData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Denúncia registrada com protocolo ${protocolData}`,
      });

      setShowNewDenuncia(false);
      setNewDenuncia({
        tipo_denuncia: "",
        descricao: "",
        local_ocorrencia: "",
        latitude: "",
        longitude: "",
        data_ocorrencia: "",
        denunciante_nome: "",
        denunciante_cpf: "",
        denunciante_telefone: "",
        denunciante_email: "",
        anonima: false,
        prioridade: "normal"
      });
      fetchDenuncias();
    } catch (error) {
      console.error("Erro ao registrar denúncia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a denúncia.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      recebida: { label: "Recebida", variant: "outline" as const },
      em_apuracao: { label: "Em Apuração", variant: "secondary" as const },
      fiscalizacao_agendada: { label: "Fiscalização Agendada", variant: "default" as const },
      fiscalizacao_realizada: { label: "Fiscalização Realizada", variant: "default" as const },
      procedente: { label: "Procedente", variant: "destructive" as const },
      improcedente: { label: "Improcedente", variant: "secondary" as const },
      arquivada: { label: "Arquivada", variant: "secondary" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
  };

  const getPriorityBadge = (prioridade: string) => {
    const priorityConfig = {
      baixa: { label: "Baixa", variant: "outline" as const },
      normal: { label: "Normal", variant: "secondary" as const },
      alta: { label: "Alta", variant: "destructive" as const },
      urgente: { label: "Urgente", variant: "destructive" as const },
    };
    return priorityConfig[prioridade as keyof typeof priorityConfig] || { label: prioridade, variant: "secondary" as const };
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      queima_lixo: "Queima de Lixo",
      desmatamento: "Desmatamento",
      poluicao_agua: "Poluição da Água",
      poluicao_sonora: "Poluição Sonora",
      construcao_irregular: "Construção Irregular",
      outros: "Outros"
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const filteredDenuncias = denuncias.filter(denuncia => {
    const matchesSearch = denuncia.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         denuncia.local_ocorrencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         denuncia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || denuncia.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ouvidoria Ambiental</h1>
          <p className="text-muted-foreground">
            Sistema de denúncias ambientais conforme Lei 9.605/1998
          </p>
        </div>

        <Dialog open={showNewDenuncia} onOpenChange={setShowNewDenuncia}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Denúncia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nova Denúncia</DialogTitle>
              <DialogDescription>
                Registre uma denúncia ambiental no sistema
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_denuncia">Tipo de Denúncia *</Label>
                  <Select
                    value={newDenuncia.tipo_denuncia}
                    onValueChange={(value) => setNewDenuncia({...newDenuncia, tipo_denuncia: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="queima_lixo">Queima de Lixo</SelectItem>
                      <SelectItem value="desmatamento">Desmatamento</SelectItem>
                      <SelectItem value="poluicao_agua">Poluição da Água</SelectItem>
                      <SelectItem value="poluicao_sonora">Poluição Sonora</SelectItem>
                      <SelectItem value="construcao_irregular">Construção Irregular</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={newDenuncia.prioridade}
                    onValueChange={(value) => setNewDenuncia({...newDenuncia, prioridade: value})}
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

              <div>
                <Label htmlFor="descricao">Descrição da Denúncia *</Label>
                <Textarea
                  id="descricao"
                  value={newDenuncia.descricao}
                  onChange={(e) => setNewDenuncia({...newDenuncia, descricao: e.target.value})}
                  rows={3}
                  placeholder="Descreva detalhadamente o problema..."
                />
              </div>

              <div>
                <Label htmlFor="local_ocorrencia">Local da Ocorrência *</Label>
                <Input
                  id="local_ocorrencia"
                  value={newDenuncia.local_ocorrencia}
                  onChange={(e) => setNewDenuncia({...newDenuncia, local_ocorrencia: e.target.value})}
                  placeholder="Endereço ou referência do local"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={newDenuncia.latitude}
                    onChange={(e) => setNewDenuncia({...newDenuncia, latitude: e.target.value})}
                    placeholder="-20.123456"
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={newDenuncia.longitude}
                    onChange={(e) => setNewDenuncia({...newDenuncia, longitude: e.target.value})}
                    placeholder="-43.123456"
                  />
                </div>

                <div>
                  <Label htmlFor="data_ocorrencia">Data da Ocorrência</Label>
                  <Input
                    id="data_ocorrencia"
                    type="datetime-local"
                    value={newDenuncia.data_ocorrencia}
                    onChange={(e) => setNewDenuncia({...newDenuncia, data_ocorrencia: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonima"
                  checked={newDenuncia.anonima}
                  onCheckedChange={(checked) => setNewDenuncia({...newDenuncia, anonima: checked as boolean})}
                />
                <Label htmlFor="anonima">Denúncia anônima</Label>
              </div>

              {!newDenuncia.anonima && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Dados do Denunciante</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="denunciante_nome">Nome</Label>
                      <Input
                        id="denunciante_nome"
                        value={newDenuncia.denunciante_nome}
                        onChange={(e) => setNewDenuncia({...newDenuncia, denunciante_nome: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="denunciante_cpf">CPF</Label>
                      <Input
                        id="denunciante_cpf"
                        value={newDenuncia.denunciante_cpf}
                        onChange={(e) => setNewDenuncia({...newDenuncia, denunciante_cpf: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="denunciante_telefone">Telefone</Label>
                      <Input
                        id="denunciante_telefone"
                        value={newDenuncia.denunciante_telefone}
                        onChange={(e) => setNewDenuncia({...newDenuncia, denunciante_telefone: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="denunciante_email">E-mail</Label>
                      <Input
                        id="denunciante_email"
                        type="email"
                        value={newDenuncia.denunciante_email}
                        onChange={(e) => setNewDenuncia({...newDenuncia, denunciante_email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewDenuncia(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createDenuncia}
                  disabled={!newDenuncia.tipo_denuncia || !newDenuncia.descricao || !newDenuncia.local_ocorrencia}
                >
                  Registrar Denúncia
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Denúncias</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{denuncias.length}</div>
            <p className="text-xs text-muted-foreground">Este ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Apuração</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {denuncias.filter(d => ['recebida', 'em_apuracao', 'fiscalizacao_agendada'].includes(d.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando fiscalização</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procedentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {denuncias.filter(d => d.status === 'procedente').length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {denuncias.filter(d => ['procedente', 'improcedente', 'arquivada'].includes(d.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por protocolo, local ou descrição..."
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
            <SelectItem value="recebida">Recebida</SelectItem>
            <SelectItem value="em_apuracao">Em Apuração</SelectItem>
            <SelectItem value="fiscalizacao_agendada">Fiscalização Agendada</SelectItem>
            <SelectItem value="fiscalizacao_realizada">Fiscalização Realizada</SelectItem>
            <SelectItem value="procedente">Procedente</SelectItem>
            <SelectItem value="improcedente">Improcedente</SelectItem>
            <SelectItem value="arquivada">Arquivada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      <div className="grid gap-4">
        {filteredDenuncias.map((denuncia) => {
          const statusBadge = getStatusBadge(denuncia.status);
          const priorityBadge = getPriorityBadge(denuncia.prioridade);

          return (
            <Card key={denuncia.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {denuncia.protocolo}
                      {denuncia.anonima && <Shield className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription>{getTipoLabel(denuncia.tipo_denuncia)}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">{denuncia.descricao}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{denuncia.local_ocorrencia}</span>
                  </div>

                  {denuncia.data_ocorrencia && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Ocorrência: {format(new Date(denuncia.data_ocorrencia), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}

                  {!denuncia.anonima && denuncia.denunciante_nome && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{denuncia.denunciante_nome}</span>
                      </div>
                      {denuncia.denunciante_telefone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{denuncia.denunciante_telefone}</span>
                        </div>
                      )}
                      {denuncia.denunciante_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{denuncia.denunciante_email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {denuncia.fiscal_responsavel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Fiscal responsável: {denuncia.fiscal_responsavel.full_name}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Registrada em {format(new Date(denuncia.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      {isFiscal && (
                        <Button variant="outline" size="sm">
                          <Shield className="h-4 w-4 mr-1" />
                          Gerenciar
                        </Button>
                      )}
                    </div>
                  </div>

                  {denuncia.relatorio_fiscalizacao && (
                    <div className="bg-muted/50 border rounded p-3">
                      <h5 className="font-medium mb-1">Relatório de Fiscalização</h5>
                      <p className="text-sm">{denuncia.relatorio_fiscalizacao}</p>
                      {denuncia.data_fiscalizacao && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Fiscalização realizada em {format(new Date(denuncia.data_fiscalizacao), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredDenuncias.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma denúncia encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "todos" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Clique em 'Nova Denúncia' para registrar a primeira denúncia"
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

export default Ouvidoria;