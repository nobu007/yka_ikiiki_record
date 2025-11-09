import { renderHook, act } from '@testing-library/react';
import { useDashboard } from './useDashboard';

// Mock the notification hook
jest.mock('./useNotification', () => ({
  useNotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
    clearNotification: jest.fn(),
    hideNotification: jest.fn(),
    notification: { show: false, message: '', type: 'success' as const }
  })
}));

// Mock useSeedGeneration hook
jest.mock('../application/hooks/useSeedGeneration', () => ({
  useSeedGeneration: () => ({
    generateSeed: jest.fn().mockResolvedValue(undefined),
    isGenerating: false,
    error: null
  })
}));

describe('useDashboard', () => {
  test('initial state should be correct', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(false);
    expect(typeof result.current.handleInitialGeneration).toBe('function');
    expect(result.current.isLoadingMessage).toBe(null);
  });

  test('handleInitialGeneration should work without errors', async () => {
    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(result.current.isGenerating).toBe(false);
  });
});