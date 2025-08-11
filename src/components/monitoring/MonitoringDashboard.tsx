import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription as _CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  TrendingUp,
  Shield,
  Database,
  Wifi as _Wifi
} from 'lucide-react';
import { metricsCollector } from '@/utils';
import { healthMonitor } from '@/utils';
import { authCircuitBreaker, databaseCircuitBreaker } from '@/utils';
import type { SystemHealth, Alert as AlertType, MetricsSummary } from '@/utils';

/**
 * Dashboard de Monitoramento do Sistema CODEMA
 * Exibe métricas em tempo real, alertas e status de saúde
 */
export const MonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Atualizar dados do dashboard
  const updateDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Buscar dados em paralelo
      const [healthData, metricsData, alertsData] = await Promise.all([
        healthMonitor.performFullHealthCheck(),
        Promise.resolve(metricsCollector.getMetricsSummary()),
        Promise.resolve(metricsCollector.getActiveAlerts())
      ]);

      setSystemHealth(healthData);
      setMetrics(metricsData);
      setAlerts(alertsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualização automática
  useEffect(() => {
    updateDashboard();
    
    const interval = setInterval(updateDashboard, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Resolver alerta
  const resolveAlert = (alertId: string) => {
    metricsCollector.resolveAlert(alertId);
    updateDashboard();
  };

  // Formatação de tempo
  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      degraded: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-500' },
      unhealthy: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-500' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.unhealthy;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Alert badge
  const getAlertBadge = (level: string) => {
    const variants = {
      info: { variant: 'outline' as const, color: 'text-blue-500' },
      warning: { variant: 'secondary' as const, color: 'text-yellow-500' },
      error: { variant: 'destructive' as const, color: 'text-red-500' },
      critical: { variant: 'destructive' as const, color: 'text-red-600' }
    };
    
    const config = variants[level as keyof typeof variants] || variants.error;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Monitoramento</h1>
          <p className="text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={updateDashboard} disabled={isLoading}>
          <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {systemHealth && getStatusBadge(systemHealth.overall)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {systemHealth && formatUptime(systemHealth.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sessões ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalRequests || 0} requisições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Pico: {metrics?.peakResponseTime || 0}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Saúde dos Serviços</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas {alerts.length > 0 && `(${alerts.length})`}
          </TabsTrigger>
          <TabsTrigger value="circuit-breakers">Circuit Breakers</TabsTrigger>
        </TabsList>

        {/* Saúde dos Serviços */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemHealth?.services.map((service) => (
              <Card key={service.service}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">
                      {service.service.replace('-', ' ')}
                    </CardTitle>
                    {getStatusBadge(service.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de resposta:</span>
                      <span>{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Última verificação:</span>
                      <span>{new Date(service.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {service.error && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {service.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum alerta ativo</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertBadge(alert.level)}
                        <CardTitle className="text-sm">{alert.service}</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                    {alert.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground">
                          Detalhes técnicos
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-muted rounded">
                          {JSON.stringify(alert.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Circuit Breakers */}
        <TabsContent value="circuit-breakers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Auth Circuit Breaker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estado:</span>
                    <Badge variant={authCircuitBreaker.getState().state === 'closed' ? 'default' : 'destructive'}>
                      {authCircuitBreaker.getState().state.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Falhas:</span>
                    <span>{authCircuitBreaker.getState().failures}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Circuit Breaker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estado:</span>
                    <Badge variant={databaseCircuitBreaker.getState().state === 'closed' ? 'default' : 'destructive'}>
                      {databaseCircuitBreaker.getState().state.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Falhas:</span>
                    <span>{databaseCircuitBreaker.getState().failures}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
