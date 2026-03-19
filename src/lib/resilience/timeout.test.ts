import {
  TimeoutError,
  withApiTimeout,
  withDatabaseTimeout,
  withCommandTimeout,
  withFileTimeout,
  withE2ETimeout,
  withCustomTimeout,
  DEFAULT_TIMEOUTS,
} from "./timeout";

describe("Timeout", () => {
  describe("TimeoutError", () => {
    it("should create timeout error with correct properties", () => {
      const error = new TimeoutError("test-operation", 5000);

      expect(error.name).toBe("TimeoutError");
      expect(error.message).toContain("test-operation");
      expect(error.message).toContain("5000");
      expect(error.code).toBe("TIMEOUT_ERROR");
      expect(error.statusCode).toBe(408);
    });
  });

  describe("withCustomTimeout", () => {
    it("should resolve when operation completes before timeout", async () => {
      const operation = Promise.resolve("success");

      await expect(withCustomTimeout(operation, 1000, "test")).resolves.toBe(
        "success",
      );
    });

    it("should timeout when operation takes too long", async () => {
      const operation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("late"), 2000);
      });

      await expect(
        withCustomTimeout(operation, 100, "slow-operation"),
      ).rejects.toThrow(TimeoutError);
    });

    it("should reject with operation error before timeout", async () => {
      const operation = Promise.reject(new Error("Operation failed"));

      await expect(
        withCustomTimeout(operation, 1000, "failing-operation"),
      ).rejects.toThrow("Operation failed");
    });

    it("should use custom timeout value", async () => {
      const operation = Promise.resolve("custom-result");

      await expect(
        withCustomTimeout(operation, 5000, "custom-operation"),
      ).resolves.toBe("custom-result");
    });

    it("should timeout with custom duration", async () => {
      const operation = new Promise<string>((resolve) => {
        setTimeout(() => resolve("late"), 1000);
      });

      await expect(
        withCustomTimeout(operation, 100, "custom-slow-operation"),
      ).rejects.toThrow(TimeoutError);
    });
  });

  describe("Specialized timeout wrappers", () => {
    it("withApiTimeout should use default API timeout", async () => {
      const operation = Promise.resolve("api-result");

      await expect(withApiTimeout(operation)).resolves.toBe("api-result");
    });

    it("withDatabaseTimeout should use default database timeout", async () => {
      const operation = Promise.resolve("db-result");

      await expect(withDatabaseTimeout(operation)).resolves.toBe("db-result");
    });

    it("withCommandTimeout should use default command timeout", async () => {
      const operation = Promise.resolve("cmd-result");

      await expect(withCommandTimeout(operation)).resolves.toBe("cmd-result");
    });

    it("withFileTimeout should use default file timeout", async () => {
      const operation = Promise.resolve("file-result");

      await expect(withFileTimeout(operation)).resolves.toBe("file-result");
    });

    it("withE2ETimeout should use default E2E timeout", async () => {
      const operation = Promise.resolve("e2e-result");

      await expect(withE2ETimeout(operation)).resolves.toBe("e2e-result");
    });
  });

  describe("DEFAULT_TIMEOUTS", () => {
    it("should have correct timeout values", () => {
      expect(DEFAULT_TIMEOUTS.command).toBe(30000);
      expect(DEFAULT_TIMEOUTS.api).toBe(10000);
      expect(DEFAULT_TIMEOUTS.database).toBe(5000);
      expect(DEFAULT_TIMEOUTS.file).toBe(15000);
      expect(DEFAULT_TIMEOUTS.e2e).toBe(60000);
    });
  });
});
