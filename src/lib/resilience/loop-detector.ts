import { AppError, ERROR_CODES } from '@/lib/error-handler';

export class InfiniteLoopError extends AppError {
  constructor(operationId: string) {
    super(
      `Operation ${operationId} exceeded maximum iterations`,
      ERROR_CODES.UNKNOWN,
      500
    );
    this.name = 'InfiniteLoopError';
  }
}

export class LoopDetector {
  private operationCounts = new Map<string, number>();
  private readonly maxIterations: number;
  private readonly timeWindow: number;

  constructor(maxIterations = 1000, timeWindow = 30000) {
    this.maxIterations = maxIterations;
    this.timeWindow = timeWindow;
  }

  checkIteration(operationId: string): void {
    const currentCount = this.operationCounts.get(operationId) || 0;

    if (currentCount > this.maxIterations) {
      throw new InfiniteLoopError(operationId);
    }

    this.operationCounts.set(operationId, currentCount + 1);

    setTimeout(() => {
      this.operationCounts.delete(operationId);
    }, this.timeWindow);
  }

  getCount(operationId: string): number {
    return this.operationCounts.get(operationId) || 0;
  }

  reset(operationId: string): void {
    this.operationCounts.delete(operationId);
  }

  resetAll(): void {
    this.operationCounts.clear();
  }
}

export const createLoopDetector = (
  maxIterations?: number,
  timeWindow?: number
): LoopDetector => new LoopDetector(maxIterations, timeWindow);

export const globalLoopDetector = createLoopDetector();

export const safeLoop = <T>(
  operationId: string,
  iterable: T[],
  callback: (item: T, index: number) => void
): void => {
  const detector = createLoopDetector();

  iterable.forEach((item, index) => {
    detector.checkIteration(operationId);
    callback(item, index);
  });
};

export const safeAsyncLoop = async <T>(
  operationId: string,
  iterable: T[],
  callback: (item: T, index: number) => Promise<void>
): Promise<void> => {
  const detector = createLoopDetector();

  for (const [index, item] of iterable.entries()) {
    detector.checkIteration(operationId);
    await callback(item, index);
  }
};
