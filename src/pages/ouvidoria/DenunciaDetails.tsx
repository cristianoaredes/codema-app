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
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash,
  Download,
  Share2,
  Printer,
  Flag,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOuvidoriaDenuncias } from "@/hooks/useOuvidoriaDenuncias";
import { useAuth } from "@/hooks/useAuth";
import DenunciaWorkflow from "@/components/ouvidoria/DenunciaWorkflow";
import DenunciaMap from "@/components/ouvidoria/DenunciaMap";
import DenunciaIntegrations from "@/components/ouvidoria/DenunciaIntegrations";
import DenunciaAnalytics from "@/components/ouvidoria/DenunciaAnalytics";
import DenunciaTimeline from "@/components/ouvidoria/DenunciaTimeline";
import DenunciaNotifications from "@/components/ouvidoria/DenunciaNotifications";
import DenunciaReuniao from "@/components/ouvidoria/DenunciaReuniao";

const DenunciaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buscarDenuncia, denuncias } = useOuvidoriaDenuncias();
  
  const [denuncia, setDenuncia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("detalhes");

  useEffect(() => {
    loadDenuncia();
  }, [id]);

  const loadDenuncia = async () => {
    if (!id) {
      toast.error("ID da denúncia não encontrado");
      navigate("/ouvidoria");
      return;
    }

    setLoading(true);
    try {
      const data = await buscarDenuncia(id);
      if (data) {
        setDenuncia(data);
      } else {
        toast.error("Denúncia não encontrada");
        navigate("/ouvidoria");
      }
    } catch (error) {
      console.error("Erro ao carregar denúncia:", error);
      toast.error("Erro ao carregar denúncia");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!denuncia) return;
    
    const content = `
DENÚNCIA AMBIENTAL - ${denuncia.protocolo}
${'='.repeat(50)}

Data: ${format(new Date(denuncia.created_at), "dd/MM/yyyy HH:mm")}
Tipo: ${denuncia.tipo_denuncia}
Prioridade: ${denuncia.prioridade}
Status: ${denuncia.status}

LOCAL DA OCORRÊNCIA
${'-'.repeat(30)}
${denuncia.local_ocorrencia}
${denuncia.latitude && denuncia.longitude ? `Coordenadas: ${denuncia.latitude}, ${denuncia.longitude}` : ''}

DESCRIÇÃO
${'-'.repeat(30)}
${denuncia.descricao}

DENUNCIANTE
${'-'.repeat(30)}
${denuncia.anonima ? 'Denúncia Anônima' : `
Nome: ${denuncia.denunciante_nome || 'Não informado'}
Telefone: ${denuncia.denunciante_telefone || 'Não informado'}
Email: ${denuncia.denunciante_email || 'Não informado'}
`}

FISCAL RESPONSÁVEL
${'-'.repeat(30)}
${denuncia.fiscal_responsavel?.full_name || 'Não atribuído'}

${denuncia.relatorio_fiscalizacao ? `RELATÓRIO DE FISCALIZAÇÃO\n${'-'.repeat(30)}\n${denuncia.relatorio_fiscalizacao}` : ''}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `denuncia_${denuncia.protocolo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Denúncia exportada com sucesso");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      recebida: { label: 'Recebida', variant: 'secondary', icon: Clock },
      em_apuracao: { label: 'Em Apuração', variant: 'default', icon: AlertTriangle },
      fiscalizacao_agendada: { label: 'Fiscalização Agendada', variant: 'default', icon: Calendar },
      fiscalizacao_realizada: { label: 'Fiscalização Realizada', variant: 'default', icon: CheckCircle },
      procedente: { label: 'Procedente', variant: 'destructive', icon: AlertTriangle },
      improcedente: { label: 'Improcedente', variant: 'outline', icon: CheckCircle },
      arquivada: { label: 'Arquivada', variant: 'secondary', icon: FileText }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig: Record<string, { label: string; variant: any; className?: string }> = {
      baixa: { label: 'Baixa', variant: 'secondary' },
      normal: { label: 'Normal', variant: 'default' },
      alta: { label: 'Alta', variant: 'default', className: 'bg-orange-500' },
      urgente: { label: 'Urgente', variant: 'destructive' }
    };

    const config = prioridadeConfig[prioridade] || { label: prioridade, variant: 'outline' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const canManage = user?.role === 'admin' || user?.role === 'fiscal';

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

  if (!denuncia) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Denúncia não encontrada</AlertTitle>
          <AlertDescription>
            A denúncia solicitada não foi encontrada ou você não tem permissão para visualizá-la.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/ouvidoria")} className="mt-4">
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
              onClick={() => navigate("/ouvidoria")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Denúncia {denuncia.protocolo}
          </h1>
          <p className="text-muted-foreground mt-1">
            Registrada em {format(new Date(denuncia.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          {canManage && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(denuncia.status)}</div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prioridade</p>
                <div className="mt-1">{getPrioridadeBadge(denuncia.prioridade)}</div>
              </div>
              <Flag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="text-lg font-semibold">{denuncia.tipo_denuncia}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fiscal</p>
                <p className="text-lg font-semibold">
                  {denuncia.fiscal_responsavel?.full_name || 'Não atribuído'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações da Denúncia */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Denúncia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="mt-1">{denuncia.descricao}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Local da Ocorrência</p>
                  <p className="mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {denuncia.local_ocorrencia}
                  </p>
                  {denuncia.latitude && denuncia.longitude && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Coordenadas: {denuncia.latitude}, {denuncia.longitude}
                    </p>
                  )}
                </div>
                
                {denuncia.data_ocorrencia && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data da Ocorrência</p>
                    <p className="mt-1">
                      {format(new Date(denuncia.data_ocorrencia), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do Denunciante */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Denunciante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {denuncia.anonima ? (
                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertTitle>Denúncia Anônima</AlertTitle>
                    <AlertDescription>
                      Esta denúncia foi registrada de forma anônima.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="mt-1 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {denuncia.denunciante_nome || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="mt-1 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {denuncia.denunciante_telefone || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="mt-1 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {denuncia.denunciante_email || 'Não informado'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Relatório de Fiscalização */}
          {denuncia.relatorio_fiscalizacao && (
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Fiscalização</CardTitle>
                {denuncia.data_fiscalizacao && (
                  <CardDescription>
                    Realizada em {format(new Date(denuncia.data_fiscalizacao), "dd/MM/yyyy")}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{denuncia.relatorio_fiscalizacao}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mapa */}
          {denuncia.latitude && denuncia.longitude && (
            <DenunciaMap denuncias={[denuncia]} center={{ lat: denuncia.latitude, lng: denuncia.longitude }} />
          )}
        </TabsContent>

        <TabsContent value="workflow">
          <DenunciaWorkflow denuncia={denuncia} onUpdate={loadDenuncia} canManage={canManage} />
        </TabsContent>

        <TabsContent value="timeline">
          <DenunciaTimeline denuncia={denuncia} canAddEvent={canManage} />
        </TabsContent>

        <TabsContent value="reunioes">
          <DenunciaReuniao denuncia={denuncia} canManage={canManage} />
        </TabsContent>

        <TabsContent value="notificacoes">
          <DenunciaNotifications denuncia={denuncia} canManage={canManage} />
        </TabsContent>

        <TabsContent value="integracoes">
          <DenunciaIntegrations denuncia={denuncia} />
        </TabsContent>

        <TabsContent value="analytics">
          <DenunciaAnalytics denuncias={denuncias} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DenunciaDetails;