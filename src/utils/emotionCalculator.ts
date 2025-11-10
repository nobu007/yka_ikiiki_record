import { EmotionDistributionPattern, EventEffect, EMOTION_CONSTANTS } from '@/domain/entities/DataGeneration';
import { EMOTION_CONFIG } from '@/lib/config';

const { MIN_EMOTION, MAX_EMOTION, DEFAULT_STDDEV, SEASONAL_IMPACT, MAX_EVENT_IMPACT } = EMOTION_CONSTANTS;
const { seasonalFactors, baseEmotions } = EMOTION_CONFIG;

const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

export const clampEmotionValue = (emotion: number): number => 
  Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, emotion));

export const generateBaseEmotion = (pattern: EmotionDistributionPattern): number => {
  const baseValue = baseEmotions[pattern] ?? baseEmotions.normal;
  const adjustedBase = pattern === 'bimodal' && Math.random() < 0.5 ? 4.0 : baseValue;
  return clampEmotionValue(adjustedBase + DEFAULT_STDDEV * generateNormalRandom());
};

export const calculateSeasonalEffect = (date: Date): number => 
  (seasonalFactors[date.getMonth()] - 0.3) * SEASONAL_IMPACT;

export const calculateEventEffect = (date: Date, events: EventEffect[]): number => 
  events.reduce((total, { startDate, endDate, impact }) => {
    if (date < startDate || date > endDate) return total;
    
    const duration = endDate.getTime() - startDate.getTime();
    const progress = (date.getTime() - startDate.getTime()) / duration;
    const intensity = Math.sin(progress * Math.PI);
    
    return total + impact * intensity * MAX_EVENT_IMPACT;
  }, 0);