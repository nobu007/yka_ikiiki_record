import { act } from '@testing-library/react';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { setupTestHook, createMockOnGenerate, createMockEvent } from './useDataGeneration.test.utils';

describe('useDataGeneration - Integration Scenarios', () => {
  let mockOnGenerate: jest.Mock;

  beforeEach(() => {
    mockOnGenerate = createMockOnGenerate();
    jest.clearAllMocks();
  });

  describe('integration scenarios', () => {
    it('should handle complex configuration workflow', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateStudentCount(150);
        result.current.updatePeriodDays(90);
        result.current.updateDistributionPattern('stress');
        result.current.toggleSeasonalEffects();
        result.current.updateClassCharacteristics({
          baselineEmotion: 3.5,
          volatility: 0.4
        });
      });

      expect(result.current.config.studentCount).toBe(150);
      expect(result.current.config.periodDays).toBe(90);
      expect(result.current.config.distributionPattern).toBe('stress');
      expect(result.current.config.seasonalEffects).toBe(true);
      expect(result.current.config.classCharacteristics.baselineEmotion).toBe(3.5);
      expect(result.current.config.classCharacteristics.volatility).toBe(0.4);
    });

    it('should manage event lifecycle', () => {
      const { result } = setupTestHook(mockOnGenerate);
      const event1 = createMockEvent({ name: 'Event 1' });
      const event2 = createMockEvent({ name: 'Event 2', impact: -0.3 });

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
      });

      expect(result.current.config.eventEffects).toHaveLength(2);

      act(() => {
        result.current.removeEvent(0);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event2);
    });

    it('should reset and reconfigure', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateStudentCount(200);
        result.current.updatePeriodDays(120);
        result.current.resetConfig();
        result.current.updateStudentCount(100);
      });

      expect(result.current.config.studentCount).toBe(100);
      expect(result.current.config.periodDays).toBe(DEFAULT_CONFIG.periodDays);
    });
  });
});
