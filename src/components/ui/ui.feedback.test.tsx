import React from 'react';
import { memo } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Notification,
  LoadingOverlay
} from './index';

describe('UI Feedback Components', () => {
  describe('Notification', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
      mockOnClose.mockClear();
    });

    it('renders nothing when show is false', () => {
      const { container } = render(
        <Notification show={false} message="Test message" type="info" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders success notification', () => {
      render(
        <Notification show={true} message="Success message" type="success" />
      );
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-green-50');
    });

    it('renders error notification', () => {
      render(
        <Notification show={true} message="Error message" type="error" />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-red-50');
    });

    it('renders warning notification', () => {
      render(
        <Notification show={true} message="Warning message" type="warning" />
      );
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-yellow-50');
    });

    it('renders info notification', () => {
      render(
        <Notification show={true} message="Info message" type="info" />
      );
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-blue-50');
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <Notification
          show={true}
          message="Test message"
          type="info"
          onClose={mockOnClose}
        />
      );
      const closeButton = screen.getByText('閉じる');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not render close button when onClose is not provided', () => {
      render(
        <Notification show={true} message="Test message" type="info" />
      );
      expect(screen.queryByText('閉じる')).not.toBeInTheDocument();
    });

    it('renders with correct ARIA attributes', () => {
      render(
        <Notification show={true} message="Test message" type="info" />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('LoadingOverlay', () => {
    it('renders nothing when isLoading is false', () => {
      const { container } = render(<LoadingOverlay isLoading={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders overlay when isLoading is true', () => {
      render(<LoadingOverlay isLoading={true} />);
      expect(screen.getByText('データを生成中...')).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(
        <LoadingOverlay isLoading={true} message="Custom message" />
      );
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });
  });
});
