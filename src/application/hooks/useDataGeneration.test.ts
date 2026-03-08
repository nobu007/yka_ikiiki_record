import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataGeneration } from './useDataGeneration';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';

describe('useDataGeneration', () => {
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('updateStudentCount', () => {
    it('should update student count within valid range', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updateStudentCount(50);
      });

      expect(result.current.config.studentCount).toBe(50);
    });

    it('should enforce minimum student count of 10', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updateStudentCount(5);
      });

      expect(result.current.config.studentCount).toBe(10);
    });

    it('should enforce maximum student count of 500', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updateStudentCount(600);
      });

      expect(result.current.config.studentCount).toBe(500);
    });
  });

  describe('updatePeriodDays', () => {
    it('should update period days within valid range', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updatePeriodDays(30);
      });

      expect(result.current.config.periodDays).toBe(30);
    });

    it('should enforce minimum period days of 7', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updatePeriodDays(5);
      });

      expect(result.current.config.periodDays).toBe(7);
    });

    it('should enforce maximum period days of 365', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updatePeriodDays(400);
      });

      expect(result.current.config.periodDays).toBe(365);
    });
  });

  describe('updateDistributionPattern', () => {
    it('should update distribution pattern', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updateDistributionPattern('bimodal');
      });

      expect(result.current.config.distributionPattern).toBe('bimodal');
    });
  });

  describe('toggleSeasonalEffects', () => {
    it('should toggle seasonal effects from false to true', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      expect(result.current.config.seasonalEffects).toBe(false);

      act(() => {
        result.current.toggleSeasonalEffects();
      });

      expect(result.current.config.seasonalEffects).toBe(true);
    });

    it('should toggle seasonal effects from true to false', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

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

  describe('addEvent', () => {
    it('should add event to event effects', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      const event = {
        name: 'Test event',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-16'),
        impact: 0.5
      };

      act(() => {
        result.current.addEvent(event);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event);
    });

    it('should add multiple events', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      const event1 = {
        name: 'Event 1',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-16'),
        impact: 0.5
      };
      const event2 = {
        name: 'Event 2',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-16'),
        impact: -0.3
      };

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
      });

      expect(result.current.config.eventEffects).toHaveLength(2);
      expect(result.current.config.eventEffects[0]).toEqual(event1);
      expect(result.current.config.eventEffects[1]).toEqual(event2);
    });
  });

  describe('removeEvent', () => {
    it('should remove event by index', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      const event1 = {
        name: 'Event 1',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-16'),
        impact: 0.5
      };
      const event2 = {
        name: 'Event 2',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-16'),
        impact: -0.3
      };

      act(() => {
        result.current.addEvent(event1);
        result.current.addEvent(event2);
        result.current.removeEvent(0);
      });

      expect(result.current.config.eventEffects).toHaveLength(1);
      expect(result.current.config.eventEffects[0]).toEqual(event2);
    });

    it('should handle removing non-existent index gracefully', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.removeEvent(999);
      });

      expect(result.current.config.eventEffects).toHaveLength(0);
    });
  });

  describe('updateClassCharacteristics', () => {
    it('should update class characteristics partially', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updateClassCharacteristics({ baselineEmotion: 4.0 });
      });

      expect(result.current.config.classCharacteristics.baselineEmotion).toBe(4.0);
      expect(result.current.config.classCharacteristics.volatility).toBe(DEFAULT_CONFIG.classCharacteristics.volatility);
    });

    it('should merge multiple characteristics', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

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

  describe('resetConfig', () => {
    it('should reset config to default', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

      act(() => {
        result.current.updateStudentCount(100);
        result.current.updatePeriodDays(60);
        result.current.resetConfig();
      });

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
    });

    it('should clear error state on reset', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      mockOnGenerate.mockRejectedValueOnce(new Error('Test error'));

      act(() => {
        result.current.generateData();
      });

      waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      act(() => {
        result.current.resetConfig();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('generateData', () => {
    it('should call onGenerate with current config', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      mockOnGenerate.mockResolvedValueOnce(undefined);

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledWith(result.current.config);
      });
    });

    it('should set isGenerating to true during generation', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
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

    it('should set error when generation fails', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      const testError = new Error('Generation failed');
      mockOnGenerate.mockRejectedValueOnce(testError);

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(testError);
      });
      expect(result.current.isGenerating).toBe(false);
    });

    it('should clear previous error on successful generation', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      mockOnGenerate.mockRejectedValueOnce(new Error('First error'));

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      mockOnGenerate.mockResolvedValueOnce(undefined);

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should create error from unknown error type', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      mockOnGenerate.mockRejectedValueOnce('String error');

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('データ生成に失敗しました');
      });
    });

    it('should create generic error for null error', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      mockOnGenerate.mockRejectedValueOnce(null);

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('データ生成に失敗しました');
      });
    });

    it('should reset isGenerating after successful generation', async () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      mockOnGenerate.mockResolvedValueOnce(undefined);

      act(() => {
        result.current.generateData();
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex configuration workflow', () => {
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

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
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
      const event1 = {
        name: 'Event 1',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-16'),
        impact: 0.5
      };
      const event2 = {
        name: 'Event 2',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-16'),
        impact: -0.3
      };

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
      const { result } = renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));

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
