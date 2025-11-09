import { EmotionDistributionPattern, EventEffect, EMOTION_CONSTANTS } from '@/domain/entities/DataGeneration';

const { MIN_EMOTION, MAX_EMOTION, DEFAULT_STDDEV, SEASONAL_IMPACT, MAX_EVENT_IMPACT } = EMOTION_CONSTANTS;
const SEASONAL_FACTORS = [0.2, 0.1, 0.3, 0.4, 0.5, 0.3, 0.2, 0.1, 0.3, 0.4, 0.3, 0.1];

const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

const clampEmotion = (emotion: number): number => 
  Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, emotion));

const generatePatternEmotion = (pattern: EmotionDistributionPattern, random = Math.random()): number => {
  const baseEmotions: Record<string, number> = {
    normal: 3.0,
    bimodal: random < 0.5 ? 2.0 : 4.0,
    stress: 2.5,
    happy: 3.5
  };
  
  if (!baseEmotions[pattern]) {
    return 3.0; // Return exact default for unknown patterns
  }
  
  return clampEmotion(baseEmotions[pattern] + DEFAULT_STDDEV * generateNormalRandom());
};

export const generateBaseEmotion = generatePatternEmotion;

export const calculateSeasonalEffect = (date: Date): number => 
  (SEASONAL_FACTORS[date.getMonth()] - 0.3) * SEASONAL_IMPACT;

export const calculateEventEffect = (date: Date, events: EventEffect[]): number => 
  events.reduce((total, event) => {
    if (date >= event.startDate && date <= event.endDate) {
      const progress = (date.getTime() - event.startDate.getTime()) / 
                      (event.endDate.getTime() - event.startDate.getTime());
      const intensity = Math.sin(progress * Math.PI);
      return total + event.impact * intensity * MAX_EVENT_IMPACT;
    }
    return total;
  }, 0);

export const clampEmotionValue = clampEmotion;