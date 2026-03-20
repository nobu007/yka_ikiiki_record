import { DataGenerationConfig } from "../entities/DataGeneration";
import {
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  clampEmotion,
} from "@/utils/statsCalculator";

/**
 * Generates a single emotion value for a student on a specific date.
 *
 * Combines multiple factors to create realistic emotion data:
 * - Base emotion from distribution pattern (normal, bimodal, etc.)
 * - Class characteristics (baseline emotion, volatility)
 * - Seasonal effects (monthly adjustments)
 * - Event effects (time-bound impact multipliers)
 *
 * The final value is clamped to the valid emotion range.
 *
 * @param config - Data generation configuration containing all parameters.
 * @param date - The date for which to generate the emotion value.
 * @param _studentIndex - Index of the student (currently unused, reserved for future individualization).
 * @returns Generated emotion value within valid range (0-100).
 *
 * @example
 * ```ts
 * const config = {
 *   distributionPattern: "normal",
 *   classCharacteristics: { baselineEmotion: 3.0, volatility: 0.5 },
 *   seasonalEffects: true,
 *   eventEffects: []
 * };
 * const emotion = generateEmotion(config, new Date("2024-01-15"), 0);
 * // Returns: e.g., 52.3
 * ```
 */
export const generateEmotion = (
  config: DataGenerationConfig,
  date: Date,
  _studentIndex: number,
): number => {
  const {
    distributionPattern,
    classCharacteristics,
    seasonalEffects,
    eventEffects,
  } = config;

  let emotion = generateBaseEmotion(distributionPattern);

  // Apply class characteristics
  emotion = emotion * (1 + (classCharacteristics.volatility - 0.5) * 0.4);
  emotion += (classCharacteristics.baselineEmotion - 3.0) * 0.5;

  // Apply seasonal effects if enabled
  if (seasonalEffects) {
    emotion += calculateSeasonalEffect(date);
  }

  // Apply event effects (empty array has no effect)
  emotion += calculateEventEffect(date, eventEffects);

  return clampEmotion(emotion);
};
