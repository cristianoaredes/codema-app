import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NotificationConfig {
  enabled: boolean;
  antecedencia_dias: number;
  lembrete_24h: boolean;
  lembrete_2h: boolean;
  incluir_pauta: boolean;
  incluir_documentos: boolean;
  canais: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  destinatarios: string[];
}

interface NotificationConfigPanelProps {
  config: NotificationConfig;
  onChange: (config: NotificationConfig) => void;
  availableConselheiros?: Array<{
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    cargo: string;
  }>;
  reunionData?: {
    data_reuniao: string;
    tipo: string;
  };
  className?: string;
}

export function NotificationConfigPanel({
  config,
  onChange,
  availableConselheiros = [],
  reunionData,
  className
}: NotificationConfigPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (updates: Partial<NotificationConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateCanais = (canal: keyof NotificationConfig['canais'], value: boolean) => {
    updateConfig({
      canais: {
        ...config.canais,
        [canal]: value
      }
    });
  };

  const getDataEnvio = () => {
    if (!reunionData?.data_reuniao) return null;
    
    const dataReuniao = new Date(reunionData.data_reuniao);
    const dataEnvio = new Date(dataReuniao);
    dataEnvio.setDate(dataEnvio.getDate() - config.antecedencia_dias);
    
    return dataEnvio;
  };

  const getLembreteDates = () => {
    if (!reunionData?.data_reuniao) return { lembrete24h: null, lembrete2h: null };
    
    const dataReuniao = new Date(reunionData.data_reuniao);
    
    const lembrete24h = new Date(dataReuniao);
    lembrete24h.setHours(lembrete24h.getHours() - 24);
    
    const lembrete2h = new Date(dataReuniao);
    lembrete2h.setHours(lembrete2h.getHours() - 2);
    
    return { lembrete24h, lembrete2h };
  };

  const dataEnvio = getDataEnvio();
  const { lembrete24h, lembrete2h } = getLembreteDates();
  
  const canaisAtivos = Object.entries(config.canais).filter(([_, ativo]) => ativo).length;
  const destinatariosSelecionados = config.destinatarios.length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configurações de Notificação
            </CardTitle>
            <CardDescription>
              Configure como e quando os conselheiros serão notificados sobre esta reunião
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
            <span className="text-sm font-medium">
              {config.enabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {config.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Status de Configuração */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Canais Ativos</p>
                  <p className="text-xs text-muted-foreground">{canaisAtivos} de 3</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Destinatários</p>
                  <p className="text-xs text-muted-foreground">{destinatariosSelecionados}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Agendamentos</p>
                  <p className="text-xs text-muted-foreground">
                    {1 + (config.lembrete_24h ? 1 : 0) + (config.lembrete_2h ? 1 : 0)} notificações
                  </p>
                </div>
              </div>
            </div>

            {/* Cronograma de Envio */}
            {dataEnvio && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Cronograma de Envio
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="font-medium text-sm">Convocação Inicial</p>
                        <p className="text-xs text-muted-foreground">
                          {dataEnvio.toLocaleDateString('pt-BR')} às {dataEnvio.toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Principal</Badge>
                  </div>

                  {config.lembrete_24h && lembrete24h && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div>
                          <p className="font-medium text-sm">Lembrete 24h</p>
                          <p className="text-xs text-muted-foreground">
                            {lembrete24h.toLocaleDateString('pt-BR')} às {lembrete24h.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Lembrete</Badge>
                    </div>
                  )}

                  {config.lembrete_2h && lembrete2h && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <div>
                          <p className="font-medium text-sm">Lembrete 2h</p>
                          <p className="text-xs text-muted-foreground">
                            {lembrete2h.toLocaleDateString('pt-BR')} às {lembrete2h.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">Urgente</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configurações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Antecedência da Convocação</label>
                <Select
                  value={config.antecedencia_dias.toString()}
                  onValueChange={(value) => updateConfig({ antecedencia_dias: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia antes</SelectItem>
                    <SelectItem value="2">2 dias antes</SelectItem>
                    <SelectItem value="3">3 dias antes</SelectItem>
                    <SelectItem value="5">5 dias antes</SelectItem>
                    <SelectItem value="7">7 dias antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Lembretes Automáticos</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lembrete 24 horas antes</span>
                    <Switch
                      checked={config.lembrete_24h}
                      onCheckedChange={(value) => updateConfig({ lembrete_24h: value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lembrete 2 horas antes</span>
                    <Switch
                      checked={config.lembrete_2h}
                      onCheckedChange={(value) => updateConfig({ lembrete_2h: value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Canais de Comunicação */}
            <div className="space-y-3">
              <h4 className="font-medium">Canais de Comunicação</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <Switch
                    checked={config.canais.email}
                    onCheckedChange={(value) => updateCanais('email', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">SMS</span>
                  </div>
                  <Switch
                    checked={config.canais.sms}
                    onCheckedChange={(value) => updateCanais('sms', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </div>
                  <Switch
                    checked={config.canais.whatsapp}
                    onCheckedChange={(value) => updateCanais('whatsapp', value)}
                  />
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurações Avançadas
              </Button>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 border rounded-lg bg-muted/50"
                >
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Conteúdo das Notificações</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Incluir pauta da reunião</span>
                        <Switch
                          checked={config.incluir_pauta}
                          onCheckedChange={(value) => updateConfig({ incluir_pauta: value })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Anexar documentos</span>
                        <Switch
                          checked={config.incluir_documentos}
                          onCheckedChange={(value) => updateConfig({ incluir_documentos: value })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Validação */}
            {canaisAtivos === 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  Selecione pelo menos um canal de comunicação
                </span>
              </div>
            )}

            {destinatariosSelecionados === 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700 dark:text-orange-300">
                  A lista de destinatários será preenchida automaticamente com todos os conselheiros ativos
                </span>
              </div>
            )}

            {config.enabled && canaisAtivos > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Configuração válida! As notificações serão agendadas automaticamente.
                </span>
              </div>
            )}
          </motion.div>
        )}

        {!config.enabled && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Ative as notificações para configurar convocações automáticas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}