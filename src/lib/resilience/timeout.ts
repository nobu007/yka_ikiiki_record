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

export const withCommandTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.command, "command");

export const withApiTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.api, "api");

export const withDatabaseTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.database, "database");

export const withFileTimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.file, "file");

export const withE2ETimeout = <T>(operation: Promise<T>): Promise<T> =>
  withTimeout(operation, DEFAULT_TIMEOUTS.e2e, "e2e");

export const withCustomTimeout = <T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationType: string,
): Promise<T> => withTimeout(operation, timeoutMs, operationType);
