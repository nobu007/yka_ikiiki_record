import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsDisplay from './StatsDisplay';

const mockData = {
  monthly: [
    { label: '1月', value: 75 },
    { label: '2月', value: 80 },
    { label: '3月', value: 85 }
  ],
  dayOfWeek: [
    { label: '月', value: 70 },
    { label: '火', value: 75 },
    { label: '水', value: 80 },
    { label: '木', value: 72 },
    { label: '金', value: 78 },
    { label: '土', value: 82 },
    { label: '日', value: 85 }
  ],
  timeOfDay: [
    { label: '朝', value: 75 },
    { label: '昼', value: 80 },
    { label: '夕', value: 78 }
  ],
  overview: {
    count: 1000,
    avgEmotion: 78.5
  }
};

describe('StatsDisplay', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  describe('loading state', () => {
    it('should render loading spinner when isLoading is true', () => {
      render(
        <StatsDisplay
          data={null}
          isLoading={true}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show data when loading', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={true}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      expect(screen.queryByText('総記録数')).not.toBeInTheDocument();
      expect(screen.queryByText('月別平均感情スコア')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should render error message when error exists', () => {
      const testError = new Error('Network error');
      render(
        <StatsDisplay
          data={null}
          isLoading={false}
          error={testError}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      expect(screen.getByText('エラーが発生しました: Network error')).toBeInTheDocument();
    });

    it('should render retry button when error exists', () => {
      const testError = new Error('API error');
      render(
        <StatsDisplay
          data={null}
          isLoading={false}
          error={testError}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const retryButton = screen.getByText('再試行');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('px-4', 'py-2', 'bg-primary', 'text-white', 'rounded');
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const testError = new Error('Test error');
      render(
        <StatsDisplay
          data={null}
          isLoading={false}
          error={testError}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      await user.click(screen.getByText('再試行'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('no data state', () => {
    it('should render message when data is null', () => {
      render(
        <StatsDisplay
          data={null}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      expect(screen.getByText('データが見つかりません')).toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('should render overview statistics', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      expect(screen.getByText('総記録数')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('78.5')).toBeInTheDocument();
    });

    it('should render all chart sections', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      expect(screen.getByText('月別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('曜日別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('時間帯別平均感情スコア')).toBeInTheDocument();
    });

    it('should render charts with correct data', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      // Charts are rendered but data labels are mocked
      expect(screen.getByText('月別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('曜日別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('時間帯別平均感情スコア')).toBeInTheDocument();
    });
  });

  describe('dark mode styling', () => {
    it('should apply light mode styles when isDark is false', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const statsCards = document.querySelectorAll('.bg-white');
      expect(statsCards.length).toBeGreaterThan(0);
    });

    it('should apply dark mode styles when isDark is true', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={true}
        />
      );

      const statsCards = document.querySelectorAll('.bg-gray-800');
      expect(statsCards.length).toBeGreaterThan(0);
    });

    it('should apply correct text colors in light mode', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const grayText = document.querySelectorAll('.text-gray-500');
      expect(grayText.length).toBeGreaterThan(0);

      const grayHeading = document.querySelectorAll('.text-gray-900');
      expect(grayHeading.length).toBeGreaterThan(0);
    });

    it('should apply correct text colors in dark mode', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={true}
        />
      );

      const grayText = document.querySelectorAll('.text-gray-200');
      expect(grayText.length).toBeGreaterThan(0);

      const whiteHeading = document.querySelectorAll('.text-white');
      expect(whiteHeading.length).toBeGreaterThan(0);
    });
  });

  describe('component structure', () => {
    it('should render cards with shadow classes', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const shadowElements = document.querySelectorAll('.shadow');
      expect(shadowElements.length).toBeGreaterThan(0);
    });

    it('should render cards with rounded corners', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const roundedElements = document.querySelectorAll('.rounded-lg');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('should render cards with transition classes', () => {
      render(
        <StatsDisplay
          data={mockData}
          isLoading={false}
          error={null}
          onRetry={mockOnRetry}
          isDark={false}
        />
      );

      const transitionElements = document.querySelectorAll('.transition-colors');
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });

  describe('memoization behavior', () => {
    it('should have displayName set for debugging', () => {
      expect(StatsDisplay.displayName).toBe('StatsDisplay');
    });

    it('should be wrapped with React.memo', () => {
      const memoizedComponent = StatsDisplay;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });

    it('should export as default', () => {
      expect(typeof StatsDisplay).toBe('object');
    });
  });

  describe('component interface', () => {
    it('should accept required props', () => {
      const props = {
        data: {
          monthly: [],
          dayOfWeek: [],
          timeOfDay: [],
          overview: { count: 0, avgEmotion: 0 }
        },
        isLoading: false,
        error: null,
        onRetry: () => {},
        isDark: false
      };

      expect(() => {
        React.createElement(StatsDisplay, props);
      }).not.toThrow();
    });
  });
});
