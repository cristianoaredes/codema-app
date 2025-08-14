import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Shield,
  Zap,
  Volume2,
  Filter,
  Plus,
  Trash,
  Edit,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'status_change' | 'time_based' | 'priority' | 'assignment' | 'custom';
  conditions: Record<string, any>;
  channels: ('email' | 'whatsapp' | 'sms' | 'push' | 'system')[];
  recipients: ('denunciante' | 'fiscal' | 'admin' | 'custom')[];
  template: string;
  enabled: boolean;
  lastTriggered?: string;
}

interface NotificationLog {
  id: string;
  timestamp: string;
  type: string;
  recipient: string;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
  message: string;
}

interface DenunciaNotificationsProps {
  denuncia: Denuncia;
  onSendNotification?: (notification: any) => void;
  canManage?: boolean;
}

const DenunciaNotifications: React.FC<DenunciaNotificationsProps> = ({
  denuncia,
  onSendNotification,
  canManage = false
}) => {
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Status Atualizado',
      description: 'Notificar denunciante quando o status da denúncia mudar',
      trigger: 'status_change',
      conditions: { any_status_change: true },
      channels: ['email', 'whatsapp'],
      recipients: ['denunciante'],
      template: 'Olá! Sua denúncia ${protocolo} teve o status atualizado para ${status}.',
      enabled: true,
      lastTriggered: '2025-01-20T10:00:00'
    },
    {
      id: '2',
      name: 'Fiscalização Agendada',
      description: 'Notificar fiscal quando uma fiscalização for agendada',
      trigger: 'status_change',
      conditions: { status: 'fiscalizacao_agendada' },
      channels: ['email', 'push'],
      recipients: ['fiscal'],
      template: 'Nova fiscalização agendada para ${data} no local ${local}.',
      enabled: true
    },
    {
      id: '3',
      name: 'Denúncia Urgente',
      description: 'Alertar administradores sobre denúncias urgentes',
      trigger: 'priority',
      conditions: { priority: 'urgente' },
      channels: ['email', 'push', 'sms'],
      recipients: ['admin'],
      template: '⚠️ Denúncia URGENTE recebida: ${protocolo} - ${tipo}',
      enabled: true
    },
    {
      id: '4',
      name: 'Prazo de Apuração',
      description: 'Lembrete de prazo próximo para conclusão',
      trigger: 'time_based',
      conditions: { days_before_deadline: 3 },
      channels: ['email', 'push'],
      recipients: ['fiscal', 'admin'],
      template: 'Atenção! Faltam ${dias} dias para o prazo de conclusão da denúncia ${protocolo}.',
      enabled: true
    },
    {
      id: '5',
      name: 'Denúncia Procedente',
      description: 'Notificar autoridades quando denúncia for procedente',
      trigger: 'status_change',
      conditions: { status: 'procedente' },
      channels: ['email'],
      recipients: ['admin', 'custom'],
      template: 'Denúncia ${protocolo} confirmada como PROCEDENTE. Medidas necessárias: ${medidas}',
      enabled: false
    }
  ]);

  const [notificationLogs] = useState<NotificationLog[]>([
    {
      id: '1',
      timestamp: '2025-01-20T11:30:00',
      type: 'Status Atualizado',
      recipient: denuncia.denunciante_email || 'denunciante@email.com',
      channel: 'email',
      status: 'sent',
      message: `Denúncia ${denuncia.protocolo} em apuração`
    },
    {
      id: '2',
      timestamp: '2025-01-20T10:00:00',
      type: 'Nova Denúncia',
      recipient: 'fiscal@codema.gov.br',
      channel: 'push',
      status: 'sent',
      message: `Nova denúncia recebida: ${denuncia.protocolo}`
    },
    {
      id: '3',
      timestamp: '2025-01-19T15:00:00',
      type: 'Lembrete',
      recipient: denuncia.denunciante_telefone || '+55 31 99999-9999',
      channel: 'whatsapp',
      status: 'failed',
      message: 'Falha ao enviar notificação'
    }
  ]);

  const [customNotification, setCustomNotification] = useState({
    recipient: '',
    channel: 'email',
    subject: '',
    message: '',
    schedule: ''
  });

  const handleSendNotification = async () => {
    setIsSending(true);
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Notificação enviada com sucesso!');
      onSendNotification?.({
        denunciaId: denuncia.id,
        ...customNotification,
        timestamp: new Date().toISOString()
      });
      
      setShowSendDialog(false);
      setCustomNotification({
        recipient: '',
        channel: 'email',
        subject: '',
        message: '',
        schedule: ''
      });
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    } finally {
      setIsSending(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    setNotificationRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    
    const rule = notificationRules.find(r => r.id === ruleId);
    if (rule) {
      toast.success(
        rule.enabled 
          ? `Regra "${rule.name}" desativada`
          : `Regra "${rule.name}" ativada`
      );
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'whatsapp': return <MessageSquare className="h-3 w-3" />;
      case 'sms': return <Phone className="h-3 w-3" />;
      case 'push': return <Bell className="h-3 w-3" />;
      case 'system': return <Volume2 className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'status_change': return <RefreshCw className="h-4 w-4" />;
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'priority': return <AlertTriangle className="h-4 w-4" />;
      case 'assignment': return <User className="h-4 w-4" />;
      case 'custom': return <Zap className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Auto-notificações baseadas em status
  useEffect(() => {
    const checkAutoNotifications = () => {
      const activeRules = notificationRules.filter(rule => rule.enabled);
      
      activeRules.forEach(rule => {
        if (rule.trigger === 'priority' && denuncia.prioridade === 'urgente') {
          console.log(`Auto-notificação: ${rule.name}`);
        }
      });
    };
    
    checkAutoNotifications();
  }, [denuncia.status, denuncia.prioridade]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Sistema de Notificações
              </CardTitle>
              <CardDescription>
                Gerencie notificações automáticas e manuais da denúncia
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSendDialog(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificação
              </Button>
              
              {canManage && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRuleDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Regras
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Alerts */}
      {denuncia.prioridade === 'urgente' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Notificação Urgente Ativa</AlertTitle>
          <AlertDescription>
            Esta denúncia está marcada como urgente. Notificações automáticas estão sendo enviadas para os responsáveis.
          </AlertDescription>
        </Alert>
      )}

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regras de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationRules.map(rule => (
              <div 
                key={rule.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  !rule.enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {getTriggerIcon(rule.trigger)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      {rule.enabled ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          <BellOff className="h-3 w-3 mr-1" />
                          Inativa
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Canais:</span>
                        {rule.channels.map(channel => (
                          <span key={channel} className="inline-flex">
                            {getChannelIcon(channel)}
                          </span>
                        ))}
                      </div>
                      
                      {rule.lastTriggered && (
                        <span>
                          Último envio: {format(new Date(rule.lastTriggered), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRule(rule);
                        setShowRuleDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${
                    log.status === 'sent' ? 'bg-green-100' :
                    log.status === 'failed' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    {getChannelIcon(log.channel)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.type}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          log.status === 'sent' ? 'text-green-600' :
                          log.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }
                      >
                        {log.status === 'sent' ? 'Enviado' :
                         log.status === 'failed' ? 'Falhou' :
                         'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Para: {log.recipient} • {log.message}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Notificação Manual</DialogTitle>
            <DialogDescription>
              Envie uma notificação personalizada sobre esta denúncia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Destinatário</Label>
              <Input
                placeholder="Email ou telefone"
                value={customNotification.recipient}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  recipient: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label>Canal</Label>
              <Select 
                value={customNotification.channel}
                onValueChange={(value) => setCustomNotification({
                  ...customNotification,
                  channel: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {customNotification.channel === 'email' && (
              <div>
                <Label>Assunto</Label>
                <Input
                  placeholder="Assunto do email"
                  value={customNotification.subject}
                  onChange={(e) => setCustomNotification({
                    ...customNotification,
                    subject: e.target.value
                  })}
                />
              </div>
            )}
            
            <div>
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite a mensagem..."
                rows={4}
                value={customNotification.message}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  message: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variáveis disponíveis: {'{protocolo}'}, {'{status}'}, {'{tipo}'}, {'{local}'}
              </p>
            </div>
            
            <div>
              <Label>Agendar envio (opcional)</Label>
              <Input
                type="datetime-local"
                value={customNotification.schedule}
                onChange={(e) => setCustomNotification({
                  ...customNotification,
                  schedule: e.target.value
                })}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSendDialog(false)}
                disabled={isSending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={!customNotification.recipient || !customNotification.message || isSending}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DenunciaNotifications;