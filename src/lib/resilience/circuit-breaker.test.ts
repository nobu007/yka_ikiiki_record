import {
  CircuitBreakerOpenError,
  CircuitBreaker,
  createCircuitBreaker,
  globalCircuitBreaker,
} from './circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = createCircuitBreaker();
  });

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

  describe('execute', () => {
    it('should execute successful operation', async () => {
      const operation = async () => 'success';

      await expect(circuitBreaker.execute(operation)).resolves.toBe('success');
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it('should count failures and open circuit after threshold', async () => {
      const config = {
        failureThreshold: 3,
        resetTimeout: 5000,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.getFailureCount()).toBe(3);
    });

    it('should reject immediately when circuit is open', async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 10000,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      await expect(circuitBreaker.execute(failingOperation, config)).rejects.toThrow(
        CircuitBreakerOpenError
      );
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 100,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      const successOperation = async () => 'success';
      await expect(circuitBreaker.execute(successOperation, config)).resolves.toBe(
        'success'
      );
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should close circuit on successful operation in HALF_OPEN state', async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      await new Promise((resolve) => {
        setTimeout(resolve, 60);
      });

      const successOperation = async () => 'success';
      await expect(circuitBreaker.execute(successOperation, config)).resolves.toBe(
        'success'
      );

      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it('should reopen circuit on failure in HALF_OPEN state', async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      await new Promise((resolve) => {
        setTimeout(resolve, 60);
      });

      try {
        await circuitBreaker.execute(failingOperation, config);
      } catch {
        // Expected to fail
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should reset failure count after monitoring period expires', async () => {
      const config = {
        failureThreshold: 3,
        resetTimeout: 10000,
        monitoringPeriod: 100,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getFailureCount()).toBe(2);

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      try {
        await circuitBreaker.execute(failingOperation, config);
      } catch {
        // Expected to fail
      }

      expect(circuitBreaker.getFailureCount()).toBe(1);
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should not reset failure count within monitoring period', async () => {
      const config = {
        failureThreshold: 3,
        resetTimeout: 10000,
        monitoringPeriod: 200,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getFailureCount()).toBe(2);

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      try {
        await circuitBreaker.execute(failingOperation, config);
      } catch {
        // Expected to fail
      }

      expect(circuitBreaker.getFailureCount()).toBe(3);
      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should accumulate failures across monitoring period boundary', async () => {
      const config = {
        failureThreshold: 4,
        resetTimeout: 10000,
        monitoringPeriod: 100,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getFailureCount()).toBe(2);

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getFailureCount()).toBe(2);
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('reset', () => {
    it('should reset circuit breaker to initial state', async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 10000,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error('Operation failed');
      };

      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });
  });

  describe('globalCircuitBreaker', () => {
    it('should provide a shared circuit breaker instance', () => {
      expect(globalCircuitBreaker).toBeInstanceOf(CircuitBreaker);
    });
  });
});
