import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Notification } from './Notification';

describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not render when show is false', () => {
    render(
      <Notification
        show={false}
        message="Test message"
        type="success"
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders success notification correctly', () => {
    render(
      <Notification
        show={true}
        message="Success message"
        type="success"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-label', '成功');
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  test('renders error notification correctly', () => {
    render(
      <Notification
        show={true}
        message="Error message"
        type="error"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-label', 'エラー');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test('renders warning notification correctly', () => {
    render(
      <Notification
        show={true}
        message="Warning message"
        type="warning"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-label', '警告');
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  test('renders info notification correctly', () => {
    render(
      <Notification
        show={true}
        message="Info message"
        type="info"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-label', '情報');
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('通知を閉じる');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not show close button when onClose is not provided', () => {
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
      />
    );

    expect(screen.queryByLabelText('通知を閉じる')).not.toBeInTheDocument();
  });

  test('auto-closes after specified duration when autoClose is true', async () => {
    const mockOnClose = jest.fn();
    
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
        onClose={mockOnClose}
        autoClose={true}
        duration={1000}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('does not auto-close when autoClose is false', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
        onClose={mockOnClose}
        autoClose={false}
        duration={1000}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    jest.advanceTimersByTime(1000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('clears timeout on unmount', () => {
    const mockOnClose = jest.fn();
    const { unmount } = render(
      <Notification
        show={true}
        message="Test message"
        type="success"
        onClose={mockOnClose}
        autoClose={true}
        duration={1000}
      />
    );

    unmount();

    jest.advanceTimersByTime(1000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('applies correct CSS classes for different types', () => {
    const { rerender } = render(
      <Notification
        show={true}
        message="Test message"
        type="success"
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');

    rerender(
      <Notification
        show={true}
        message="Test message"
        type="error"
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');

    rerender(
      <Notification
        show={true}
        message="Test message"
        type="warning"
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');

    rerender(
      <Notification
        show={true}
        message="Test message"
        type="info"
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  test('handles long messages with proper text wrapping', () => {
    const longMessage = 'This is a very long message that should wrap properly when displayed in the notification component to ensure it does not break the layout or overflow the container boundaries.';
    
    render(
      <Notification
        show={true}
        message={longMessage}
        type="info"
      />
    );

    const messageElement = screen.getByText(longMessage);
    expect(messageElement).toHaveClass('break-words');
  });

  test('close button has proper accessibility attributes', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('通知を閉じる');
    expect(closeButton).toHaveAttribute('type', 'button');
  });
});