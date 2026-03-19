export * from './messages';
export * from './ui';

export const APP_CONFIG = {
  NAME: 'イキイキレコード',
  VERSION: '0.1.0',
  DESCRIPTION: '生徒の学習データを生成・管理するダッシュボードです',
} as const;

export const GENERATION_DEFAULTS = {
  STUDENT_COUNT: 25,
  PERIOD_DAYS: 30,
  BASELINE_EMOTION: 3.0,
  VOLATILITY: 0.5,
  COHESION: 0.7,
} as const;

export const EMOTION_RANGES = {
  MIN: 1.0,
  MAX: 5.0,
  DEFAULT_STDDEV: 0.5,
  SEASONAL_IMPACT: 0.2,
  MAX_EVENT_IMPACT: 0.5,
} as const;

export const GENERATION_CONSTRAINTS = {
  STUDENT_COUNT: {
    MIN: 10,
    MAX: 500,
  },
  PERIOD_DAYS: {
    MIN: 7,
    MAX: 365,
  },
  EVENT_IMPACT: {
    MIN: -1.0,
    MAX: 1.0,
    STEP: 0.1,
  },
  BASELINE_EMOTION: {
    MIN: 2.5,
    MAX: 3.5,
  },
  VOLATILITY: {
    MIN: 0.1,
    MAX: 1.0,
  },
  COHESION: {
    MIN: 0.1,
    MAX: 1.0,
  },
} as const;