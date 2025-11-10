import {
  calculateAverage,
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  clamp,
  clampEmotion,
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  getRandomHour,
  calculateEmotionTrend
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

  describe('clamp', () => {
    test('値を範囲内に制限する', () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('clampEmotion', () => {
    test('感情値を1-5の範囲に制限する', () => {
      expect(clampEmotion(0)).toBe(1);
      expect(clampEmotion(3)).toBe(3);
      expect(clampEmotion(6)).toBe(5);
    });
  });

  describe('generateBaseEmotion', () => {
    test('各パターンで感情値を生成する', () => {
      const normal = generateBaseEmotion('normal');
      const bimodal = generateBaseEmotion('bimodal');
      const stress = generateBaseEmotion('stress');
      const happy = generateBaseEmotion('happy');

      expect(normal).toBeGreaterThanOrEqual(1);
      expect(normal).toBeLessThanOrEqual(5);
      expect(bimodal).toBeGreaterThanOrEqual(1);
      expect(bimodal).toBeLessThanOrEqual(5);
      expect(stress).toBeGreaterThanOrEqual(1);
      expect(stress).toBeLessThanOrEqual(5);
      expect(happy).toBeGreaterThanOrEqual(1);
      expect(happy).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateSeasonalEffect', () => {
    test('季節効果を計算する', () => {
      const date = new Date('2025-05-23');
      const effect = calculateSeasonalEffect(date);
      expect(typeof effect).toBe('number');
    });
  });

  describe('calculateEventEffect', () => {
    test('イベント効果を計算する', () => {
      const date = new Date('2025-05-23');
      const events = [
        {
          startDate: new Date('2025-05-20'),
          endDate: new Date('2025-05-25'),
          impact: 0.5
        }
      ];
      const effect = calculateEventEffect(date, events);
      expect(typeof effect).toBe('number');
      expect(effect).toBeGreaterThan(0);
    });

    test('期間外のイベントは影響しない', () => {
      const date = new Date('2025-05-23');
      const events = [
        {
          startDate: new Date('2025-05-20'),
          endDate: new Date('2025-05-22'),
          impact: 0.5
        }
      ];
      const effect = calculateEventEffect(date, events);
      expect(effect).toBe(0);
    });
  });

  describe('getRandomHour', () => {
    test('有効な時間帯を生成する', () => {
      const hour = getRandomHour();
      expect(hour).toBeGreaterThanOrEqual(5);
      expect(hour).toBeLessThan(24);
    });
  });

  describe('calculateEmotionTrend', () => {
    test('感情トレンドを計算する', () => {
      expect(calculateEmotionTrend([])).toBe('stable');
      expect(calculateEmotionTrend([3])).toBe('stable');
      expect(calculateEmotionTrend([3, 4, 5])).toBe('stable'); // Not enough data for trend
      expect(calculateEmotionTrend([5, 4, 3])).toBe('stable'); // Not enough data for trend
      expect(calculateEmotionTrend([3, 3, 3])).toBe('stable');
      // Test with enough data for trend calculation
      expect(calculateEmotionTrend([2, 2, 2, 3, 4, 5])).toBe('up');
      expect(calculateEmotionTrend([5, 5, 5, 4, 3, 2])).toBe('down');
      expect(calculateEmotionTrend([3, 3, 3, 3, 3, 3])).toBe('stable');
    });
  });
});