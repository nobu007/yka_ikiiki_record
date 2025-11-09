import { renderHook, act } from '@testing-library/react';
import { useNotification } from './useNotification';

describe('useNotification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initial state should be correct', () => {
    const { result } = renderHook(() => useNotification());

    expect(result.current.notification.show).toBe(false);
    expect(result.current.notification.message).toBe('');
    expect(result.current.notification.type).toBe('success');
    expect(typeof result.current.showSuccess).toBe('function');
    expect(typeof result.current.showError).toBe('function');
    expect(typeof result.current.hideNotification).toBe('function');
  });

  test('showSuccess should display success notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.message).toBe('Success message');
    expect(result.current.notification.type).toBe('success');
  });

  test('showError should display error notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showError('Error message');
    });

    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.message).toBe('Error message');
    expect(result.current.notification.type).toBe('error');
  });

  test('hideNotification should hide notification', () => {
    const { result } = renderHook(() => useNotification());

    // Show notification first
    act(() => {
      result.current.showSuccess('Test message');
    });

    expect(result.current.notification.show).toBe(true);

    // Hide notification
    act(() => {
      result.current.hideNotification();
    });

    expect(result.current.notification.show).toBe(false);
  });

  test('success notification should auto-hide after 3 seconds', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showSuccess('Auto-hide message');
    });

    expect(result.current.notification.show).toBe(true);

    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.notification.show).toBe(false);
  });

  test('error notification should auto-hide after 5 seconds', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showError('Error message');
    });

    expect(result.current.notification.show).toBe(true);

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.notification.show).toBe(false);
  });

  test('should handle rapid successive notifications', () => {
    const { result } = renderHook(() => useNotification());

    // Show multiple notifications rapidly
    act(() => {
      result.current.showSuccess('Message 1');
    });

    act(() => {
      result.current.showError('Message 2');
    });

    act(() => {
      result.current.showSuccess('Message 3');
    });

    expect(result.current.notification.message).toBe('Message 3');
    expect(result.current.notification.type).toBe('success');

    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.notification.show).toBe(false);
  });
});