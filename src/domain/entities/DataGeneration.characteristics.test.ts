import { ClassCharacteristics } from './DataGeneration';

describe('ClassCharacteristics', () => {
  it('should create valid ClassCharacteristics', () => {
    // Arrange
    const characteristics: ClassCharacteristics = {
      baselineEmotion: 3.2,
      volatility: 0.4,
      cohesion: 0.8
    };

    // Assert
    expect(characteristics.baselineEmotion).toBe(3.2);
    expect(characteristics.volatility).toBe(0.4);
    expect(characteristics.cohesion).toBe(0.8);
  });

  it('should handle boundary values', () => {
    // Arrange
    const boundaryCases: ClassCharacteristics[] = [
      { baselineEmotion: 1.0, volatility: 0.1, cohesion: 0.1 },
      { baselineEmotion: 5.0, volatility: 1.0, cohesion: 1.0 },
      { baselineEmotion: 2.5, volatility: 0.5, cohesion: 0.7 }
    ];

    // Assert
    boundaryCases.forEach(char => {
      expect(char.baselineEmotion).toBeGreaterThanOrEqual(1.0);
      expect(char.baselineEmotion).toBeLessThanOrEqual(5.0);
      expect(char.volatility).toBeGreaterThanOrEqual(0.1);
      expect(char.volatility).toBeLessThanOrEqual(1.0);
      expect(char.cohesion).toBeGreaterThanOrEqual(0.1);
      expect(char.cohesion).toBeLessThanOrEqual(1.0);
    });
  });

  it('should validate relationship between characteristics', () => {
    // Arrange
    const highCohesionClass: ClassCharacteristics = {
      baselineEmotion: 3.8,
      volatility: 0.2,
      cohesion: 0.9
    };

    const lowCohesionClass: ClassCharacteristics = {
      baselineEmotion: 2.8,
      volatility: 0.8,
      cohesion: 0.3
    };

    // Assert
    expect(highCohesionClass.cohesion).toBeGreaterThan(lowCohesionClass.cohesion);
    expect(highCohesionClass.volatility).toBeLessThan(lowCohesionClass.volatility);
  });
});
