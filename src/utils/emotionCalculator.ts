import { EmotionDistributionPattern, EventEffect, EMOTION_CONSTANTS } from '@/domain/entities/DataGeneration';

/**
 * 感情値計算に関するユーティリティ関数
 */

/**
 * 標準正規分布の乱数を生成（ボックス・ミュラー法）
 */
const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * 感情値を範囲内に制限
 */
const clampEmotion = (emotion: number): number => {
  const { MIN_EMOTION, MAX_EMOTION } = EMOTION_CONSTANTS;
  return Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, emotion));
};

/**
 * 基本の感情値を生成（分布パターンに基づく）
 */
export const generateBaseEmotion = (pattern: EmotionDistributionPattern, random = Math.random()): number => {
  const { DEFAULT_STDDEV } = EMOTION_CONSTANTS;

  const patterns = {
    normal: () => {
      const z = generateNormalRandom();
      return clampEmotion(3.0 + DEFAULT_STDDEV * z);
    },
    bimodal: () => {
      const base = random < 0.5 ? 2.0 : 4.0;
      return clampEmotion(base + DEFAULT_STDDEV * generateNormalRandom());
    },
    stress: () => clampEmotion(2.5 + DEFAULT_STDDEV * generateNormalRandom()),
    happy: () => clampEmotion(3.5 + DEFAULT_STDDEV * generateNormalRandom())
  };

  return patterns[pattern]?.() || 3.0;
};

/**
 * 季節変動の影響を計算
 */
export function calculateSeasonalEffect(date: Date): number {
  const month = date.getMonth();
  const { SEASONAL_IMPACT } = EMOTION_CONSTANTS;

  // 季節ごとの基本的な影響度
  const seasonalFactors = [
    0.2,  // 1月（冬）
    0.1,  // 2月（冬）
    0.3,  // 3月（春）
    0.4,  // 4月（春）
    0.5,  // 5月（春）
    0.3,  // 6月（夏）
    0.2,  // 7月（夏）
    0.1,  // 8月（夏）
    0.3,  // 9月（秋）
    0.4,  // 10月（秋）
    0.3,  // 11月（秋）
    0.1   // 12月（冬）
  ];

  return (seasonalFactors[month] - 0.3) * SEASONAL_IMPACT;
}

/**
 * イベントの影響を計算
 */
export function calculateEventEffect(date: Date, events: EventEffect[]): number {
  const { MAX_EVENT_IMPACT } = EMOTION_CONSTANTS;
  let totalEffect = 0;

  events.forEach(event => {
    if (date >= event.startDate && date <= event.endDate) {
      // イベント期間中は影響度を徐々に変化させる
      const progress = (date.getTime() - event.startDate.getTime()) /
                      (event.endDate.getTime() - event.startDate.getTime());
      const intensity = Math.sin(progress * Math.PI); // 山型の影響度
      totalEffect += event.impact * intensity * MAX_EVENT_IMPACT;
    }
  });

  return totalEffect;
}