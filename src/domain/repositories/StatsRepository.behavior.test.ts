import { StatsRepository } from "./StatsRepository";
import { Stats } from "../entities/Stats";
import { createEmptyStats } from "@/test-utils/fixtures";

type MockedStatsRepository = {
  [K in keyof StatsRepository]: jest.MockedFunction<StatsRepository[K]>;
};

describe("StatsRepository Method Behavior", () => {
  let mockRepository: MockedStatsRepository;
  let mockStats: Stats;

  beforeEach(() => {
    // Arrange
    mockStats = {
      overview: { count: 150, avgEmotion: 3.8 },
      monthlyStats: [
        { month: "2024-01", count: 50, avgEmotion: 3.5 },
        { month: "2024-02", count: 55, avgEmotion: 4.0 },
      ],
      studentStats: [
        {
          student: "田中太郎",
          recordCount: 25,
          avgEmotion: 3.7,
          trendline: [3.0, 3.5, 4.0],
        },
      ],
      dayOfWeekStats: [{ day: "月曜日", avgEmotion: 3.6, count: 30 }],
      emotionDistribution: [20, 30, 40, 25, 35],
      timeOfDayStats: { morning: 3.4, afternoon: 3.8, evening: 4.2 },
    };

    mockRepository = {
      getStats: jest
        .fn()
        .mockResolvedValue(mockStats) as unknown as jest.MockedFunction<
        StatsRepository["getStats"]
      >,
      saveStats: jest
        .fn()
        .mockResolvedValue(undefined) as unknown as jest.MockedFunction<
        StatsRepository["saveStats"]
      >,
      generateSeedData: jest
        .fn()
        .mockResolvedValue(undefined) as unknown as jest.MockedFunction<
        StatsRepository["generateSeedData"]
      >,
    };
  });

  describe("getStats", () => {
    it("should return Stats object", async () => {
      // Act
      const result = await mockRepository.getStats();

      // Assert
      expect(result).toBe(mockStats);
      expect(mockRepository.getStats).toHaveBeenCalledTimes(1);
      expect(result.overview.count).toBe(150);
      expect(result.overview.avgEmotion).toBe(3.8);
    });

    it("should handle empty stats", async () => {
      // Arrange
      const emptyStats = createEmptyStats();
      mockRepository.getStats.mockResolvedValue(emptyStats);

      // Act
      const result = await mockRepository.getStats();

      // Assert
      expect(result.overview.count).toBe(0);
      expect(result.monthlyStats).toEqual([]);
      expect(result.studentStats).toEqual([]);
    });

    it("should handle repository errors", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockRepository.getStats.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(mockRepository.getStats()).rejects.toThrow(errorMessage);
    });
  });

  describe("saveStats", () => {
    it("should save stats successfully", async () => {
      // Act
      await mockRepository.saveStats(mockStats);

      // Assert
      expect(mockRepository.saveStats).toHaveBeenCalledTimes(1);
      expect(mockRepository.saveStats).toHaveBeenCalledWith(mockStats);
    });

    it("should handle different stats configurations", async () => {
      // Arrange
      const differentStats: Stats = {
        overview: { count: 200, avgEmotion: 4.2 },
        monthlyStats: [
          { month: "2024-03", count: 70, avgEmotion: 4.1 },
          { month: "2024-04", count: 75, avgEmotion: 4.3 },
        ],
        studentStats: [
          {
            student: "山田花子",
            recordCount: 30,
            avgEmotion: 4.0,
            trendline: [3.8, 4.0, 4.2],
          },
        ],
        dayOfWeekStats: [{ day: "金曜日", avgEmotion: 4.5, count: 40 }],
        emotionDistribution: [15, 25, 35, 20, 30],
        timeOfDayStats: { morning: 3.9, afternoon: 4.3, evening: 4.6 },
      };

      // Act
      await mockRepository.saveStats(differentStats);

      // Assert
      expect(mockRepository.saveStats).toHaveBeenCalledWith(differentStats);
    });

    it("should handle save errors", async () => {
      // Arrange
      const errorMessage = "Save operation failed";
      mockRepository.saveStats.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(mockRepository.saveStats(mockStats)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe("generateSeedData", () => {
    it("should generate seed data successfully", async () => {
      // Act
      await mockRepository.generateSeedData();

      // Assert
      expect(mockRepository.generateSeedData).toHaveBeenCalledTimes(1);
    });

    it("should handle seed generation errors", async () => {
      // Arrange
      const errorMessage = "Seed generation failed";
      mockRepository.generateSeedData.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(mockRepository.generateSeedData()).rejects.toThrow(
        errorMessage,
      );
    });

    it("should not return any value", async () => {
      // Act
      const result = await mockRepository.generateSeedData();

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
