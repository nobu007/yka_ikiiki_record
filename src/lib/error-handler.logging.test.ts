import {
  AppError,
  ValidationError,
  NetworkError,
  logError,
  ERROR_CODES
} from './error-handler';

let originalConsoleError: typeof console.error;
let mockConsoleError: jest.Mock;
let mockConsoleGroup: jest.SpyInstance;
let mockConsoleGroupEnd: jest.SpyInstance;

describe('error-handler: logError', () => {
  beforeAll(() => {
    originalConsoleError = console.error;
    mockConsoleError = jest.fn();
    console.error = mockConsoleError;
    mockConsoleGroup = jest.spyOn(console, 'group').mockImplementation();
    mockConsoleGroupEnd = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    mockConsoleGroup.mockRestore();
    mockConsoleGroupEnd.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs error with context', () => {
    const error = new ValidationError('Test validation error');

    logError(error, 'TestContext');

    expect(mockConsoleError).toHaveBeenCalledWith('[TestContext] VALIDATION_ERROR: Test validation error');
  });

  test('logs error without context', () => {
    const error = new NetworkError('Network error');

    logError(error);

    expect(mockConsoleError).toHaveBeenCalledWith('[APP] NETWORK_ERROR: Network error');
  });

  test('logs error with details', () => {
    const error = new AppError('Error with details', ERROR_CODES.VALIDATION, 400, { field: 'email' });

    logError(error);

    expect(mockConsoleError).toHaveBeenCalledWith('[APP] VALIDATION_ERROR: Error with details');
  });

  test('logs error with detailed format in non-test environment', () => {
    const error = new AppError('Error with details', ERROR_CODES.VALIDATION, 400, { field: 'email' });

    const originalEnv = process.env.NODE_ENV;
    process.env = { ...process.env, NODE_ENV: 'production' };

    logError(error, 'TestContext');

    expect(mockConsoleError).toHaveBeenCalledWith('[TestContext] Error:', {
      code: 'VALIDATION_ERROR',
      message: 'Error with details',
      status: 400,
      details: { field: 'email' },
      stack: error.stack
    });

    process.env = { ...process.env, NODE_ENV: originalEnv };
  });
});
