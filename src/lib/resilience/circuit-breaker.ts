import { AppError, ERROR_CODES } from "@/lib/error-handler";
import { CIRCUIT_BREAKER_CONSTANTS } from "@/lib/constants/resilience";
import { globalLogger } from "./structured-logger";

export class CircuitBreakerOpenError extends AppError {
  constructor(message: string = "Circuit breaker is OPEN") {
    super(message, ERROR_CODES.TIMEOUT, 503);
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * Configuration options for circuit breaker behavior
 *
 * @property failureThreshold - Number of consecutive failures before opening circuit (default: 5)
 * @property resetTimeout - Time in ms to wait before attempting recovery (default: 60000)
 * @property monitoringPeriod - Time window in ms for counting failures (default: 30000)
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: CIRCUIT_BREAKER_CONSTANTS.FAILURE_THRESHOLD,
  resetTimeout: CIRCUIT_BREAKER_CONSTANTS.RESET_TIMEOUT_MS,
  monitoringPeriod: CIRCUIT_BREAKER_CONSTANTS.MONITORING_PERIOD_MS,
} as const;

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * Circuit Breaker implementation for preventing cascading failures
 *
 * Per SYSTEM_CONSTITUTION.md §6: Implements circuit-breaker pattern to prevent
 * cascading failures and automatic state transitions (CLOSED → OPEN → HALF_OPEN)
 *
 * @see {@link https://martinfowler.com/bliki/CircuitBreaker.html}
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: CircuitState = "CLOSED";

  /**
   * Executes an operation with circuit breaker protection
   *
   * @template T - Return type of the operation
   * @param operation - Async operation to execute
   * @param config - Circuit breaker configuration (optional, uses defaults)
   * @returns Promise that resolves with operation result or rejects with CircuitBreakerOpenError
   * @throws {CircuitBreakerOpenError} When circuit is OPEN and reset timeout hasn't elapsed
   *
   * @example
   * ```ts
   * const breaker = new CircuitBreaker();
   * try {
   *   const result = await breaker.execute(
   *     async () => await fetchData(),
   *     { failureThreshold: 5, resetTimeout: 60000, monitoringPeriod: 30000 }
   *   );
   * } catch (error) {
   *   if (error instanceof CircuitBreakerOpenError) {
   *     // Handle circuit breaker open state
   *   }
   * }
   * ```
   */
  async execute<T>(
    operation: () => Promise<T>,
    config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG,
  ): Promise<T> {
    if (
      this.state === "OPEN" &&
      Date.now() - this.lastFailureTime < config.resetTimeout
    ) {
      globalLogger.warn("CIRCUIT_BREAKER", "REJECTED", {
        state: this.state,
        failureCount: this.failures,
        timeSinceLastFailure: Date.now() - this.lastFailureTime,
        resetTimeout: config.resetTimeout,
      });
      throw new CircuitBreakerOpenError();
    }

    if (
      this.state === "OPEN" &&
      Date.now() - this.lastFailureTime >= config.resetTimeout
    ) {
      globalLogger.info("CIRCUIT_BREAKER", "STATE_TRANSITION", {
        from: this.state,
        to: "HALF_OPEN",
        reason: "reset_timeout_elapsed",
      });
      this.state = "HALF_OPEN";
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
    this.state = "CLOSED";

    if (previousState !== "CLOSED") {
      globalLogger.info("CIRCUIT_BREAKER", "STATE_TRANSITION", {
        from: previousState,
        to: this.state,
        reason: "operation_success",
      });
    }
  }

  private onFailure(config: CircuitBreakerConfig): void {
    const now = Date.now();
    const previousState = this.state;

    if (
      this.lastFailureTime > 0 &&
      now - this.lastFailureTime > config.monitoringPeriod
    ) {
      this.failures = 0;
    }

    this.failures++;
    this.lastFailureTime = now;

    if (this.failures >= config.failureThreshold && this.state !== "OPEN") {
      this.state = "OPEN";
      globalLogger.error("CIRCUIT_BREAKER", "STATE_TRANSITION", {
        from: previousState,
        to: this.state,
        reason: "failure_threshold_exceeded",
        failureCount: this.failures,
        threshold: config.failureThreshold,
      });
    }
  }

  /**
   * Gets the current circuit state
   * @returns Current state ("CLOSED" | "OPEN" | "HALF_OPEN")
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Gets the current failure count
   * @returns Number of consecutive failures in current monitoring period
   */
  getFailureCount(): number {
    return this.failures;
  }

  /**
   * Resets the circuit breaker to initial state
   * Useful for testing or manual recovery
   */
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = "CLOSED";
  }
}

export const createCircuitBreaker = (): CircuitBreaker => new CircuitBreaker();

export const globalCircuitBreaker = createCircuitBreaker();
