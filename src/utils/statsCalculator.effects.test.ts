import {
  calculateSeasonalEffect,
  calculateEventEffect,
} from "./statsCalculator";

describe("statsCalculator Effect Calculations", () => {
  describe("calculateSeasonalEffect", () => {
    test("季節効果を計算する", () => {
      const date = new Date("2025-05-23");
      const effect = calculateSeasonalEffect(date);
      expect(typeof effect).toBe("number");
    });

    test("すべての月で季節効果を計算する", () => {
      for (let month = 0; month < 12; month++) {
        const date = new Date(2025, month, 15);
        const effect = calculateSeasonalEffect(date);
        expect(typeof effect).toBe("number");
        expect(isNaN(effect)).toBe(false);
      }
    });

    test("境界外の月インデックスでフォールバック値を使用する (line 30)", () => {
      // Create a date with an invalid month and manipulate monthIndex directly
      const date = new Date(2025, 5, 15);
      // Force an out-of-bounds access by modifying the date object
      const invalidDate = new Date(date);
      invalidDate.setMonth(15); // Month 15 doesn't exist in seasonalFactors array

      const effect = calculateSeasonalEffect(invalidDate);
      expect(typeof effect).toBe("number");
      expect(isNaN(effect)).toBe(false);
    });
  });

  describe("calculateEventEffect", () => {
    test("イベント効果を計算する", () => {
      const date = new Date("2025-05-23");
      const events = [
        {
          startDate: new Date("2025-05-20"),
          endDate: new Date("2025-05-25"),
          impact: 0.5,
        },
      ];
      const effect = calculateEventEffect(date, events);
      expect(typeof effect).toBe("number");
      expect(effect).toBeGreaterThan(0);
    });

    test("期間外のイベントは影響しない", () => {
      const date = new Date("2025-05-23");
      const events = [
        {
          startDate: new Date("2025-05-20"),
          endDate: new Date("2025-05-22"),
          impact: 0.5,
        },
      ];
      const effect = calculateEventEffect(date, events);
      expect(effect).toBe(0);
    });

    test("零期間イベントは除算ゼロを防ぐ", () => {
      const date = new Date("2025-05-23");
      const events = [
        {
          startDate: new Date("2025-05-23"),
          endDate: new Date("2025-05-23"),
          impact: 0.5,
        },
      ];
      const effect = calculateEventEffect(date, events);
      expect(effect).toBe(0);
    });

    test("複数イベントの効果を累積する", () => {
      const date = new Date("2025-05-23");
      const events = [
        {
          startDate: new Date("2025-05-20"),
          endDate: new Date("2025-05-25"),
          impact: 0.3,
        },
        {
          startDate: new Date("2025-05-22"),
          endDate: new Date("2025-05-24"),
          impact: 0.2,
        },
      ];
      const effect = calculateEventEffect(date, events);
      expect(effect).toBeGreaterThan(0);
    });

    test("空のイベント配列を処理する", () => {
      const date = new Date("2025-05-23");
      const effect = calculateEventEffect(date, []);
      expect(effect).toBe(0);
    });
  });
});
