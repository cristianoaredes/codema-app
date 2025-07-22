import { supabase } from '@/integrations/supabase/client';

/**
 * Sistema de Health Check e Monitoramento
 * Monitora a saúde dos serviços críticos do CODEMA
 */

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthCheckResult[];
  timestamp: string;
  uptime: number;
}

// Métricas de performance
interface PerformanceMetrics {
  authRequests: number;
  authSuccessRate: number;
  averageResponseTime: number;
  errorCount: number;
  lastError?: string;
  resetTime: string;
}

class HealthMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      authRequests: 0,
      authSuccessRate: 100,
      averageResponseTime: 0,
      errorCount: 0,
      resetTime: new Date().toISOString()
    };
  }

  /**
   * Verifica a saúde do Supabase Auth
   */
  async checkSupabaseAuth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'supabase-auth',
          status: 'degraded',
          responseTime,
          timestamp: new Date().toISOString(),
          error: error.message
        };
      }

      return {
        service: 'supabase-auth',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          sessionExists: !!data.session,
          userExists: !!data.session?.user
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'supabase-auth',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verifica a saúde do banco de dados
   */
  async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Teste simples de conectividade com a tabela profiles
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'database',
          status: 'degraded',
          responseTime,
          timestamp: new Date().toISOString(),
          error: error.message
        };
      }

      return {
        service: 'database',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          connection: 'active'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verifica a saúde do localStorage
   */
  async checkLocalStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const testKey = 'codema-health-check';
      const testValue = Date.now().toString();
      
      // Teste de escrita
      localStorage.setItem(testKey, testValue);
      
      // Teste de leitura
      const retrieved = localStorage.getItem(testKey);
      
      // Limpeza
      localStorage.removeItem(testKey);
      
      const responseTime = Date.now() - startTime;

      if (retrieved !== testValue) {
        return {
          service: 'localStorage',
          status: 'degraded',
          responseTime,
          timestamp: new Date().toISOString(),
          error: 'Read/write test failed'
        };
      }

      return {
        service: 'localStorage',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          available: true,
          readWrite: 'working'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'localStorage',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'LocalStorage not available'
      };
    }
  }

  /**
   * Verifica a saúde da rede/conectividade
   */
  async checkNetworkConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Teste de conectividade básica
      const online = navigator.onLine;
      const responseTime = Date.now() - startTime;

      if (!online) {
        return {
          service: 'network',
          status: 'unhealthy',
          responseTime,
          timestamp: new Date().toISOString(),
          error: 'No network connection detected'
        };
      }

      return {
        service: 'network',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          online: true,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        service: 'network',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network check failed'
      };
    }
  }

  /**
   * Executa todos os health checks
   */
  async performFullHealthCheck(): Promise<SystemHealth> {
    const checks = await Promise.all([
      this.checkSupabaseAuth(),
      this.checkDatabase(),
      this.checkLocalStorage(),
      this.checkNetworkConnectivity()
    ]);

    // Determinar status geral do sistema
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      services: checks,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Registra uma requisição de autenticação
   */
  recordAuthRequest(success: boolean, responseTime: number, error?: string): void {
    this.metrics.authRequests++;
    
    if (!success) {
      this.metrics.errorCount++;
      this.metrics.lastError = error;
    }

    // Calcular taxa de sucesso
    const successCount = this.metrics.authRequests - this.metrics.errorCount;
    this.metrics.authSuccessRate = (successCount / this.metrics.authRequests) * 100;

    // Atualizar tempo médio de resposta
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  /**
   * Obtém métricas de performance
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reseta métricas
   */
  resetMetrics(): void {
    this.metrics = {
      authRequests: 0,
      authSuccessRate: 100,
      averageResponseTime: 0,
      errorCount: 0,
      resetTime: new Date().toISOString()
    };
  }

  /**
   * Obtém uptime do sistema
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

// Instância singleton do monitor
export const healthMonitor = new HealthMonitor();

/**
 * Hook para monitoramento contínuo
 */
export const startHealthMonitoring = (intervalMs: number = 60000) => {
  const interval = setInterval(async () => {
    try {
      const health = await healthMonitor.performFullHealthCheck();
      
      // Log apenas se houver problemas
      if (health.overall !== 'healthy') {
        console.warn('🏥 System Health Check:', health);
        
        // Alertas para problemas críticos
        const criticalServices = health.services.filter(s => s.status === 'unhealthy');
        if (criticalServices.length > 0) {
          console.error('🚨 Critical services down:', criticalServices.map(s => s.service));
        }
      } else {
        console.log('✅ System health check passed');
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }, intervalMs);

  // Retornar função para parar o monitoramento
  return () => clearInterval(interval);
};

/**
 * Utilitário para verificação rápida de saúde
 */
export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    const health = await healthMonitor.performFullHealthCheck();
    return health.overall === 'healthy';
  } catch {
    return false;
  }
};
