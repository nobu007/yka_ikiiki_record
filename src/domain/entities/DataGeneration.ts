/**
 * データ生成の設定に関する型定義
 */

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
  impact: number; // -1.0 to 1.0
};

export type ClassCharacteristics = {
  baselineEmotion: number; // 基準感情値（3.0前後）
  volatility: number; // 変動の大きさ（0.1-1.0）
  cohesion: number; // クラスの結束度（影響の伝播度）
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

// 感情値の生成に使用する定数
export const EMOTION_CONSTANTS = {
  MIN_EMOTION: 1.0,
  MAX_EMOTION: 5.0,
  DEFAULT_STDDEV: 0.5,
  SEASONAL_IMPACT: 0.2,
  MAX_EVENT_IMPACT: 0.5
};