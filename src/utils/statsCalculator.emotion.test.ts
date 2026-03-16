import {
  clampEmotion,
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
} from './statsCalculator';

describe('statsCalculator - Emotion & Event Functions', () => {
  describe('clampEmotion', () => {
    it('clamps to emotion range [1, 5]', () => {
      expect(clampEmotion(0)).toBe(1);
      expect(clampEmotion(3)).toBe(3);
      expect(clampEmotion(6)).toBe(5);
    });
  });

  describe('generateBaseEmotion', () => {
    it('returns value in [1, 5] for normal pattern', () => {
      for (let i = 0; i < 20; i++) {
        const val = generateBaseEmotion('normal');
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(5);
      }
    });

    it('returns value in [1, 5] for stress pattern', () => {
      for (let i = 0; i < 20; i++) {
        const val = generateBaseEmotion('stress');
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(5);
      }
    });

    it('returns value in [1, 5] for happy pattern', () => {
      for (let i = 0; i < 20; i++) {
        const val = generateBaseEmotion('happy');
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(5);
      }
    });

    it('returns value in [1, 5] for bimodal pattern', () => {
      for (let i = 0; i < 20; i++) {
        const val = generateBaseEmotion('bimodal');
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(5);
      }
    });

    it('handles invalid pattern key by falling back to normal', () => {
      const val = generateBaseEmotion('invalid' as never);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateSeasonalEffect', () => {
    it('returns a number for any month', () => {
      for (let m = 0; m < 12; m++) {
        const date = new Date(2024, m, 15);
        const effect = calculateSeasonalEffect(date);
        expect(typeof effect).toBe('number');
        expect(Number.isFinite(effect)).toBe(true);
      }
    });

    it('produces different effects for different months', () => {
      const jan = calculateSeasonalEffect(new Date(2024, 0, 15));
      const may = calculateSeasonalEffect(new Date(2024, 4, 15));
      expect(jan).not.toBe(may);
    });

    it('handles invalid month index by falling back to default', () => {
      // Create a date with invalid month (should not happen in practice)
      const date = new Date(2024, 15, 15); // Month 15 is out of range
      const effect = calculateSeasonalEffect(date);
      expect(typeof effect).toBe('number');
      expect(Number.isFinite(effect)).toBe(true);
    });
  });

  describe('calculateEventEffect', () => {
    const event = {
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-10'),
      impact: 0.5,
    };

    it('returns 0 when date is before event', () => {
      expect(calculateEventEffect(new Date('2024-03-31'), [event])).toBe(0);
    });

    it('returns 0 when date is after event', () => {
      expect(calculateEventEffect(new Date('2024-04-11'), [event])).toBe(0);
    });

    it('returns non-zero during event period', () => {
      const effect = calculateEventEffect(new Date('2024-04-05'), [event]);
      expect(effect).not.toBe(0);
    });

    it('returns 0 for empty events array', () => {
      expect(calculateEventEffect(new Date('2024-04-05'), [])).toBe(0);
    });

    it('handles zero-duration event without division by zero', () => {
      const zeroEvent = {
        startDate: new Date('2024-04-05'),
        endDate: new Date('2024-04-05'),
        impact: 1.0,
      };
      expect(calculateEventEffect(new Date('2024-04-05'), [zeroEvent])).toBe(0);
    });

    it('accumulates effects from multiple events', () => {
      const events = [
        { startDate: new Date('2024-04-01'), endDate: new Date('2024-04-10'), impact: 0.5 },
        { startDate: new Date('2024-04-03'), endDate: new Date('2024-04-08'), impact: -0.3 },
      ];
      const effect = calculateEventEffect(new Date('2024-04-05'), events);
      expect(typeof effect).toBe('number');
    });
  });
});
