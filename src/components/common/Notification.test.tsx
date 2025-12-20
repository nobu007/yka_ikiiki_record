import { render, screen, fireEvent } from '@testing-library/react';
import { Notification } from './Notification';

describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should not render when show is false', () => {
    render(
      <Notification
        show={false}
        message="Test message"
        type="success"
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('should render when show is true', () => {
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('should apply correct styles for success type', () => {
    render(
      <Notification
        show={true}
        message="Success message"
        type="success"
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  test('should apply correct styles for error type', () => {
    render(
      <Notification
        show={true}
        message="Error message"
        type="error"
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  test('should apply correct styles for warning type', () => {
    render(
      <Notification
        show={true}
        message="Warning message"
        type="warning"
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  test('should apply correct styles for info type', () => {
    render(
      <Notification
        show={true}
        message="Info message"
        type="info"
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  test('should call onClose when close button is clicked', () => {
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

  test('should not render close button when onClose is not provided', () => {
    render(
      <Notification
        show={true}
        message="Test message"
        type="success"
      />
    );

    expect(screen.queryByLabelText('通知を閉じる')).not.toBeInTheDocument();
  });

});