import {
  clamp,
  average,
  calculateAverage,
  generateNormalRandom,
} from "./statsCalculator";

describe("statsCalculator - Basic Functions", () => {
  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it("clamps to min when below", () => {
      expect(clamp(-1, 0, 10)).toBe(0);
    });

    it("clamps to max when above", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("handles equal min and max", () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });
  });

  describe("average", () => {
    it("calculates average of numbers", () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    it("returns 0 for empty array", () => {
      expect(average([])).toBe(0);
    });

    it("returns the number itself for single element", () => {
      expect(average([4.5])).toBe(4.5);
    });

    it("rounds to 1 decimal place", () => {
      expect(average([1, 2])).toBe(1.5);
      expect(average([1, 1, 2])).toBe(1.3);
    });
  });

  describe("calculateAverage", () => {
    it("is an alias for average", () => {
      expect(calculateAverage).toBe(average);
    });
  });

  describe("generateNormalRandom", () => {
    it("generates numbers (statistical check over 1000 samples)", () => {
      const samples = Array.from({ length: 1000 }, () =>
        generateNormalRandom(),
      );
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      // Mean should be approximately 0 (within tolerance)
      expect(Math.abs(mean)).toBeLessThan(0.2);
    });
  });
});
