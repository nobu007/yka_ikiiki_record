import {
  CircuitBreakerOpenError,
} from './circuit-breaker';

describe('CircuitBreakerOpenError', () => {
  it('should create error with correct properties', () => {
    const error = new CircuitBreakerOpenError('Custom message');

    expect(error.name).toBe('CircuitBreakerOpenError');
    expect(error.message).toBe('Custom message');
    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.statusCode).toBe(503);
  });

  it('should use default message', () => {
    const error = new CircuitBreakerOpenError();

    expect(error.message).toBe('Circuit breaker is OPEN');
  });
});
