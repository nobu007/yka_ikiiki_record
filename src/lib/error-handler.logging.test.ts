import {
  AppError,
  ValidationError,
  NetworkError,
  logError,
  ERROR_CODES
} from './error-handler';
import { globalLogger } from '@/lib/resilience/structured-logger';

describe('error-handler: logError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs error with context', () => {
    const error = new ValidationError('Test validation error');
    const spy = jest.spyOn(globalLogger, 'error');

    logError(error, 'TestContext');

    expect(spy).toHaveBeenCalledWith('TestContext', 'logError', {
      code: 'VALIDATION_ERROR',
      message: 'Test validation error',
      status: 400,
      details: undefined,
      stack: error.stack,
    });
  });

  test('logs error without context', () => {
    const error = new NetworkError('Network error');
    const spy = jest.spyOn(globalLogger, 'error');

    logError(error);

    expect(spy).toHaveBeenCalledWith('APP', 'logError', {
      code: 'NETWORK_ERROR',
      message: 'Network error',
      status: 0,
      details: undefined,
      stack: error.stack,
    });
  });

  test('logs error with details', () => {
    const error = new AppError('Error with details', ERROR_CODES.VALIDATION, 400, { field: 'email' });
    const spy = jest.spyOn(globalLogger, 'error');

    logError(error);

    expect(spy).toHaveBeenCalledWith('APP', 'logError', {
      code: 'VALIDATION_ERROR',
      message: 'Error with details',
      status: 400,
      details: { field: 'email' },
      stack: error.stack,
    });
  });
});
