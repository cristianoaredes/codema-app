import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  BarChart3,
  Send,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { NotificationService } from '@/services/notificationService';
import { motion } from 'framer-motion';

export default function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    notificationReport, 
    processQueue, 
    isProcessing, 
    testServices,
    quickStats 
  } = useNotificationScheduler();

  const [autoProcessing, setAutoProcessing] = useState(true);

  // Query para configurações globais
  const {
    data: globalSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['global-notification-settings'],
    queryFn: async () => {
      // Simular busca de configurações globais
      return {
        email_enabled: true,
        sms_enabled: true,
        whatsapp_enabled: false,
        auto_processing: true,
        default_antecedencia: 3,
        max_tentativas: 3,
        intervalo_processamento: 5,
        templates_personalizados: true
      };
    }
  });

  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // Simular atualização de configurações
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Configurações atualizadas",
        description: "As configurações de notificação foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['global-notification-settings'] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
    }
  });

  // Teste de serviços
  const handleTestServices = async () => {
    const result = await testServices();
    if (result) {
      const workingServices = Object.entries(result)
        .filter(([key, value]) => key !== 'errors' && value)
        .map(([key]) => key);
      
      toast({
        title: "Teste de conectividade",
        description: `Serviços funcionando: ${workingServices.join(', ')}`,
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Notificação</h1>
            <p className="text-muted-foreground">
              Gerencie como as notificações são enviadas para os conselheiros
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTestServices}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Testar Serviços
            </Button>
            <Button onClick={processQueue} disabled={isProcessing}>
              {isProcessing ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Processar Fila
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas Rápidas */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{quickStats.pendingTotal}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{quickStats.pendingNext24h}</p>
                  <p className="text-xs text-muted-foreground">Próximas 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{notificationReport?.sent || 0}</p>
                  <p className="text-xs text-muted-foreground">Enviadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{quickStats.totalRecipients}</p>
                  <p className="text-xs text-muted-foreground">Destinatários</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Configurações Principais */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="processing">Processamento</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          </TabsList>

          {/* Aba: Serviços */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração de Serviços
                </CardTitle>
                <CardDescription>
                  Configure quais canais de notificação estão habilitados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-xs text-muted-foreground">Supabase Edge Functions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={globalSettings?.email_enabled ? "default" : "secondary"}>
                        {globalSettings?.email_enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch
                        checked={globalSettings?.email_enabled || false}
                        onCheckedChange={(value) => {
                          updateSettingsMutation.mutate({ email_enabled: value });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">SMS</p>
                        <p className="text-xs text-muted-foreground">Twilio/AWS SNS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={globalSettings?.sms_enabled ? "default" : "secondary"}>
                        {globalSettings?.sms_enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch
                        checked={globalSettings?.sms_enabled || false}
                        onCheckedChange={(value) => {
                          updateSettingsMutation.mutate({ sms_enabled: value });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Business API</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={globalSettings?.whatsapp_enabled ? "default" : "secondary"}>
                        {globalSettings?.whatsapp_enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch
                        checked={globalSettings?.whatsapp_enabled || false}
                        onCheckedChange={(value) => {
                          updateSettingsMutation.mutate({ whatsapp_enabled: value });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Para configurar as credenciais dos serviços, acesse as variáveis de ambiente ou as configurações do Supabase.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Processamento */}
          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Processamento Automático
                </CardTitle>
                <CardDescription>
                  Configure como as notificações são processadas e enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Processamento Automático</p>
                    <p className="text-sm text-muted-foreground">
                      Processar fila de notificações automaticamente a cada {globalSettings?.intervalo_processamento} minutos
                    </p>
                  </div>
                  <Switch
                    checked={autoProcessing}
                    onCheckedChange={setAutoProcessing}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Antecedência Padrão</label>
                    <p className="text-sm text-muted-foreground">
                      {globalSettings?.default_antecedencia} dias antes da reunião
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Máximo de Tentativas</label>
                    <p className="text-sm text-muted-foreground">
                      {globalSettings?.max_tentativas} tentativas por notificação
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={processQueue} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Processar Fila Agora
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={() => processQueue()}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatório de Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Notificação</CardTitle>
                <CardDescription>
                  Gerencie os templates de email e SMS utilizados nas notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Convocação - Email</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Template principal para convocações por email
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="default">Ativo</Badge>
                        <Badge variant="outline">HTML</Badge>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Convocação - SMS</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Template principal para convocações por SMS
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="default">Ativo</Badge>
                        <Badge variant="outline">Texto</Badge>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Lembrete 24h</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Lembrete automático 24 horas antes
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="default">Ativo</Badge>
                        <Badge variant="outline">Multi-canal</Badge>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Cancelamento</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Notificação de cancelamento de reunião
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="default">Ativo</Badge>
                        <Badge variant="outline">Urgente</Badge>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Os templates são gerenciados no código. Para personalizações avançadas, entre em contato com o suporte técnico.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Relatórios */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Relatórios de Notificação
                </CardTitle>
                <CardDescription>
                  Análise detalhada do desempenho das notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Estatísticas Gerais</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total enviadas</span>
                        <span className="font-medium">{notificationReport?.sent || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Falhas</span>
                        <span className="font-medium text-red-600">{notificationReport?.failed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pendentes</span>
                        <span className="font-medium text-orange-600">{notificationReport?.pending || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de sucesso</span>
                        <span className="font-medium text-green-600">
                          {notificationReport?.total ? 
                            Math.round((notificationReport.sent / notificationReport.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Por Tipo</h4>
                    <div className="space-y-2">
                      {notificationReport?.by_type && Object.entries(notificationReport.by_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}