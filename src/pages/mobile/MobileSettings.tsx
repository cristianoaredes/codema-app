import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone,
  QrCode,
  Bell,
  Settings,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Wifi,
  Battery,
  Signal,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeAuth } from '@/components/mobile/QRCodeAuth';
import { PushNotificationSettings } from '@/components/mobile/PushNotificationSettings';
import { MobileReunionTracker } from '@/components/mobile/MobileReunionTracker';
import { BreadcrumbWithActions, SmartBreadcrumb } from '@/components/navigation/SmartBreadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function MobileSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data para demo
  const mobileStats = {
    devices_connected: 2,
    notifications_sent: 45,
    last_sync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
    app_version: '1.0.0-beta',
    connection_quality: 'excellent'
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

  const getConnectionIcon = () => {
    switch (mobileStats.connection_quality) {
      case 'excellent': return <Signal className="h-4 w-4 text-green-600" />;
      case 'good': return <Signal className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <Signal className="h-4 w-4 text-red-600" />;
      default: return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <BreadcrumbWithActions
          title="Configurações Mobile"
          description="Configure o acesso mobile e notificações para conselheiros"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Manual do App
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
            </div>
          }
        >
          <SmartBreadcrumb />
        </BreadcrumbWithActions>
      </motion.div>

      {/* Alertas e Status */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>App Mobile em Beta:</strong> O aplicativo mobile está em desenvolvimento. 
              Use a versão web mobile por enquanto.
            </AlertDescription>
          </Alert>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getConnectionIcon()}
                    <div>
                      <p className="font-medium">Status de Conexão</p>
                      <p className="text-sm text-muted-foreground">
                        Última sincronização: {mobileStats.last_sync.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{mobileStats.devices_connected}</p>
                      <p className="text-xs text-muted-foreground">Dispositivos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{mobileStats.notifications_sent}</p>
                      <p className="text-xs text-muted-foreground">Notificações</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Autenticação
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Demo
            </TabsTrigger>
          </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recursos Mobile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Recursos Mobile
                  </CardTitle>
                  <CardDescription>
                    Funcionalidades disponíveis para conselheiros mobile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Autenticação QR Code</span>
                      </div>
                      <Badge variant="default">Ativo</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Notificações Push</span>
                      </div>
                      <Badge variant="default">Ativo</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Check-in de Presença</span>
                      </div>
                      <Badge variant="default">Ativo</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Acompanhamento em Tempo Real</span>
                      </div>
                      <Badge variant="default">Ativo</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">Votação Eletrônica</span>
                      </div>
                      <Badge variant="secondary">Em Desenvolvimento</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas de Uso */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso</CardTitle>
                  <CardDescription>
                    Métricas de utilização do sistema mobile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Smartphone className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">Conselheiros Ativos</p>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-xs text-muted-foreground">Taxa de Check-in</p>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Bell className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold">245</p>
                      <p className="text-xs text-muted-foreground">Notificações Enviadas</p>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold">88%</p>
                      <p className="text-xs text-muted-foreground">Engajamento</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Dispositivos por Plataforma</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>iOS</span>
                        <span className="font-medium">5 dispositivos</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Android</span>
                        <span className="font-medium">3 dispositivos</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Web Mobile</span>
                        <span className="font-medium">2 dispositivos</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Guia Rápido */}
            <Card>
              <CardHeader>
                <CardTitle>Guia Rápido para Conselheiros</CardTitle>
                <CardDescription>
                  Instruções simples para configurar e usar o sistema mobile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                      <QrCode className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">1. Conectar Dispositivo</h4>
                      <p className="text-sm text-muted-foreground">
                        Use a aba "Autenticação" para gerar um QR Code e conectar seu smartphone
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">2. Ativar Notificações</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure as notificações push para receber alertas sobre reuniões
                      </p>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">3. Participar das Reuniões</h4>
                      <p className="text-sm text-muted-foreground">
                        Faça check-in, acompanhe a pauta e participe das discussões
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Autenticação */}
          <TabsContent value="auth" className="space-y-6">
            <QRCodeAuth />
          </TabsContent>

          {/* Aba: Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationSettings />
          </TabsContent>

          {/* Aba: Demo */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demonstração - Reunião em Tempo Real
                </CardTitle>
                <CardDescription>
                  Simula como um conselheiro acompanharia uma reunião pelo mobile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Esta é uma demonstração simulada. Os dados são fictícios e atualizados automaticamente 
                    para mostrar como funciona o acompanhamento em tempo real.
                  </AlertDescription>
                </Alert>

                <MobileReunionTracker
                  reunionId="demo-reunion"
                  autoRefresh={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Rodapé com Informações Técnicas */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium mb-2">Versão do Sistema</h4>
                <p className="text-sm text-muted-foreground">
                  App Mobile: {mobileStats.app_version}
                  <br />
                  Web: 2.1.0
                  <br />
                  API: 1.0.0
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compatibilidade</h4>
                <p className="text-sm text-muted-foreground">
                  iOS 12+ / Android 8+
                  <br />
                  Chrome 80+ / Safari 13+
                  <br />
                  PWA Ready
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recursos</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Push Notifications</Badge>
                  <Badge variant="outline" className="text-xs">Real-time Sync</Badge>
                  <Badge variant="outline" className="text-xs">Offline Support</Badge>
                  <Badge variant="outline" className="text-xs">QR Auth</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}