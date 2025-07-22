/**
 * Sistema de Retry com Backoff Exponencial
 * Implementa tentativas automáticas para operações críticas
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
  totalTime: number;
}

/**
 * Classe para gerenciar operações com retry
 */
export class RetryManager {
  private defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error: unknown) => {
      // Retry em erros de rede ou temporários
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('connection') ||
          message.includes('fetch') ||
          message.includes('503') ||
          message.includes('502') ||
          message.includes('504')
        );
      }
      return false;
    },
    onRetry: (attempt: number, error: unknown) => {
      console.warn(`🔄 Retry attempt ${attempt}:`, error);
    }
  };

  /**
   * Executa uma operação com retry automático
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: unknown;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error;
        
        // Se não deve fazer retry ou é a última tentativa
        if (!config.retryCondition(error) || attempt === config.maxAttempts) {
          break;
        }

        // Callback de retry
        config.onRetry(attempt, error);

        // Calcular delay com backoff exponencial
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        // Adicionar jitter para evitar thundering herd
        const jitter = Math.random() * 0.1 * delay;
        const finalDelay = delay + jitter;

        await this.sleep(finalDelay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: config.maxAttempts,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Utilitário para sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância singleton
export const retryManager = new RetryManager();

/**
 * Wrapper para operações de autenticação com retry
 */
export async function withAuthRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Auth Operation'
): Promise<T> {
  const result = await retryManager.executeWithRetry(operation, {
    maxAttempts: 3,
    baseDelay: 1000,
    onRetry: (attempt, error) => {
      console.warn(`🔐 ${operationName} - Retry ${attempt}:`, error);
    }
  });

  if (!result.success) {
    console.error(`❌ ${operationName} failed after ${result.attempts} attempts:`, result.error);
    throw result.error;
  }

  if (result.attempts > 1) {
    console.log(`✅ ${operationName} succeeded after ${result.attempts} attempts (${result.totalTime}ms)`);
  }

  return result.data!;
}

/**
 * Wrapper para operações de banco de dados com retry
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database Operation'
): Promise<T> {
  const result = await retryManager.executeWithRetry(operation, {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 5000,
    retryCondition: (error: unknown) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('connection') ||
          message.includes('503') ||
          message.includes('502') ||
          message.includes('504') ||
          message.includes('rate limit') ||
          message.includes('too many requests')
        );
      }
      return false;
    },
    onRetry: (attempt, error) => {
      console.warn(`🗄️ ${operationName} - Retry ${attempt}:`, error);
    }
  });

  if (!result.success) {
    console.error(`❌ ${operationName} failed after ${result.attempts} attempts:`, result.error);
    throw result.error;
  }

  if (result.attempts > 1) {
    console.log(`✅ ${operationName} succeeded after ${result.attempts} attempts (${result.totalTime}ms)`);
  }

  return result.data!;
}

/**
 * Wrapper para operações críticas com retry agressivo
 */
export async function withCriticalRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Critical Operation'
): Promise<T> {
  const result = await retryManager.executeWithRetry(operation, {
    maxAttempts: 10,
    baseDelay: 100,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    retryCondition: () => true, // Retry em qualquer erro
    onRetry: (attempt, error) => {
      console.warn(`🚨 ${operationName} - Critical Retry ${attempt}:`, error);
    }
  });

  if (!result.success) {
    console.error(`💥 ${operationName} CRITICAL FAILURE after ${result.attempts} attempts:`, result.error);
    throw result.error;
  }

  if (result.attempts > 1) {
    console.log(`🎯 ${operationName} critical recovery after ${result.attempts} attempts (${result.totalTime}ms)`);
  }

  return result.data!;
}

/**
 * Circuit Breaker para prevenir cascata de falhas
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      console.warn(`🔴 Circuit breaker OPENED after ${this.failures} failures`);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
    console.log('🟢 Circuit breaker CLOSED - service recovered');
  }

  getState(): { state: string; failures: number; lastFailure: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime
    };
  }
}

// Circuit breakers para serviços críticos
export const authCircuitBreaker = new CircuitBreaker(3, 30000);
export const databaseCircuitBreaker = new CircuitBreaker(5, 60000);

/**
 * Wrapper que combina retry + circuit breaker
 */
export async function withResilientOperation<T>(
  operation: () => Promise<T>,
  circuitBreaker: CircuitBreaker,
  operationName: string = 'Resilient Operation'
): Promise<T> {
  return circuitBreaker.execute(async () => {
    return withAuthRetry(operation, operationName);
  });
}
