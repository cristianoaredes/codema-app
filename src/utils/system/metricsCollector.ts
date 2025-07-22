/**
 * Sistema de Coleta de Métricas e Alertas
 * Monitora performance, erros e comportamento do sistema
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
  unit?: string;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  service: string;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export interface MetricsSummary {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  peakResponseTime: number;
  activeUsers: number;
  systemUptime: number;
}

/**
 * Coletor de métricas centralizado
 */
class MetricsCollector {
  private metrics: Metric[] = [];
  private alerts: Alert[] = [];
  private startTime: number = Date.now();
  private activeUsers: Set<string> = new Set();

  // Contadores de performance
  private counters = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    authAttempts: 0,
    successfulLogins: 0,
    failedLogins: 0,
    logouts: 0,
    sessionRefreshes: 0
  };

  // Métricas de tempo de resposta
  private responseTimes: number[] = [];
  private readonly maxResponseTimeHistory = 1000;

  /**
   * Registra uma métrica
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    const metric: Metric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      unit
    };

    this.metrics.push(metric);

    // Manter apenas as últimas 10000 métricas para evitar vazamento de memória
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }

    // Processar métricas especiais
    this.processSpecialMetrics(name, value, tags);
  }

  /**
   * Processa métricas especiais para contadores e alertas
   */
  private processSpecialMetrics(name: string, value: number, tags?: Record<string, string>): void {
    switch (name) {
      case 'auth.login.attempt':
        this.counters.authAttempts++;
        this.counters.totalRequests++;
        break;
      
      case 'auth.login.success':
        this.counters.successfulLogins++;
        this.counters.successfulRequests++;
        if (tags?.userId) {
          this.activeUsers.add(tags.userId);
        }
        break;
      
      case 'auth.login.failure':
        this.counters.failedLogins++;
        this.counters.failedRequests++;
        this.checkLoginFailureRate();
        break;
      
      case 'auth.logout':
        this.counters.logouts++;
        if (tags?.userId) {
          this.activeUsers.delete(tags.userId);
        }
        break;
      
      case 'auth.session.refresh':
        this.counters.sessionRefreshes++;
        break;
      
      case 'response.time':
        this.responseTimes.push(value);
        if (this.responseTimes.length > this.maxResponseTimeHistory) {
          this.responseTimes = this.responseTimes.slice(-500);
        }
        this.checkResponseTime(value);
        break;
    }
  }

  /**
   * Verifica taxa de falhas de login e gera alertas
   */
  private checkLoginFailureRate(): void {
    const recentFailures = this.getRecentMetrics('auth.login.failure', 5 * 60 * 1000); // 5 minutos
    
    if (recentFailures.length >= 10) {
      this.createAlert('critical', 'High login failure rate detected', 'auth', {
        failures: recentFailures.length,
        timeWindow: '5 minutes'
      });
    } else if (recentFailures.length >= 5) {
      this.createAlert('warning', 'Elevated login failure rate', 'auth', {
        failures: recentFailures.length,
        timeWindow: '5 minutes'
      });
    }
  }

  /**
   * Verifica tempo de resposta e gera alertas
   */
  private checkResponseTime(responseTime: number): void {
    if (responseTime > 10000) { // 10 segundos
      this.createAlert('critical', 'Extremely slow response time detected', 'performance', {
        responseTime,
        threshold: 10000
      });
    } else if (responseTime > 5000) { // 5 segundos
      this.createAlert('warning', 'Slow response time detected', 'performance', {
        responseTime,
        threshold: 5000
      });
    }

    // Verificar média dos últimos 10 requests
    if (this.responseTimes.length >= 10) {
      const recent = this.responseTimes.slice(-10);
      const average = recent.reduce((sum, time) => sum + time, 0) / recent.length;
      
      if (average > 3000) {
        this.createAlert('warning', 'Average response time degraded', 'performance', {
          averageResponseTime: average,
          threshold: 3000,
          sampleSize: 10
        });
      }
    }
  }

  /**
   * Cria um alerta
   */
  private createAlert(
    level: Alert['level'],
    message: string,
    service: string,
    metadata?: Record<string, unknown>
  ): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      service,
      resolved: false,
      metadata
    };

    this.alerts.push(alert);

    // Log do alerta
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[level];

    console.log(`${emoji} ALERT [${level.toUpperCase()}] ${service}: ${message}`, metadata);

    // Manter apenas os últimos 1000 alertas
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-500);
    }
  }

  /**
   * Obtém métricas recentes por nome
   */
  private getRecentMetrics(name: string, timeWindowMs: number): Metric[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.metrics.filter(
      metric => metric.name === name && 
      new Date(metric.timestamp).getTime() > cutoff
    );
  }

  /**
   * Registra início de operação
   */
  startOperation(operationName: string, tags?: Record<string, string>): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(`${operationName}.duration`, duration, tags, 'ms');
      this.recordMetric('response.time', duration, { operation: operationName }, 'ms');
    };
  }

  /**
   * Registra evento de autenticação
   */
  recordAuthEvent(
    event: 'login.attempt' | 'login.success' | 'login.failure' | 'logout' | 'session.refresh',
    userId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const tags = userId ? { userId } : undefined;
    this.recordMetric(`auth.${event}`, 1, tags, 'count');
    
    if (metadata) {
      console.log(`🔐 Auth Event: ${event}`, { userId, ...metadata });
    }
  }

  /**
   * Registra erro do sistema
   */
  recordError(
    error: Error | string,
    service: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, unknown>
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    
    this.recordMetric('system.error', 1, { service, severity }, 'count');
    
    const alertLevelMap: Record<string, Alert['level']> = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'critical'
    };
    const alertLevel = alertLevelMap[severity];

    this.createAlert(alertLevel, `Error in ${service}: ${errorMessage}`, service, {
      error: errorMessage,
      severity,
      ...metadata
    });
  }

  /**
   * Obtém resumo das métricas
   */
  getMetricsSummary(): MetricsSummary {
    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    const peakResponseTime = this.responseTimes.length > 0
      ? Math.max(...this.responseTimes)
      : 0;

    const successRate = this.counters.totalRequests > 0
      ? (this.counters.successfulRequests / this.counters.totalRequests) * 100
      : 100;

    const errorRate = this.counters.totalRequests > 0
      ? (this.counters.failedRequests / this.counters.totalRequests) * 100
      : 0;

    return {
      totalRequests: this.counters.totalRequests,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      peakResponseTime: Math.round(peakResponseTime),
      activeUsers: this.activeUsers.size,
      systemUptime: Date.now() - this.startTime
    };
  }

  /**
   * Obtém alertas ativos
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve um alerta
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  /**
   * Obtém métricas por período
   */
  getMetricsByPeriod(hours: number = 1): Metric[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.metrics.filter(
      metric => new Date(metric.timestamp).getTime() > cutoff
    );
  }

  /**
   * Limpa métricas antigas
   */
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    this.metrics = this.metrics.filter(
      metric => new Date(metric.timestamp).getTime() > cutoff
    );
    
    // Limpar alertas resolvidos antigos
    this.alerts = this.alerts.filter(
      alert => !alert.resolved || 
      new Date(alert.timestamp).getTime() > cutoff
    );
  }

  /**
   * Exporta dados para análise
   */
  exportData(): {
    metrics: Metric[];
    alerts: Alert[];
    summary: MetricsSummary;
    counters: typeof this.counters;
  } {
    return {
      metrics: [...this.metrics],
      alerts: [...this.alerts],
      summary: this.getMetricsSummary(),
      counters: { ...this.counters }
    };
  }
}

