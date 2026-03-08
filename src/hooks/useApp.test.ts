import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotification, useDashboard } from './useApp';
import { MESSAGES } from '@/lib/config';

global.fetch = jest.fn();

describe('useApp Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useNotification', () => {
    it('should initialize with default notification state', () => {
      const { result } = renderHook(() => useNotification());

      expect(result.current.notification).toEqual({
        show: false,
        message: '',
        type: 'info'
      });
    });

    it('should show success notification', () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification('Success message', 'success');
      });

      expect(result.current.notification).toEqual({
        show: true,
        message: 'Success message',
        type: 'success'
      });
    });

    it('should show error notification', () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification('Error message', 'error');
      });

      expect(result.current.notification).toEqual({
        show: true,
        message: 'Error message',
        type: 'error'
      });
    });

    it('should show warning notification', () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification('Warning message', 'warning');
      });

      expect(result.current.notification).toEqual({
        show: true,
        message: 'Warning message',
        type: 'warning'
      });
    });

    it('should show info notification with default type', () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification('Info message');
      });

      expect(result.current.notification).toEqual({
        show: true,
        message: 'Info message',
        type: 'info'
      });
    });

    it('should clear notification', () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification('Test message', 'info');
      });

      expect(result.current.notification.show).toBe(true);

      act(() => {
        result.current.clearNotification();
      });

      expect(result.current.notification.show).toBe(false);
      expect(result.current.notification.message).toBe('Test message');
      expect(result.current.notification.type).toBe('info');
    });

    it('should override existing notification', () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification('First message', 'info');
      });

      act(() => {
        result.current.showNotification('Second message', 'error');
      });

      expect(result.current.notification).toEqual({
        show: true,
        message: 'Second message',
        type: 'error'
      });
    });
  });

  describe('useDashboard', () => {
    const mockSuccessResponse = {
      success: true,
      data: {
        overview: { count: 100, avgEmotion: 75.5 },
        monthlyStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [],
        timeOfDayStats: [],
        studentStats: []
      }
    };

    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDashboard());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification).toEqual({
        show: false,
        message: '',
        type: 'info'
      });
      expect(result.current.isLoadingMessage).toBeNull();
    });

    it('should handle successful data generation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockSuccessResponse
      });

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification).toEqual({
        show: true,
        message: MESSAGES.success.dataGeneration,
        type: 'success'
      });
      expect(result.current.isLoadingMessage).toBeNull();
    });

    it('should handle API error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification.show).toBe(true);
      expect(result.current.notification.type).toBe('error');
      expect(result.current.isLoadingMessage).toBeNull();
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification.show).toBe(true);
      expect(result.current.notification.type).toBe('error');
      expect(result.current.isLoadingMessage).toBeNull();
    });

    it('should handle validation error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ invalid: 'data' })
      });

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification.type).toBe('error');
    });

    it('should handle API response with success:false', async () => {
      const errorResponse = {
        success: false,
        error: 'Generation failed'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => errorResponse
      });

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification.type).toBe('error');
    });

    it('should show loading message during generation', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
              json: async () => mockSuccessResponse
            });
          }, 100);
        })
      );

      const { result } = renderHook(() => useDashboard());

      act(() => {
        result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(true);
      expect(result.current.isLoadingMessage).toBe(MESSAGES.loading.generating);

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('should clear notification before starting generation', async () => {
      const { result } = renderHook(() => useDashboard());

      act(() => {
        result.current.notification = { show: true, message: 'Previous message', type: 'info' };
      });

      expect(result.current.notification.show).toBe(true);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockSuccessResponse
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('should send correct request payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockSuccessResponse
      });

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/seed'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"config"')
        })
      );
    });

    it('should handle 404 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification.type).toBe('error');
    });

    it('should handle timeout error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Request timeout')
      );

      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.notification.type).toBe('error');
    });
  });
});
