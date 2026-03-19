import { TimeOfDayStats } from "./Stats";

describe("TimeOfDayStats", () => {
  it("should create valid TimeOfDayStats", () => {
    // Arrange
    const timeStats: TimeOfDayStats = {
      morning: 3.2,
      afternoon: 3.5,
      evening: 3.8,
    };

    // Assert
    expect(timeStats.morning).toBe(3.2);
    expect(timeStats.afternoon).toBe(3.5);
    expect(timeStats.evening).toBe(3.8);
  });

  it("should handle edge cases", () => {
    // Arrange
    const edgeCases: TimeOfDayStats[] = [
      { morning: 1.0, afternoon: 1.0, evening: 1.0 },
      { morning: 5.0, afternoon: 5.0, evening: 5.0 },
      { morning: 0, afternoon: 0, evening: 0 },
    ];

    // Assert
    edgeCases.forEach((stats) => {
      expect(stats.morning).toBeGreaterThanOrEqual(0);
      expect(stats.afternoon).toBeGreaterThanOrEqual(0);
      expect(stats.evening).toBeGreaterThanOrEqual(0);
    });
  });
});
