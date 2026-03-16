/**
 * ChartWrapper Accessibility Tests
 *
 * Tests ARIA labels, roles, and accessibility features
 * INV-TEST-001
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartWrapper from './ChartWrapper';
import { mockChildren } from './ChartWrapper.test.setup';

describe('ChartWrapper Accessibility (INV-TEST-001)', () => {
  it('should have proper aria-label for loading state', () => {
    render(
      <ChartWrapper isLoading={true}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('status', { ariaLabel: 'グラフローディング中' })).toBeInTheDocument();
  });

  it('should have proper aria-label for error state', () => {
    const error = new Error('Test error');
    render(
      <ChartWrapper error={error}>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('alert', { ariaLabel: 'グラフエラー' })).toBeInTheDocument();
  });

  it('should have proper aria-label for chart region with title', () => {
    render(
      <ChartWrapper title="Test Chart">
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('region', { ariaLabel: 'Test Chart' })).toBeInTheDocument();
  });

  it('should have proper aria-label for chart region without title', () => {
    render(
      <ChartWrapper>
        {mockChildren}
      </ChartWrapper>
    );

    expect(screen.getByRole('region', { ariaLabel: '統計グラフ' })).toBeInTheDocument();
  });

  it('should have proper heading id linked to region', () => {
    render(
      <ChartWrapper title="Test Chart">
        {mockChildren}
      </ChartWrapper>
    );

    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('id', 'chart-Test-Chart-title');
  });
});
