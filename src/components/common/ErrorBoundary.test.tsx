import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('displays error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('アプリケーションで予期せぬエラーが発生しました。')).toBeInTheDocument();
    expect(screen.getByText('ページを更新')).toBeInTheDocument();
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
  });

  test('reloads page when reload button is clicked', () => {
    const originalLocation = window.location;
    const mockLocation = {
      ...originalLocation,
      reload: jest.fn(),
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: mockLocation,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('ページを更新');
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    // Restore original location
    window.location = originalLocation;
  });

  test('logs error to console when error occurs', () => {
    const testError = new Error('Test error');
    const ThrowSpecificError = () => {
      throw testError;
    };

    render(
      <ErrorBoundary>
        <ThrowSpecificError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      testError,
      expect.any(Object)
    );
  });

  describe('development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('shows error details in development mode', () => {
      const testError = new Error('Test error with stack');
      testError.stack = 'Error: Test error with stack\n    at TestComponent';

      const ThrowErrorWithStack = () => {
        throw testError;
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithStack />
        </ErrorBoundary>
      );

      expect(screen.getByText('エラー詳細（開発モード）')).toBeInTheDocument();
    });
  });

  describe('production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('hides error details in production mode', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText('エラー詳細（開発モード）')).not.toBeInTheDocument();
    });
  });
});