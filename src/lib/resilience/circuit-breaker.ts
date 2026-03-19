import { AppError, ERROR_CODES } from '@/lib/error-handler';
import { globalLogger } from './structured-logger';

export class CircuitBreakerOpenError extends AppError {
  constructor(message: string = 'Circuit breaker is OPEN') {
    super(message, ERROR_CODES.TIMEOUT, 503);
    this.name = 'CircuitBreakerOpenError';
  }
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000,
  monitoringPeriod: 30000,
} as const;

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: CircuitState = 'CLOSED';

  async execute<T>(
    operation: () => Promise<T>,
    config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG
  ): Promise<T> {
    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime < config.resetTimeout
    ) {
      globalLogger.warn('CIRCUIT_BREAKER', 'REJECTED', {
        state: this.state,
        failureCount: this.failures,
        timeSinceLastFailure: Date.now() - this.lastFailureTime,
        resetTimeout: config.resetTimeout
      });
      throw new CircuitBreakerOpenError();
    }

    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime >= config.resetTimeout
    ) {
      globalLogger.info('CIRCUIT_BREAKER', 'STATE_TRANSITION', {
        from: this.state,
        to: 'HALF_OPEN',
        reason: 'reset_timeout_elapsed'
      });
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess(config);
      return result;
    } catch (error) {
      this.onFailure(config);
      throw error;
    }
  }

  private onSuccess(_config: CircuitBreakerConfig): void {
    const previousState = this.state;
    this.failures = 0;
    this.state = 'CLOSED';

    if (previousState !== 'CLOSED') {
      globalLogger.info('CIRCUIT_BREAKER', 'STATE_TRANSITION', {
        from: previousState,
        to: this.state,
        reason: 'operation_success'
      });
    }
  }

  private onFailure(config: CircuitBreakerConfig): void {
    const now = Date.now();
    const previousState = this.state;

    if (this.lastFailureTime > 0 && now - this.lastFailureTime > config.monitoringPeriod) {
      this.failures = 0;
    }

    this.failures++;
    this.lastFailureTime = now;

    if (this.failures >= config.failureThreshold && this.state !== 'OPEN') {
      this.state = 'OPEN';
      globalLogger.error('CIRCUIT_BREAKER', 'STATE_TRANSITION', {
        from: previousState,
        to: this.state,
        reason: 'failure_threshold_exceeded',
        failureCount: this.failures,
        threshold: config.failureThreshold
      });
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

export const createCircuitBreaker = (): CircuitBreaker => new CircuitBreaker();

export const globalCircuitBreaker = createCircuitBreaker();
