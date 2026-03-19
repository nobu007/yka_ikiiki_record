import { APP_CONFIG, EMOTION_CONFIG, UI_CONFIG } from "./index";

describe("APP_CONFIG", () => {
  it("has correct app name and description", () => {
    expect(APP_CONFIG.name).toBe("イキイキレコード デモ");
    expect(APP_CONFIG.description).toContain("生徒の学習データ");
  });

  it("has api configuration with baseUrl and endpoints", () => {
    expect(APP_CONFIG.api.baseUrl).toBeDefined();
    expect(APP_CONFIG.api.endpoints.seed).toBe("/seed");
  });

  it("has generation defaults", () => {
    expect(APP_CONFIG.generation.defaultPeriodDays).toBe(30);
    expect(APP_CONFIG.generation.defaultStudentCount).toBe(20);
    expect(APP_CONFIG.generation.defaultPattern).toBe("normal");
  });
});

describe("EMOTION_CONFIG", () => {
  it("has valid min/max range", () => {
    expect(EMOTION_CONFIG.min).toBe(1);
    expect(EMOTION_CONFIG.max).toBe(5);
    expect(EMOTION_CONFIG.min).toBeLessThan(EMOTION_CONFIG.max);
  });

  it("has defaultStddev as positive number", () => {
    expect(EMOTION_CONFIG.defaultStddev).toBeGreaterThan(0);
  });

  it("has seasonalImpact and maxEventImpact within [0,1]", () => {
    expect(EMOTION_CONFIG.seasonalImpact).toBeGreaterThanOrEqual(0);
    expect(EMOTION_CONFIG.seasonalImpact).toBeLessThanOrEqual(1);
    expect(EMOTION_CONFIG.maxEventImpact).toBeGreaterThanOrEqual(0);
    expect(EMOTION_CONFIG.maxEventImpact).toBeLessThanOrEqual(1);
  });

  it("has 12 seasonal factors (one per month)", () => {
    expect(EMOTION_CONFIG.seasonalFactors).toHaveLength(12);
    EMOTION_CONFIG.seasonalFactors.forEach((f) => {
      expect(typeof f).toBe("number");
    });
  });

  it("has baseEmotions for all distribution patterns", () => {
    expect(EMOTION_CONFIG.baseEmotions.normal).toBeDefined();
    expect(EMOTION_CONFIG.baseEmotions.bimodal).toBeDefined();
    expect(EMOTION_CONFIG.baseEmotions.stress).toBeDefined();
    expect(EMOTION_CONFIG.baseEmotions.happy).toBeDefined();
  });

  it("has baseEmotions within min/max range", () => {
    const values = Object.values(EMOTION_CONFIG.baseEmotions);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(EMOTION_CONFIG.min);
      expect(v).toBeLessThanOrEqual(EMOTION_CONFIG.max);
    });
  });
});

describe("UI_CONFIG", () => {
  it("defines morning/afternoon/evening time ranges", () => {
    expect(UI_CONFIG.timeRanges.morning).toEqual({ start: 5, end: 12 });
    expect(UI_CONFIG.timeRanges.afternoon).toEqual({ start: 12, end: 18 });
    expect(UI_CONFIG.timeRanges.evening).toEqual({ start: 18, end: 24 });
  });

  it("has time ranges that are contiguous (afternoon starts where morning ends)", () => {
    expect(UI_CONFIG.timeRanges.afternoon.start).toBe(
      UI_CONFIG.timeRanges.morning.end,
    );
    expect(UI_CONFIG.timeRanges.evening.start).toBe(
      UI_CONFIG.timeRanges.afternoon.end,
    );
  });

  it("has 7 days of week labels", () => {
    expect(UI_CONFIG.daysOfWeek).toHaveLength(7);
    expect(UI_CONFIG.daysOfWeek[0]).toBe("日");
    expect(UI_CONFIG.daysOfWeek[6]).toBe("土");
  });

  it("has primary and secondary button styles", () => {
    expect(UI_CONFIG.buttonStyles.primary).toContain("bg-blue-600");
    expect(UI_CONFIG.buttonStyles.secondary).toContain("bg-gray-200");
  });
});
