import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { useNotification } from '@/hooks/useNotification';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';

// Mock the hooks
jest.mock('@/application/hooks/useSeedGeneration');
jest.mock('@/hooks/useNotification');
jest.mock('@/domain/entities/DataGeneration');

const mockUseSeedGeneration = useSeedGeneration as jest.MockedFunction<typeof useSeedGeneration>;
const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

describe('useDashboard', () => {
  const mockGenerateSeed = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockClearNotification = jest.fn();

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
      showError: mockShowError,
      clearNotification: mockClearNotification
    });

    (DEFAULT_CONFIG as jest.Mock) = { periodDays: 7 };
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification).toEqual({ show: false, message: '', type: 'success' });
    expect(result.current.isLoadingMessage).toBe(null);
    expect(typeof result.current.handleInitialGeneration).toBe('function');
  });

  it('shows loading message when generating', () => {
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: true,
      error: null
    });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.isLoadingMessage).toBe('テストデータを生成中...');
  });

  it('clears notification when generation starts', () => {
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: true,
      error: null
    });

    renderHook(() => useDashboard());

    expect(mockClearNotification).toHaveBeenCalled();
  });

  it('shows error notification when generation fails', () => {
    const error = new Error('Test error');
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: false,
      error
    });

    mockUseNotification.mockReturnValue({
      notification: { show: false, message: '', type: 'success' },
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      clearNotification: mockClearNotification
    });

    renderHook(() => useDashboard());

    expect(mockShowError).toHaveBeenCalledWith('予期せぬエラーが発生しました');
  });

  it('does not show error if notification is already showing', () => {
    const error = new Error('Test error');
    mockUseSeedGeneration.mockReturnValue({
      generateSeed: mockGenerateSeed,
      isGenerating: false,
      error
    });

    mockUseNotification.mockReturnValue({
      notification: { show: true, message: 'Existing', type: 'error' },
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      clearNotification: mockClearNotification
    });

    renderHook(() => useDashboard());

    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('handles successful generation', async () => {
    mockGenerateSeed.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(mockClearNotification).toHaveBeenCalled();
    expect(mockGenerateSeed).toHaveBeenCalledWith({ periodDays: 30 });
    expect(mockShowSuccess).toHaveBeenCalledWith('テストデータの生成が完了しました');
  });

  it('handles generation failure', async () => {
    const error = new Error('Generation failed');
    mockGenerateSeed.mockRejectedValue(error);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(mockClearNotification).toHaveBeenCalled();
    expect(mockGenerateSeed).toHaveBeenCalledWith({ periodDays: 30 });
    expect(mockShowError).toHaveBeenCalledWith('予期せぬエラーが発生しました');
  });

  it('does not show error notification if already showing during failure', async () => {
    const error = new Error('Generation failed');
    mockGenerateSeed.mockRejectedValue(error);

    mockUseNotification.mockReturnValue({
      notification: { show: true, message: 'Existing', type: 'error' },
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      clearNotification: mockClearNotification
    });

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(mockShowError).not.toHaveBeenCalled();
  });
});