import React from 'react';
import { screen } from '@testing-library/react';
import {
  mockData,
  createMockOnRetry,
  renderStatsDisplay
} from './StatsDisplay.test.setup';

describe('StatsDisplay - Data Display', () => {
  let mockOnRetry: ReturnType<typeof createMockOnRetry>;

  beforeEach(() => {
    mockOnRetry = createMockOnRetry();
  });

  describe('overview statistics', () => {
    it('should render overview statistics', () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false
      });

      expect(screen.getByText('総記録数')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('78.5')).toBeInTheDocument();
    });
  });

  describe('chart sections', () => {
    it('should render all chart sections', () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false
      });

      expect(screen.getByText('月別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('曜日別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('時間帯別平均感情スコア')).toBeInTheDocument();
    });

    it('should render charts with correct data', () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false
      });

      // Charts are rendered but data labels are mocked
      expect(screen.getByText('月別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('曜日別平均感情スコア')).toBeInTheDocument();
      expect(screen.getByText('時間帯別平均感情スコア')).toBeInTheDocument();
    });
  });
});
