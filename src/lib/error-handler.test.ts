import { 
  AppError, 
  ValidationError, 
  NetworkError, 
  normalizeError, 
  getUserFriendlyMessage, 
  logError,
  isNetworkError,
  isValidationError,
  isNotFoundError,
  isTimeoutError,
  isServerError,
  ERROR_CODES 
} from './error-handler';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleGroup = jest.spyOn(console, 'group').mockImplementation();
const mockConsoleGroupEnd = jest.spyOn(console, 'groupEnd').mockImplementation();

describe('error-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Classes', () => {
    test('AppError creates proper error instance', () => {
      const error = new AppError('Test error', ERROR_CODES.VALIDATION, 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ERROR_CODES.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    test('ValidationError creates proper error instance', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(ERROR_CODES.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    test('NetworkError creates proper error instance', () => {
      const error = new NetworkError('Network failed', 503);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Network failed');
      expect(error.code).toBe(ERROR_CODES.NETWORK);
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('NetworkError');
    });

  });

  describe('normalizeError', () => {
    test('returns AppError as-is', () => {
      const appError = new AppError('Test error');
      const result = normalizeError(appError);
      
      expect(result).toBe(appError);
    });

    test('converts generic Error to AppError', () => {
      const genericError = new Error('Generic error');
      const result = normalizeError(genericError);
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Generic error');
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
      expect(result.statusCode).toBe(500);
    });

    test('converts TypeError to NetworkError', () => {
      const typeError = new TypeError('Failed to fetch');
      const result = normalizeError(typeError);
      
      expect(result).toBeInstanceOf(NetworkError);
      expect(result.message).toBe('Failed to fetch');
      expect(result.code).toBe(ERROR_CODES.NETWORK);
    });

    test('converts fetch-related error to NetworkError', () => {
      const fetchError = new Error('fetch failed');
      const result = normalizeError(fetchError);
      
      expect(result).toBeInstanceOf(NetworkError);
    });

    test('converts string to AppError', () => {
      const stringError = 'String error';
      const result = normalizeError(stringError);
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('String error');
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });

    test('handles unknown error type', () => {
      const unknownError = { some: 'object' };
      const result = normalizeError(unknownError);
      
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('予期せぬエラーが発生しました');
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });
  });

  describe('getUserFriendlyMessage', () => {
    test('returns predefined message for known error codes', () => {
      const validationError = new ValidationError('Invalid data');
      const message = getUserFriendlyMessage(validationError);
      
      expect(message).toBe('入力内容を確認してください');
    });

    test('returns error message for unknown error codes', () => {
      const customError = new AppError('Custom message', 'CUSTOM_CODE' as any);
      const message = getUserFriendlyMessage(customError);
      
      expect(message).toBe('Custom message');
    });

    test('handles generic errors', () => {
      const genericError = new Error('Generic error');
      const message = getUserFriendlyMessage(genericError);
      
      expect(message).toBe('予期せぬエラーが発生しました');
    });
  });

  describe('logError', () => {
    test('logs error with context', () => {
      const error = new ValidationError('Test validation error');
      
      logError(error, 'TestContext');
      
      expect(mockConsoleError).toHaveBeenCalledWith('[TestContext] Error:', {
        code: ERROR_CODES.VALIDATION,
        message: 'Test validation error',
        status: 400,
        details: undefined,
        stack: expect.any(String)
      });
    });

    test('logs error without context', () => {
      const error = new NetworkError('Network error');
      
      logError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith('[APP] Error:', {
        code: ERROR_CODES.NETWORK,
        message: 'Network error',
        status: 0,
        details: undefined,
        stack: expect.any(String)
      });
    });

    test('logs error with details', () => {
      const error = new AppError('Error with details', ERROR_CODES.VALIDATION, 400, { field: 'email' });
      
      logError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith('[APP] Error:', {
        code: ERROR_CODES.VALIDATION,
        message: 'Error with details',
        status: 400,
        details: { field: 'email' },
        stack: expect.any(String)
      });
    });
  });

  describe('errorTypeGuards', () => {
    test('isNetworkError identifies network errors', () => {
      const networkError = new NetworkError('Network failed');
      expect(isNetworkError(networkError)).toBe(true);
      
      const validationError = new ValidationError('Invalid data');
      expect(isNetworkError(validationError)).toBe(false);
    });

    test('isValidationError identifies validation errors', () => {
      const validationError = new ValidationError('Invalid data');
      expect(isValidationError(validationError)).toBe(true);
      
      const networkError = new NetworkError('Network failed');
      expect(isValidationError(networkError)).toBe(false);
    });

    test('isNotFoundError identifies not found errors', () => {
      const notFoundError = new AppError('Not found', ERROR_CODES.NOT_FOUND, 404);
      expect(isNotFoundError(notFoundError)).toBe(true);
      
      const validationError = new ValidationError('Invalid data');
      expect(isNotFoundError(validationError)).toBe(false);
    });

    test('isTimeoutError identifies timeout errors', () => {
      const timeoutError = new AppError('Timeout', ERROR_CODES.TIMEOUT, 408);
      expect(isTimeoutError(timeoutError)).toBe(true);
      
      const validationError = new ValidationError('Invalid data');
      expect(isTimeoutError(validationError)).toBe(false);
    });

    test('isServerError identifies server errors', () => {
      const serverError = new AppError('Server error', ERROR_CODES.UNKNOWN, 500);
      expect(isServerError(serverError)).toBe(true);
      
      const clientError = new ValidationError('Client error');
      expect(isServerError(clientError)).toBe(false);
    });
  });
});