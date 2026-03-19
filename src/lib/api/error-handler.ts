import { z } from "zod";
import { NextResponse } from "next/server";
import { createErrorResponse } from "./response";
import {
  AppError,
  normalizeError,
  logError,
  ERROR_CODES,
  HTTP_STATUS,
} from "@/lib/error-handler";
import { withCustomTimeout, DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { globalCircuitBreaker, globalLogger } from "@/lib/resilience";
import type { CircuitBreakerConfig } from "@/lib/resilience";
import { API_ERROR_MESSAGES } from "@/lib/constants/messages";

const formatZodError = (error: z.ZodError): string => {
  return error.errors
    .map((err) => {
      const field = err.path.join(".");
      const message = err.message;
      return field ? `${field}: ${message}` : message;
    })
    .join(", ");
};

function isSyntaxErrorWithBody(
  error: unknown,
): error is SyntaxError & { body: boolean } {
  if (!(error instanceof SyntaxError)) {
    return false;
  }
  const syntaxError = error;
  return "body" in syntaxError && syntaxError.body === true;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    const message = formatZodError(error);
    return createErrorResponse(
      `${API_ERROR_MESSAGES.VALIDATION_FAILED_PREFIX}${message}`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (isSyntaxErrorWithBody(error)) {
    return createErrorResponse(
      API_ERROR_MESSAGES.INVALID_JSON_BODY,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalizedError = normalizeError(error);
  logError(error, "API");

  return createErrorResponse(
    normalizedError.message,
    normalizedError.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
}

export const createError = {
  badRequest: (message: string = API_ERROR_MESSAGES.BAD_REQUEST) =>
    new AppError(message, ERROR_CODES.VALIDATION, HTTP_STATUS.BAD_REQUEST),
  unauthorized: (message: string = API_ERROR_MESSAGES.UNAUTHORIZED) =>
    new AppError(message, ERROR_CODES.PERMISSION, HTTP_STATUS.UNAUTHORIZED),
  forbidden: (message: string = API_ERROR_MESSAGES.FORBIDDEN) =>
    new AppError(message, ERROR_CODES.PERMISSION, HTTP_STATUS.FORBIDDEN),
  notFound: (message: string = API_ERROR_MESSAGES.NOT_FOUND) =>
    new AppError(message, ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND),
  timeout: (message: string = API_ERROR_MESSAGES.TIMEOUT) =>
    new AppError(message, ERROR_CODES.TIMEOUT, 408),
  generation: (message: string = API_ERROR_MESSAGES.GENERATION_FAILED) =>
    new AppError(
      message,
      ERROR_CODES.GENERATION,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ),
  internal: (message: string = API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR) =>
    new AppError(
      message,
      ERROR_CODES.UNKNOWN,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ),
} as const;

/**
 * Enhanced API handler wrapper with resilience patterns
 * Combines timeout enforcement, circuit-breaker, and structured logging
 *
 * Per SYSTEM_CONSTITUTION.md §6: All async operations must have timeouts
 */
export function withResilientHandler<T extends NextResponse>(
  handler: () => Promise<T>,
  options?: {
    timeoutMs?: number;
    circuitBreakerConfig?: CircuitBreakerConfig;
    operationName?: string;
  },
): Promise<T | NextResponse> {
  const {
    timeoutMs = DEFAULT_TIMEOUTS.api,
    circuitBreakerConfig,
    operationName = "API_HANDLER",
  } = options || {};

  const startTime = Date.now();

  return globalCircuitBreaker
    .execute(async () => {
      try {
        const result = await withCustomTimeout(
          handler(),
          timeoutMs,
          operationName,
        );

        const duration = Date.now() - startTime;
        globalLogger.info("API", "SUCCESS", {
          operation: operationName,
          duration,
          timeoutMs,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        globalLogger.error("API", "HANDLER_ERROR", {
          operation: operationName,
          duration,
          timeoutMs,
          error: error instanceof Error ? error.message : String(error),
        });

        throw error;
      }
    }, circuitBreakerConfig)
    .catch(handleApiError);
}

/**
 * Interface for objects that can provide JSON data
 * Follows Dependency Inversion Principle - depends on abstraction, not concretion
 */
export interface JsonReadable {
  json(): Promise<unknown>;
}

export async function parseRequestBody(source: JsonReadable): Promise<unknown> {
  try {
    return await source.json();
  } catch {
    throw createError.badRequest(API_ERROR_MESSAGES.REQUEST_BODY_PARSE_FAILED);
  }
}
