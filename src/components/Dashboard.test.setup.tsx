import { render, screen } from '@testing-library/react';
import { StatsData } from '@/schemas/api';
import { Dashboard } from './Dashboard';

global.fetch = jest.fn();

export const mockStats: StatsData = {
  overview: {
    count: 100,
    avgEmotion: 3.5
  },
  monthlyStats: [],
  dayOfWeekStats: [],
  emotionDistribution: [],
  timeOfDayStats: {
    morning: 3.2,
    afternoon: 3.8,
    evening: 3.5
  },
  studentStats: []
};

export const mockProps = {
  isGenerating: false,
  onGenerate: jest.fn(),
  notification: {
    show: false,
    message: '',
    type: 'info' as const
  }
};

export const renderDashboard = (props = mockProps) => {
  return render(<Dashboard {...props} />);
};

export const getByHeading = () => screen.getByRole('heading', { level: 1 });
export const getByButton = () => screen.getByRole('button');
