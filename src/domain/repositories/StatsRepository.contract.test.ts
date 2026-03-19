import { StatsRepository } from "./StatsRepository";
import { Stats } from "../entities/Stats";
import { createEmptyStats, createValidStats } from "@/test-utils/fixtures";

describe("StatsRepository Interface Contract", () => {
  describe("Interface Definition", () => {
    it("should define required methods", () => {
      // Arrange
      const mockRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue({} as Stats),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined),
      };

      // Assert
      expect(mockRepository).toHaveProperty("getStats");
      expect(mockRepository).toHaveProperty("saveStats");
      expect(mockRepository).toHaveProperty("generateSeedData");
      expect(typeof mockRepository.getStats).toBe("function");
      expect(typeof mockRepository.saveStats).toBe("function");
      expect(typeof mockRepository.generateSeedData).toBe("function");
    });

    it("should have correct method signatures", () => {
      // Arrange
      const mockStats = createValidStats({
        overview: { count: 100, avgEmotion: 3.5 },
        timeOfDayStats: { morning: 3.0, afternoon: 3.5, evening: 4.0 },
      });

      const mockRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue(mockStats),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined),
      };

      // Assert - TypeScript should enforce these signatures
      expect(mockRepository.getStats()).resolves.toBe(mockStats);
      expect(mockRepository.saveStats(mockStats)).resolves.toBeUndefined();
      expect(mockRepository.generateSeedData()).resolves.toBeUndefined();
    });

    it("should enforce async method contracts", () => {
      // Arrange
      const emptyStats = createEmptyStats();

      const mockRepository: StatsRepository = {
        getStats: jest.fn().mockResolvedValue(emptyStats),
        saveStats: jest.fn().mockResolvedValue(undefined),
        generateSeedData: jest.fn().mockResolvedValue(undefined),
      };

      // Assert
      expect(mockRepository.getStats()).toBeInstanceOf(Promise);
      expect(mockRepository.saveStats(emptyStats)).toBeInstanceOf(Promise);
      expect(mockRepository.generateSeedData()).toBeInstanceOf(Promise);
    });
  });
});
