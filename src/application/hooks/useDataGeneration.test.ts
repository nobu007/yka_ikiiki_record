import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataGeneration } from './useDataGeneration';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import type { EventEffect } from '@/domain/entities/DataGeneration';

// Test constants
const MIN_STUDENTS = 10;
const MAX_STUDENTS = 500;
const MIN_PERIOD_DAYS = 7;
const MAX_PERIOD_DAYS = 365;

const VALID_STUDENT_COUNT = 50;
const BELOW_MIN_STUDENT_COUNT = 5;
const ABOVE_MAX_STUDENT_COUNT = 600;

const VALID_PERIOD_DAYS = 30;
const BELOW_MIN_PERIOD_DAYS = 5;
const ABOVE_MAX_PERIOD_DAYS = 400;

// Test helper factories
const createMockEvent = (overrides: Partial<EventEffect> = {}): EventEffect => ({
  name: 'Test Event',
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-01-16'),
  impact: 0.5,
  ...overrides
});

describe('useDataGeneration', () => {
  let mockOnGenerate: jest.Mock;

  beforeEach(() => {
    mockOnGenerate = jest.fn();
    jest.clearAllMocks();
  });

  // Helper to render the hook
  const renderTestHook = () => renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const { result } = renderTestHook();

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('config updates - student count', () => {
    it('should update student count within valid range', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updateStudentCount(VALID_STUDENT_COUNT);
      });

      expect(result.current.config.studentCount).toBe(VALID_STUDENT_COUNT);
    });

    it('should enforce minimum student count', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updateStudentCount(BELOW_MIN_STUDENT_COUNT);
      });

      expect(result.current.config.studentCount).toBe(MIN_STUDENTS);
    });

    it('should enforce maximum student count', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updateStudentCount(ABOVE_MAX_STUDENT_COUNT);
      });

      expect(result.current.config.studentCount).toBe(MAX_STUDENTS);
    });
  });

  describe('config updates - period days', () => {
    it('should update period days within valid range', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updatePeriodDays(VALID_PERIOD_DAYS);
      });

      expect(result.current.config.periodDays).toBe(VALID_PERIOD_DAYS);
    });

    it('should enforce minimum period days', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updatePeriodDays(BELOW_MIN_PERIOD_DAYS);
      });

      expect(result.current.config.periodDays).toBe(MIN_PERIOD_DAYS);
    });

    it('should enforce maximum period days', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updatePeriodDays(ABOVE_MAX_PERIOD_DAYS);
      });

      expect(result.current.config.periodDays).toBe(MAX_PERIOD_DAYS);
    });
  });

  describe('config updates - distribution pattern', () => {
    it('should update distribution pattern', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updateDistributionPattern('bimodal');
      });

      expect(result.current.config.distributionPattern).toBe('bimodal');
    });
  });

  describe('config updates - seasonal effects', () => {
    it('should toggle seasonal effects from false to true', () => {
      const { result } = renderTestHook();

      expect(result.current.config.seasonalEffects).toBe(false);

      act(() => {
        result.current.toggleSeasonalEffects();
      });

      expect(result.current.config.seasonalEffects).toBe(true);
    });

    it('should toggle seasonal effects from true to false', () => {
      const { result } = renderTestHook();

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

  describe('event management - add events', () => {
    it('should add single event to event effects', () => {
      const { result } = renderTestHook();
      const event = createMockEvent();

      act(() => {
        result.current.addEvent(event);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event);
    });

    it('should add multiple events', () => {
      const { result } = renderTestHook();
      const event1 = createMockEvent({ name: 'Event 1' });
      const event2 = createMockEvent({ name: 'Event 2', impact: -0.3 });

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
      });

      expect(result.current.config.eventEffects).toHaveLength(2);
      expect(result.current.config.eventEffects[0]).toEqual(event1);
      expect(result.current.config.eventEffects[1]).toEqual(event2);
    });
  });

  describe('event management - remove events', () => {
    it('should remove event by index', () => {
      const { result } = renderTestHook();
      const event1 = createMockEvent({ name: 'Event 1' });
      const event2 = createMockEvent({ name: 'Event 2', impact: -0.3 });

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
        result.current.removeEvent(0);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event2);
    });

    it('should handle removing non-existent index gracefully', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.removeEvent(999);
      });

      expect(result.current.config.eventEffects).toHaveLength(0);
    });
  });

  describe('config updates - class characteristics', () => {
    it('should update class characteristics partially', () => {
      const { result } = renderTestHook();

      act(() => {
        result.current.updateClassCharacteristics({ baselineEmotion: 4.0 });
      });

      expect(result.current.config.classCharacteristics.baselineEmotion).toBe(4.0);
      expect(result.current.config.classCharacteristics.volatility).toBe(DEFAULT_CONFIG.classCharacteristics.volatility);
    });

    it('should merge multiple characteristics', () => {
      const { result } = renderTestHook();

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
      const { result } = renderTestHook();

      act(() => {
        result.current.updateStudentCount(100);
        result.current.updatePeriodDays(60);
        result.current.resetConfig();
      });

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
    });

    it('should reset config values while preserving error state', async () => {
      const { result } = renderTestHook();
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

  describe('data generation - success scenarios', () => {
    it('should call onGenerate with current config', async () => {
      const { result } = renderTestHook();
      mockOnGenerate.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledWith(result.current.config);
      });
    });

    it('should set isGenerating to true during generation', async () => {
      const { result } = renderTestHook();
      let resolveGenerate: (value?: void) => void;
      mockOnGenerate.mockImplementationOnce(() => new Promise(resolve => {
        resolveGenerate = resolve;
      }));

      act(() => {
        result.current.generateData();
      });

      expect(result.current.isGenerating).toBe(true);

      await act(async () => {
        resolveGenerate!();
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('should reset isGenerating after successful generation', async () => {
      const { result } = renderTestHook();
      mockOnGenerate.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });
  });

  describe('data generation - error scenarios', () => {
    it('should set error when generation fails', async () => {
      const { result } = renderTestHook();
      const testError = new Error('Generation failed');
      mockOnGenerate.mockRejectedValueOnce(testError);

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(testError);
      });
      expect(result.current.isGenerating).toBe(false);
    });

    it('should clear previous error on successful generation', async () => {
      const { result } = renderTestHook();
      mockOnGenerate.mockRejectedValueOnce(new Error('First error'));

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      mockOnGenerate.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should create generic error for unknown error types', async () => {
      const { result } = renderTestHook();
      mockOnGenerate.mockRejectedValueOnce('String error');

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('データ生成に失敗しました');
      });
    });

    it('should create generic error for null error', async () => {
      const { result } = renderTestHook();
      mockOnGenerate.mockRejectedValueOnce(null);

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('データ生成に失敗しました');
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex configuration workflow', () => {
      const { result } = renderTestHook();

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
      const { result } = renderTestHook();
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
      const { result } = renderTestHook();

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
