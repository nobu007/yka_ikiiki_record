import { EMOTION_CONFIG, UI_CONFIG } from "@/lib/config";
import { EMOTION_CALCULATION_PARAMS } from "@/lib/constants";
import { clamp } from "./math";

type EmotionData = {
  date: Date;
  emotion: number;
  hour?: number;
  student?: number;
};

/**
 * Generates a random number following a standard normal distribution (mean=0, std=1).
 *
 * Uses the Box-Muller transform to convert two uniform random numbers
 * into a single normally-distributed random number.
 *
 * @returns A random number from standard normal distribution.
 *
 * @example
 * ```ts
 * const value = generateNormalRandom();
 * // Typically returns values between -3 and +3
 * ```
 */
export const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * Clamps an emotion value to the configured valid range.
 *
 * @param emotion - The emotion value to clamp.
 * @returns The emotion value constrained between EMOTION_CONFIG.min and EMOTION_CONFIG.max.
 *
 * @example
 * ```ts
 * clampEmotion(150); // Returns: 100 (if max is 100)
 * clampEmotion(-10); // Returns: 0 (if min is 0)
 * clampEmotion(50);  // Returns: 50
 * ```
 */
export const clampEmotion = (emotion: number): number =>
  clamp(emotion, EMOTION_CONFIG.min, EMOTION_CONFIG.max);

/**
 * Generates a base emotion value with optional pattern variation.
 *
 * Applies configured base emotion values and adds random noise based on
 * standard deviation. Special handling for "bimodal" pattern creates
 * a distribution with two peaks.
 *
 * @param pattern - The emotion pattern key from EMOTION_CONFIG.baseEmotions.
 * @returns A generated emotion value within valid range.
 *
 * @example
 * ```ts
 * generateBaseEmotion("normal"); // Returns: value around 50 with noise
 * generateBaseEmotion("bimodal"); // Returns: either low or high values
 * ```
 */
export const generateBaseEmotion = (
  pattern: keyof typeof EMOTION_CONFIG.baseEmotions,
): number => {
  const baseValue =
    EMOTION_CONFIG.baseEmotions[pattern] ?? EMOTION_CONFIG.baseEmotions.normal;
  const adjustedBase =
    pattern === "bimodal" &&
    Math.random() < EMOTION_CALCULATION_PARAMS.BIMODAL.THRESHOLD
      ? EMOTION_CALCULATION_PARAMS.BIMODAL.HIGH_VALUE
      : baseValue;
  return clampEmotion(
    adjustedBase + EMOTION_CONFIG.defaultStddev * generateNormalRandom(),
  );
};

/**
 * Calculates seasonal emotion effect based on month of year.
 *
 * Uses configured seasonal factors to adjust emotion values based on
 * temporal patterns (e.g., lower emotions in winter, higher in spring).
 *
 * @param date - The date for which to calculate seasonal effect.
 * @returns Seasonal adjustment value to be added to base emotion.
 *
 * @example
 * ```ts
 * calculateSeasonalEffect(new Date("2024-01-01")); // Winter (negative adjustment)
 * calculateSeasonalEffect(new Date("2024-04-01")); // Spring (positive adjustment)
 * ```
 */
export const calculateSeasonalEffect = (date: Date): number => {
  const monthIndex = date.getMonth();
  const factor =
    EMOTION_CONFIG.seasonalFactors[monthIndex] ??
    EMOTION_CALCULATION_PARAMS.SEASONAL.FACTOR_FALLBACK;
  return (
    (factor - EMOTION_CALCULATION_PARAMS.SEASONAL.BASELINE) *
    EMOTION_CONFIG.seasonalImpact
  );
};

/**
 * Calculates cumulative emotion effect from active events.
 *
 * Events have a sine-wave intensity curve that peaks in the middle
 * of the event duration. Multiple events can overlap and their
 * effects are summed.
 *
 * @param date - The date for which to calculate event effects.
 * @param events - Array of events with date ranges and impact values.
 * @returns Sum of all active event effects at the given date.
 *
 * @example
 * ```ts
 * const events = [
 *   { startDate: new Date("2024-01-01"), endDate: new Date("2024-01-07"), impact: 0.5 }
 * ];
 * calculateEventEffect(new Date("2024-01-04"), events); // Returns: positive effect
 * calculateEventEffect(new Date("2024-02-01"), events); // Returns: 0 (no active events)
 * ```
 */
export const calculateEventEffect = (
  date: Date,
  events: ReadonlyArray<{
    readonly startDate: Date;
    readonly endDate: Date;
    readonly impact: number;
  }>,
): number => {
  return events.reduce((total, { startDate, endDate, impact }) => {
    if (date < startDate || date > endDate) return total;

    const duration = endDate.getTime() - startDate.getTime();
    if (duration === 0) return total;

    const progress = (date.getTime() - startDate.getTime()) / duration;
    const intensity = Math.sin(progress * Math.PI);

    return total + impact * intensity * EMOTION_CONFIG.maxEventImpact;
  }, 0);
};

/**
 * Generates a random hour within configured time ranges.
 *
 * Returns a value between morning start and evening end, representing
 * a plausible hour for student record entries.
 *
 * @returns A random hour value (0-23).
 *
 * @example
 * ```ts
 * getRandomHour(); // Returns: e.g., 14 (2 PM)
 * ```
 */
export const getRandomHour = (): number => {
  const totalHours =
    UI_CONFIG.timeRanges.evening.end - UI_CONFIG.timeRanges.morning.start;
  return (
    Math.floor(Math.random() * totalHours) + UI_CONFIG.timeRanges.morning.start
  );
};

export type { EmotionData };
