import { calculateStats, StatsError } from './statsCalculator';

describe('statsCalculator', () => {
  const validRecord = {
    emotion: 3,
    date: '2025-05-23T10:00:00.000Z',
    student: '学生1',
    comment: 'テストコメント'
  };

  describe('バリデーション', () => {
    test('無効なレコードの場合はエラーを投げる', () => {
      expect(() => calculateStats([])).toThrow(StatsError);
      expect(() => calculateStats([])).toThrow('No valid records found');
    });

    test('感情スコアは1-5の範囲内である必要がある', () => {
      const records = [
        { ...validRecord, emotion: 0 },
        { ...validRecord, emotion: 6 }
      ];
      const result = calculateStats([validRecord, ...records]);
      expect(result.overview.count).toBe(1); // 無効なレコードは除外される
    });

    test('日付は有効な日時形式である必要がある', () => {
      const records = [
        { ...validRecord, date: 'invalid-date' }
      ];
      const result = calculateStats([validRecord, ...records]);
      expect(result.overview.count).toBe(1);
    });
  });

  describe('統計計算', () => {
    test('月別統計の計算', () => {
      const records = [
        { ...validRecord, date: '2025-05-23T10:00:00.000Z', emotion: 3 },
        { ...validRecord, date: '2025-05-24T10:00:00.000Z', emotion: 4 }
      ];
      const result = calculateStats(records);
      const monthStat = result.monthlyStats.find(s => s.month === '2025-05');
      expect(monthStat).toBeDefined();
      expect(monthStat?.avgEmotion).toBe('3.50');
      expect(monthStat?.count).toBe(2);
    });

    test('学生別統計の計算', () => {
      const records = [
        { ...validRecord, student: '学生1', emotion: 3 },
        { ...validRecord, student: '学生1', emotion: 4 },
        { ...validRecord, student: '学生2', emotion: 5 }
      ];
      const result = calculateStats(records);
      const student1Stats = result.studentStats.find(s => s.student === '学生1');
      expect(student1Stats?.avgEmotion).toBe('3.50');
      expect(student1Stats?.recordCount).toBe(2);
    });

    test('曜日別統計の計算', () => {
      const records = [
        { ...validRecord, date: '2025-05-23T10:00:00.000Z', emotion: 3 }, // 金曜日
        { ...validRecord, date: '2025-05-23T15:00:00.000Z', emotion: 4 }  // 同じ金曜日
      ];
      const result = calculateStats(records);
      const fridayStats = result.dayOfWeekStats[5]; // 金曜日は5番目
      expect(fridayStats.avgEmotion).toBe('3.50');
      expect(fridayStats.count).toBe(2);
    });

    test('時間帯別統計の計算', () => {
      const records = [
        { ...validRecord, date: '2025-05-23T10:00:00.000Z', emotion: 3 }, // 朝
        { ...validRecord, date: '2025-05-23T14:00:00.000Z', emotion: 4 }, // 午後
        { ...validRecord, date: '2025-05-23T20:00:00.000Z', emotion: 5 }  // 夜
      ];
      const result = calculateStats(records);
      expect(result.timeOfDayStats.morning).toBe('3.00');
      expect(result.timeOfDayStats.afternoon).toBe('4.00');
      expect(result.timeOfDayStats.evening).toBe('5.00');
    });

    test('感情スコア分布の計算', () => {
      const records = [
        { ...validRecord, emotion: 1 },
        { ...validRecord, emotion: 2 },
        { ...validRecord, emotion: 3 },
        { ...validRecord, emotion: 3 },
        { ...validRecord, emotion: 4 }
      ];
      const result = calculateStats(records);
      expect(result.emotionDistribution).toEqual([1, 1, 2, 1, 0]);
    });
  });
});