import { StatsRepository } from "./StatsRepository";
import { Stats } from "../entities/Stats";
import { createEmptyStats } from "@/test-utils/fixtures";

describe("StatsRepository Integration", () => {
  describe("Workflow Simulation", () => {
    it("should simulate complete repository workflow", async () => {
      // Arrange
      let savedStats: Stats | null = null;
      const integrationRepository: StatsRepository = {
        getStats: jest.fn().mockImplementation(async () => {
          return (
            savedStats || {
              overview: { count: 0, avgEmotion: 0 },
              monthlyStats: [],
              studentStats: [],
              dayOfWeekStats: [],
              emotionDistribution: [],
              timeOfDayStats: { morning: 0, afternoon: 0, evening: 0 },
            }
          );
        }),
        saveStats: jest.fn().mockImplementation(async (stats: Stats) => {
          savedStats = stats;
        }),
        generateSeedData: jest.fn().mockImplementation(async () => {
          savedStats = {
            overview: { count: 100, avgEmotion: 3.5 },
            monthlyStats: [{ month: "2024-01", count: 30, avgEmotion: 3.5 }],
            studentStats: [
              {
                student: "テスト生徒",
                recordCount: 10,
                avgEmotion: 3.5,
                trendline: [3.5],
              },
            ],
            dayOfWeekStats: [{ day: "月曜日", avgEmotion: 3.5, count: 10 }],
            emotionDistribution: [20, 20, 20, 20, 20],
            timeOfDayStats: { morning: 3.4, afternoon: 3.5, evening: 3.6 },
          };
        }),
      };

      // Act
      await integrationRepository.generateSeedData();
      const retrievedStats = await integrationRepository.getStats();
      await integrationRepository.saveStats({
        ...retrievedStats,
        overview: {
          count: retrievedStats.overview.count + 10,
          avgEmotion: 3.6,
        },
      });
      const finalStats = await integrationRepository.getStats();

      // Assert
      expect(integrationRepository.generateSeedData).toHaveBeenCalledTimes(1);
      expect(integrationRepository.getStats).toHaveBeenCalledTimes(2);
      expect(integrationRepository.saveStats).toHaveBeenCalledTimes(1);
      expect(finalStats.overview.count).toBe(110);
      expect(finalStats.overview.avgEmotion).toBe(3.6);
    });

    it("should handle concurrent operations", async () => {
      // Arrange
      const concurrentRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue({
          overview: { count: 50, avgEmotion: 3.0 },
          monthlyStats: [],
          studentStats: [],
          dayOfWeekStats: [],
          emotionDistribution: [],
          timeOfDayStats: { morning: 3.0, afternoon: 3.0, evening: 3.0 },
        }),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined),
      };

      // Act
      const emptyStats = createEmptyStats();

      const operations = [
        concurrentRepository.getStats(),
        concurrentRepository.saveStats(emptyStats),
        concurrentRepository.generateSeedData(),
      ];

      // Assert
      await expect(Promise.all(operations)).resolves.toBeDefined();
      expect(concurrentRepository.getStats).toHaveBeenCalledTimes(1);
      expect(concurrentRepository.saveStats).toHaveBeenCalledTimes(1);
      expect(concurrentRepository.generateSeedData).toHaveBeenCalledTimes(1);
    });
  });
});
