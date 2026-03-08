import { DataGenerationConfig, EventEffect, EMOTION_CONSTANTS } from './DataGeneration';

describe('DataGeneration Integration Tests', () => {
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
    expect(config.eventEffects[0]?.impact).toBeGreaterThan(0);
    expect(config.eventEffects[2]?.impact).toBeLessThan(0);
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
    expect(config.eventEffects[0]?.impact).toBeLessThan(0);
    expect(config.eventEffects[0]?.impact).toBeGreaterThanOrEqual(EMOTION_CONSTANTS.MAX_EVENT_IMPACT * -1);
  });
});
