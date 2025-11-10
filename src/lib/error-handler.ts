import { ERROR_MESSAGES } from '@/lib/constants/messages';

export const ERROR_CODES = {
  UNKNOWN: 'UNKNOWN_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  GENERATION: 'GENERATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  PERMISSION: 'PERMISSION_ERROR'
} as const;

type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES];

const USER_MESSAGES = {
  [ERROR_CODES.UNKNOWN]: ERROR_MESSAGES.UNEXPECTED,
  [ERROR_CODES.VALIDATION]: ERROR_MESSAGES.VALIDATION,
  [ERROR_CODES.NETWORK]: ERROR_MESSAGES.NETWORK,
  [ERROR_CODES.TIMEOUT]: ERROR_MESSAGES.TIMEOUT,
  [ERROR_CODES.GENERATION]: ERROR_MESSAGES.GENERATION,
  [ERROR_CODES.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
  [ERROR_CODES.PERMISSION]: ERROR_MESSAGES.PERMISSION
} as const;

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
    Error.captureStackTrace?.(this, AppError);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ERROR_CODES.VALIDATION, 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR, statusCode: number = 0) {
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
  
  return new AppError(ERROR_MESSAGES.UNEXPECTED);
}

export function getUserFriendlyMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return USER_MESSAGES[normalized.code] || normalized.message;
}

export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error);
  const contextStr = context ? `[${context}]` : '[APP]';
  
  console.group(`${contextStr} Error Details`);
  console.error('Code:', normalized.code);
  console.error('Message:', normalized.message);
  console.error('Status:', normalized.statusCode);
  
  if (normalized.details) {
    console.error('Details:', normalized.details);
  }
  
  console.error('Stack:', normalized.stack);
  console.groupEnd();
}

export const errorTypeGuards = {
  isNetworkError: (error: unknown): boolean => {
    const normalized = normalizeError(error);
    return normalized.code === ERROR_CODES.NETWORK || normalized.statusCode === 0;
  },
  
  isValidationError: (error: unknown): boolean => 
    normalizeError(error).code === ERROR_CODES.VALIDATION,
  
  isNotFoundError: (error: unknown): boolean => 
    normalizeError(error).code === ERROR_CODES.NOT_FOUND,
  
  isTimeoutError: (error: unknown): boolean => 
    normalizeError(error).code === ERROR_CODES.TIMEOUT,
  
  isServerError: (error: unknown): boolean => 
    normalizeError(error).statusCode >= 500
} as const;