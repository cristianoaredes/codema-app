/**
 * Inicialização do Sistema de Robustez e Monitoramento
 * Configura todos os sistemas de monitoramento, métricas e health checks
 */

import { initializeMetrics } from '@/utils';
import { startHealthMonitoring } from '@/utils';

/**
 * Configurações do sistema
 */
const SYSTEM_CONFIG = {
  healthCheckInterval: 60000, // 1 minuto
  metricsCleanupInterval: 3600000, // 1 hora
  enableConsoleLogging: true,
  enablePerformanceTracking: true
};

/**
 * Estado do sistema
 */
let systemInitialized = false;
let healthMonitoringStop: (() => void) | null = null;

/**
 * Inicializa todos os sistemas de monitoramento
 */
export const initializeSystemMonitoring = async (): Promise<void> => {
  if (systemInitialized) {
    console.warn('⚠️ Sistema de monitoramento já foi inicializado');
    return;
  }

  try {
    console.log('🚀 Inicializando sistema de robustez e monitoramento...');

    // 1. Inicializar coleta de métricas
    initializeMetrics();
    console.log('✅ Sistema de métricas inicializado');

    // 2. Iniciar monitoramento de saúde
    healthMonitoringStop = startHealthMonitoring(SYSTEM_CONFIG.healthCheckInterval);
    console.log('✅ Monitoramento de saúde iniciado');

    // 3. Configurar listeners de eventos globais
    setupGlobalErrorHandling();
    console.log('✅ Tratamento global de erros configurado');

    // 4. Configurar monitoramento de performance
    if (SYSTEM_CONFIG.enablePerformanceTracking) {
      setupPerformanceMonitoring();
      console.log('✅ Monitoramento de performance ativado');
    }

    systemInitialized = true;
    console.log('🎯 Sistema de monitoramento totalmente inicializado');

  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de monitoramento:', error);
    throw error;
  }
};

/**
 * Configura tratamento global de erros
 */
const setupGlobalErrorHandling = (): void => {
  // Erros não capturados
  window.addEventListener('error', (event) => {
    console.error('🚨 Erro global capturado:', event.error);
    
    // Registrar no sistema de métricas se disponível
    if (typeof window !== 'undefined' && (window as any).metricsCollector) {
      (window as any).metricsCollector.recordError(
        event.error || 'Unknown error',
        'global',
        'high',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    }
  });

  // Promises rejeitadas não capturadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promise rejeitada não capturada:', event.reason);
    
    // Registrar no sistema de métricas se disponível
    if (typeof window !== 'undefined' && (window as any).metricsCollector) {
      (window as any).metricsCollector.recordError(
        event.reason || 'Unhandled promise rejection',
        'global',
        'high',
        {
          type: 'unhandledrejection'
        }
      );
    }
  });
};

/**
 * Configura monitoramento de performance
 */
const setupPerformanceMonitoring = (): void => {
  // Monitorar Web Vitals se disponível
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('📊 LCP:', entry.startTime);
          }
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            console.log('📊 FID:', (entry as any).processingStart - entry.startTime);
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

    } catch (error) {
      console.warn('⚠️ Erro ao configurar PerformanceObserver:', error);
    }
  }

  // Monitorar navegação
  if ('navigation' in performance) {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navTiming) {
      console.log('📊 Navigation Timing:', {
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
        totalTime: navTiming.loadEventEnd - navTiming.fetchStart
      });
    }
  }
};

/**
 * Para o sistema de monitoramento
 */
export const stopSystemMonitoring = (): void => {
  if (!systemInitialized) {
    console.warn('⚠️ Sistema de monitoramento não foi inicializado');
    return;
  }

  try {
    // Parar monitoramento de saúde
    if (healthMonitoringStop) {
      healthMonitoringStop();
      healthMonitoringStop = null;
    }

    systemInitialized = false;
    console.log('🛑 Sistema de monitoramento parado');
  } catch (error) {
    console.error('❌ Erro ao parar sistema de monitoramento:', error);
  }
};

/**
 * Verifica se o sistema está inicializado
 */
export const isSystemInitialized = (): boolean => {
  return systemInitialized;
};

/**
 * Obtém configurações do sistema
 */
export const getSystemConfig = () => {
  return { ...SYSTEM_CONFIG };
};

/**
 * Atualiza configurações do sistema
 */
export const updateSystemConfig = (newConfig: Partial<typeof SYSTEM_CONFIG>): void => {
  Object.assign(SYSTEM_CONFIG, newConfig);
  console.log('⚙️ Configurações do sistema atualizadas:', newConfig);
};

/**
 * Hook para inicialização automática no React
 */
export const useSystemInitialization = () => {
  const initialize = async () => {
    if (!isSystemInitialized()) {
      await initializeSystemMonitoring();
    }
  };

  const cleanup = () => {
    if (isSystemInitialized()) {
      stopSystemMonitoring();
    }
  };

  return { initialize, cleanup, isInitialized: isSystemInitialized };
};