// Instância singleton
export const metricsCollector = new MetricsCollector();

/**
 * Hook para inicializar coleta de métricas
 */
export const initializeMetrics = () => {
  // Cleanup automático a cada hora
  setInterval(() => {
    metricsCollector.cleanup();
  }, 60 * 60 * 1000);

  // Log de resumo a cada 10 minutos
  setInterval(() => {
    const summary = metricsCollector.getMetricsSummary();
    const activeAlerts = metricsCollector.getActiveAlerts();
    
    console.log('📊 Metrics Summary:', summary);
    
    if (activeAlerts.length > 0) {
      console.warn('🚨 Active Alerts:', activeAlerts.length);
    }
  }, 10 * 60 * 1000);

  console.log('📈 Metrics collection initialized');
};

/**
 * Decorator para medir performance de funções
 */
export function measurePerformance(operationName: string) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const endTimer = metricsCollector.startOperation(operationName, {
        method: propertyKey,
        class: target.constructor.name
      });

      try {
        const result = await originalMethod.apply(this, args);
        metricsCollector.recordMetric(`${operationName}.success`, 1, undefined, 'count');
        return result;
      } catch (error) {
        metricsCollector.recordError(
          error instanceof Error ? error : new Error(String(error)),
          operationName,
          'medium',
          { method: propertyKey, class: target.constructor.name }
        );
        throw error;
      } finally {
        endTimer();
      }
    };

    return descriptor;
  };
}
