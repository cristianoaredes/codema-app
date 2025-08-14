import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ExternalLink,
  Send,
  Calendar,
  FileText,
  Users,
  Building,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Link2,
  Settings,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";

interface DenunciaIntegrationsProps {
  denuncia: Denuncia;
  onIntegrationUpdate?: (integration: string, data: any) => void;
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

const DenunciaIntegrations: React.FC<DenunciaIntegrationsProps> = ({
  denuncia,
  onIntegrationUpdate
}) => {
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: 'reunioes',
      name: 'Sistema de Reuniões',
      description: 'Adicionar denúncia à pauta de reuniões do CODEMA',
      icon: <Calendar className="h-4 w-4" />,
      enabled: true,
      status: 'connected',
      lastSync: '2025-01-20T10:00:00'
    },
    {
      id: 'sisnama',
      name: 'SISNAMA',
      description: 'Sistema Nacional do Meio Ambiente',
      icon: <Building className="h-4 w-4" />,
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'ministerio_publico',
      name: 'Ministério Público',
      description: 'Integração com MP para casos graves',
      icon: <Shield className="h-4 w-4" />,
      enabled: true,
      status: 'connected',
      lastSync: '2025-01-19T15:30:00'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Notificações automáticas via WhatsApp',
      icon: <MessageSquare className="h-4 w-4" />,
      enabled: true,
      status: 'connected',
      lastSync: '2025-01-20T11:45:00'
    },
    {
      id: 'email',
      name: 'Email/SMTP',
      description: 'Envio de notificações por email',
      icon: <Mail className="h-4 w-4" />,
      enabled: true,
      status: 'connected',
      lastSync: '2025-01-20T12:00:00'
    },
    {
      id: 'geoserver',
      name: 'GeoServer Municipal',
      description: 'Dados geoespaciais e mapas',
      icon: <Globe className="h-4 w-4" />,
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'protocolo_municipal',
      name: 'Protocolo Municipal',
      description: 'Sistema de protocolo da prefeitura',
      icon: <FileText className="h-4 w-4" />,
      enabled: true,
      status: 'connected',
      lastSync: '2025-01-20T09:00:00'
    },
    {
      id: 'policia_ambiental',
      name: 'Polícia Ambiental',
      description: 'Comunicação com Polícia Ambiental',
      icon: <AlertTriangle className="h-4 w-4" />,
      enabled: false,
      status: 'disconnected'
    }
  ]);

  const handleIntegrationAction = async (integration: IntegrationConfig, action: string) => {
    setIsProcessing(true);
    
    try {
      switch (action) {
        case 'add_to_meeting':
          // Adicionar à pauta de reunião
          toast.success(`Denúncia ${denuncia.protocolo} adicionada à próxima pauta de reunião`);
          onIntegrationUpdate?.('reunioes', {
            action: 'add_to_agenda',
            denunciaId: denuncia.id,
            protocolo: denuncia.protocolo
          });
          break;
          
        case 'notify_mp':
          // Notificar Ministério Público
          toast.success(`Ministério Público notificado sobre denúncia ${denuncia.protocolo}`);
          onIntegrationUpdate?.('ministerio_publico', {
            action: 'notify',
            denunciaId: denuncia.id,
            severity: denuncia.prioridade
          });
          break;
          
        case 'send_whatsapp':
          // Enviar notificação WhatsApp
          toast.success('Notificação enviada via WhatsApp');
          onIntegrationUpdate?.('whatsapp', {
            action: 'send_notification',
            denunciaId: denuncia.id,
            to: denuncia.denunciante_telefone
          });
          break;
          
        case 'sync_protocol':
          // Sincronizar com protocolo municipal
          toast.success('Sincronizado com sistema de protocolo municipal');
          onIntegrationUpdate?.('protocolo_municipal', {
            action: 'sync',
            denunciaId: denuncia.id,
            protocolo: denuncia.protocolo
          });
          break;
          
        default:
          toast.info(`Ação ${action} executada para ${integration.name}`);
      }
      
      // Atualizar lastSync
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, lastSync: new Date().toISOString() }
          : int
      ));
    } catch (error) {
      toast.error(`Erro ao executar ação: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { 
            ...int, 
            enabled: !int.enabled,
            status: !int.enabled ? 'connected' : 'disconnected'
          }
        : int
    ));
  };

  const getStatusBadge = (status: IntegrationConfig['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Conectado
        </Badge>;
      case 'disconnected':
        return <Badge variant="outline" className="text-gray-600">
          <Link2 className="h-3 w-3 mr-1" />
          Desconectado
        </Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Erro
        </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Integrações e Sistemas Externos
              </CardTitle>
              <CardDescription>
                Conecte a denúncia com outros sistemas e órgãos competentes
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Integration Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Integrações Ativas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {integrations.filter(int => int.enabled).map(integration => (
            <Card key={integration.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {integration.lastSync && (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {integration.id === 'reunioes' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleIntegrationAction(integration, 'add_to_meeting')}
                        disabled={isProcessing}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Adicionar à Pauta
                      </Button>
                    )}
                    
                    {integration.id === 'ministerio_publico' && denuncia.prioridade === 'urgente' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleIntegrationAction(integration, 'notify_mp')}
                        disabled={isProcessing}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Notificar MP
                      </Button>
                    )}
                    
                    {integration.id === 'whatsapp' && denuncia.denunciante_telefone && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleIntegrationAction(integration, 'send_whatsapp')}
                        disabled={isProcessing}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Enviar Status
                      </Button>
                    )}
                    
                    {integration.id === 'protocolo_municipal' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleIntegrationAction(integration, 'sync_protocol')}
                        disabled={isProcessing}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sincronizar
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowConfigDialog(true);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {integrations.filter(int => !int.enabled).map(integration => (
            <Card key={integration.id} className="opacity-75">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => toggleIntegration(integration.id)}
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    Conectar
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico de Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Adicionado à pauta da reunião #2025-01</span>
                  </div>
                  <span className="text-muted-foreground">Há 2 horas</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Notificação enviada via WhatsApp</span>
                  </div>
                  <span className="text-muted-foreground">Há 5 horas</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Sincronizado com protocolo municipal</span>
                  </div>
                  <span className="text-muted-foreground">Ontem</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Ministério Público notificado</span>
                  </div>
                  <span className="text-muted-foreground">2 dias atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configurar {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros de integração
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Status da Integração</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  checked={selectedIntegration?.enabled}
                  onCheckedChange={() => selectedIntegration && toggleIntegration(selectedIntegration.id)}
                />
                <Label className="font-normal">
                  {selectedIntegration?.enabled ? 'Ativada' : 'Desativada'}
                </Label>
              </div>
            </div>
            
            {selectedIntegration?.id === 'whatsapp' && (
              <>
                <div>
                  <Label>Número WhatsApp Business</Label>
                  <Input placeholder="+55 31 99999-9999" />
                </div>
                <div>
                  <Label>Token de API</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </>
            )}
            
            {selectedIntegration?.id === 'email' && (
              <>
                <div>
                  <Label>Servidor SMTP</Label>
                  <Input placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Label>Porta</Label>
                  <Input placeholder="587" />
                </div>
              </>
            )}
            
            {selectedIntegration?.id === 'reunioes' && (
              <>
                <div>
                  <Label>Adicionar automaticamente à pauta</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Apenas denúncias urgentes</SelectItem>
                      <SelectItem value="high">Prioridade alta e urgente</SelectItem>
                      <SelectItem value="all">Todas as denúncias</SelectItem>
                      <SelectItem value="manual">Apenas manualmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast.success('Configurações salvas');
                setShowConfigDialog(false);
              }}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DenunciaIntegrations;