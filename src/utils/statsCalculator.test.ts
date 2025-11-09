import {
  calculateAverage,
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats
} from './statsCalculator';

describe('statsCalculator', () => {
  const testDate = new Date('2025-05-23T10:00:00.000Z');
  const testEmotions = [
    { date: testDate, emotion: 3, student: 0, hour: 10 },
    { date: new Date('2025-05-23T15:00:00.000Z'), emotion: 4, student: 0, hour: 15 },
    { date: new Date('2025-05-24T10:00:00.000Z'), emotion: 2, student: 1, hour: 10 },
    { date: new Date('2025-05-24T20:00:00.000Z'), emotion: 5, student: 1, hour: 20 }
  ];

  describe('calculateAverage', () => {
    test('空の配列の場合は0を返す', () => {
      expect(calculateAverage([])).toBe(0);
    });

    test('平均値を正しく計算する', () => {
      expect(calculateAverage([3, 4, 2, 5])).toBe(3.5);
    });

    test('小数点以下1桁に丸める', () => {
      expect(calculateAverage([1, 2])).toBe(1.5);
    });
  });

  describe('calculateMonthlyStats', () => {
    test('月別統計を正しく計算する', () => {
      const result = calculateMonthlyStats(testEmotions);
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('2025-05');
      expect(result[0].avgEmotion).toBe(3.5);
      expect(result[0].count).toBe(4);
    });
  });

  describe('calculateDayOfWeekStats', () => {
    test('曜日別統計を正しく計算する', () => {
      const result = calculateDayOfWeekStats(testEmotions);
      expect(result).toHaveLength(7);
      
      // 2025-05-23T10:00:00.000Zは金曜日 (emotion: 3)
      // 2025-05-23T15:00:00.000Zは土曜日 (emotion: 4) 
      // 2025-05-24T10:00:00.000Zは土曜日 (emotion: 2)
      // 2025-05-24T20:00:00.000Zは日曜日 (emotion: 5)
      const friday = result.find(s => s.day === '金');
      const saturday = result.find(s => s.day === '土');
      const sunday = result.find(s => s.day === '日');
      
      expect(friday?.avgEmotion).toBe(3); // Only emotion: 3
      expect(friday?.count).toBe(1);
      expect(saturday?.avgEmotion).toBe(3); // (4 + 2) / 2 = 3
      expect(saturday?.count).toBe(2);
      expect(sunday?.avgEmotion).toBe(5); // Only emotion: 5
      expect(sunday?.count).toBe(1);
    });
  });

  describe('calculateTimeOfDayStats', () => {
    test('時間帯別統計を正しく計算する', () => {
      const result = calculateTimeOfDayStats(testEmotions);
      expect(result.morning).toBe(2.5); // 3 + 2 / 2
      expect(result.afternoon).toBe(4); // 4
      expect(result.evening).toBe(5); // 5
    });
  });

  describe('calculateEmotionDistribution', () => {
    test('感情分布を正しく計算する', () => {
      const result = calculateEmotionDistribution(testEmotions);
      expect(result).toEqual([0, 1, 1, 1, 1]); // 2, 3, 4, 5が各1回
    });
  });

  describe('calculateStudentStats', () => {
    test('学生別統計を正しく計算する', () => {
      const result = calculateStudentStats(testEmotions);
      expect(result).toHaveLength(2);
      
      const student0 = result.find(s => s.student === '学生1');
      const student1 = result.find(s => s.student === '学生2');
      
      expect(student0?.avgEmotion).toBe(3.5);
      expect(student0?.recordCount).toBe(2);
      expect(student1?.avgEmotion).toBe(3.5);
      expect(student1?.recordCount).toBe(2);
    });
  });
});