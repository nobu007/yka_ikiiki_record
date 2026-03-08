export type EmotionDistributionPattern = 'normal' | 'bimodal' | 'stress' | 'happy';

export type SeasonalEffect = {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
};

export type EventEffect = {
  name: string;
  startDate: Date;
  endDate: Date;
  impact: number;
};

export type ClassCharacteristics = {
  baselineEmotion: number;
  volatility: number;
  cohesion: number;
};

export interface DataGenerationConfig {
  studentCount: number;
  periodDays: number;
  distributionPattern: EmotionDistributionPattern;
  seasonalEffects: boolean;
  eventEffects: EventEffect[];
  classCharacteristics: ClassCharacteristics;
}

export const DEFAULT_CONFIG: DataGenerationConfig = {
  studentCount: 25,
  periodDays: 30,
  distributionPattern: 'normal',
  seasonalEffects: false,
  eventEffects: [],
  classCharacteristics: {
    baselineEmotion: 3.0,
    volatility: 0.5,
    cohesion: 0.7
  }
};

export const EMOTION_CONSTANTS = {
  MIN_EMOTION: 1.0,
  MAX_EMOTION: 5.0,
  DEFAULT_STDDEV: 0.5,
  SEASONAL_IMPACT: 0.2,
  MAX_EVENT_IMPACT: 0.5
};