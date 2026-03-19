import { MonthlyStats } from "./Stats";

describe("MonthlyStats", () => {
  it("should create valid MonthlyStats", () => {
    // Arrange
    const monthlyStats: MonthlyStats = {
      month: "2024-01",
      count: 50,
      avgEmotion: 3.2,
    };

    // Assert
    expect(monthlyStats.month).toBe("2024-01");
    expect(monthlyStats.count).toBe(50);
    expect(monthlyStats.avgEmotion).toBe(3.2);
  });

  it("should handle different month formats", () => {
    // Arrange & Act
    const cases = [
      { month: "2024-12", count: 10, avgEmotion: 4.0 },
      { month: "2023-06", count: 25, avgEmotion: 2.8 },
      { month: "2025-03", count: 0, avgEmotion: 0.0 },
    ];

    // Assert
    cases.forEach((stats) => {
      expect(stats.month).toMatch(/^\d{4}-\d{2}$/);
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(stats.avgEmotion).toBeGreaterThanOrEqual(0);
    });
  });
});
