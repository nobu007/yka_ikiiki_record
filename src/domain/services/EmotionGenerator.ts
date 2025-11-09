import { DataGenerationConfig } from '../entities/DataGeneration';
import {
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  clampEmotionValue
} from '@/utils/emotionCalculator';

/**
 * 感情値を生成する関数
 */
export const generateEmotion = (
  config: DataGenerationConfig, 
  date: Date, 
  studentIndex: number
): number => {
  const { distributionPattern, classCharacteristics, seasonalEffects, eventEffects } = config;
  
  let emotion = generateBaseEmotion(distributionPattern);
  
  // クラス特性の反映
  emotion = emotion * (1 + (classCharacteristics.volatility - 0.5) * 0.4);
  emotion += (classCharacteristics.baselineEmotion - 3.0) * 0.5;
  
  // 季節変動の反映
  if (seasonalEffects) {
    emotion += calculateSeasonalEffect(date);
  }
  
  // イベントの影響を反映
  emotion += calculateEventEffect(date, eventEffects);
  
  return clampEmotionValue(emotion);
};

/**
 * 感情値を生成するクラス（後方互換性のため）
 * @deprecated generateEmotion 関数の使用を推奨
 */
export class EmotionGenerator {
  generateEmotion(config: DataGenerationConfig, date: Date, studentIndex: number): number {
    return generateEmotion(config, date, studentIndex);
  }
}