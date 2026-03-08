import { DayOfWeekStats } from './Stats';

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
