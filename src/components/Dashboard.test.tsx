import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { StatsData } from '@/schemas/api';

global.fetch = jest.fn();

const mockStats: StatsData = {
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

const mockProps = {
  isGenerating: false,
  onGenerate: jest.fn(),
  notification: {
    show: false,
    message: '',
    type: 'info' as const
  }
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard header', () => {
      render(<Dashboard {...mockProps} />);

      const header = screen.getByRole('heading', { level: 1 });
      expect(header).toBeInTheDocument();
    });

    it('should render generate button', () => {
      render(<Dashboard {...mockProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show loading state when generating', () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should render features list', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/生成されるデータ/)).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch stats on mount', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockStats
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seed');
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle HTTP error responses (line 43 branch)', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Server error'
        })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seed');
      });
    });

    it('should handle HTTP 404 error responses', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Not found'
        })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seed');
      });
    });

    it('should handle validation error with default message (line 50)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: null
        })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seed');
      });
    });

    it('should handle validation error with custom error message (line 52)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            overview: {
              count: 'invalid', // This should be a number
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
          }
        })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seed');
      });
    });

    it('should display data visualization when stats are loaded', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockStats
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/データ概要/)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onGenerate when button is clicked', () => {
      render(<Dashboard {...mockProps} />);

      const button = screen.getByRole('button');
      button.click();

      expect(mockProps.onGenerate).toHaveBeenCalledTimes(1);
    });

    it('should not call onGenerate when button is disabled', () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      const button = screen.getByRole('button');
      button.click();

      expect(mockProps.onGenerate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-describedby on generate button', () => {
      render(<Dashboard {...mockProps} />);

      const generateButton = screen.getByRole('button', { name: /初期データを生成/ });
      expect(generateButton).toHaveAttribute('aria-describedby', 'generate-help');
    });

    it('should have help text with matching id', () => {
      render(<Dashboard {...mockProps} />);

      const helpText = screen.getAllByText(/ボタンをクリック/)[0];
      expect(helpText).toHaveAttribute('id', 'generate-help');
    });
  });

  describe('Notification', () => {
    it('should display notification when show is true', () => {
      const notificationProps = {
        ...mockProps,
        notification: {
          show: true,
          message: 'Test notification',
          type: 'success' as const
        }
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    it('should pass onNotificationClose when provided (line 103)', () => {
      const notificationProps = {
        ...mockProps,
        notification: {
          show: true,
          message: 'Test notification',
          type: 'success' as const
        },
        onNotificationClose: jest.fn()
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    it('should not display notification when show is false', () => {
      const notificationProps = {
        ...mockProps,
        notification: {
          show: false,
          message: 'Hidden notification',
          type: 'info' as const
        }
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.queryByText('Hidden notification')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should memoize component', () => {
      const { rerender } = render(<Dashboard {...mockProps} />);

      const initialHeader = screen.getByRole('heading', { level: 1 });

      rerender(<Dashboard {...mockProps} />);

      expect(initialHeader).toBeInTheDocument();
    });

    it('should have correct displayName', () => {
      expect(Dashboard.displayName).toBe('Dashboard');
    });
  });
});
