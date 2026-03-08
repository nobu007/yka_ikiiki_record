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
export function expectClasses(element: HTMLElement, ...classNames: string[]): void {
  classNames.forEach(className => {
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
export function createMockedFunction<T extends (...args: unknown[]) => unknown>(
  fn: T
): jest.MockedFunction<T> {
  return fn as unknown as jest.MockedFunction<T>;
}
