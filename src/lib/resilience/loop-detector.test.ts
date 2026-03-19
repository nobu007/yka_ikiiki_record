import {
  InfiniteLoopError,
  LoopDetector,
  createLoopDetector,
  globalLoopDetector,
  safeLoop,
  safeAsyncLoop,
} from "./loop-detector";

describe("LoopDetector", () => {
  let detector: LoopDetector;

  beforeEach(() => {
    detector = createLoopDetector();
  });

  afterEach(() => {
    detector.destroy();
  });

  describe("InfiniteLoopError", () => {
    it("should create error with correct properties", () => {
      const error = new InfiniteLoopError("test-operation");

      expect(error.name).toBe("InfiniteLoopError");
      expect(error.message).toContain("test-operation");
      expect(error.message).toContain("exceeded maximum iterations");
      expect(error.code).toBe("UNKNOWN_ERROR");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("checkIteration", () => {
    it("should allow iterations below maximum", () => {
      for (let i = 0; i < 500; i++) {
        expect(() => detector.checkIteration("operation-1")).not.toThrow();
      }
    });

    it("should throw error when exceeding maximum iterations", () => {
      const maxIterations = 100;
      const strictDetector = createLoopDetector(maxIterations, 30000);

      for (let i = 0; i <= maxIterations; i++) {
        strictDetector.checkIteration("operation-strict");
      }

      expect(() => strictDetector.checkIteration("operation-strict")).toThrow(
        InfiniteLoopError,
      );

      strictDetector.destroy();
    });

    it("should reset counter after time window", async () => {
      const shortWindowDetector = createLoopDetector(100, 100);

      for (let i = 0; i < 99; i++) {
        shortWindowDetector.checkIteration("operation-timed");
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      expect(() =>
        shortWindowDetector.checkIteration("operation-timed"),
      ).not.toThrow();

      shortWindowDetector.destroy();
    });

    it("should track different operation IDs independently", () => {
      const strictDetector = createLoopDetector(100, 30000);

      for (let i = 0; i <= 100; i++) {
        strictDetector.checkIteration("operation-1");
      }

      expect(() => strictDetector.checkIteration("operation-1")).toThrow(
        InfiniteLoopError,
      );

      expect(() => strictDetector.checkIteration("operation-2")).not.toThrow();

      strictDetector.destroy();
    });
  });

  describe("getCount", () => {
    it("should return current iteration count for operation", () => {
      detector.checkIteration("operation-count");
      detector.checkIteration("operation-count");
      detector.checkIteration("operation-count");

      expect(detector.getCount("operation-count")).toBe(3);
    });

    it("should return 0 for non-existent operation", () => {
      expect(detector.getCount("non-existent")).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset counter for specific operation", () => {
      for (let i = 0; i < 150; i++) {
        detector.checkIteration("operation-reset");
      }

      expect(detector.getCount("operation-reset")).toBe(150);

      detector.reset("operation-reset");

      expect(detector.getCount("operation-reset")).toBe(0);
    });

    it("should allow iterations after reset", () => {
      for (let i = 0; i < 150; i++) {
        detector.checkIteration("operation-reset-2");
      }

      detector.reset("operation-reset-2");

      expect(() => detector.checkIteration("operation-reset-2")).not.toThrow();
    });
  });

  describe("resetAll", () => {
    it("should reset all operation counters", () => {
      detector.checkIteration("op1");
      detector.checkIteration("op1");
      detector.checkIteration("op2");
      detector.checkIteration("op2");
      detector.checkIteration("op2");

      expect(detector.getCount("op1")).toBe(2);
      expect(detector.getCount("op2")).toBe(3);

      detector.resetAll();

      expect(detector.getCount("op1")).toBe(0);
      expect(detector.getCount("op2")).toBe(0);
    });
  });

  describe("destroy", () => {
    it("should clear all pending timeouts and operation counts", () => {
      detector.checkIteration("op1");
      detector.checkIteration("op2");
      detector.checkIteration("op3");

      expect(detector.getCount("op1")).toBe(1);
      expect(detector.getCount("op2")).toBe(1);
      expect(detector.getCount("op3")).toBe(1);

      detector.destroy();

      expect(detector.getCount("op1")).toBe(0);
      expect(detector.getCount("op2")).toBe(0);
      expect(detector.getCount("op3")).toBe(0);
    });

    it("should allow multiple destroy calls without error", () => {
      detector.checkIteration("op1");

      expect(() => {
        detector.destroy();
        detector.destroy();
        detector.destroy();
      }).not.toThrow();
    });
  });

  describe("safeLoop", () => {
    it("should execute callback for each item", () => {
      const items = [1, 2, 3, 4, 5];
      const results: number[] = [];

      safeLoop("test-loop", items, (item) => {
        results.push(item * 2);
      });

      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it("should throw error for too many iterations", () => {
      const items = Array(1002).fill(0);

      expect(() => {
        safeLoop("large-loop", items, () => {
          // No-op
        });
      }).toThrow(InfiniteLoopError);
    });

    it("should track iterations with index", () => {
      const items = ["a", "b", "c"];
      const indices: number[] = [];

      safeLoop("indexed-loop", items, (_item, index) => {
        indices.push(index);
      });

      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe("safeAsyncLoop", () => {
    it("should execute async callback for each item", async () => {
      const items = [1, 2, 3];
      const results: number[] = [];

      await safeAsyncLoop("async-loop", items, async (item) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        results.push(item * 2);
      });

      expect(results).toEqual([2, 4, 6]);
    });

    it("should throw error for too many iterations", async () => {
      const items = Array(1002).fill(0);

      await expect(
        safeAsyncLoop("large-async-loop", items, async () => {
          // No-op
        }),
      ).rejects.toThrow(InfiniteLoopError);
    });

    it("should process items sequentially", async () => {
      const items = [1, 2, 3];
      const order: number[] = [];

      await safeAsyncLoop("sequential-loop", items, async (item) => {
        order.push(item);
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
      });

      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe("globalLoopDetector", () => {
    it("should provide a shared loop detector instance", () => {
      expect(globalLoopDetector).toBeInstanceOf(LoopDetector);
    });
  });
});
