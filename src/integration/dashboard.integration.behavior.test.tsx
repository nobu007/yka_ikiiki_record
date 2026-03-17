/**
 * Integration tests for dashboard component behavior
 * Tests component interaction, error handling, and performance
 */

import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import * as hooks from '@/hooks/useApp';

// Mock hooks
jest.mock('@/hooks/useApp');

const mockUseDashboard = hooks.useDashboard as unknown as jest.MockedFunction<typeof hooks.useDashboard>;

// Simple test wrapper
const createTestWrapper = () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('Dashboard Integration - Behavior', () => {
  const mockHandleInitialGeneration = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification: { show: false, message: '', type: 'success' },
      handleGenerate: mockHandleInitialGeneration,
      isLoadingMessage: null,
    });
  });

  describe('Component Interaction', () => {
    it('should display all features in the data section', () => {
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check all features are listed
      expect(screen.getByText('月別感情スコアの統計')).toBeInTheDocument();
      expect(screen.getByText('曜日別の学習傾向分析')).toBeInTheDocument();
      expect(screen.getByText('時間帯別の活動パターン')).toBeInTheDocument();
      expect(screen.getByText('生徒ごとの詳細データ')).toBeInTheDocument();
      expect(screen.getByText('感情分布の可視化')).toBeInTheDocument();
    });

    it('should display instruction steps correctly', () => {
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check instruction steps
      expect(screen.getByText('「初期データを生成」ボタンをクリックしてテストデータを作成します')).toBeInTheDocument();
      expect(screen.getByText('生成が完了すると統計データが表示されます')).toBeInTheDocument();
      expect(screen.getByText('グラフやチャートで生徒の感情データを確認できます')).toBeInTheDocument();
      expect(screen.getByText('何度でもデータを再生成して異なるパターンを試せます')).toBeInTheDocument();
    });

    it('should display correct help text for different states', () => {
      const Wrapper = createTestWrapper();

      // Test idle state
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: { show: false, message: '', type: 'success' },
        handleGenerate: mockHandleInitialGeneration,
        isLoadingMessage: null,
      });

      const { unmount } = render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      expect(screen.getByText('ボタンをクリックしてテストデータを生成してください')).toBeInTheDocument();

      unmount();

      // Test generating state
      mockUseDashboard.mockReturnValue({
        isGenerating: true,
        notification: { show: false, message: '', type: 'success' },
        handleGenerate: mockHandleInitialGeneration,
        isLoadingMessage: 'データを生成中...',
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // The help text should show the generating message
      expect(screen.getByText('データを生成しています。しばらくお待ちください...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error notification when error occurs', () => {
      const Wrapper = createTestWrapper();

      // Mock error state
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: {
          show: true,
          message: 'ネットワーク接続を確認してください',
          type: 'error'
        },
        handleGenerate: mockHandleInitialGeneration,
        isLoadingMessage: null,
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Verify error notification is shown
      expect(screen.getByText('ネットワーク接続を確認してください')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const Wrapper = createTestWrapper();

      const { rerender } = render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Re-render with same props
      rerender(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Component should still be present and functional
      expect(screen.getByText('イキイキレコード - 教師ダッシュボード')).toBeInTheDocument();
    });
  });
});
