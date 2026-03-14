import { renderHook, act } from '@testing-library/react';
import { useNotification, useDashboard } from './useApp';

// Mock fetch
global.fetch = jest.fn();

// Mock error handlers
jest.mock('@/lib/error-handler', () => ({
  normalizeError: jest.fn((error) => error),
  getUserFriendlyMessage: jest.fn((error) => (error as Error).message),
  logError: jest.fn(),
}));

// Mock validation - must be called before useDashboard is used
const mockValidateDataSafe = jest.fn((data) => [data, null]);
jest.mock('@/lib/api/validation', () => ({
  validateDataSafe: (...args: unknown[]) => mockValidateDataSafe(...args),
}));

describe('useNotification', () => {
  it('initializes with hidden notification', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.notification.show).toBe(false);
    expect(result.current.notification.message).toBe('');
    expect(result.current.notification.type).toBe('info');
  });

  it('shows notification with message and type', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification('Test message', 'success');
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.message).toBe('Test message');
    expect(result.current.notification.type).toBe('success');
  });

  it('shows notification with default type (info)', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification('Test message');
    });

    expect(result.current.notification.type).toBe('info');
  });

  it('clears notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showNotification('Test message', 'error');
    });

    expect(result.current.notification.show).toBe(true);

    act(() => {
      result.current.clearNotification();
    });

    expect(result.current.notification.show).toBe(false);
  });
});

describe('useDashboard', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockValidateDataSafe.mockClear();
    // Reset to default successful validation
    mockValidateDataSafe.mockImplementation((data) => [data, null]);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(false);
    expect(result.current.isLoadingMessage).toBeNull();
  });

  it('shows loading message while generating', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true, message: 'Generation successful' }),
            } as Response);
          }, 100);
        })
    );

    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleGenerate();
    });

    // Should show loading message
    expect(result.current.isLoadingMessage).toBe('データを生成中...');

    // Wait for async operation
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('shows success notification after successful generation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Generation successful' }),
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('success');
    expect(result.current.notification.message).toContain('データの生成が完了しました');
  });

  it('handles API errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('error');
  });

  it('handles validation errors', async () => {
    mockValidateDataSafe.mockReturnValue([null, new Error('Validation failed')]);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('error');
  });

  it('handles API response with success: false', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Generation failed' }),
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('error');
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe('error');
  });

  it('clears notification before new generation', async () => {
    // First, trigger an error
    mockFetch.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.notification.show).toBe(true);

    // Now trigger successful generation - notification should be updated
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Success' }),
    } as Response);

    await act(async () => {
      await result.current.handleGenerate();
    });

    // Should have success notification
    expect(result.current.notification.type).toBe('success');
  });

  it('resets isGenerating after successful generation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('resets isGenerating after failed generation', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
  });
});
