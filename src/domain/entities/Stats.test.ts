import { 
  Stats, 
  StatsOverview, 
  MonthlyStats, 
  StudentStats, 
  DayOfWeekStats, 
  TimeOfDayStats 
} from './Stats';

describe('Stats Domain Entities', () => {
  describe('StatsOverview', () => {
    it('should create valid StatsOverview', () => {
      // Arrange
      const overview: StatsOverview = {
        count: 100,
        avgEmotion: 3.5
      };

      // Assert
      expect(overview.count).toBe(100);
      expect(overview.avgEmotion).toBe(3.5);
    });

    it('should handle zero count', () => {
      // Arrange
      const overview: StatsOverview = {
        count: 0,
        avgEmotion: 0
      };

      // Assert
      expect(overview.count).toBe(0);
      expect(overview.avgEmotion).toBe(0);
    });

    it('should handle maximum values', () => {
      // Arrange
      const overview: StatsOverview = {
        count: Number.MAX_SAFE_INTEGER,
        avgEmotion: 5.0
      };

      // Assert
      expect(overview.count).toBe(Number.MAX_SAFE_INTEGER);
      expect(overview.avgEmotion).toBe(5.0);
    });
  });

  describe('MonthlyStats', () => {
    it('should create valid MonthlyStats', () => {
      // Arrange
      const monthlyStats: MonthlyStats = {
        month: '2024-01',
        count: 50,
        avgEmotion: 3.2
      };

      // Assert
      expect(monthlyStats.month).toBe('2024-01');
      expect(monthlyStats.count).toBe(50);
      expect(monthlyStats.avgEmotion).toBe(3.2);
    });

    it('should handle different month formats', () => {
      // Arrange & Act
      const cases = [
        { month: '2024-12', count: 10, avgEmotion: 4.0 },
        { month: '2023-06', count: 25, avgEmotion: 2.8 },
        { month: '2025-03', count: 0, avgEmotion: 0.0 }
      ];

      // Assert
      cases.forEach(stats => {
        expect(stats.month).toMatch(/^\d{4}-\d{2}$/);
        expect(stats.count).toBeGreaterThanOrEqual(0);
        expect(stats.avgEmotion).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('StudentStats', () => {
    it('should create valid StudentStats', () => {
      // Arrange
      const studentStats: StudentStats = {
        student: '田中太郎',
        recordCount: 30,
        avgEmotion: 3.8,
        trendline: [3.0, 3.2, 3.5, 3.8, 4.0]
      };

      // Assert
      expect(studentStats.student).toBe('田中太郎');
      expect(studentStats.recordCount).toBe(30);
      expect(studentStats.avgEmotion).toBe(3.8);
      expect(studentStats.trendline).toEqual([3.0, 3.2, 3.5, 3.8, 4.0]);
    });

    it('should handle empty trendline', () => {
      // Arrange
      const studentStats: StudentStats = {
        student: '山田花子',
        recordCount: 0,
        avgEmotion: 0,
        trendline: []
      };

      // Assert
      expect(studentStats.trendline).toEqual([]);
      expect(studentStats.recordCount).toBe(0);
    });

    it('should handle single point trendline', () => {
      // Arrange
      const studentStats: StudentStats = {
        student: '佐木次郎',
        recordCount: 1,
        avgEmotion: 3.5,
        trendline: [3.5]
      };

      // Assert
      expect(studentStats.trendline).toHaveLength(1);
      expect(studentStats.trendline[0]).toBe(3.5);
    });
  });

  describe('DayOfWeekStats', () => {
    it('should create valid DayOfWeekStats', () => {
      // Arrange
      const dayStats: DayOfWeekStats = {
        day: '月曜日',
        avgEmotion: 3.1,
        count: 20
      };

      // Assert
      expect(dayStats.day).toBe('月曜日');
      expect(dayStats.avgEmotion).toBe(3.1);
      expect(dayStats.count).toBe(20);
    });

    it('should handle all days of week', () => {
      // Arrange
      const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

      // Act & Assert
      days.forEach(day => {
        const dayStats: DayOfWeekStats = {
          day,
          avgEmotion: 3.0,
          count: 10
        };
        expect(dayStats.day).toBe(day);
        expect(dayStats.avgEmotion).toBe(3.0);
        expect(dayStats.count).toBe(10);
      });
    });
  });

  describe('TimeOfDayStats', () => {
    it('should create valid TimeOfDayStats', () => {
      // Arrange
      const timeStats: TimeOfDayStats = {
        morning: 3.2,
        afternoon: 3.5,
        evening: 3.8
      };

      // Assert
      expect(timeStats.morning).toBe(3.2);
      expect(timeStats.afternoon).toBe(3.5);
      expect(timeStats.evening).toBe(3.8);
    });

    it('should handle edge cases', () => {
      // Arrange
      const edgeCases: TimeOfDayStats[] = [
        { morning: 1.0, afternoon: 1.0, evening: 1.0 },
        { morning: 5.0, afternoon: 5.0, evening: 5.0 },
        { morning: 0, afternoon: 0, evening: 0 }
      ];

      // Assert
      edgeCases.forEach(stats => {
        expect(stats.morning).toBeGreaterThanOrEqual(0);
        expect(stats.afternoon).toBeGreaterThanOrEqual(0);
        expect(stats.evening).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Stats', () => {
    it('should create complete Stats object', () => {
      // Arrange
      const stats: Stats = {
        overview: { count: 100, avgEmotion: 3.5 },
        monthlyStats: [
          { month: '2024-01', count: 30, avgEmotion: 3.2 },
          { month: '2024-02', count: 35, avgEmotion: 3.8 }
        ],
        studentStats: [
          { student: '田中太郎', recordCount: 20, avgEmotion: 3.5, trendline: [3.0, 3.5, 4.0] }
        ],
        dayOfWeekStats: [
          { day: '月曜日', avgEmotion: 3.1, count: 15 }
        ],
        emotionDistribution: [10, 20, 30, 25, 15],
        timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.8 }
      };

      // Assert
      expect(stats.overview.count).toBe(100);
      expect(stats.overview.avgEmotion).toBe(3.5);
      expect(stats.monthlyStats).toHaveLength(2);
      expect(stats.studentStats).toHaveLength(1);
      expect(stats.dayOfWeekStats).toHaveLength(1);
      expect(stats.emotionDistribution).toHaveLength(5);
      expect(stats.timeOfDayStats.morning).toBe(3.2);
    });

    it('should handle empty arrays', () => {
      // Arrange
      const stats: Stats = {
        overview: { count: 0, avgEmotion: 0 },
        monthlyStats: [],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: { morning: 0, afternoon: 0, evening: 0 }
      };

      // Assert
      expect(stats.monthlyStats).toEqual([]);
      expect(stats.studentStats).toEqual([]);
      expect(stats.dayOfWeekStats).toEqual([]);
      expect(stats.emotionDistribution).toEqual([]);
    });

    it('should validate emotion distribution sum', () => {
      // Arrange
      const stats: Stats = {
        overview: { count: 100, avgEmotion: 3.5 },
        monthlyStats: [],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [20, 20, 20, 20, 20],
        timeOfDayStats: { morning: 3.5, afternoon: 3.5, evening: 3.5 }
      };

      // Act
      const sum = stats.emotionDistribution.reduce((acc, val) => acc + val, 0);

      // Assert
      expect(sum).toBe(100);
    });

    it('should handle complex nested data', () => {
      // Arrange
      const stats: Stats = {
        overview: { count: 1000, avgEmotion: 3.7 },
        monthlyStats: Array.from({ length: 12 }, (_, i) => ({
          month: `2024-${String(i + 1).padStart(2, '0')}`,
          count: 80 + i,
          avgEmotion: 3.0 + (i * 0.1)
        })),
        studentStats: Array.from({ length: 25 }, (_, i) => ({
          student: `生徒${i + 1}`,
          recordCount: 20 + i,
          avgEmotion: 2.5 + (i * 0.05),
          trendline: Array.from({ length: 7 }, (_, j) => 3.0 + (j * 0.1))
        })),
        dayOfWeekStats: [
          { day: '月曜日', avgEmotion: 3.2, count: 100 },
          { day: '火曜日', avgEmotion: 3.4, count: 120 },
          { day: '水曜日', avgEmotion: 3.6, count: 110 },
          { day: '木曜日', avgEmotion: 3.3, count: 105 },
          { day: '金曜日', avgEmotion: 3.8, count: 130 },
          { day: '土曜日', avgEmotion: 4.0, count: 80 },
          { day: '日曜日', avgEmotion: 3.9, count: 85 }
        ],
        emotionDistribution: [50, 100, 150, 120, 80],
        timeOfDayStats: { morning: 3.3, afternoon: 3.7, evening: 4.1 }
      };

      // Assert
      expect(stats.monthlyStats).toHaveLength(12);
      expect(stats.studentStats).toHaveLength(25);
      expect(stats.dayOfWeekStats).toHaveLength(7);
      expect(stats.studentStats[0]?.trendline).toHaveLength(7);
      expect(stats.overview.count).toBe(1000);
    });
  });
});
