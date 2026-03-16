/**
 * ChartWrapper Error State Tests
 *
 * Tests error display behavior and error state priority
 * INV-TEST-001
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartWrapper from './ChartWrapper';
import { mockChildren } from './ChartWrapper.test.setup';

describe('ChartWrapper Error State (INV-TEST-001)', () => {
  it('should display error message when error is provided', () => {
    const error = new Error('Test error message');
    render(
      <ChartWrapper error={error}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('alert')).toHaveAttribute('aria-label', 'グラフエラー');
    expect(screen.getByText(/グラフの表示中にエラーが発生しました: Test error message/)).toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  it('should display error message with custom error', () => {
    const error = new Error('Custom error');
    render(
      <ChartWrapper error={error}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByText(/Custom error/)).toBeInTheDocument();
  });

  it('should not display error when error is null', () => {
    render(
      <ChartWrapper error={null}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('should not display error when error is undefined', () => {
    render(
      <ChartWrapper>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('should prioritize error state over children when not loading', () => {
    const error = new Error('Test error');
    render(
      <ChartWrapper isLoading={false} error={error}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });
});
