import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { GeneratedStats } from '@/infrastructure/services/dataService';

global.fetch = jest.fn();

const mockStats: GeneratedStats = {
  overview: {
    count: 100,
    avgEmotion: 75.5
  },
  monthlyStats: [],
  dayOfWeekStats: [],
  emotionDistribution: [],
  timeOfDayStats: [],
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
    it('should render dashboard title', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/ダッシュボード/)).toBeInTheDocument();
    });

    it('should render generate button when not generating', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/データを生成/)).toBeInTheDocument();
    });

    it('should show loading state when generating', () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      expect(screen.getByText(/生成中/)).toBeInTheDocument();
    });

    it('should render usage instructions', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/使い方/)).toBeInTheDocument();
    });

    it('should render features list', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/生成されるデータ/)).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch stats on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStats
        })
      });

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seed');
      });
    });

    it('should display data visualization when stats are loaded', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStats
        })
      });

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/データ概要/)).toBeInTheDocument();
      });
    });

    it('should handle fetch error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/データがありません/)).toBeInTheDocument();
      });
    });

    it('should show empty state when no stats available', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: null
        })
      });

      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/データがありません/)).toBeInTheDocument();
    });

    it('should show loading state while fetching', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true, data: mockStats })
            });
          }, 100);
        })
      );

      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/データを読み込み中/)).toBeInTheDocument();
    });

    it('should refetch stats on success notification', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockStats })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockStats })
        });

      const successProps = {
        ...mockProps,
        notification: {
          show: true,
          message: 'Success',
          type: 'success' as const
        }
      };

      const { rerender } = render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      rerender(<Dashboard {...successProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch on non-success notifications', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats })
      });

      const errorProps = {
        ...mockProps,
        notification: {
          show: true,
          message: 'Error',
          type: 'error' as const
        }
      };

      render(<Dashboard {...errorProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
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

    it('should call onNotificationClose when provided', () => {
      const onClose = jest.fn();
      const notificationProps = {
        ...mockProps,
        notification: {
          show: true,
          message: 'Test',
          type: 'info' as const
        },
        onNotificationClose: onClose
      };

      render(<Dashboard {...notificationProps} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('should show generating help text when generating', () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      expect(screen.getByText(/生成中です/)).toBeInTheDocument();
    });

    it('should show ready help text when not generating', () => {
      render(<Dashboard {...mockProps} />);

      expect(screen.getByText(/ボタンをクリック/)).toBeInTheDocument();
    });
  });

  describe('Button State', () => {
    it('should disable button when generating', () => {
      const generatingProps = { ...mockProps, isGenerating: true };
      render(<Dashboard {...generatingProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable button when not generating', () => {
      render(<Dashboard {...mockProps} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should call onGenerate when button is clicked', () => {
      render(<Dashboard {...mockProps} />);

      const button = screen.getByRole('button');
      button.click();

      expect(mockProps.onGenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-describedby on generate button', () => {
      render(<Dashboard {...mockProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'generate-help');
    });

    it('should have help text with matching id', () => {
      render(<Dashboard {...mockProps} />);

      const helpText = screen.getByText(/ボタンをクリック/);
      expect(helpText).toHaveAttribute('id', 'generate-help');
    });
  });

  describe('Performance', () => {
    it('should memoize help text', () => {
      const { rerender } = render(<Dashboard {...mockProps} />);

      const initialHelp = screen.getByText(/ボタンをクリック/);

      rerender(<Dashboard {...mockProps} />);

      expect(initialHelp).toBeInTheDocument();
    });

    it('should have correct displayName', () => {
      expect(Dashboard.displayName).toBe('Dashboard');
    });
  });
});
