import { ERROR_MESSAGES } from "@/lib/constants/messages";
import { globalLogger } from "@/lib/resilience/structured-logger";

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  UNKNOWN: "UNKNOWN_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  NETWORK: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT_ERROR",
  GENERATION: "GENERATION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  PERMISSION: "PERMISSION_ERROR",
} as const;

export type ErrorCodeType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const NETWORK_ERROR_PATTERNS = ["fetch", "network", "connection"] as const;

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCodeType = ERROR_CODES.UNKNOWN,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ERROR_CODES.VALIDATION, HTTP_STATUS.BAD_REQUEST, details);
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.NETWORK,
    statusCode: number = 0,
  ) {
    super(message, ERROR_CODES.NETWORK, statusCode);
    this.name = "NetworkError";
  }
}

const isNetworkRelated = (error: Error): boolean =>
  error.name === "TypeError" ||
  NETWORK_ERROR_PATTERNS.some((pattern) => error.message.includes(pattern));

/**
 * Normalizes any error into a standardized AppError instance.
 *
 * @param {unknown} error - The error to normalize (can be any type)
 * @returns {AppError} A standardized AppError instance
 *
 * @example
 * ```ts
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const normalized = normalizeError(error);
 *   logError(normalized);
 * }
 * ```
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    return isNetworkRelated(error)
      ? new NetworkError(error.message)
      : new AppError(
          error.message,
          ERROR_CODES.UNKNOWN,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
  }

  if (typeof error === "string") return new AppError(error);

  return new AppError(ERROR_MESSAGES.UNEXPECTED);
}

/**
 * Converts any error into a user-friendly message.
 *
 * @param {unknown} error - The error to convert
 * @returns {string} A user-friendly error message
 *
 * @example
 * ```ts
 * try {
 *   await operation();
 * } catch (error) {
 *   const message = getUserFriendlyMessage(error);
 *   alert(message);
 * }
 * ```
 */
export function getUserFriendlyMessage(error: unknown): string {
  const normalized = normalizeError(error);

  if (normalized.code === ERROR_CODES.VALIDATION) {
    return normalized.message;
  }

  const messageMap: Record<ErrorCodeType, string> = {
    [ERROR_CODES.UNKNOWN]: ERROR_MESSAGES.UNEXPECTED,
    [ERROR_CODES.VALIDATION]: ERROR_MESSAGES.VALIDATION,
    [ERROR_CODES.NETWORK]: ERROR_MESSAGES.NETWORK,
    [ERROR_CODES.TIMEOUT]: ERROR_MESSAGES.TIMEOUT,
    [ERROR_CODES.GENERATION]: ERROR_MESSAGES.GENERATION,
    [ERROR_CODES.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
    [ERROR_CODES.PERMISSION]: ERROR_MESSAGES.PERMISSION,
  };

  return messageMap[normalized.code] || normalized.message;
}

/**
 * Logs an error using the structured logger with full context.
 *
 * @param {unknown} error - The error to log
 * @param {string} [context] - Optional context label for categorization
 * @returns {void}
 *
 * @example
 * ```ts
 * try {
 *   await fetchData();
 * } catch (error) {
 *   logError(error, "API_FETCH");
 * }
 * ```
 */
export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error);
  const category = context || "APP";

  globalLogger.error(category, "logError", {
    code: normalized.code,
    message: normalized.message,
    status: normalized.statusCode,
    details: normalized.details,
    stack: normalized.stack,
  });
}

/**
 * Type guard to check if an error is an AppError instance.
 *
 * @param {unknown} error - The error to check
 * @returns {error is AppError} True if the error is an AppError
 *
 * @example
 * ```ts
 * if (isAppError(error)) {
 *   console.log(error.code); // TypeScript knows this is safe
 * }
 * ```
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Type guard to check if an error is a ValidationError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is ValidationError} True if the error is a ValidationError
 *
 * @example
 * ```ts
 * if (isValidationError(error)) {
 *   // Handle validation errors specifically
 * }
 * ```
 */
export const isValidationError = (error: unknown): error is ValidationError => {
  if (!(error instanceof AppError)) {
    return false;
  }
  return error.code === ERROR_CODES.VALIDATION;
};

/**
 * Type guard to check if an error is a NetworkError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is NetworkError} True if the error is a NetworkError
 *
 * @example
 * ```ts
 * if (isNetworkError(error)) {
 *   // Retry logic or offline handling
 * }
 * ```
 */
export const isNetworkError = (error: unknown): error is NetworkError => {
  if (!(error instanceof AppError)) {
    return false;
  }
  return error.code === ERROR_CODES.NETWORK || error.statusCode === 0;
};

/**
 * Type guard to check if an error is a NotFoundError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is AppError} True if the error has NOT_FOUND code
 *
 * @example
 * ```ts
 * if (isNotFoundError(error)) {
 *   // Show 404 page or message
 * }
 * ```
 */
export const isNotFoundError = (error: unknown): error is AppError => {
  if (!(error instanceof AppError)) {
    return false;
  }
  return error.code === ERROR_CODES.NOT_FOUND;
};

/**
 * Type guard to check if an error is a TimeoutError.
 *
 * @param {unknown} error - The error to check
 * @returns {error is AppError} True if the error has TIMEOUT code
 *
 * @example
 * ```ts
 * if (isTimeoutError(error)) {
 *   // Retry with longer timeout
 * }
 * ```
 */
export const isTimeoutError = (error: unknown): error is AppError => {
  if (!(error instanceof AppError)) {
    return false;
  }
  return error.code === ERROR_CODES.TIMEOUT;
};

/**
 * Type guard to check if an error is a server error (5xx).
 *
 * @param {unknown} error - The error to check
 * @returns {error is AppError} True if the error has 5xx status code
 *
 * @example
 * ```ts
 * if (isServerError(error)) {
 *   // Server error - may not be retryable immediately
 * }
 * ```
 */
export const isServerError = (error: unknown): error is AppError => {
  if (!(error instanceof AppError)) {
    return false;
  }
  return error.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
};
