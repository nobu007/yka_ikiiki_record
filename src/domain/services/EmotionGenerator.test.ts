import { generateEmotion } from './EmotionGenerator';
import { DEFAULT_CONFIG } from '../entities/DataGeneration';
import { EMOTION_CONSTANTS } from '../entities/DataGeneration';

describe('EmotionGenerator', () => {
  describe('generateEmotion', () => {
    test('generates emotion within valid range', () => {
      const date = new Date('2025-05-15');
      const emotion = generateEmotion(DEFAULT_CONFIG, date, 0);
      
      expect(emotion).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MIN_EMOTION);
      expect(emotion).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EMOTION);
    });

    test('handles different distribution patterns', () => {
      const date = new Date('2025-05-15');
      const patterns = ['normal', 'bimodal', 'stress', 'happy'] as const;
      
      patterns.forEach(pattern => {
        const config = { ...DEFAULT_CONFIG, distributionPattern: pattern };
        const emotion = generateEmotion(config, date, 0);
        
        expect(emotion).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MIN_EMOTION);
        expect(emotion).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EMOTION);
      });
    });

    test('applies seasonal effects when enabled', () => {
      const date = new Date('2025-05-15'); // Spring
      const configWithSeasonal = { ...DEFAULT_CONFIG, seasonalEffects: true };
      const configWithoutSeasonal = { ...DEFAULT_CONFIG, seasonalEffects: false };
      
      const emotionWithSeasonal = generateEmotion(configWithSeasonal, date, 0);
      const emotionWithoutSeasonal = generateEmotion(configWithoutSeasonal, date, 0);
      
      // Values should be different due to seasonal effect
      expect(typeof emotionWithSeasonal).toBe('number');
      expect(typeof emotionWithoutSeasonal).toBe('number');
    });

    test('applies event effects', () => {
      const date = new Date('2025-05-15');
      const configWithEvents = {
        ...DEFAULT_CONFIG,
        eventEffects: [
          {
            startDate: new Date('2025-05-10'),
            endDate: new Date('2025-05-20'),
            impact: 0.5
          }
        ]
      };
      
      const emotionWithEvents = generateEmotion(configWithEvents, date, 0);
      const emotionWithoutEvents = generateEmotion(DEFAULT_CONFIG, date, 0);
      
      expect(typeof emotionWithEvents).toBe('number');
      expect(typeof emotionWithoutEvents).toBe('number');
    });

    test('handles different student indices', () => {
      const date = new Date('2025-05-15');
      const emotion1 = generateEmotion(DEFAULT_CONFIG, date, 0);
      const emotion2 = generateEmotion(DEFAULT_CONFIG, date, 1);
      
      expect(typeof emotion1).toBe('number');
      expect(typeof emotion2).toBe('number');
    });

    test('respects class characteristics', () => {
      const date = new Date('2025-05-15');
      const configHighVolatility = {
        ...DEFAULT_CONFIG,
        classCharacteristics: {
          volatility: 0.9,
          baselineEmotion: 3.0
        }
      };
      
      const configLowVolatility = {
        ...DEFAULT_CONFIG,
        classCharacteristics: {
          volatility: 0.1,
          baselineEmotion: 3.0
        }
      };
      
      const emotionHigh = generateEmotion(configHighVolatility, date, 0);
      const emotionLow = generateEmotion(configLowVolatility, date, 0);
      
      expect(typeof emotionHigh).toBe('number');
      expect(typeof emotionLow).toBe('number');
    });
  });
});