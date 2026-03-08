import { 
  EmotionDistributionPattern,
  SeasonalEffect,
  EventEffect,
  ClassCharacteristics,
  DataGenerationConfig,
  DEFAULT_CONFIG,
  EMOTION_CONSTANTS
} from './DataGeneration';

describe('DataGeneration Domain Entities', () => {
  describe('EmotionDistributionPattern', () => {
    it('should have valid pattern types', () => {
      // Arrange & Act
      const patterns: EmotionDistributionPattern[] = ['normal', 'bimodal', 'stress', 'happy'];

      // Assert
      expect(patterns).toHaveLength(4);
      expect(patterns).toContain('normal');
      expect(patterns).toContain('bimodal');
      expect(patterns).toContain('stress');
      expect(patterns).toContain('happy');
    });
  });

  describe('SeasonalEffect', () => {
    it('should create valid SeasonalEffect', () => {
      // Arrange
      const seasonalEffect: SeasonalEffect = {
        spring: 3.2,
        summer: 3.5,
        autumn: 3.1,
        winter: 2.8
      };

      // Assert
      expect(seasonalEffect.spring).toBe(3.2);
      expect(seasonalEffect.summer).toBe(3.5);
      expect(seasonalEffect.autumn).toBe(3.1);
      expect(seasonalEffect.winter).toBe(2.8);
    });

    it('should handle edge cases', () => {
      // Arrange
      const edgeCases: SeasonalEffect[] = [
        { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
        { spring: 5.0, summer: 5.0, autumn: 5.0, winter: 5.0 },
        { spring: 0, summer: 0, autumn: 0, winter: 0 }
      ];

      // Assert
      edgeCases.forEach(effect => {
        expect(effect.spring).toBeGreaterThanOrEqual(0);
        expect(effect.summer).toBeGreaterThanOrEqual(0);
        expect(effect.autumn).toBeGreaterThanOrEqual(0);
        expect(effect.winter).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle seasonal variations', () => {
      // Arrange
      const seasonalVariations: SeasonalEffect = {
        spring: 2.5,
        summer: 4.0,
        autumn: 3.3,
        winter: 2.0
      };

      // Assert
      expect(seasonalVariations.summer).toBeGreaterThan(seasonalVariations.winter);
      expect(seasonalVariations.spring).toBeGreaterThan(seasonalVariations.winter);
    });
  });

  describe('EventEffect', () => {
    it('should create valid EventEffect', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      const eventEffect: EventEffect = {
        name: '文化祭',
        startDate,
        endDate,
        impact: 0.3
      };

      // Assert
      expect(eventEffect.name).toBe('文化祭');
      expect(eventEffect.startDate).toBe(startDate);
      expect(eventEffect.endDate).toBe(endDate);
      expect(eventEffect.impact).toBe(0.3);
    });

    it('should handle positive and negative impacts', () => {
      // Arrange
      const positiveEvent: EventEffect = {
        name: '体育祭',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-03'),
        impact: 0.5
      };

      const negativeEvent: EventEffect = {
        name: '試験期間',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        impact: -0.4
      };

      // Assert
      expect(positiveEvent.impact).toBeGreaterThan(0);
      expect(negativeEvent.impact).toBeLessThan(0);
    });

    it('should handle zero impact events', () => {
      // Arrange
      const neutralEvent: EventEffect = {
        name: '通常授業',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-01'),
        impact: 0
      };

      // Assert
      expect(neutralEvent.impact).toBe(0);
    });

    it('should validate date ranges', () => {
      // Arrange
      const startDate = new Date('2024-03-01');
      const endDate = new Date('2024-03-05');
      const eventEffect: EventEffect = {
        name: '春休み',
        startDate,
        endDate,
        impact: 0.2
      };

      // Assert
      expect(eventEffect.endDate.getTime()).toBeGreaterThan(eventEffect.startDate.getTime());
    });
  });

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

  describe('DataGenerationConfig', () => {
    it('should create valid DataGenerationConfig', () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      const eventEffect: EventEffect = {
        name: '新年イベント',
        startDate,
        endDate,
        impact: 0.2
      };

      const config: DataGenerationConfig = {
        studentCount: 30,
        periodDays: 60,
        distributionPattern: 'normal',
        seasonalEffects: true,
        eventEffects: [eventEffect],
        classCharacteristics: {
          baselineEmotion: 3.5,
          volatility: 0.4,
          cohesion: 0.7
        }
      };

      // Assert
      expect(config.studentCount).toBe(30);
      expect(config.periodDays).toBe(60);
      expect(config.distributionPattern).toBe('normal');
      expect(config.seasonalEffects).toBe(true);
      expect(config.eventEffects).toHaveLength(1);
      expect(config.classCharacteristics.baselineEmotion).toBe(3.5);
    });

    it('should handle empty event effects', () => {
      // Arrange
      const config: DataGenerationConfig = {
        studentCount: 25,
        periodDays: 30,
        distributionPattern: 'bimodal',
        seasonalEffects: false,
        eventEffects: [],
        classCharacteristics: {
          baselineEmotion: 3.0,
          volatility: 0.5,
          cohesion: 0.6
        }
      };

      // Assert
      expect(config.eventEffects).toEqual([]);
      expect(config.seasonalEffects).toBe(false);
    });

    it('should handle all distribution patterns', () => {
      // Arrange
      const patterns: EmotionDistributionPattern[] = ['normal', 'bimodal', 'stress', 'happy'];

      // Act & Assert
      patterns.forEach(pattern => {
        const config: DataGenerationConfig = {
          studentCount: 20,
          periodDays: 30,
          distributionPattern: pattern,
          seasonalEffects: false,
          eventEffects: [],
          classCharacteristics: {
            baselineEmotion: 3.0,
            volatility: 0.5,
            cohesion: 0.7
          }
        };
        expect(config.distributionPattern).toBe(pattern);
      });
    });

    it('should validate student count and period constraints', () => {
      // Arrange
      const configs: DataGenerationConfig[] = [
        { studentCount: 10, periodDays: 7, distributionPattern: 'normal', seasonalEffects: false, eventEffects: [], classCharacteristics: { baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.7 } },
        { studentCount: 500, periodDays: 365, distributionPattern: 'normal', seasonalEffects: false, eventEffects: [], classCharacteristics: { baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.7 } }
      ];

      // Assert
      configs.forEach(config => {
        expect(config.studentCount).toBeGreaterThanOrEqual(10);
        expect(config.studentCount).toBeLessThanOrEqual(500);
        expect(config.periodDays).toBeGreaterThanOrEqual(7);
        expect(config.periodDays).toBeLessThanOrEqual(365);
      });
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have valid default values', () => {
      // Assert
      expect(DEFAULT_CONFIG.studentCount).toBe(25);
      expect(DEFAULT_CONFIG.periodDays).toBe(30);
      expect(DEFAULT_CONFIG.distributionPattern).toBe('normal');
      expect(DEFAULT_CONFIG.seasonalEffects).toBe(false);
      expect(DEFAULT_CONFIG.eventEffects).toEqual([]);
      expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBe(3.0);
      expect(DEFAULT_CONFIG.classCharacteristics.volatility).toBe(0.5);
      expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBe(0.7);
    });

    it('should be a valid DataGenerationConfig', () => {
      // Assert
      expect(DEFAULT_CONFIG).toHaveProperty('studentCount');
      expect(DEFAULT_CONFIG).toHaveProperty('periodDays');
      expect(DEFAULT_CONFIG).toHaveProperty('distributionPattern');
      expect(DEFAULT_CONFIG).toHaveProperty('seasonalEffects');
      expect(DEFAULT_CONFIG).toHaveProperty('eventEffects');
      expect(DEFAULT_CONFIG).toHaveProperty('classCharacteristics');
    });

    it('should have reasonable default values', () => {
      // Assert
      expect(DEFAULT_CONFIG.studentCount).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.periodDays).toBeGreaterThan(0);
      expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBeGreaterThanOrEqual(1.0);
      expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBeLessThanOrEqual(5.0);
      expect(DEFAULT_CONFIG.classCharacteristics.volatility).toBeGreaterThanOrEqual(0.0);
      expect(DEFAULT_CONFIG.classCharacteristics.volatility).toBeLessThanOrEqual(1.0);
      expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBeGreaterThanOrEqual(0.0);
      expect(DEFAULT_CONFIG.classCharacteristics.cohesion).toBeLessThanOrEqual(1.0);
    });
  });

  describe('EMOTION_CONSTANTS', () => {
    it('should have valid emotion range constants', () => {
      // Assert
      expect(EMOTION_CONSTANTS.MIN_EMOTION).toBe(1.0);
      expect(EMOTION_CONSTANTS.MAX_EMOTION).toBe(5.0);
      expect(EMOTION_CONSTANTS.DEFAULT_STDDEV).toBe(0.5);
      expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBe(0.2);
      expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBe(0.5);
    });

    it('should validate emotion range logic', () => {
      // Assert
      expect(EMOTION_CONSTANTS.MIN_EMOTION).toBeLessThan(EMOTION_CONSTANTS.MAX_EMOTION);
      expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeLessThan(EMOTION_CONSTANTS.MAX_EVENT_IMPACT);
      expect(EMOTION_CONSTANTS.DEFAULT_STDDEV).toBeGreaterThan(0);
    });

    it('should ensure constants are within reasonable bounds', () => {
      // Assert
      expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeGreaterThan(0);
      expect(EMOTION_CONSTANTS.SEASONAL_IMPACT).toBeLessThan(1);
      expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBeGreaterThan(0);
      expect(EMOTION_CONSTANTS.MAX_EVENT_IMPACT).toBeLessThan(1);
    });

    it('should be used consistently with DEFAULT_CONFIG', () => {
      // Assert
      expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBeGreaterThanOrEqual(
        EMOTION_CONSTANTS.MIN_EMOTION
      );
      expect(DEFAULT_CONFIG.classCharacteristics.baselineEmotion).toBeLessThanOrEqual(
        EMOTION_CONSTANTS.MAX_EMOTION
      );
    });
  });

  describe('Integration Tests', () => {
    it('should create complete configuration with multiple events', () => {
      // Arrange
      const events: EventEffect[] = [
        {
          name: '体育祭',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-03'),
          impact: 0.4
        },
        {
          name: '文化祭',
          startDate: new Date('2024-11-01'),
          endDate: new Date('2024-11-03'),
          impact: 0.3
        },
        {
          name: '期末試験',
          startDate: new Date('2024-07-15'),
          endDate: new Date('2024-07-20'),
          impact: -0.3
        }
      ];

      const config: DataGenerationConfig = {
        studentCount: 35,
        periodDays: 180,
        distributionPattern: 'happy',
        seasonalEffects: true,
        eventEffects: events,
        classCharacteristics: {
          baselineEmotion: 3.6,
          volatility: 0.3,
          cohesion: 0.8
        }
      };

      // Assert
      expect(config.eventEffects).toHaveLength(3);
      expect(config.eventEffects[0].impact).toBeGreaterThan(0);
      expect(config.eventEffects[2].impact).toBeLessThan(0);
      expect(config.studentCount).toBe(35);
      expect(config.periodDays).toBe(180);
    });

    it('should validate all business rules together', () => {
      // Arrange
      const config: DataGenerationConfig = {
        studentCount: 100,
        periodDays: 90,
        distributionPattern: 'stress',
        seasonalEffects: true,
        eventEffects: [{
          name: 'ストレスイベント',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-04-10'),
          impact: -0.5
        }],
        classCharacteristics: {
          baselineEmotion: 2.2,
          volatility: 0.9,
          cohesion: 0.2
        }
      };

      // Assert
      expect(config.distributionPattern).toBe('stress');
      expect(config.classCharacteristics.volatility).toBeGreaterThan(0.5);
      expect(config.classCharacteristics.cohesion).toBeLessThan(0.5);
      expect(config.eventEffects[0].impact).toBeLessThan(0);
      expect(config.eventEffects[0].impact).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MAX_EVENT_IMPACT * -1);
    });
  });
});
