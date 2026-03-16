import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockData,
  createMockOnRetry,
  renderStatsDisplay
} from './StatsDisplay.test.setup';

describe('StatsDisplay - State Management', () => {
  let mockOnRetry: ReturnType<typeof createMockOnRetry>;

  beforeEach(() => {
    mockOnRetry = createMockOnRetry();
  });

  describe('loading state', () => {
    it('should render loading spinner when isLoading is true', () => {
      renderStatsDisplay({
        data: null,
        isLoading: true,
        error: null,
        onRetry: mockOnRetry,
        isDark: false
      });

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show data when loading', () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: true,
        error: null,
        onRetry: mockOnRetry,
        isDark: false
      });

      expect(screen.queryByText('総記録数')).not.toBeInTheDocument();
      expect(screen.queryByText('月別平均感情スコア')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should render error message when error exists', () => {
      const testError = new Error('Network error');
      renderStatsDisplay({
        data: null,
        isLoading: false,
        error: testError,
        onRetry: mockOnRetry,
        isDark: false
      });

      expect(screen.getByText('エラーが発生しました: Network error')).toBeInTheDocument();
    });

    it('should render retry button when error exists', () => {
      const testError = new Error('API error');
      renderStatsDisplay({
        data: null,
        isLoading: false,
        error: testError,
        onRetry: mockOnRetry,
        isDark: false
      });

      const retryButton = screen.getByText('再試行');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('px-4', 'py-2', 'bg-primary', 'text-white', 'rounded');
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const testError = new Error('Test error');
      renderStatsDisplay({
        data: null,
        isLoading: false,
        error: testError,
        onRetry: mockOnRetry,
        isDark: false
      });

      await user.click(screen.getByText('再試行'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('no data state', () => {
    it('should render message when data is null', () => {
      renderStatsDisplay({
        data: null,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false
      });

      expect(screen.getByText('データが見つかりません')).toBeInTheDocument();
    });
  });
});
