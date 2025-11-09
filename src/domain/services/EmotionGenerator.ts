import { DataGenerationConfig } from '../entities/DataGeneration';
import {
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  clampEmotionValue
} from '@/utils/emotionCalculator';

/**
 * 感情値を生成するクラス
 */
export class EmotionGenerator {
  /**
   * 指定された設定に基づいて感情値を生成
   */
  generateEmotion(config: DataGenerationConfig, date: Date, studentIndex: number): number {
    // 基本感情値の生成
    const baseEmotion = generateBaseEmotion(config.distributionPattern);

    // 各種影響の計算
    let emotion = baseEmotion;

    // クラス特性の反映
    emotion = emotion * (1 + (config.classCharacteristics.volatility - 0.5) * 0.4);
    emotion += (config.classCharacteristics.baselineEmotion - 3.0) * 0.5;

    // 季節変動の反映
    if (config.seasonalEffects) {
      emotion += calculateSeasonalEffect(date);
    }

    // イベントの影響を反映
    emotion += calculateEventEffect(date, config.eventEffects);

    // 値の範囲を制限
    return clampEmotionValue(emotion);
  }
}