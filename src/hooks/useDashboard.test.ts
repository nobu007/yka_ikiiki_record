import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from './useApp';

// Mock fetch API
global.fetch = jest.fn();

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification).toEqual({ show: false, message: '', type: 'info' });
    expect(result.current.isLoadingMessage).toBe(null);
    expect(typeof result.current.handleGenerate).toBe('function');
  });

  it('shows loading message when generating', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      result.current.handleGenerate();
    });

    expect(result.current.isLoadingMessage).toBe('データを生成中...');
  });

  it('handles successful generation', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} })
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('success');
    expect(result.current.notification.message).toBe('テストデータの生成が完了しました');
  });

  it('handles generation failure', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('error');
    expect(result.current.notification.message).toBe('予期せぬエラーが発生しました');
  });
});