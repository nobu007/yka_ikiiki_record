import { AppError, ERROR_CODES } from "@/lib/error-handler";
import { LOOP_DETECTOR_CONSTANTS } from "@/lib/constants/resilience";
import { globalLogger } from "./structured-logger";

export class InfiniteLoopError extends AppError {
  constructor(operationId: string) {
    super(
      `Operation ${operationId} exceeded maximum iterations`,
      ERROR_CODES.UNKNOWN,
      500,
    );
    this.name = "InfiniteLoopError";
  }
}

const DEFAULT_MAX_ITERATIONS: number = LOOP_DETECTOR_CONSTANTS.MAX_ITERATIONS;
const DEFAULT_TIME_WINDOW: number = LOOP_DETECTOR_CONSTANTS.TIME_WINDOW_MS;

/**
 * Infinite loop detection and prevention system
 *
 * Per SYSTEM_CONSTITUTION.md §6: Detects and prevents infinite loops in all operations
 * with time-based counter reset and destroy() method for complete cleanup
 */
export class LoopDetector {
  private operationCounts = new Map<string, number>();
  private readonly maxIterations: number;
  private readonly timeWindow: number;
  private pendingTimeouts = new Set<NodeJS.Timeout>();

  /**
   * Creates a new LoopDetector instance
   * @param maxIterations - Maximum iterations before throwing InfiniteLoopError (default: 1000)
   * @param timeWindow - Time window in ms for counter reset (default: 30000)
   */
  constructor(
    maxIterations: number = DEFAULT_MAX_ITERATIONS,
    timeWindow: number = DEFAULT_TIME_WINDOW,
  ) {
    this.maxIterations = maxIterations;
    this.timeWindow = timeWindow;
  }

  /**
   * Checks and records an iteration, throwing if max iterations exceeded
   * @param operationId - Unique identifier for the operation being monitored
   * @throws {InfiniteLoopError} When operation exceeds max iterations
   *
   * @example
   * ```ts
   * const detector = new LoopDetector();
   * while (condition) {
   *   detector.checkIteration("my_operation");
   *   // ... operation logic
   * }
   * ```
   */
  checkIteration(operationId: string): void {
    const currentCount = this.operationCounts.get(operationId) || 0;

    if (currentCount > this.maxIterations) {
      globalLogger.error("LOOP_DETECTOR", "INFINITE_LOOP_DETECTED", {
        operation: operationId,
        iterationCount: currentCount,
        maxIterations: this.maxIterations,
        timestamp: Date.now(),
      });
      throw new InfiniteLoopError(operationId);
    }

    this.operationCounts.set(operationId, currentCount + 1);

    const timeoutId = setTimeout(() => {
      this.operationCounts.delete(operationId);
      this.pendingTimeouts.delete(timeoutId);
    }, this.timeWindow);

    this.pendingTimeouts.add(timeoutId);
  }

  /**
   * Gets the current iteration count for an operation
   * @param operationId - Operation identifier to check
   * @returns Current iteration count
   */
  getCount(operationId: string): number {
    return this.operationCounts.get(operationId) || 0;
  }

  /**
   * Resets the counter for a specific operation
   * @param operationId - Operation identifier to reset
   */
  reset(operationId: string): void {
    this.operationCounts.delete(operationId);
  }

  /**
   * Resets all operation counters
   */
  resetAll(): void {
    this.operationCounts.clear();
  }

  /**
   * Cleans up all pending timeouts and clears counters
   * IMPORTANT: Must be called to prevent memory leaks
   */
  destroy(): void {
    for (const timeoutId of this.pendingTimeouts) {
      clearTimeout(timeoutId);
    }
    this.pendingTimeouts.clear();
    this.operationCounts.clear();
  }
}

export const createLoopDetector = (
  maxIterations: number = DEFAULT_MAX_ITERATIONS,
  timeWindow: number = DEFAULT_TIME_WINDOW,
): LoopDetector => new LoopDetector(maxIterations, timeWindow);

export const globalLoopDetector = createLoopDetector();

/**
 * Safely iterates over an array with infinite loop protection
 * Automatically handles cleanup via try/finally
 *
 * @template T - Type of array elements
 * @param operationId - Unique identifier for the operation
 * @param iterable - Array to iterate over
 * @param callback - Function to call for each element
 *
 * @example
 * ```ts
 * safeLoop("process_items", items, (item, index) => {
 *   console.log(`Processing ${index}: ${item}`);
 * });
 * ```
 */
export const safeLoop = <T>(
  operationId: string,
  iterable: T[],
  callback: (item: T, index: number) => void,
): void => {
  const detector = createLoopDetector();

  try {
    iterable.forEach((item, index) => {
      detector.checkIteration(operationId);
      callback(item, index);
    });
  } finally {
    detector.destroy();
  }
};

/**
 * Safely iterates over an array with async operations and infinite loop protection
 * Automatically handles cleanup via try/finally
 *
 * @template T - Type of array elements
 * @param operationId - Unique identifier for the operation
 * @param iterable - Array to iterate over
 * @param callback - Async function to call for each element
 * @returns Promise that resolves when all iterations complete
 *
 * @example
 * ```ts
 * await safeAsyncLoop("fetch_data", urls, async (url, index) => {
 *   const data = await fetch(url);
 *   console.log(`Fetched ${index}: ${url}`);
 * });
 * ```
 */
export const safeAsyncLoop = async <T>(
  operationId: string,
  iterable: T[],
  callback: (item: T, index: number) => Promise<void>,
): Promise<void> => {
  const detector = createLoopDetector();

  try {
    for (const [index, item] of iterable.entries()) {
      detector.checkIteration(operationId);
      await callback(item, index);
    }
  } finally {
    detector.destroy();
  }
};
