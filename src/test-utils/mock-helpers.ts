/**
 * Mock Helper Utilities
 *
 * Type-safe utilities for extracting Jest mock call data without type assertions.
 * Complies with SYSTEM_CONSTITUTION.md §6.3 by avoiding direct `as Type` assertions.
 */

/**
 * Type guard to check if a value is not null or undefined.
 * Use this to narrow types after extracting mock call arguments.
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Extracts the first argument from the first call to a mock function.
 * Uses type narrowing instead of type assertions for type safety.
 * Returns null if no calls were made or if the first call had no arguments.
 *
 * @param mock - The Jest mock function to extract from
 * @returns The first argument of the first call, or null if no calls were made
 *
 * @example
 * ```ts
 * const savedStats = getFirstMockCallArg(mockRepository.saveStats);
 * if (isNotNullOrUndefined(savedStats)) {
 *   expect(savedStats.overview.count).toBe(100);
 * }
 * ```
 */
export function getFirstMockCallArg<T>(mock: jest.Mock): T | null {
  const firstCall = mock.mock.calls[0];
  if (!firstCall || firstCall.length === 0) {
    return null;
  }
  return firstCall[0] as T;
}

/**
 * Extracts all arguments from the first call to a mock function.
 *
 * @param mock - The Jest mock function to extract from
 * @returns Array of arguments from the first call, or null if no calls were made
 */
export function getFirstMockCallArgs(mock: jest.Mock): unknown[] | null {
  const firstCall = mock.mock.calls[0];
  if (!firstCall) {
    return null;
  }
  return firstCall;
}

/**
 * Gets the number of times a mock function was called.
 *
 * @param mock - The Jest mock function
 * @returns The call count
 */
export function getMockCallCount(mock: jest.Mock): number {
  return mock.mock.calls.length;
}
