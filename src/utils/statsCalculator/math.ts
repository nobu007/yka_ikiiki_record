import { EMOTION_CALCULATION_PARAMS } from "@/lib/constants";

/**
 * Clamps a numeric value between minimum and maximum bounds.
 *
 * @param value - The value to clamp.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @returns The clamped value, constrained between min and max.
 *
 * @example
 * ```ts
 * clamp(5, 0, 10); // Returns: 5
 * clamp(-5, 0, 10); // Returns: 0
 * clamp(15, 0, 10); // Returns: 10
 * ```
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Calculates the arithmetic mean of an array of numbers.
 *
 * Returns 0 for empty arrays. Uses decimal precision from configuration
 * for consistent floating-point results.
 *
 * @param values - Array of numbers to average.
 * @returns The arithmetic mean, or 0 if array is empty.
 *
 * @example
 * ```ts
 * average([1, 2, 3, 4, 5]); // Returns: 3.00
 * average([]); // Returns: 0
 * ```
 */
export const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : Number(
        (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(
          EMOTION_CALCULATION_PARAMS.DECIMAL_PRECISION,
        ),
      );

/** Alias for {@link average} function. */
export const calculateAverage = average;
