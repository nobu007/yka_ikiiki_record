/**
 * ChartWrapper Integration Tests
 *
 * Tests loading states, error states, dark mode, and rendering behavior
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartWrapper from './ChartWrapper';

describe('ChartWrapper Integration Tests (INV-TEST-001)', () => {
  const mockChildren = <div data-testid="chart-content">Test Chart</div>;

  describe('Loading State (INV-TEST-001)', () => {
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

  describe('Error State (INV-TEST-001)', () => {
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

  describe('Normal Rendering State (INV-TEST-001)', () => {
    it('should render children when not loading and no error', () => {
      render(
        <ChartWrapper isLoading={false} error={null}>
          {mockChildren}
        </ChartWrapper>
      );

      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
      expect(screen.queryByRole('status', { ariaLabel: 'グラフローディング中' })).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <ChartWrapper title="Test Chart Title">
          {mockChildren}
        </ChartWrapper>
      );

      expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
      expect(screen.getByRole('region', { ariaLabel: 'Test Chart Title' })).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      render(
        <ChartWrapper>
          {mockChildren}
        </ChartWrapper>
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByRole('region', { ariaLabel: '統計グラフ' })).toBeInTheDocument();
    });

    it('should render empty title as empty string', () => {
      render(
        <ChartWrapper title="">
          {mockChildren}
        </ChartWrapper>
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should sanitize title in chartId', () => {
      render(
        <ChartWrapper title="Test Chart With Spaces">
          {mockChildren}
        </ChartWrapper>
      );

      expect(screen.getByRole('region', { ariaLabel: 'Test Chart With Spaces' })).toBeInTheDocument();
    });

    it('should use default aria-label when title is not provided', () => {
      render(
        <ChartWrapper>
          {mockChildren}
        </ChartWrapper>
      );

      expect(screen.getByRole('region', { ariaLabel: '統計グラフ' })).toBeInTheDocument();
    });
  });

  describe('Dark Mode (INV-TEST-001)', () => {
    it('should apply dark mode styles when isDark is true', () => {
      const { container: _container } = render(
        <ChartWrapper isDark={true} title="Test Title">
          {mockChildren}
        </ChartWrapper>
      );

      const heading = screen.getByText('Test Title');
      expect(heading).toHaveClass('text-gray-100');
    });

    it('should apply light mode styles when isDark is false', () => {
      const { container: _container } = render(
        <ChartWrapper isDark={false} title="Test Title">
          {mockChildren}
        </ChartWrapper>
      );

      const heading = screen.getByText('Test Title');
      expect(heading).toHaveClass('text-gray-900');
    });

    it('should default to light mode when isDark is not provided', () => {
      const { container: _container } = render(
        <ChartWrapper title="Test Title">
          {mockChildren}
        </ChartWrapper>
      );

      const heading = screen.getByText('Test Title');
      expect(heading).toHaveClass('text-gray-900');
    });
  });

  describe('Height Customization (INV-TEST-001)', () => {
    it('should apply custom height when provided', () => {
      const { container } = render(
        <ChartWrapper height={500}>
          {mockChildren}
        </ChartWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.height).toBe('500px');
    });

    it('should use default height when not provided', () => {
      const { container } = render(
        <ChartWrapper>
          {mockChildren}
        </ChartWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.height).toBe('300px');
    });
  });

  describe('Accessibility (INV-TEST-001)', () => {
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

  describe('Children Rendering (INV-TEST-001)', () => {
    it('should render multiple children', () => {
      render(
        <ChartWrapper>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should render children in overflow-x-auto container', () => {
      const { container } = render(
        <ChartWrapper>
          {mockChildren}
        </ChartWrapper>
      );

      const overflowContainer = container.querySelector('.overflow-x-auto');
      expect(overflowContainer).toBeInTheDocument();
    });
  });

  describe('Memoization (INV-TEST-001)', () => {
    it('should have displayName for debugging', () => {
      expect(ChartWrapper.displayName).toBe('ChartWrapper');
    });
  });
});
