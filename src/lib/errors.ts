// Simplified error handling system

import { ERROR_CODES, MESSAGES, ErrorCodeType } from './config';

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCodeType = ERROR_CODES.UNKNOWN,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = MESSAGES.error.network) {
    super(message, ERROR_CODES.NETWORK, 0);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = MESSAGES.error.validation) {
    super(message, ERROR_CODES.VALIDATION, 400);
  }
}

// Simple error normalization
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  
  if (error instanceof Error) {
    const isNetwork = error.message.includes('fetch') || 
                     error.message.includes('network') || 
                     error.message.includes('connection');
    
    return isNetwork 
      ? new NetworkError(error.message)
      : new AppError(error.message, ERROR_CODES.UNKNOWN);
  }
  
  if (typeof error === 'string') return new AppError(error);
  
  return new AppError(MESSAGES.error.unexpected);
}

// Simple user-friendly message extraction
export function getUserMessage(error: unknown): string {
  const normalized = normalizeError(error);
  
  const messageMap: Record<ErrorCodeType, string> = {
    [ERROR_CODES.UNKNOWN]: MESSAGES.error.unexpected,
    [ERROR_CODES.VALIDATION]: MESSAGES.error.validation,
    [ERROR_CODES.NETWORK]: MESSAGES.error.network,
    [ERROR_CODES.TIMEOUT]: MESSAGES.error.generation,
    [ERROR_CODES.GENERATION]: MESSAGES.error.generation,
    [ERROR_CODES.NOT_FOUND]: MESSAGES.error.unexpected,
    [ERROR_CODES.PERMISSION]: MESSAGES.error.unexpected
  };
  
  return messageMap[normalized.code] || normalized.message;
}

// Simple error logging
export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error);
  const contextStr = context ? `[${context}]` : '[APP]';
  
  console.error(`${contextStr} Error:`, {
    code: normalized.code,
    message: normalized.message,
    status: normalized.statusCode,
    stack: normalized.stack
  });
}

// Type guards
export const isNetworkError = (error: unknown): boolean => 
  normalizeError(error).code === ERROR_CODES.NETWORK;

export const isValidationError = (error: unknown): boolean => 
  normalizeError(error).code === ERROR_CODES.VALIDATION;