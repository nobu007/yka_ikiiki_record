import { AppError, ERROR_CODES } from '@/lib/error-handler';

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
      throw new CircuitBreakerOpenError();
    }

    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime >= config.resetTimeout
    ) {
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
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(config: CircuitBreakerConfig): void {
    const now = Date.now();

    if (this.lastFailureTime > 0 && now - this.lastFailureTime > config.monitoringPeriod) {
      this.failures = 0;
    }

    this.failures++;
    this.lastFailureTime = now;

    if (this.failures >= config.failureThreshold) {
      this.state = 'OPEN';
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
