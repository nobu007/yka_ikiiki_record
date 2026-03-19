import { CircuitBreaker, createCircuitBreaker } from "./circuit-breaker";

describe("CircuitBreaker", () => {
  describe("execute - monitoring period", () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = createCircuitBreaker();
    });

    it("should reset failure count after monitoring period expires", async () => {
      const config = {
        failureThreshold: 3,
        resetTimeout: 10000,
        monitoringPeriod: 100,
      };

      const failingOperation = async () => {
        throw new Error("Operation failed");
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
      expect(circuitBreaker.getState()).toBe("CLOSED");
    });

    it("should not reset failure count within monitoring period", async () => {
      const config = {
        failureThreshold: 3,
        resetTimeout: 10000,
        monitoringPeriod: 200,
      };

      const failingOperation = async () => {
        throw new Error("Operation failed");
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
      expect(circuitBreaker.getState()).toBe("OPEN");
    });

    it("should accumulate failures across monitoring period boundary", async () => {
      const config = {
        failureThreshold: 4,
        resetTimeout: 10000,
        monitoringPeriod: 100,
      };

      const failingOperation = async () => {
        throw new Error("Operation failed");
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
      expect(circuitBreaker.getState()).toBe("CLOSED");
    });
  });
});
