import { EmotionDistributionPattern, EventEffect, EMOTION_CONSTANTS } from '@/domain/entities/DataGeneration';

// Extract constants for better maintainability
const { MIN_EMOTION, MAX_EMOTION, DEFAULT_STDDEV, SEASONAL_IMPACT, MAX_EVENT_IMPACT } = EMOTION_CONSTANTS;

// Type-safe seasonal factors for each month (Jan-Dec)
const SEASONAL_FACTORS = [0.2, 0.1, 0.3, 0.4, 0.5, 0.3, 0.2, 0.1, 0.3, 0.4, 0.3, 0.1] as const;

// Type-safe base emotion values for different patterns
const BASE_EMOTIONS = {
  normal: 3.0,
  bimodal: 2.0, // Will be randomized between 2.0 and 4.0
  stress: 2.5,
  happy: 3.5
} as const;

// Type for month index (0-11)
type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Generates a normally distributed random number using Box-Muller transform
 * Optimized for performance with memoization
 */
const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * Clamps emotion value to valid range
 * Optimized with direct comparison
 */
export const clampEmotionValue = (emotion: number): number => 
  Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, emotion));

/**
 * Generates base emotion based on pattern
 * Simplified logic with better type safety
 */
export const generateBaseEmotion = (pattern: EmotionDistributionPattern): number => {
  const baseValue = BASE_EMOTIONS[pattern] ?? BASE_EMOTIONS.normal;
  
  // Handle bimodal pattern with simplified logic
  const adjustedBase = pattern === 'bimodal' && Math.random() < 0.5 ? 4.0 : baseValue;
  
  const emotion = adjustedBase + DEFAULT_STDDEV * generateNormalRandom();
  return clampEmotionValue(emotion);
};

/**
 * Calculates seasonal effect on emotion
 * Optimized with direct array access
 */
export const calculateSeasonalEffect = (date: Date): number => {
  const monthIndex = date.getMonth() as MonthIndex;
  const monthFactor = SEASONAL_FACTORS[monthIndex];
  return (monthFactor - 0.3) * SEASONAL_IMPACT;
};

/**
 * Calculates cumulative effect of events on a given date
 * Optimized with early return and better variable naming
 */
export const calculateEventEffect = (date: Date, events: EventEffect[]): number => {
  return events.reduce((total, event) => {
    const { startDate, endDate, impact } = event;
    
    // Early return if date is outside event range
    if (date < startDate || date > endDate) {
      return total;
    }
    
    // Calculate progress and intensity
    const duration = endDate.getTime() - startDate.getTime();
    const progress = (date.getTime() - startDate.getTime()) / duration;
    const intensity = Math.sin(progress * Math.PI);
    
    return total + impact * intensity * MAX_EVENT_IMPACT;
  }, 0);
};