import { AppError, ERROR_CODES, HTTP_STATUS } from "@/lib/error-handler";
import { TIMEOUT_CONSTANTS } from "@/lib/constants/resilience";
import { globalLogger } from "./structured-logger";

export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation ${operation} timed out after ${timeoutMs}ms`,
      ERROR_CODES.TIMEOUT,
      HTTP_STATUS.REQUEST_TIMEOUT,
    );
    this.name = "TimeoutError";
  }
}

/**
 * Timeout configuration for different operation types
 *
 * Per SYSTEM_CONSTITUTION.md §6: All async operations must have timeouts
 *
 * @property command - CLI commands timeout in ms (default: 30000)
 * @property api - API calls timeout in ms (default: 10000)
 * @property database - Database operations timeout in ms (default: 10000)
 * @property file - File operations timeout in ms (default: 15000)
 * @property e2e - E2E tests timeout in ms (default: 60000)
 */
export interface TimeoutConfig {
  command: number;
  api: number;
  database: number;
  file: number;
  e2e: number;
}

export const DEFAULT_TIMEOUTS: TimeoutConfig = {
  command: TIMEOUT_CONSTANTS.COMMAND,
  api: TIMEOUT_CONSTANTS.API,
  database: TIMEOUT_CONSTANTS.DATABASE,
  file: TIMEOUT_CONSTANTS.FILE,
  e2e: TIMEOUT_CONSTANTS.E2E,
} as const;

/**
 * Wraps an operation with timeout enforcement
 * Automatically cleans up timeout on completion or error
 *
 * @template T - Type of promise result
 * @param operation - Promise to wrap with timeout
 * @param timeoutMs - Timeout duration in milliseconds
 * @param operationType - Description of operation for logging
 * @returns Promise that resolves with operation result or rejects with TimeoutError
 * @throws {TimeoutError} When operation exceeds timeout duration
 *
 * @example
 * ```ts
 * try {
 *   const result = await withTimeout(
 *     fetchData(),
 *     5000,
 *     "fetch_data"
 *   );
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.error("Operation timed out");
 *   }
 * }
 * ```
 */
export const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationType: string,
): Promise<T> => {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      globalLogger.error("TIMEOUT", "OPERATION_TIMEOUT", {
        operation: operationType,
        timeoutMs,
        timestamp: Date.now(),
      });
      reject(new TimeoutError(operationType, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

/**
 * Wraps operation with default command timeout (30s)
 * @template T - Type of promise result
 * @param operation - Promise to wrap
 * @returns Promise with timeout enforcement
 */
export const withCommandTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.command, "command");

/**
 * Wraps operation with default API timeout (10s)
 * @template T - Type of promise result
 * @param operation - Promise to wrap
 * @returns Promise with timeout enforcement
 */
export const withApiTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.api, "api");

/**
 * Wraps operation with default database timeout (5s)
 * @template T - Type of promise result
 * @param operation - Promise to wrap
 * @returns Promise with timeout enforcement
 */
export const withDatabaseTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.database, "database");

/**
 * Wraps operation with default file timeout (15s)
 * @template T - Type of promise result
 * @param operation - Promise to wrap
 * @returns Promise with timeout enforcement
 */
export const withFileTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.file, "file");

/**
 * Wraps operation with default E2E test timeout (60s)
 * @template T - Type of promise result
 * @param operation - Promise to wrap
 * @returns Promise with timeout enforcement
 */
export const withE2ETimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.e2e, "e2e");

/**
 * Wraps operation with custom timeout
 * @template T - Type of promise result
 * @param operation - Promise to wrap
 * @param timeoutMs - Custom timeout duration in ms
 * @param operationType - Description for logging
 * @returns Promise with custom timeout enforcement
 */
export const withCustomTimeout = <T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationType: string,
): Promise<T> => withTimeout(operation, timeoutMs, operationType);
