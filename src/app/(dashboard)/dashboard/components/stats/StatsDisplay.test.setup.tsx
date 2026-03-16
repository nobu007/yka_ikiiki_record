import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsDisplay from './StatsDisplay';

export const mockData = {
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
