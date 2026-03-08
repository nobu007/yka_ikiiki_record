import { renderHook, act } from '@testing-library/react';
import { useNotification } from './useApp';

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
