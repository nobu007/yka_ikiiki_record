/**
 * Component Testing Helper Utilities
 *
 * Provides reusable helpers for common component testing patterns
 * to reduce verbosity and improve test consistency.
 */

/**
 * Asserts that an element has all specified CSS classes.
 *
 * This is a convenience wrapper around multiple toHaveClass() calls
 * to reduce verbosity when checking multiple classes on a single element.
 *
 * @example
 * ```tsx
 * const notification = screen.getByRole('alert');
 * expectClasses(notification, 'bg-green-50', 'border-green-200', 'text-green-800');
 * ```
 *
 * @param element - The DOM element to check
 * @param classNames - Variable number of class names to assert
 */
export function expectClasses(
  element: HTMLElement,
  ...classNames: string[]
): void {
  classNames.forEach((className) => {
    expect(element).toHaveClass(className);
  });
}

/**
 * Creates a type-safe Jest mock with proper typing.
 *
 * This helper encapsulates the `as unknown as` pattern required for
 * proper TypeScript typing of Jest mocks under strict mode.
 *
 * @example
 * ```ts
 * import { generateEmotion } from './EmotionGenerator';
 * const mockGenerateEmotion = createMockedFunction(generateEmotion);
 * mockGenerateEmotion.mockReturnValue(3.5);
 * ```
 *
 * @param fn - The function to mock
 * @returns A properly typed Jest mock function
 */
export function createMockedFunction<T extends (...args: never[]) => unknown>(
  fn: T,
): jest.MockedFunction<T> {
  return fn as unknown as jest.MockedFunction<T>;
}

/**
 * Mocks window.location with a reload spy.
 *
 * Automatically handles cleanup by restoring the original location after the test.
 * Should be called in beforeEach or at the start of a test.
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   mockWindowLocation();
 * });
 *
 * test("reloads page", () => {
 *   // ... test code that triggers reload
 *   expect(window.location.reload).toHaveBeenCalled();
 * });
 * ```
 *
 * @returns An object with restore function for manual cleanup if needed
 */
export function mockWindowLocation(): { restore: () => void } {
  const originalLocation = window.location;
  delete (window as Partial<Window>).location;

  const mockReload = jest.fn();
  const mockLocation = {
    ...originalLocation,
    reload: mockReload,
  };

  Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
    configurable: true,
  });

  return {
    restore: () => {
      delete (window as Partial<Window>).location;
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    },
  };
}

/**
 * Mocks process.env.NODE_ENV for testing environment-specific behavior.
 *
 * Automatically handles cleanup by restoring the original env after the test.
 * Should be called in beforeEach or at the start of a test.
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   mockProcessEnv("development");
 * });
 *
 * test("shows debug info in development", () => {
 *   // ... test code
 * });
 * ```
 *
 * @param envValue - The value to set for NODE_ENV ("development" | "production")
 * @returns An object with restore function for manual cleanup if needed
 */
export function mockProcessEnv(envValue: "development" | "production"): {
  restore: () => void;
} {
  const originalNodeEnv = process.env.NODE_ENV;

  Object.defineProperty(process, "env", {
    value: { ...process.env, NODE_ENV: envValue },
    writable: true,
    configurable: true,
  });

  return {
    restore: () => {
      Object.defineProperty(process, "env", {
        value: { ...process.env, NODE_ENV: originalNodeEnv },
        writable: true,
        configurable: true,
      });
    },
  };
}
