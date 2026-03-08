import { act, waitFor } from '@testing-library/react';
import { useDataGeneration } from './useDataGeneration';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import {
  setupTestHook,
  createMockOnGenerate,
  MIN_STUDENTS,
  MAX_STUDENTS,
  MIN_PERIOD_DAYS,
  MAX_PERIOD_DAYS,
  VALID_STUDENT_COUNT,
  BELOW_MIN_STUDENT_COUNT,
  ABOVE_MAX_STUDENT_COUNT,
  VALID_PERIOD_DAYS,
  BELOW_MIN_PERIOD_DAYS,
  ABOVE_MAX_PERIOD_DAYS,
} from './useDataGeneration.test.utils';

describe('useDataGeneration - Configuration', () => {
  let mockOnGenerate: jest.Mock;

  beforeEach(() => {
    mockOnGenerate = createMockOnGenerate();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const { result } = setupTestHook(mockOnGenerate);

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('config updates - student count', () => {
    it('should update student count within valid range', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateStudentCount(VALID_STUDENT_COUNT);
      });

      expect(result.current.config.studentCount).toBe(VALID_STUDENT_COUNT);
    });

    it('should enforce minimum student count', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateStudentCount(BELOW_MIN_STUDENT_COUNT);
      });

      expect(result.current.config.studentCount).toBe(MIN_STUDENTS);
    });

    it('should enforce maximum student count', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateStudentCount(ABOVE_MAX_STUDENT_COUNT);
      });

      expect(result.current.config.studentCount).toBe(MAX_STUDENTS);
    });
  });

  describe('config updates - period days', () => {
    it('should update period days within valid range', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updatePeriodDays(VALID_PERIOD_DAYS);
      });

      expect(result.current.config.periodDays).toBe(VALID_PERIOD_DAYS);
    });

    it('should enforce minimum period days', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updatePeriodDays(BELOW_MIN_PERIOD_DAYS);
      });

      expect(result.current.config.periodDays).toBe(MIN_PERIOD_DAYS);
    });

    it('should enforce maximum period days', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updatePeriodDays(ABOVE_MAX_PERIOD_DAYS);
      });

      expect(result.current.config.periodDays).toBe(MAX_PERIOD_DAYS);
    });
  });

  describe('config updates - distribution pattern', () => {
    it('should update distribution pattern', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateDistributionPattern('bimodal');
      });

      expect(result.current.config.distributionPattern).toBe('bimodal');
    });
  });

  describe('config updates - seasonal effects', () => {
    it('should toggle seasonal effects from false to true', () => {
      const { result } = setupTestHook(mockOnGenerate);

      expect(result.current.config.seasonalEffects).toBe(false);

      act(() => {
        result.current.toggleSeasonalEffects();
      });

      expect(result.current.config.seasonalEffects).toBe(true);
    });

    it('should toggle seasonal effects from true to false', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.toggleSeasonalEffects();
      });

      expect(result.current.config.seasonalEffects).toBe(true);

      act(() => {
        result.current.toggleSeasonalEffects();
      });

      expect(result.current.config.seasonalEffects).toBe(false);
    });
  });

  describe('config updates - class characteristics', () => {
    it('should update class characteristics partially', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateClassCharacteristics({ baselineEmotion: 4.0 });
      });

      expect(result.current.config.classCharacteristics.baselineEmotion).toBe(4.0);
      expect(result.current.config.classCharacteristics.volatility).toBe(DEFAULT_CONFIG.classCharacteristics.volatility);
    });

    it('should merge multiple characteristics', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateClassCharacteristics({
          baselineEmotion: 4.0,
          volatility: 0.3
        });
      });

      expect(result.current.config.classCharacteristics.baselineEmotion).toBe(4.0);
      expect(result.current.config.classCharacteristics.volatility).toBe(0.3);
    });
  });

  describe('config reset', () => {
    it('should reset config to default', () => {
      const { result } = setupTestHook(mockOnGenerate);

      act(() => {
        result.current.updateStudentCount(100);
        result.current.updatePeriodDays(60);
        result.current.resetConfig();
      });

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
    });

    it('should reset config values while preserving error state', async () => {
      const { result } = setupTestHook(mockOnGenerate);
      mockOnGenerate.mockRejectedValueOnce(new Error('Test error'));

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      const errorBeforeReset = result.current.error;

      act(() => {
        result.current.updateStudentCount(100);
        result.current.resetConfig();
      });

      // Config should be reset
      expect(result.current.config).toEqual(DEFAULT_CONFIG);
      // Error state should be preserved (resetConfig only resets config)
      expect(result.current.error).toEqual(errorBeforeReset);
    });
  });
});
