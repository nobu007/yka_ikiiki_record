/**
 * Stats Calculator Module
 *
 * This file re-exports all functions from the split module structure
 * for backward compatibility with existing imports.
 *
 * Module structure:
 * - math.ts: Basic mathematical utilities (clamp, average)
 * - generation.ts: Random generation and emotion calculation
 * - analytics.ts: Statistical analysis and data aggregation
 */

// Math utilities
export { clamp, average, calculateAverage } from "./statsCalculator/math";

// Generation and emotion calculation
export {
  generateNormalRandom,
  clampEmotion,
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  getRandomHour,
  type EmotionData,
} from "./statsCalculator/generation";

// Analytics and statistics
export {
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateTrendline,
  calculateEmotionTrend,
} from "./statsCalculator/analytics";
