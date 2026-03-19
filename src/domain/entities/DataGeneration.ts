export type EmotionDistributionPattern =
  | "normal"
  | "bimodal"
  | "stress"
  | "happy";

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

export type ClassEvent = EventEffect;

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

export { DEFAULT_CONFIG } from "@/schemas/api";

export const EMOTION_CONSTANTS = {
  MIN_EMOTION: 1.0,
  MAX_EMOTION: 5.0,
  DEFAULT_STDDEV: 0.5,
  SEASONAL_IMPACT: 0.2,
  MAX_EVENT_IMPACT: 0.5,
} as const;

export const DATA_GENERATION_BOUNDS = {
  MIN_STUDENTS: 10,
  MAX_STUDENTS: 500,
  MIN_PERIOD_DAYS: 7,
  MAX_PERIOD_DAYS: 365,
} as const;
