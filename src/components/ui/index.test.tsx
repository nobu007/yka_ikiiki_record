import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LoadingSpinner,
  CheckIcon,
  PlusIcon,
  NotificationIcon,
  Notification,
  LoadingOverlay,
  ErrorBoundary,
  Button
} from './index';

describe('UI Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default size (md) and color (blue)', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-6', 'h-6');
      expect(spinner).toHaveAttribute('aria-label', '読み込み中');
    });

    it('renders with small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with custom color', () => {
      const { container } = render(<LoadingSpinner color="green" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('border-t-green-500');
    });
  });

  describe('CheckIcon', () => {
    it('renders check icon', () => {
      const { container } = render(<CheckIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4', 'text-green-500');
    });
  });

  describe('PlusIcon', () => {
    it('renders plus icon', () => {
      const { container } = render(<PlusIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });
  });

  describe('NotificationIcon', () => {
    it('renders success icon', () => {
      const { container } = render(<NotificationIcon type="success" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-green-500');
    });

    it('renders error icon', () => {
      const { container } = render(<NotificationIcon type="error" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
    });

    it('renders warning icon', () => {
      const { container } = render(<NotificationIcon type="warning" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-500');
    });

    it('renders info icon', () => {
      const { container } = render(<NotificationIcon type="info" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });
  });

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
      expect(screen.queryByRole('alert')).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('renders error notification', () => {
      render(
        <Notification show={true} message="Error message" type="error" />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('renders warning notification', () => {
      render(
        <Notification show={true} message="Warning message" type="warning" />
      );
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('renders info notification', () => {
      render(
        <Notification show={true} message="Info message" type="info" />
      );
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-200');
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

  describe('ErrorBoundary', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    it('catches errors and renders error UI', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('ページを再読み込みしてください')).toBeInTheDocument();
      expect(screen.getByText('再読み込み')).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('reloads page when reload button is clicked', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      const originalLocation = window.location;
      delete (window as Partial<Window>).location;
      window.location = { ...originalLocation, reload: jest.fn() };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('再読み込み');
      fireEvent.click(reloadButton);

      expect(window.location.reload).toHaveBeenCalledTimes(1);

      window.location = originalLocation;
      consoleError.mockRestore();
    });

    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('renders primary button by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Click me');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders secondary button variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Secondary');
    });

    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders submit button type', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
});
