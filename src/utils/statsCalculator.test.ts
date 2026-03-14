import {
  clamp,
  average,
  calculateAverage,
  clampEmotion,
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  getRandomHour,
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateTrendline,
  calculateEmotionTrend,
  generateNormalRandom,
} from './statsCalculator';

describe('statsCalculator', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('clamps to min when below', () => {
      expect(clamp(-1, 0, 10)).toBe(0);
    });

    it('clamps to max when above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles equal min and max', () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });
  });

  describe('average', () => {
    it('calculates average of numbers', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(average([])).toBe(0);
    });

    it('returns the number itself for single element', () => {
      expect(average([4.5])).toBe(4.5);
    });

    it('rounds to 1 decimal place', () => {
      expect(average([1, 2])).toBe(1.5);
      expect(average([1, 1, 2])).toBe(1.3);
    });
  });

  describe('calculateAverage', () => {
    it('is an alias for average', () => {
      expect(calculateAverage).toBe(average);
    });
  });

  describe('generateNormalRandom', () => {
    it('generates numbers (statistical check over 1000 samples)', () => {
      const samples = Array.from({ length: 1000 }, () => generateNormalRandom());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      // Mean should be approximately 0 (within tolerance)
      expect(Math.abs(mean)).toBeLessThan(0.2);
    });
  });

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
      // @ts-expect-error - Testing invalid key
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

  describe('getRandomHour', () => {
    it('returns integer in valid time range', () => {
      for (let i = 0; i < 20; i++) {
        const hour = getRandomHour();
        expect(Number.isInteger(hour)).toBe(true);
        expect(hour).toBeGreaterThanOrEqual(5);
        expect(hour).toBeLessThan(24);
      }
    });
  });

  describe('calculateMonthlyStats', () => {
    const emotions = [
      { date: new Date('2024-04-01'), emotion: 3.0 },
      { date: new Date('2024-04-15'), emotion: 4.0 },
      { date: new Date('2024-05-01'), emotion: 2.0 },
    ];

    it('groups by month and calculates averages', () => {
      const result = calculateMonthlyStats(emotions);
      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('2024-04');
      expect(result[0].avgEmotion).toBe(3.5);
      expect(result[0].count).toBe(2);
      expect(result[1].month).toBe('2024-05');
      expect(result[1].count).toBe(1);
    });

    it('sorts by month ascending', () => {
      const reversed = [
        { date: new Date('2024-12-01'), emotion: 3.0 },
        { date: new Date('2024-01-01'), emotion: 3.0 },
      ];
      const result = calculateMonthlyStats(reversed);
      expect(result[0].month).toBe('2024-01');
      expect(result[1].month).toBe('2024-12');
    });

    it('returns empty array for empty input', () => {
      expect(calculateMonthlyStats([])).toEqual([]);
    });
  });

  describe('calculateDayOfWeekStats', () => {
    it('returns stats for all 7 days', () => {
      const emotions = [
        { date: new Date('2024-04-01'), emotion: 3.0 }, // Monday (月)
        { date: new Date('2024-04-02'), emotion: 4.0 }, // Tuesday (火)
      ];
      const result = calculateDayOfWeekStats(emotions);
      expect(result).toHaveLength(7);
      expect(result.map(r => r.day)).toEqual(['日', '月', '火', '水', '木', '金', '土']);
    });

    it('correctly assigns emotions to day of week', () => {
      const monday = new Date('2024-04-01'); // Monday
      const emotions = [{ date: monday, emotion: 4.0 }];
      const result = calculateDayOfWeekStats(emotions);
      const mondayStats = result.find(r => r.day === '月');
      expect(mondayStats?.avgEmotion).toBe(4);
      expect(mondayStats?.count).toBe(1);
    });

    it('returns 0 avgEmotion for days with no data', () => {
      const result = calculateDayOfWeekStats([]);
      result.forEach(stat => {
        expect(stat.avgEmotion).toBe(0);
        expect(stat.count).toBe(0);
      });
    });
  });

  describe('calculateTimeOfDayStats', () => {
    it('categorizes by morning/afternoon/evening', () => {
      const emotions = [
        { date: new Date(), emotion: 3.0, hour: 8 },   // morning
        { date: new Date(), emotion: 4.0, hour: 14 },  // afternoon
        { date: new Date(), emotion: 2.0, hour: 20 },  // evening
      ];
      const result = calculateTimeOfDayStats(emotions);
      expect(result.morning).toBe(3);
      expect(result.afternoon).toBe(4);
      expect(result.evening).toBe(2);
    });

    it('returns 0 for all periods when no data', () => {
      const result = calculateTimeOfDayStats([]);
      expect(result.morning).toBe(0);
      expect(result.afternoon).toBe(0);
      expect(result.evening).toBe(0);
    });

    it('handles entries without hour field', () => {
      const emotions = [
        { date: new Date(), emotion: 3.0 },
      ];
      const result = calculateTimeOfDayStats(emotions);
      expect(result.morning).toBe(0);
      expect(result.afternoon).toBe(0);
      expect(result.evening).toBe(0);
    });
  });

  describe('calculateEmotionDistribution', () => {
    it('distributes emotions into 5 buckets', () => {
      const emotions = [
        { date: new Date(), emotion: 1.2 },
        { date: new Date(), emotion: 2.5 },
        { date: new Date(), emotion: 3.0 },
        { date: new Date(), emotion: 4.8 },
        { date: new Date(), emotion: 5.0 },
      ];
      const result = calculateEmotionDistribution(emotions);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(1); // 1.x
      expect(result[1]).toBe(1); // 2.x
      expect(result[2]).toBe(1); // 3.x
      expect(result[3]).toBe(1); // 4.x
      expect(result[4]).toBe(1); // 5.x
    });

    it('returns all zeros for empty input', () => {
      expect(calculateEmotionDistribution([])).toEqual([0, 0, 0, 0, 0]);
    });

    it('clamps values outside [1,5] to boundaries', () => {
      const emotions = [
        { date: new Date(), emotion: 0.5 },
        { date: new Date(), emotion: 6.0 },
      ];
      const result = calculateEmotionDistribution(emotions);
      expect(result[0]).toBe(1); // 0.5 → index 0
      expect(result[4]).toBe(1); // 6.0 → index 4
    });
  });

  describe('calculateStudentStats', () => {
    it('groups by student and calculates stats', () => {
      const emotions = [
        { date: new Date(), emotion: 3.0, student: 0 },
        { date: new Date(), emotion: 4.0, student: 0 },
        { date: new Date(), emotion: 2.0, student: 1 },
      ];
      const result = calculateStudentStats(emotions);
      expect(result).toHaveLength(2);
      expect(result[0].student).toBe('学生1');
      expect(result[0].recordCount).toBe(2);
      expect(result[0].avgEmotion).toBe(3.5);
      expect(result[1].student).toBe('学生2');
      expect(result[1].recordCount).toBe(1);
    });

    it('returns empty array for empty input', () => {
      expect(calculateStudentStats([])).toEqual([]);
    });

    it('defaults to student 0 when student is undefined', () => {
      const emotions = [{ date: new Date(), emotion: 3.0 }];
      const result = calculateStudentStats(emotions);
      expect(result[0].student).toBe('学生1');
    });
  });

  describe('calculateTrendline', () => {
    it('returns last 7 values rounded to 1 decimal', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = calculateTrendline(input);
      expect(result).toEqual([4, 5, 6, 7, 8, 9, 10]);
    });

    it('returns all if fewer than 7', () => {
      expect(calculateTrendline([3.14, 2.71])).toEqual([3.1, 2.7]);
    });

    it('returns empty for empty input', () => {
      expect(calculateTrendline([])).toEqual([]);
    });
  });

  describe('calculateEmotionTrend', () => {
    it('returns "stable" for fewer than 2 elements', () => {
      expect(calculateEmotionTrend([])).toBe('stable');
      expect(calculateEmotionTrend([3.0])).toBe('stable');
    });

    it('returns "up" when recent avg exceeds earlier by > 0.2', () => {
      expect(calculateEmotionTrend([2.0, 2.0, 2.0, 3.0, 3.0, 3.0])).toBe('up');
    });

    it('returns "down" when recent avg is below earlier by > 0.2', () => {
      expect(calculateEmotionTrend([4.0, 4.0, 4.0, 3.0, 3.0, 3.0])).toBe('down');
    });

    it('returns "stable" when difference is within 0.2', () => {
      expect(calculateEmotionTrend([3.0, 3.0, 3.0, 3.1, 3.1, 3.1])).toBe('stable');
    });

    it('returns "stable" when no earlier period exists (< 4 elements)', () => {
      expect(calculateEmotionTrend([3.0, 3.0, 3.0])).toBe('stable');
    });
  });
});
