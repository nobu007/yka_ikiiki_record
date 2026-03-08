import { DataGenerationConfig } from '../entities/DataGeneration';
import {
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  clampEmotion
} from './statsCalculator';

export const generateEmotion = (
  config: DataGenerationConfig, 
  date: Date, 
  _studentIndex: number
): number => {
  const { distributionPattern, classCharacteristics, seasonalEffects, eventEffects } = config;
  
  let emotion = generateBaseEmotion(distributionPattern);
  
  emotion = emotion * (1 + (classCharacteristics.volatility - 0.5) * 0.4);
  emotion += (classCharacteristics.baselineEmotion - 3.0) * 0.5;
  
  if (seasonalEffects) {
    emotion += calculateSeasonalEffect(date);
  }
  
  emotion += calculateEventEffect(date, eventEffects);
  
  return clampEmotion(emotion);
};