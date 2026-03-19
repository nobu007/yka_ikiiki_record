import {
  CircuitBreaker,
  CircuitBreakerOpenError,
  createCircuitBreaker,
} from "./circuit-breaker";

describe("CircuitBreaker", () => {
  describe("execute - state transitions", () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = createCircuitBreaker();
    });

    it("should count failures and open circuit after threshold", async () => {
      const config = {
        failureThreshold: 3,
        resetTimeout: 5000,
        monitoringPeriod: 30000,
      };

      const failingOperation = async () => {
        throw new Error("Operation failed");
      };

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation, config);
        } catch {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe("OPEN");
      expect(circuitBreaker.getFailureCount()).toBe(3);
    });

    it("should reject immediately when circuit is open", async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 10000,
        monitoringPeriod: 30000,
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

      await expect(
        circuitBreaker.execute(failingOperation, config),
      ).rejects.toThrow(CircuitBreakerOpenError);
    });

    it("should transition to HALF_OPEN after reset timeout", async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 100,
        monitoringPeriod: 30000,
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

      expect(circuitBreaker.getState()).toBe("OPEN");

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      const successOperation = async () => "success";
      await expect(
        circuitBreaker.execute(successOperation, config),
      ).resolves.toBe("success");
      expect(circuitBreaker.getState()).toBe("CLOSED");
    });

    it("should close circuit on successful operation in HALF_OPEN state", async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 30000,
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

      expect(circuitBreaker.getState()).toBe("OPEN");

      await new Promise((resolve) => {
        setTimeout(resolve, 60);
      });

      const successOperation = async () => "success";
      await expect(
        circuitBreaker.execute(successOperation, config),
      ).resolves.toBe("success");

      expect(circuitBreaker.getState()).toBe("CLOSED");
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it("should reopen circuit on failure in HALF_OPEN state", async () => {
      const config = {
        failureThreshold: 2,
        resetTimeout: 50,
        monitoringPeriod: 30000,
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

      expect(circuitBreaker.getState()).toBe("OPEN");

      await new Promise((resolve) => {
        setTimeout(resolve, 60);
      });

      try {
        await circuitBreaker.execute(failingOperation, config);
      } catch {
        // Expected to fail
      }

      expect(circuitBreaker.getState()).toBe("OPEN");
    });
  });
});
