import {
  clamp,
  clampEmotion,
  generateBaseEmotion,
  getRandomHour,
  calculateEmotionTrend,
} from "./statsCalculator";

describe("statsCalculator Utility Functions", () => {
  describe("clamp", () => {
    test("値を範囲内に制限する", () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });

  describe("clampEmotion", () => {
    test("感情値を1-5の範囲に制限する", () => {
      expect(clampEmotion(0)).toBe(1);
      expect(clampEmotion(3)).toBe(3);
      expect(clampEmotion(6)).toBe(5);
    });
  });

  describe("generateBaseEmotion", () => {
    test("各パターンで感情値を生成する", () => {
      const normal = generateBaseEmotion("normal");
      const bimodal = generateBaseEmotion("bimodal");
      const stress = generateBaseEmotion("stress");
      const happy = generateBaseEmotion("happy");

      expect(normal).toBeGreaterThanOrEqual(1);
      expect(normal).toBeLessThanOrEqual(5);
      expect(bimodal).toBeGreaterThanOrEqual(1);
      expect(bimodal).toBeLessThanOrEqual(5);
      expect(stress).toBeGreaterThanOrEqual(1);
      expect(stress).toBeLessThanOrEqual(5);
      expect(happy).toBeGreaterThanOrEqual(1);
      expect(happy).toBeLessThanOrEqual(5);
    });
  });

  describe("getRandomHour", () => {
    test("有効な時間帯を生成する", () => {
      const hour = getRandomHour();
      expect(hour).toBeGreaterThanOrEqual(5);
      expect(hour).toBeLessThan(24);
    });
  });

  describe("calculateEmotionTrend", () => {
    test("感情トレンドを計算する", () => {
      expect(calculateEmotionTrend([])).toBe("stable");
      expect(calculateEmotionTrend([3])).toBe("stable");
      expect(calculateEmotionTrend([3, 4, 5])).toBe("stable"); // Not enough data for trend
      expect(calculateEmotionTrend([5, 4, 3])).toBe("stable"); // Not enough data for trend
      expect(calculateEmotionTrend([3, 3, 3])).toBe("stable");
      // Test with enough data for trend calculation
      expect(calculateEmotionTrend([2, 2, 2, 3, 4, 5])).toBe("up");
      expect(calculateEmotionTrend([5, 5, 5, 4, 3, 2])).toBe("down");
      expect(calculateEmotionTrend([3, 3, 3, 3, 3, 3])).toBe("stable");
    });
  });
});
