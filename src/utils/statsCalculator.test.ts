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
      expect(result[0]?.month).toBe('2025-05');
      expect(result[0]?.avgEmotion).toBe(3.5);
      expect(result[0]?.count).toBe(4);
    });

    test('空の配列を処理する', () => {
      const result = calculateMonthlyStats([]);
      expect(result).toEqual([]);
    });

    test('複数月のデータをグループ化する', () => {
      const multiMonthData = [
        ...testEmotions,
        { date: new Date('2025-06-01T10:00:00.000Z'), emotion: 3, student: 0, hour: 10 }
      ];
      const result = calculateMonthlyStats(multiMonthData);
      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('2025-05');
      expect(result[1].month).toBe('2025-06');
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

    test('空の配列を処理する', () => {
      const result = calculateDayOfWeekStats([]);
      expect(result).toHaveLength(7);
      result.forEach(day => {
        expect(day.avgEmotion).toBe(0);
        expect(day.count).toBe(0);
      });
    });
  });

  describe('calculateTimeOfDayStats', () => {
    test('時間帯別統計を正しく計算する', () => {
      const result = calculateTimeOfDayStats(testEmotions);
      expect(result.morning).toBe(2.5); // 3 + 2 / 2
      expect(result.afternoon).toBe(4); // 4
      expect(result.evening).toBe(5); // 5
    });

    test('空の配列を処理する', () => {
      const result = calculateTimeOfDayStats([]);
      expect(result.morning).toBe(0);
      expect(result.afternoon).toBe(0);
      expect(result.evening).toBe(0);
    });
  });

  describe('calculateEmotionDistribution', () => {
    test('感情分布を正しく計算する', () => {
      const result = calculateEmotionDistribution(testEmotions);
      expect(result).toEqual([0, 1, 1, 1, 1]); // 2, 3, 4, 5が各1回
    });

    test('境界値の感情を正しく分類する', () => {
      const boundaryEmotions = [
        { date: testDate, emotion: 0.5 },
        { date: testDate, emotion: 1.0 },
        { date: testDate, emotion: 1.4 },
        { date: testDate, emotion: 5.0 },
        { date: testDate, emotion: 5.9 }
      ];
      const result = calculateEmotionDistribution(boundaryEmotions);
      expect(result[0]).toBe(3); // 0.5, 1.0, 1.4 → index 0
      expect(result[4]).toBe(2); // 5.0, 5.9 → index 4
    });

    test('空の配列を処理する', () => {
      const result = calculateEmotionDistribution([]);
      expect(result).toEqual([0, 0, 0, 0, 0]);
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

    test('空の配列を処理する', () => {
      const result = calculateStudentStats([]);
      expect(result).toEqual([]);
    });

    test('学生IDがundefinedの場合はデフォルト値を使用する', () => {
      const noStudentData = [
        { date: testDate, emotion: 3 },
        { date: testDate, emotion: 4 }
      ];
      const result = calculateStudentStats(noStudentData);
      expect(result).toHaveLength(1);
      expect(result[0].student).toBe('学生1'); // student 0 becomes 学生1
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

    test('すべての月で季節効果を計算する', () => {
      for (let month = 0; month < 12; month++) {
        const date = new Date(2025, month, 15);
        const effect = calculateSeasonalEffect(date);
        expect(typeof effect).toBe('number');
        expect(isNaN(effect)).toBe(false);
      }
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

    test('零期間イベントは除算ゼロを防ぐ', () => {
      const date = new Date('2025-05-23');
      const events = [
        {
          startDate: new Date('2025-05-23'),
          endDate: new Date('2025-05-23'),
          impact: 0.5
        }
      ];
      const effect = calculateEventEffect(date, events);
      expect(effect).toBe(0);
    });

    test('複数イベントの効果を累積する', () => {
      const date = new Date('2025-05-23');
      const events = [
        {
          startDate: new Date('2025-05-20'),
          endDate: new Date('2025-05-25'),
          impact: 0.3
        },
        {
          startDate: new Date('2025-05-22'),
          endDate: new Date('2025-05-24'),
          impact: 0.2
        }
      ];
      const effect = calculateEventEffect(date, events);
      expect(effect).toBeGreaterThan(0);
    });

    test('空のイベント配列を処理する', () => {
      const date = new Date('2025-05-23');
      const effect = calculateEventEffect(date, []);
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