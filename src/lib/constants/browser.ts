/**
 * Browser-related constants and utilities.
 *
 * Provides centralized access to browser APIs and window events
 * with type-safe constants and utility functions.
 */

/**
 * Window event name constants for event listener registration.
 */
export const WINDOW_EVENTS = {
  /** Window resize event */
  RESIZE: "resize",
} as const;

/**
 * Reloads the current page using window.location.reload().
 *
 * This utility function provides a centralized way to trigger page reloads,
 * making it easier to mock in tests and replace with alternative implementations
 * if needed (e.g., with router navigation).
 *
 * @example
 * ```tsx
 * // Basic usage
 * reloadPage();
 *
 * // In an error handler
 * <button onClick={reloadPage}>Retry</button>
 *
 * // After successful operation
 * const handleSuccess = () => {
 *   await saveData();
 *   reloadPage();
 * };
 * ```
 */
export const reloadPage = (): void => {
  window.location.reload();
};
