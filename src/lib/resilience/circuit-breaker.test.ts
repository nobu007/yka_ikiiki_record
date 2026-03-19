import {
  CircuitBreaker,
  createCircuitBreaker,
  globalCircuitBreaker,
} from './circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = createCircuitBreaker();
  });

  describe('execute - basic operations', () => {
    it('should execute successful operation', async () => {
      const operation = async () => 'success';

      await expect(circuitBreaker.execute(operation)).resolves.toBe('success');
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
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
