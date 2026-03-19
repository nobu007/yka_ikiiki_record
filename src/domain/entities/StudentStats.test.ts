import { StudentStats } from "./Stats";

describe("StudentStats", () => {
  it("should create valid StudentStats", () => {
    // Arrange
    const studentStats: StudentStats = {
      student: "田中太郎",
      recordCount: 30,
      avgEmotion: 3.8,
      trendline: [3.0, 3.2, 3.5, 3.8, 4.0],
    };

    // Assert
    expect(studentStats.student).toBe("田中太郎");
    expect(studentStats.recordCount).toBe(30);
    expect(studentStats.avgEmotion).toBe(3.8);
    expect(studentStats.trendline).toEqual([3.0, 3.2, 3.5, 3.8, 4.0]);
  });

  it("should handle empty trendline", () => {
    // Arrange
    const studentStats: StudentStats = {
      student: "山田花子",
      recordCount: 0,
      avgEmotion: 0,
      trendline: [],
    };

    // Assert
    expect(studentStats.trendline).toEqual([]);
    expect(studentStats.recordCount).toBe(0);
  });

  it("should handle single point trendline", () => {
    // Arrange
    const studentStats: StudentStats = {
      student: "佐木次郎",
      recordCount: 1,
      avgEmotion: 3.5,
      trendline: [3.5],
    };

    // Assert
    expect(studentStats.trendline).toHaveLength(1);
    expect(studentStats.trendline[0]).toBe(3.5);
  });
});
