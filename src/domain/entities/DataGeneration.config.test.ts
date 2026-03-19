import {
  DataGenerationConfig,
  EmotionDistributionPattern,
  EventEffect,
} from "./DataGeneration";

describe("DataGenerationConfig", () => {
  it("should create valid DataGenerationConfig", () => {
    // Arrange
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-07");
    const eventEffect: EventEffect = {
      name: "新年イベント",
      startDate,
      endDate,
      impact: 0.2,
    };

    const config: DataGenerationConfig = {
      studentCount: 30,
      periodDays: 60,
      distributionPattern: "normal",
      seasonalEffects: true,
      eventEffects: [eventEffect],
      classCharacteristics: {
        baselineEmotion: 3.5,
        volatility: 0.4,
        cohesion: 0.7,
      },
    };

    // Assert
    expect(config.studentCount).toBe(30);
    expect(config.periodDays).toBe(60);
    expect(config.distributionPattern).toBe("normal");
    expect(config.seasonalEffects).toBe(true);
    expect(config.eventEffects).toHaveLength(1);
    expect(config.classCharacteristics.baselineEmotion).toBe(3.5);
  });

  it("should handle empty event effects", () => {
    // Arrange
    const config: DataGenerationConfig = {
      studentCount: 25,
      periodDays: 30,
      distributionPattern: "bimodal",
      seasonalEffects: false,
      eventEffects: [],
      classCharacteristics: {
        baselineEmotion: 3.0,
        volatility: 0.5,
        cohesion: 0.6,
      },
    };

    // Assert
    expect(config.eventEffects).toEqual([]);
    expect(config.seasonalEffects).toBe(false);
  });

  it("should handle all distribution patterns", () => {
    // Arrange
    const patterns: EmotionDistributionPattern[] = [
      "normal",
      "bimodal",
      "stress",
      "happy",
    ];

    // Act & Assert
    patterns.forEach((pattern) => {
      const config: DataGenerationConfig = {
        studentCount: 20,
        periodDays: 30,
        distributionPattern: pattern,
        seasonalEffects: false,
        eventEffects: [],
        classCharacteristics: {
          baselineEmotion: 3.0,
          volatility: 0.5,
          cohesion: 0.7,
        },
      };
      expect(config.distributionPattern).toBe(pattern);
    });
  });

  it("should validate student count and period constraints", () => {
    // Arrange
    const configs: DataGenerationConfig[] = [
      {
        studentCount: 10,
        periodDays: 7,
        distributionPattern: "normal",
        seasonalEffects: false,
        eventEffects: [],
        classCharacteristics: {
          baselineEmotion: 3.0,
          volatility: 0.5,
          cohesion: 0.7,
        },
      },
      {
        studentCount: 500,
        periodDays: 365,
        distributionPattern: "normal",
        seasonalEffects: false,
        eventEffects: [],
        classCharacteristics: {
          baselineEmotion: 3.0,
          volatility: 0.5,
          cohesion: 0.7,
        },
      },
    ];

    // Assert
    configs.forEach((config) => {
      expect(config.studentCount).toBeGreaterThanOrEqual(10);
      expect(config.studentCount).toBeLessThanOrEqual(500);
      expect(config.periodDays).toBeGreaterThanOrEqual(7);
      expect(config.periodDays).toBeLessThanOrEqual(365);
    });
  });
});
