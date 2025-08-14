import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Smartphone,
  QrCode,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Download,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileApiService } from '@/services/mobileApiService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface QRCodeAuthProps {
  onAuthSuccess?: (sessionData: any) => void;
  className?: string;
}

interface ActiveSession {
  id: string;
  device_info: any;
  created_at: string;
  last_activity: string;
  active: boolean;
}

export function QRCodeAuth({ onAuthSuccess, className }: QRCodeAuthProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [isExpired, setIsExpired] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Gerar novo token QR
  const generateQRToken = async () => {
    if (!profile?.id) return;

    setIsGenerating(true);
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
        ip: 'client-generated' // Em produção, isso seria obtido no servidor
      };

      const token = await MobileApiService.generateQRToken(profile.id, deviceInfo);
      setQrToken(token);
      setTimeLeft(300); // Reset para 5 minutos
      setIsExpired(false);

      toast({
        title: "QR Code gerado",
        description: "Use seu aplicativo mobile para escanear o código",
      });

    } catch (error) {
      console.error('Erro ao gerar QR token:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Carregar sessões ativas
  const loadActiveSessions = async () => {
    if (!profile?.id) return;

    setIsLoadingSessions(true);
    try {
      // TODO: Implementar endpoint para buscar sessões ativas
      // const sessions = await MobileApiService.getActiveSessions(profile.id);
      // setActiveSessions(sessions);
      
      // Mock data para demonstração
      setActiveSessions([
        {
          id: '1',
          device_info: { platform: 'iOS', model: 'iPhone 14' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          active: true
        },
        {
          id: '2',
          device_info: { platform: 'Android', model: 'Samsung Galaxy' },
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          active: true
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Timer para expiração do QR Code
  useEffect(() => {
    if (!qrToken || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrToken, timeLeft]);

  // Verificar autenticação a cada 3 segundos
  useEffect(() => {
    if (!qrToken || isExpired) return;

    const checkAuth = setInterval(async () => {
      try {
        // TODO: Implementar verificação de autenticação via polling
        // const authResult = await MobileApiService.checkQRAuthentication(qrToken);
        // if (authResult.success) {
        //   onAuthSuccess?.(authResult.session);
        //   setQrToken(null);
        // }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    }, 3000);

    return () => clearInterval(checkAuth);
  }, [qrToken, isExpired, onAuthSuccess]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastActivity = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const qrCodeData = qrToken ? JSON.stringify({
    type: 'codema_mobile_auth',
    token: qrToken,
    server: window.location.origin,
    timestamp: Date.now()
  }) : '';

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Acesso Mobile
          </CardTitle>
          <CardDescription>
            Configure o acesso mobile para acompanhar reuniões em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Generator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Autenticação via QR Code</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    App Mobile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>App Mobile CODEMA</DialogTitle>
                    <DialogDescription>
                      Baixe o aplicativo mobile para acompanhar reuniões em tempo real
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        O aplicativo mobile está em desenvolvimento. 
                        Por enquanto, você pode usar esta interface web em seu dispositivo móvel.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <Smartphone className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-medium">iOS</h4>
                          <p className="text-sm text-muted-foreground">App Store</p>
                          <Button variant="outline" size="sm" className="mt-3" disabled>
                            Em breve
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <Smartphone className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-medium">Android</h4>
                          <p className="text-sm text-muted-foreground">Google Play</p>
                          <Button variant="outline" size="sm" className="mt-3" disabled>
                            Em breve
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {qrToken ? (
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block p-4 bg-white rounded-xl border-2 border-dashed border-gray-300"
                >
                  <QRCodeSVG
                    value={qrCodeData}
                    size={200}
                    level="M"
                    includeMargin={true}
                    fgColor={isExpired ? "#ef4444" : "#000000"}
                  />
                </motion.div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Expira em: {formatTimeLeft(timeLeft)}
                    </span>
                  </div>
                  
                  {isExpired ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      QR Code Expirado
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      Aguardando Scan
                    </Badge>
                  )}
                </div>

                <Button
                  variant={isExpired ? "default" : "outline"}
                  onClick={generateQRToken}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isExpired ? 'Gerar Novo QR Code' : 'Atualizar QR Code'}
                </Button>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instruções:</strong>
                    <br />
                    1. Abra o app CODEMA Mobile em seu dispositivo
                    <br />
                    2. Toque em "Escanear QR Code"
                    <br />
                    3. Aponte a câmera para o código acima
                    <br />
                    4. Confirme a autenticação no app
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">QR Code aparecerá aqui</p>
                  </div>
                </div>

                <Button onClick={generateQRToken} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  Gerar QR Code
                </Button>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Dispositivos Conectados</h3>
              <Button variant="outline" size="sm" onClick={loadActiveSessions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {isLoadingSessions ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : activeSessions.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence>
                  {activeSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {session.device_info.platform} {session.device_info.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Última atividade: {formatLastActivity(session.last_activity)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {session.active ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          Desconectar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum dispositivo conectado</p>
                <p className="text-sm">Use o QR Code acima para conectar seu smartphone</p>
              </div>
            )}
          </div>

          {/* Security Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Segurança:</strong> Os códigos QR expiram em 5 minutos e só podem ser usados uma vez. 
              Suas sessões mobile são criptografadas e você pode desconectar dispositivos a qualquer momento.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}