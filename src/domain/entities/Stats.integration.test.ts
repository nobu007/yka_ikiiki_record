import { Stats } from "./Stats";

describe("Stats", () => {
  it("should create complete Stats object", () => {
    // Arrange
    const stats: Stats = {
      overview: { count: 100, avgEmotion: 3.5 },
      monthlyStats: [
        { month: "2024-01", count: 30, avgEmotion: 3.2 },
        { month: "2024-02", count: 35, avgEmotion: 3.8 },
      ],
      studentStats: [
        {
          student: "田中太郎",
          recordCount: 20,
          avgEmotion: 3.5,
          trendline: [3.0, 3.5, 4.0],
        },
      ],
      dayOfWeekStats: [{ day: "月曜日", avgEmotion: 3.1, count: 15 }],
      emotionDistribution: [10, 20, 30, 25, 15],
      timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.8 },
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

  it("should handle empty arrays", () => {
    // Arrange
    const stats: Stats = {
      overview: { count: 0, avgEmotion: 0 },
      monthlyStats: [],
      studentStats: [],
      dayOfWeekStats: [],
      emotionDistribution: [],
      timeOfDayStats: { morning: 0, afternoon: 0, evening: 0 },
    };

    // Assert
    expect(stats.monthlyStats).toEqual([]);
    expect(stats.studentStats).toEqual([]);
    expect(stats.dayOfWeekStats).toEqual([]);
    expect(stats.emotionDistribution).toEqual([]);
  });

  it("should validate emotion distribution sum", () => {
    // Arrange
    const stats: Stats = {
      overview: { count: 100, avgEmotion: 3.5 },
      monthlyStats: [],
      studentStats: [],
      dayOfWeekStats: [],
      emotionDistribution: [20, 20, 20, 20, 20],
      timeOfDayStats: { morning: 3.5, afternoon: 3.5, evening: 3.5 },
    };

    // Act
    const sum = stats.emotionDistribution.reduce((acc, val) => acc + val, 0);

    // Assert
    expect(sum).toBe(100);
  });

  it("should handle complex nested data", () => {
    // Arrange
    const stats: Stats = {
      overview: { count: 1000, avgEmotion: 3.7 },
      monthlyStats: Array.from({ length: 12 }, (_, i) => ({
        month: `2024-${String(i + 1).padStart(2, "0")}`,
        count: 80 + i,
        avgEmotion: 3.0 + i * 0.1,
      })),
      studentStats: Array.from({ length: 25 }, (_, i) => ({
        student: `生徒${i + 1}`,
        recordCount: 20 + i,
        avgEmotion: 2.5 + i * 0.05,
        trendline: Array.from({ length: 7 }, (_, j) => 3.0 + j * 0.1),
      })),
      dayOfWeekStats: [
        { day: "月曜日", avgEmotion: 3.2, count: 100 },
        { day: "火曜日", avgEmotion: 3.4, count: 120 },
        { day: "水曜日", avgEmotion: 3.6, count: 110 },
        { day: "木曜日", avgEmotion: 3.3, count: 105 },
        { day: "金曜日", avgEmotion: 3.8, count: 130 },
        { day: "土曜日", avgEmotion: 4.0, count: 80 },
        { day: "日曜日", avgEmotion: 3.9, count: 85 },
      ],
      emotionDistribution: [50, 100, 150, 120, 80],
      timeOfDayStats: { morning: 3.3, afternoon: 3.7, evening: 4.1 },
    };

    // Assert
    expect(stats.monthlyStats).toHaveLength(12);
    expect(stats.studentStats).toHaveLength(25);
    expect(stats.dayOfWeekStats).toHaveLength(7);
    expect(stats.studentStats[0]?.trendline).toHaveLength(7);
    expect(stats.overview.count).toBe(1000);
  });
});
