import { EmotionDistributionPattern, EventEffect, EMOTION_CONSTANTS } from '@/domain/entities/DataGeneration';

const { MIN_EMOTION, MAX_EMOTION, DEFAULT_STDDEV, SEASONAL_IMPACT, MAX_EVENT_IMPACT } = EMOTION_CONSTANTS;

// Seasonal factors for each month (Jan-Dec)
const SEASONAL_FACTORS = [0.2, 0.1, 0.3, 0.4, 0.5, 0.3, 0.2, 0.1, 0.3, 0.4, 0.3, 0.1] as const;

// Base emotion values for different patterns
const BASE_EMOTIONS = {
  normal: 3.0,
  bimodal: 2.0, // Will be randomized between 2.0 and 4.0
  stress: 2.5,
  happy: 3.5
} as const;

/**
 * Generates a normally distributed random number using Box-Muller transform
 */
const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * Clamps emotion value to valid range
 */
export const clampEmotionValue = (emotion: number): number => 
  Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, emotion));

/**
 * Generates base emotion based on pattern
 */
export const generateBaseEmotion = (pattern: EmotionDistributionPattern): number => {
  const baseValue = BASE_EMOTIONS[pattern] ?? BASE_EMOTIONS.normal;
  
  // Handle bimodal pattern specially
  const adjustedBase = pattern === 'bimodal' && Math.random() < 0.5 ? 4.0 : baseValue;
  
  const emotion = adjustedBase + DEFAULT_STDDEV * generateNormalRandom();
  return clampEmotionValue(emotion);
};

/**
 * Calculates seasonal effect on emotion
 */
export const calculateSeasonalEffect = (date: Date): number => {
  const monthFactor = SEASONAL_FACTORS[date.getMonth()];
  return (monthFactor - 0.3) * SEASONAL_IMPACT;
};

/**
 * Calculates cumulative effect of events on a given date
 */
export const calculateEventEffect = (date: Date, events: EventEffect[]): number => {
  return events.reduce((total, event) => {
    const { startDate, endDate, impact } = event;
    
    if (date >= startDate && date <= endDate) {
      const progress = (date.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime());
      const intensity = Math.sin(progress * Math.PI);
      return total + impact * intensity * MAX_EVENT_IMPACT;
    }
    
    return total;
  }, 0);
};