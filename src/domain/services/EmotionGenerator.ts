import { DataGenerationConfig } from '../entities/DataGeneration';
import {
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  clampEmotion
} from '@/lib/utils';

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
  
  return clampEmotion(emotion);
};