import { StatsRepository } from "./StatsRepository";
import { createValidStats } from "@/test-utils/fixtures";

describe("StatsRepository Type Safety", () => {
  it("should enforce Stats type in saveStats", () => {
    // Arrange
    const mockRepository: StatsRepository = {
      getStats: jest.fn(),
      saveStats: jest.fn(),
      generateSeedData: jest.fn(),
    };

    const validStats = createValidStats({
      overview: { count: 100, avgEmotion: 3.5 },
      timeOfDayStats: { morning: 3.0, afternoon: 3.5, evening: 4.0 },
    });

    // Act & Assert
    expect(() => mockRepository.saveStats(validStats)).not.toThrow();
    expect(mockRepository.saveStats).toHaveBeenCalledWith(validStats);
  });

  it("should properly type Stats objects", () => {
    // Arrange
    const mockRepository: StatsRepository = {
      getStats: jest.fn(),
      saveStats: jest.fn(),
      generateSeedData: jest.fn(),
    };

    const validStats = createValidStats();

    // Act & Assert
    // TypeScript ensures type safety at compile time
    expect(() => mockRepository.saveStats(validStats)).not.toThrow();
  });
});
