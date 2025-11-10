import { MESSAGES } from '@/lib/config';

export const ERROR_CODES = {
  UNKNOWN: 'UNKNOWN_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  GENERATION: 'GENERATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  PERMISSION: 'PERMISSION_ERROR'
} as const;

export type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES];

const NETWORK_ERROR_PATTERNS = ['fetch', 'network', 'connection'];

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCodeType = ERROR_CODES.UNKNOWN,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ERROR_CODES.VALIDATION, 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = MESSAGES.error.network, statusCode: number = 0) {
    super(message, ERROR_CODES.NETWORK, statusCode);
    this.name = 'NetworkError';
  }
}

const isNetworkRelated = (error: Error): boolean => 
  error.name === 'TypeError' || 
  NETWORK_ERROR_PATTERNS.some(pattern => error.message.includes(pattern));

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  
  if (error instanceof Error) {
    return isNetworkRelated(error) 
      ? new NetworkError(error.message)
      : new AppError(error.message, ERROR_CODES.UNKNOWN, 500);
  }
  
  if (typeof error === 'string') return new AppError(error);
  
  return new AppError(MESSAGES.error.unexpected);
}

export function getUserFriendlyMessage(error: unknown): string {
  const normalized = normalizeError(error);
  
  const messageMap: Record<ErrorCodeType, string> = {
    [ERROR_CODES.UNKNOWN]: MESSAGES.error.unexpected,
    [ERROR_CODES.VALIDATION]: MESSAGES.error.validation,
    [ERROR_CODES.NETWORK]: MESSAGES.error.network,
    [ERROR_CODES.TIMEOUT]: MESSAGES.error.timeout,
    [ERROR_CODES.GENERATION]: MESSAGES.error.generation,
    [ERROR_CODES.NOT_FOUND]: MESSAGES.error.notFound,
    [ERROR_CODES.PERMISSION]: MESSAGES.error.permission
  };
  
  return messageMap[normalized.code] || normalized.message;
}

export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error);
  const contextStr = context ? `[${context}]` : '[APP]';
  
  // Reduce console noise in test environment
  if (process.env.NODE_ENV === 'test') {
    console.error(`${contextStr} ${normalized.code}: ${normalized.message}`);
    return;
  }
  
  console.error(`${contextStr} Error:`, {
    code: normalized.code,
    message: normalized.message,
    status: normalized.statusCode,
    details: normalized.details,
    stack: normalized.stack
  });
}

export const isNetworkError = (error: unknown): boolean => {
  const normalized = normalizeError(error);
  return normalized.code === ERROR_CODES.NETWORK || normalized.statusCode === 0;
};

export const isValidationError = (error: unknown): boolean => 
  normalizeError(error).code === ERROR_CODES.VALIDATION;

export const isNotFoundError = (error: unknown): boolean => 
  normalizeError(error).code === ERROR_CODES.NOT_FOUND;

export const isTimeoutError = (error: unknown): boolean => 
  normalizeError(error).code === ERROR_CODES.TIMEOUT;

export const isServerError = (error: unknown): boolean => 
  normalizeError(error).statusCode >= 500;