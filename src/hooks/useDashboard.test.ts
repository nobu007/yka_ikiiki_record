import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';

// Mock the dependencies
jest.mock('@/application/hooks/useSeedGeneration');
jest.mock('@/hooks/useNotification');
jest.mock('@/domain/entities/DataGeneration', () => ({
  DEFAULT_CONFIG: { periodDays: 30, studentCount: 10 }
}));

const mockUseSeedGeneration = useSeedGeneration as jest.MockedFunction<typeof useSeedGeneration>;
const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

describe('useDashboard', () => {
  const mockGenerateSeed = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: false,
      error: null
    });

    mockUseNotification.mockReturnValue({
      notification: { show: false, message: '', type: 'success' },
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(false);
    expect(typeof result.current.handleInitialGeneration).toBe('function');
  });

  it('should handle successful data generation', async () => {
    mockGenerateSeed.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(mockGenerateSeed).toHaveBeenCalledWith({
      ...DEFAULT_CONFIG,
      periodDays: 30
    });
    expect(mockShowSuccess).toHaveBeenCalledWith('テストデータの生成が完了しました');
  });

  it('should handle data generation error', async () => {
    const error = new Error('Generation failed');
    mockGenerateSeed.mockRejectedValue(error);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(mockShowError).toHaveBeenCalledWith('データの生成に失敗しました');
  });

  it('should show error notification when error exists', () => {
    const error = new Error('Test error');
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: false,
      error
    });

    renderHook(() => useDashboard());

    expect(mockShowError).toHaveBeenCalled();
  });

  it('should not show error notification when notification is already showing', () => {
    const error = new Error('Test error');
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: false,
      error
    });

    mockUseNotification.mockReturnValue({
      notification: { show: true, message: 'Existing message', type: 'error' },
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });

    renderHook(() => useDashboard());

    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('should pass through isGenerating state', () => {
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: true,
      error: null
    });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(true);
  });
});