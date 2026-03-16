/**
 * ChartWrapper Loading State Tests
 *
 * Tests loading spinner behavior and loading state priority
 * INV-TEST-001
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartWrapper from './ChartWrapper';
import { mockChildren } from './ChartWrapper.test.setup';

describe('ChartWrapper Loading State (INV-TEST-001)', () => {
  it('should display loading spinner when isLoading is true', () => {
    render(
      <ChartWrapper isLoading={true}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'グラフローディング中');
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  it('should not display loading spinner when isLoading is false', () => {
    render(
      <ChartWrapper isLoading={false}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.queryByRole('status', { ariaLabel: 'グラフローディング中' })).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('should not display loading spinner when isLoading is undefined', () => {
    render(
      <ChartWrapper>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.queryByRole('status', { ariaLabel: 'グラフローディング中' })).not.toBeInTheDocument();
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('should prioritize loading state over error state', () => {
    const error = new Error('Test error');
    render(
      <ChartWrapper isLoading={true} error={error}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('status', { ariaLabel: 'グラフローディング中' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
