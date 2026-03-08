import { act, waitFor } from '@testing-library/react';
import { setupTestHook, createMockOnGenerate } from './useDataGeneration.test.utils';

describe('useDataGeneration - Data Generation', () => {
  let mockOnGenerate: jest.Mock;

  beforeEach(() => {
    mockOnGenerate = createMockOnGenerate();
    jest.clearAllMocks();
  });

  describe('data generation - success scenarios', () => {
    it('should call onGenerate with current config', async () => {
      const { result } = setupTestHook(mockOnGenerate);
      mockOnGenerate.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.generateData();
      });

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledWith(result.current.config);
      });
    });

    it('should set isGenerating to true during generation', async () => {
      const { result } = setupTestHook(mockOnGenerate);
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
      const { result } = setupTestHook(mockOnGenerate);
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
      const { result } = setupTestHook(mockOnGenerate);
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
      const { result } = setupTestHook(mockOnGenerate);
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
      const { result } = setupTestHook(mockOnGenerate);
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
      const { result } = setupTestHook(mockOnGenerate);
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
});
