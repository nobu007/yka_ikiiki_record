import { DEFAULT_CONFIG, EMOTION_CONSTANTS } from "./DataGeneration";
import { EMOTION_RANGES, GENERATION_DEFAULTS } from "@/lib/constants";

describe("DEFAULT_CONFIG", () => {
  it("should have valid default values", () => {
    // Assert
    expect(DEFAULT_CONFIG.studentCount).toBe(25);
    expect(DEFAULT_CONFIG.periodDays).toBe(30);
    expect(DEFAULT_CONFIG.distributionPattern).toBe("normal");
    expect(DEFAULT_CONFIG.seasonalEffects).toBe(false);
    expect(DEFAULT_CONFIG.eventEffects).toEqual([]);
    expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBe(3.0);
    expect(DEFAULT_CONFIG.classCharacteristics.volatility).toBe(0.5);
    expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBe(0.7);
  });

  it("should be a valid DataGenerationConfig", () => {
    // Assert
    expect(DEFAULT_CONFIG).toHaveProperty("studentCount");
    expect(DEFAULT_CONFIG).toHaveProperty("periodDays");
    expect(DEFAULT_CONFIG).toHaveProperty("distributionPattern");
    expect(DEFAULT_CONFIG).toHaveProperty("seasonalEffects");
    expect(DEFAULT_CONFIG).toHaveProperty("eventEffects");
    expect(DEFAULT_CONFIG).toHaveProperty("classCharacteristics");
  });

  it("should have reasonable default values", () => {
    // Assert
    expect(DEFAULT_CONFIG.studentCount).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.periodDays).toBeGreaterThan(0);
    expect(
      DEFAULT_CONFIG.classCharacteristics.baselineEmotion,
    ).toBeGreaterThanOrEqual(1.0);
    expect(
      DEFAULT_CONFIG.classCharacteristics.baselineEmotion,
    ).toBeLessThanOrEqual(5.0);
    expect(
      DEFAULT_CONFIG.classCharacteristics.volatility,
    ).toBeGreaterThanOrEqual(0.0);
    expect(DEFAULT_CONFIG.classCharacteristics.volatility).toBeLessThanOrEqual(
      1.0,
    );
    expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBeGreaterThanOrEqual(
      0.0,
    );
    expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBeLessThanOrEqual(
      1.0,
    );
  });
});

describe("EMOTION_CONSTANTS", () => {
  it("should have valid emotion range constants", () => {
    // Assert
    expect(EMOTION_CONSTANTS.MIN_EMOTION).toBe(1.0);
    expect(EMOTION_CONSTANTS.MAX_EMOTION).toBe(5.0);
    expect(EMOTION_CONSTANTS.DEFAULT_STDDEV).toBe(0.5);
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBe(0.2);
    expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBe(0.5);
  });

  it("should validate emotion range logic", () => {
    // Assert
    expect(EMOTION_CONSTANTS.MIN_EMOTION).toBeLessThan(
      EMOTION_CONSTANTS.MAX_EMOTION,
    );
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeLessThan(
      EMOTION_CONSTANTS.MAX_EVENT_IMPACT,
    );
    expect(EMOTION_CONSTANTS.DEFAULT_STDDEV).toBeGreaterThan(0);
  });

  it("should ensure constants are within reasonable bounds", () => {
    // Assert
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeGreaterThan(0);
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeLessThan(1);
    expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBeGreaterThan(0);
    expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBeLessThan(1);
  });

  it("should be used consistently with DEFAULT_CONFIG", () => {
    // Assert
    expect(
      DEFAULT_CONFIG.classCharacteristics.baselineEmotion,
    ).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MIN_EMOTION);
    expect(
      DEFAULT_CONFIG.classCharacteristics.baselineEmotion,
    ).toBeLessThanOrEqual(EMOTION_CONSTANTS.MAX_EMOTION);
  });

  it("should align with centralized constants", () => {
    // Verify local constants match centralized ones
    expect(EMOTION_CONSTANTS.MIN_EMOTION).toBe(EMOTION_RANGES.MIN);
    expect(EMOTION_CONSTANTS.MAX_EMOTION).toBe(EMOTION_RANGES.MAX);
    expect(EMOTION_CONSTANTS.DEFAULT_STDDEV).toBe(EMOTION_RANGES.DEFAULT_STDDEV);
    expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBe(EMOTION_RANGES.SEASONAL_IMPACT);
    expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBe(EMOTION_RANGES.MAX_EVENT_IMPACT);

    // Verify DEFAULT_CONFIG aligns with GENERATION_DEFAULTS
    expect(DEFAULT_CONFIG.studentCount).toBe(GENERATION_DEFAULTS.STUDENT_COUNT);
    expect(DEFAULT_CONFIG.periodDays).toBe(GENERATION_DEFAULTS.PERIOD_DAYS);
    expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBe(
      GENERATION_DEFAULTS.BASELINE_EMOTION,
    );
    expect(DEFAULT_CONFIG.classCharacteristics.volatility).toBe(
      GENERATION_DEFAULTS.VOLATILITY,
    );
    expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBe(
      GENERATION_DEFAULTS.COHESION,
    );
  });
});
