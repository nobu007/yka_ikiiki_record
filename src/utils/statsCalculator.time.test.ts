import {
  getRandomHour,
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
} from './statsCalculator';

describe('statsCalculator - Time-Based Statistics', () => {
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
      expect(result[0]!.month).toBe('2024-04');
      expect(result[0]!.avgEmotion).toBe(3.5);
      expect(result[0]!.count).toBe(2);
      expect(result[1]!.month).toBe('2024-05');
      expect(result[1]!.count).toBe(1);
    });

    it('sorts by month ascending', () => {
      const reversed = [
        { date: new Date('2024-12-01'), emotion: 3.0 },
        { date: new Date('2024-01-01'), emotion: 3.0 },
      ];
      const result = calculateMonthlyStats(reversed);
      expect(result[0]!.month).toBe('2024-01');
      expect(result[1]!.month).toBe('2024-12');
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
});
