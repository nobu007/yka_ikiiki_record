import React from 'react';
import { memo } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './index';

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
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('再読み込み');
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);

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
