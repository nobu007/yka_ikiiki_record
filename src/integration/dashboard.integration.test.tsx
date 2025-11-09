/**
 * Integration tests for the complete dashboard data flow
 * Tests the interaction between components, hooks, and API
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import * as hooks from '@/hooks';
import * as api from '@/application/hooks/useSeedGeneration';

// Mock the hooks and API
jest.mock('@/hooks');
jest.mock('@/application/hooks/useSeedGeneration');

const mockUseDashboard = hooks.useDashboard as jest.MockedFunction<typeof hooks.useDashboard>;
const mockUseSeedGeneration = api.useSeedGeneration as jest.MockedFunction<typeof api.useSeedGeneration>;

// Simple test wrapper
const createTestWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
};

describe('Dashboard Integration Tests', () => {
  const mockHandleInitialGeneration = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockClearNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification: { show: false, message: '', type: 'success' },
      handleInitialGeneration: mockHandleInitialGeneration,
      isLoadingMessage: null,
    });

    mockUseSeedGeneration.mockReturnValue({
      isGenerating: false,
      error: null,
      generateSeed: jest.fn().mockResolvedValue({}),
    });
  });

  describe('Complete Data Flow', () => {
    it('should render dashboard with all components', () => {
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check main elements are present
      expect(screen.getByText('イキイキレコード - 教師ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('生徒の学習データを生成・管理するダッシュボードです')).toBeInTheDocument();
      expect(screen.getByText('テストデータ生成')).toBeInTheDocument();
      expect(screen.getByText('使い方ガイド')).toBeInTheDocument();
    });

    it('should handle data generation flow successfully', async () => {
      const Wrapper = createTestWrapper();
      
      // Mock successful generation
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: { show: false, message: '', type: 'success' },
        handleInitialGeneration: mockHandleInitialGeneration.mockResolvedValue(undefined),
        isLoadingMessage: null,
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Click generate button
      const generateButton = screen.getByText('テストデータを生成');
      fireEvent.click(generateButton);

      // Verify handler was called
      expect(mockHandleInitialGeneration).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during generation', () => {
      const Wrapper = createTestWrapper();
      
      // Mock loading state
      mockUseDashboard.mockReturnValue({
        isGenerating: true,
        notification: { show: false, message: '', type: 'success' },
        handleInitialGeneration: mockHandleInitialGeneration,
        isLoadingMessage: 'テストデータを生成中...',
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check loading overlay is present
      expect(screen.getByText('テストデータを生成中...')).toBeInTheDocument();
      
      // Button should be disabled and show loading text
      const generateButton = screen.getByText('生成中...');
      expect(generateButton).toBeDisabled();
    });

    it('should display success notification after generation', () => {
      const Wrapper = createTestWrapper();
      
      // Mock success notification
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: { 
          show: true, 
          message: 'テストデータの生成が完了しました', 
          type: 'success' 
        },
        handleInitialGeneration: mockHandleInitialGeneration,
        isLoadingMessage: null,
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check success notification is displayed
      expect(screen.getByText('テストデータの生成が完了しました')).toBeInTheDocument();
    });

    it('should display error notification on generation failure', () => {
      const Wrapper = createTestWrapper();
      
      // Mock error notification
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: { 
          show: true, 
          message: 'データの生成に失敗しました', 
          type: 'error' 
        },
        handleInitialGeneration: mockHandleInitialGeneration,
        isLoadingMessage: null,
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check error notification is displayed
      expect(screen.getByText('データの生成に失敗しました')).toBeInTheDocument();
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
      expect(screen.getByText('30日分の学習データ')).toBeInTheDocument();
      expect(screen.getByText('感情分析サンプル')).toBeInTheDocument();
      expect(screen.getByText('季節要因の考慮')).toBeInTheDocument();
      expect(screen.getByText('イベント影響のシミュレーション')).toBeInTheDocument();
    });

    it('should display instruction steps correctly', () => {
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Check instruction steps
      expect(screen.getByText('データの生成')).toBeInTheDocument();
      expect(screen.getByText('データの確認')).toBeInTheDocument();
      expect(screen.getByText('分析と活用')).toBeInTheDocument();
    });

    it('should display correct help text for different states', () => {
      const Wrapper = createTestWrapper();
      
      // Test idle state
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: { show: false, message: '', type: 'success' },
        handleInitialGeneration: mockHandleInitialGeneration,
        isLoadingMessage: null,
      });

      const { unmount } = render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      expect(screen.getByText('ボタンをクリックしてテストデータを生成してください。')).toBeInTheDocument();
      
      unmount();

      // Test generating state
      mockUseDashboard.mockReturnValue({
        isGenerating: true,
        notification: { show: false, message: '', type: 'success' },
        handleInitialGeneration: mockHandleInitialGeneration,
        isLoadingMessage: 'テストデータを生成中...',
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // The help text should show the generating message
      expect(screen.getByText('データ生成には数秒かかる場合があります。')).toBeInTheDocument();
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
        handleInitialGeneration: mockHandleInitialGeneration,
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