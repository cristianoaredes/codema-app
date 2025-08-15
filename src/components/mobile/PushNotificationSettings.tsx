import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  BellOff,
  Smartphone,
  Clock,
  Settings,
  Shield,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Info,
  TestTube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PushNotificationService, 
  NotificationPreferences,
  PushNotification 
} from '@/services/pushNotificationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationSettingsProps {
  className?: string;
}

export function PushNotificationSettings({ className }: PushNotificationSettingsProps) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    categories: {
      meeting: true,
      voting: true,
      document: true,
      system: true,
      reminder: true
    },
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'immediate'
  });

  // Verificar suporte e status das notificações
  useEffect(() => {
    const checkNotificationSupport = async () => {
      setIsLoading(true);
      
      try {
        const supported = PushNotificationService.isSupported();
        setIsSupported(supported);

        if (supported) {
          const permission = PushNotificationService.getPermissionStatus();
          setPermissionStatus(permission);

          const subscribed = await PushNotificationService.isSubscribed();
          setIsSubscribed(subscribed);

          if (profile?.id) {
            const userPreferences = await PushNotificationService.getNotificationPreferences(profile.id);
            setPreferences(userPreferences);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar suporte a notificações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkNotificationSupport();
  }, [profile?.id]);

  // Solicitar permissão e subscrever
  const handleEnableNotifications = async () => {
    if (!profile?.id) return;

    try {
      const permission = await PushNotificationService.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const subscription = await PushNotificationService.subscribe(profile.id);
        
        if (subscription) {
          setIsSubscribed(true);
          setPreferences(prev => ({ ...prev, enabled: true }));
          
          await PushNotificationService.updateNotificationPreferences(profile.id, {
            ...preferences,
            enabled: true
          });

          toast({
            title: "Notificações ativadas",
            description: "Você receberá notificações sobre reuniões e votações",
          });
        }
      } else {
        toast({
          title: "Permissão negada",
          description: "Para receber notificações, ative-as nas configurações do navegador",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast({
        title: "Erro ao ativar notificações",
        description: "Tente novamente ou verifique as configurações do navegador",
        variant: "destructive",
      });
    }
  };

  // Desativar notificações
  const handleDisableNotifications = async () => {
    if (!profile?.id) return;

    try {
      const success = await PushNotificationService.unsubscribe(profile.id);
      
      if (success) {
        setIsSubscribed(false);
        setPreferences(prev => ({ ...prev, enabled: false }));
        
        await PushNotificationService.updateNotificationPreferences(profile.id, {
          ...preferences,
          enabled: false
        });

        toast({
          title: "Notificações desativadas",
          description: "Você não receberá mais notificações push",
        });
      }
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast({
        title: "Erro ao desativar notificações",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  // Atualizar preferências
  const handleUpdatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!profile?.id) return;

    try {
      const success = await PushNotificationService.updateNotificationPreferences(
        profile.id,
        newPreferences
      );

      if (success) {
        setPreferences(newPreferences);
        toast({
          title: "Preferências atualizadas",
          description: "Suas configurações de notificação foram salvas",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar as preferências",
        variant: "destructive",
      });
    }
  };

  // Testar notificação
  const handleTestNotification = async () => {
    const testNotification: PushNotification = {
      id: 'test-' + Date.now(),
      title: 'Teste de Notificação - CODEMA',
      body: 'Esta é uma notificação de teste. Se você conseguir ver isso, tudo está funcionando!',
      icon: '/icon-192x192.png',
      category: 'system',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: { test: true }
    };

    try {
      await PushNotificationService.showLocalNotification(testNotification);
      toast({
        title: "Notificação teste enviada",
        description: "Verifique se a notificação apareceu",
      });
    } catch (error) {
      console.error('Erro ao enviar notificação teste:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação teste",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Configure as notificações que você quer receber no seu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status de Suporte */}
          {!isSupported && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seu navegador não suporta notificações push. 
                Use um navegador moderno como Chrome, Firefox ou Safari para receber notificações.
              </AlertDescription>
            </Alert>
          )}

          {/* Controle Principal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Ativar Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações sobre reuniões, votações e documentos importantes
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={
                  permissionStatus === 'granted' ? 'default' :
                  permissionStatus === 'denied' ? 'destructive' :
                  'secondary'
                }>
                  {permissionStatus === 'granted' ? 'Permitido' :
                   permissionStatus === 'denied' ? 'Negado' :
                   'Pendente'}
                </Badge>
                
                <Switch
                  checked={preferences.enabled && isSubscribed}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleEnableNotifications();
                    } else {
                      handleDisableNotifications();
                    }
                  }}
                  disabled={!isSupported || permissionStatus === 'denied'}
                />
              </div>
            </div>

            {permissionStatus === 'denied' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  As notificações foram bloqueadas. Para ativá-las:
                  <br />
                  1. Clique no ícone de cadeado na barra de endereços
                  <br />
                  2. Altere a permissão de "Notificações" para "Permitir"
                  <br />
                  3. Recarregue a página
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Configurações Detalhadas */}
          <AnimatePresence>
            {preferences.enabled && isSubscribed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Categorias de Notificação */}
                <div className="space-y-4">
                  <h3 className="font-medium">Tipos de Notificação</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <Label>Reuniões</Label>
                          <p className="text-sm text-muted-foreground">
                            Convocações, lembretes e início de reuniões
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.categories.meeting}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...preferences,
                            categories: { ...preferences.categories, meeting: checked }
                          };
                          handleUpdatePreferences(newPreferences);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <Label>Votações</Label>
                          <p className="text-sm text-muted-foreground">
                            Novas votações e resultados
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.categories.voting}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...preferences,
                            categories: { ...preferences.categories, voting: checked }
                          };
                          handleUpdatePreferences(newPreferences);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <Label>Documentos</Label>
                          <p className="text-sm text-muted-foreground">
                            Atas, resoluções e novos documentos
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.categories.document}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...preferences,
                            categories: { ...preferences.categories, document: checked }
                          };
                          handleUpdatePreferences(newPreferences);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <div>
                          <Label>Lembretes</Label>
                          <p className="text-sm text-muted-foreground">
                            Lembretes de tarefas e prazos
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.categories.reminder}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...preferences,
                            categories: { ...preferences.categories, reminder: checked }
                          };
                          handleUpdatePreferences(newPreferences);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label>Sistema</Label>
                          <p className="text-sm text-muted-foreground">
                            Atualizações do sistema e manutenção
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.categories.system}
                        onCheckedChange={(checked) => {
                          const newPreferences = {
                            ...preferences,
                            categories: { ...preferences.categories, system: checked }
                          };
                          handleUpdatePreferences(newPreferences);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Horário Silencioso */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Horário Silencioso</Label>
                      <p className="text-sm text-muted-foreground">
                        Não receber notificações em determinados horários
                      </p>
                    </div>
                    <Switch
                      checked={preferences.quiet_hours.enabled}
                      onCheckedChange={(checked) => {
                        const newPreferences = {
                          ...preferences,
                          quiet_hours: { ...preferences.quiet_hours, enabled: checked }
                        };
                        handleUpdatePreferences(newPreferences);
                      }}
                    />
                  </div>

                  {preferences.quiet_hours.enabled && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50"
                    >
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={preferences.quiet_hours.start}
                          onChange={(e) => {
                            const newPreferences = {
                              ...preferences,
                              quiet_hours: { ...preferences.quiet_hours, start: e.target.value }
                            };
                            handleUpdatePreferences(newPreferences);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={preferences.quiet_hours.end}
                          onChange={(e) => {
                            const newPreferences = {
                              ...preferences,
                              quiet_hours: { ...preferences.quiet_hours, end: e.target.value }
                            };
                            handleUpdatePreferences(newPreferences);
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Frequência */}
                <div className="space-y-2">
                  <Label>Frequência das Notificações</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(value: 'immediate' | 'batched' | 'daily_digest') => {
                      const newPreferences = { ...preferences, frequency: value };
                      handleUpdatePreferences(newPreferences);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediata</SelectItem>
                      <SelectItem value="batched">Agrupada (a cada hora)</SelectItem>
                      <SelectItem value="daily_digest">Resumo diário</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {preferences.frequency === 'immediate' && 'Receba notificações assim que acontecem'}
                    {preferences.frequency === 'batched' && 'Receba notificações agrupadas a cada hora'}
                    {preferences.frequency === 'daily_digest' && 'Receba um resumo diário das atividades'}
                  </p>
                </div>

                {/* Teste de Notificação */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Testar Notificações</Label>
                      <p className="text-sm text-muted-foreground">
                        Envie uma notificação de teste para verificar se está funcionando
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleTestNotification}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Testar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Informações de Segurança */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacidade:</strong> As notificações são enviadas diretamente para seu dispositivo. 
              Não compartilhamos suas informações com terceiros e você pode desativar a qualquer momento.
            </AlertDescription>
          </Alert>

          {/* Troubleshooting */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Info className="h-4 w-4 mr-2" />
                Solução de Problemas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solução de Problemas</DialogTitle>
                <DialogDescription>
                  Problemas comuns com notificações e como resolvê-los
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Não estou recebendo notificações</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Verifique se as notificações estão ativadas no navegador</li>
                    <li>Certifique-se de que o site não está em modo privado/incógnito</li>
                    <li>Verifique as configurações de "Não Perturbe" do seu dispositivo</li>
                    <li>Teste uma notificação usando o botão "Testar" acima</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">As notificações não aparecem no mobile</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Adicione o site à tela inicial para melhor suporte</li>
                    <li>Verifique as configurações de notificação do navegador mobile</li>
                    <li>Mantenha o navegador em segundo plano (não feche completamente)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recebendo muitas notificações</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Ajuste as categorias de notificação acima</li>
                    <li>Configure o horário silencioso</li>
                    <li>Altere a frequência para "Agrupada" ou "Resumo diário"</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}