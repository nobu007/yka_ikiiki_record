import { SeasonalEffect } from "./DataGeneration";

describe("SeasonalEffect", () => {
  it("should create valid SeasonalEffect", () => {
    // Arrange
    const seasonalEffect: SeasonalEffect = {
      spring: 3.2,
      summer: 3.5,
      autumn: 3.1,
      winter: 2.8,
    };

    // Assert
    expect(seasonalEffect.spring).toBe(3.2);
    expect(seasonalEffect.summer).toBe(3.5);
    expect(seasonalEffect.autumn).toBe(3.1);
    expect(seasonalEffect.winter).toBe(2.8);
  });

  it("should handle edge cases", () => {
    // Arrange
    const edgeCases: SeasonalEffect[] = [
      { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
      { spring: 5.0, summer: 5.0, autumn: 5.0, winter: 5.0 },
      { spring: 0, summer: 0, autumn: 0, winter: 0 },
    ];

    // Assert
    edgeCases.forEach((effect) => {
      expect(effect.spring).toBeGreaterThanOrEqual(0);
      expect(effect.summer).toBeGreaterThanOrEqual(0);
      expect(effect.autumn).toBeGreaterThanOrEqual(0);
      expect(effect.winter).toBeGreaterThanOrEqual(0);
    });
  });

  it("should handle seasonal variations", () => {
    // Arrange
    const seasonalVariations: SeasonalEffect = {
      spring: 2.5,
      summer: 4.0,
      autumn: 3.3,
      winter: 2.0,
    };

    // Assert
    expect(seasonalVariations.summer).toBeGreaterThan(
      seasonalVariations.winter,
    );
    expect(seasonalVariations.spring).toBeGreaterThan(
      seasonalVariations.winter,
    );
  });
});
