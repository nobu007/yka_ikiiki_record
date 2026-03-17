/**
 * Integration tests for dashboard data flow
 * Tests the complete flow from user action to data display
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('Dashboard Integration - Data Flow', () => {
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
      expect(screen.getByText('データ生成')).toBeInTheDocument();
      expect(screen.getByText('使い方')).toBeInTheDocument();
    });

    it('should handle data generation flow successfully', async () => {
      const Wrapper = createTestWrapper();

      // Mock successful generation
      mockHandleInitialGeneration.mockResolvedValue(undefined);
      mockUseDashboard.mockReturnValue({
        isGenerating: false,
        notification: { show: false, message: '', type: 'success' },
        handleGenerate: mockHandleInitialGeneration,
        isLoadingMessage: null,
      });

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      );

      // Click generate button within act
      await act(async () => {
        const generateButton = screen.getByText('初期データを生成');
        fireEvent.click(generateButton);
      });

      // Verify handler was called
      expect(mockHandleInitialGeneration).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during generation', () => {
      const Wrapper = createTestWrapper();

      // Mock loading state
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

      // Check loading overlay is present
      expect(screen.getByText('データを生成中...')).toBeInTheDocument();

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
        handleGenerate: mockHandleInitialGeneration,
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
        handleGenerate: mockHandleInitialGeneration,
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
});
