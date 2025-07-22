import { useState, useEffect, useCallback } from 'react';
import { metricsCollector, initializeMetrics } from '@/utils';
import { healthMonitor, startHealthMonitoring } from '@/utils';
import type { SystemHealth, Alert, MetricsSummary } from '@/utils';

/**
 * Hook personalizado para monitoramento do sistema
 * Facilita o acesso às métricas, alertas e status de saúde
 */
export const useMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Inicializar sistema de monitoramento
  useEffect(() => {
    let stopHealthMonitoring: (() => void) | null = null;

    const initialize = async () => {
      try {
        // Inicializar coleta de métricas
        initializeMetrics();
        
        // Iniciar monitoramento de saúde
        stopHealthMonitoring = startHealthMonitoring(60000); // 1 minuto
        
        console.log('✅ Sistema de monitoramento inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar monitoramento:', error);
      }
    };

    initialize();

    // Cleanup
    return () => {
      if (stopHealthMonitoring) {
        stopHealthMonitoring();
      }
    };
  }, []);

  // Atualizar dados do monitoramento
  const updateMonitoringData = useCallback(async () => {
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
      
      return {
        health: healthData,
        metrics: metricsData,
        alerts: alertsData
      };
    } catch (error) {
      console.error('Erro ao atualizar dados de monitoramento:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resolver alerta
  const resolveAlert = useCallback((alertId: string) => {
    const resolved = metricsCollector.resolveAlert(alertId);
    if (resolved) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
    return resolved;
  }, []);

  // Registrar evento de autenticação
  const recordAuthEvent = useCallback((
    event: 'login.attempt' | 'login.success' | 'login.failure' | 'logout' | 'session.refresh',
    userId?: string,
    metadata?: Record<string, unknown>
  ) => {
    metricsCollector.recordAuthEvent(event, userId, metadata);
  }, []);

  // Registrar erro
  const recordError = useCallback((
    error: Error | string,
    service: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, unknown>
  ) => {
    metricsCollector.recordError(error, service, severity, metadata);
  }, []);

  // Registrar métrica personalizada
  const recordMetric = useCallback((
    name: string,
    value: number,
    tags?: Record<string, string>,
    unit?: string
  ) => {
    metricsCollector.recordMetric(name, value, tags, unit);
  }, []);

  // Verificação rápida de saúde
  const quickHealthCheck = useCallback(async () => {
    try {
      const health = await healthMonitor.performFullHealthCheck();
      return health.overall === 'healthy';
    } catch {
      return false;
    }
  }, []);

  // Obter estatísticas resumidas
  const getStats = useCallback(() => {
    if (!metrics) return null;

    return {
      uptime: systemHealth?.uptime || 0,
      totalRequests: metrics.totalRequests,
      successRate: metrics.successRate,
      errorRate: metrics.errorRate,
      averageResponseTime: metrics.averageResponseTime,
      activeUsers: metrics.activeUsers,
      activeAlerts: alerts.length,
      systemStatus: systemHealth?.overall || 'unknown'
    };
  }, [metrics, systemHealth, alerts]);

  // Atualização automática inicial
  useEffect(() => {
    updateMonitoringData();
  }, [updateMonitoringData]);

  return {
    // Estados
    systemHealth,
    metrics,
    alerts,
    isLoading,
    lastUpdate,
    
    // Ações
    updateMonitoringData,
    resolveAlert,
    recordAuthEvent,
    recordError,
    recordMetric,
    quickHealthCheck,
    getStats,
    
    // Utilitários
    isSystemHealthy: systemHealth?.overall === 'healthy',
    hasActiveAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(alert => alert.level === 'critical'),
  };
};

/**
 * Hook simplificado para registrar métricas de performance
 */
export const usePerformanceTracking = () => {
  const recordOperation = useCallback((operationName: string) => {
    const startTime = Date.now();
    
    return {
      // Função para finalizar o tracking
      finish: (success: boolean = true, metadata?: Record<string, unknown>) => {
        const duration = Date.now() - startTime;
        
        metricsCollector.recordMetric(
          `${operationName}.duration`,
          duration,
          { success: success.toString() },
          'ms'
        );
        
        if (metadata) {
          console.log(`📊 Operation ${operationName}:`, {
            duration,
            success,
            ...metadata
          });
        }
        
        return duration;
      }
    };
  }, []);

  return { recordOperation };
};

/**
 * Hook para monitoramento de autenticação
 */
export const useAuthMonitoring = () => {
  const recordLoginAttempt = useCallback((email: string) => {
    metricsCollector.recordAuthEvent('login.attempt', undefined, { email });
  }, []);

  const recordLoginSuccess = useCallback((userId: string, email: string, method: string = 'email_password') => {
    metricsCollector.recordAuthEvent('login.success', userId, { email, method });
  }, []);

  const recordLoginFailure = useCallback((email: string, error: string) => {
    metricsCollector.recordAuthEvent('login.failure', undefined, { email, error });
  }, []);

  const recordLogout = useCallback((userId: string) => {
    metricsCollector.recordAuthEvent('logout', userId);
  }, []);

  const recordSessionRefresh = useCallback((userId: string) => {
    metricsCollector.recordAuthEvent('session.refresh', userId);
  }, []);

  return {
    recordLoginAttempt,
    recordLoginSuccess,
    recordLoginFailure,
    recordLogout,
    recordSessionRefresh
  };
};
