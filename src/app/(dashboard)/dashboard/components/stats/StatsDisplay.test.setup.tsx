import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsDisplay from './StatsDisplay';

export const mockData = {
  monthly: [
    { name: '1月', value: 75 },
    { name: '2月', value: 80 },
    { name: '3月', value: 85 }
  ],
  dayOfWeek: [
    { name: '月', value: 70 },
    { name: '火', value: 75 },
    { name: '水', value: 80 },
    { name: '木', value: 72 },
    { name: '金', value: 78 },
    { name: '土', value: 82 },
    { name: '日', value: 85 }
  ],
  timeOfDay: [
    { name: '朝', value: 75 },
    { name: '昼', value: 80 },
    { name: '夕', value: 78 }
  ],
  overview: {
    count: 1000,
    avgEmotion: 78.5
  }
};

export const createMockOnRetry = () => {
  const mockOnRetry = jest.fn();
  return mockOnRetry;
};

export const renderStatsDisplay = (props: Partial<{
  data: typeof mockData | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isDark: boolean;
}> = {}) => {
  const defaultProps = {
    data: null,
    isLoading: false,
    error: null,
    onRetry: jest.fn(),
    isDark: false,
    ...props
  };

  return render(
    <StatsDisplay {...defaultProps} />
  );
};

export { userEvent, screen, StatsDisplay };
