import {
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateTrendline,
  calculateEmotionTrend,
} from './statsCalculator';

describe('statsCalculator - Distribution & Trend Functions', () => {
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
