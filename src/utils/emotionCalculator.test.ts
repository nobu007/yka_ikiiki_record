import { generateBaseEmotion, calculateSeasonalEffect, calculateEventEffect } from './emotionCalculator';
import { EMOTION_CONSTANTS } from '@/domain/entities/DataGeneration';

describe('emotionCalculator', () => {
  describe('generateBaseEmotion', () => {
    test('normal pattern generates values within range', () => {
      for (let i = 0; i < 100; i++) {
        const emotion = generateBaseEmotion('normal');
        expect(emotion).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MIN_EMOTION);
        expect(emotion).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EMOTION);
      }
    });

    test('bimodal pattern generates values within range', () => {
      for (let i = 0; i < 100; i++) {
        const emotion = generateBaseEmotion('bimodal');
        expect(emotion).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MIN_EMOTION);
        expect(emotion).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EMOTION);
      }
    });

    test('stress pattern generates lower values', () => {
      const emotions = Array.from({ length: 50 }, () => generateBaseEmotion('stress'));
      const avg = emotions.reduce((sum, e) => sum + e, 0) / emotions.length;
      expect(avg).toBeLessThan(3.0); // Should be lower than neutral
    });

    test('happy pattern generates higher values', () => {
      const emotions = Array.from({ length: 50 }, () => generateBaseEmotion('happy'));
      const avg = emotions.reduce((sum, e) => sum + e, 0) / emotions.length;
      expect(avg).toBeGreaterThan(3.0); // Should be higher than neutral
    });

    test('unknown pattern returns default value', () => {
      const emotion = generateBaseEmotion('unknown' as any);
      expect(emotion).toBe(3.0);
    });
  });

  describe('calculateSeasonalEffect', () => {
    test('returns seasonal effect for different months', () => {
      const springDate = new Date('2025-04-15');
      const winterDate = new Date('2025-01-15');
      
      const springEffect = calculateSeasonalEffect(springDate);
      const winterEffect = calculateSeasonalEffect(winterDate);
      
      expect(typeof springEffect).toBe('number');
      expect(typeof winterEffect).toBe('number');
      expect(springEffect).not.toBe(winterEffect);
    });

    test('handles all months', () => {
      for (let month = 0; month < 12; month++) {
        const date = new Date(2025, month, 15);
        const effect = calculateSeasonalEffect(date);
        expect(typeof effect).toBe('number');
        expect(isNaN(effect)).toBe(false);
      }
    });
  });

  describe('calculateEventEffect', () => {
    test('returns 0 when no events', () => {
      const date = new Date('2025-05-15');
      const effect = calculateEventEffect(date, []);
      expect(effect).toBe(0);
    });

    test('calculates effect during event period', () => {
      const date = new Date('2025-05-15');
      const events = [
        {
          startDate: new Date('2025-05-10'),
          endDate: new Date('2025-05-20'),
          impact: 0.5
        }
      ];
      
      const effect = calculateEventEffect(date, events);
      expect(effect).toBeGreaterThan(0);
      expect(effect).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EVENT_IMPACT);
    });

    test('returns 0 outside event period', () => {
      const date = new Date('2025-05-25');
      const events = [
        {
          startDate: new Date('2025-05-10'),
          endDate: new Date('2025-05-20'),
          impact: 0.5
        }
      ];
      
      const effect = calculateEventEffect(date, events);
      expect(effect).toBe(0);
    });

    test('handles multiple events', () => {
      const date = new Date('2025-05-15');
      const events = [
        {
          startDate: new Date('2025-05-10'),
          endDate: new Date('2025-05-20'),
          impact: 0.3
        },
        {
          startDate: new Date('2025-05-12'),
          endDate: new Date('2025-05-18'),
          impact: 0.2
        }
      ];
      
      const effect = calculateEventEffect(date, events);
      expect(effect).toBeGreaterThan(0);
    });
  });
});