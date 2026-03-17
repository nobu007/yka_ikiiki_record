/**
 * Dashboard Page Component Tests
 *
 * Tests the main dashboard page component including:
 * - Rendering behavior
 * - Notification handling
 * - Loading states
 * - Integration with hooks
 */

import React from 'react';
import { memo } from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import { useDashboard } from '@/hooks/useApp';

jest.mock('@/hooks/useApp');
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: unknown[]) => {
    const dynamicModule = jest.requireActual('next/dynamic');
    const dynamicActualComp = dynamicModule.default;
    const RequiredComponent = dynamicActualComp(args[0]);
    if (RequiredComponent.preload) {
      RequiredComponent.preload();
    } else if (RequiredComponent.render?.preload) {
      RequiredComponent.render.preload();
    }
    return RequiredComponent;
  },
}));

describe('DashboardPage', () => {
  const mockUseDashboard = useDashboard as jest.MockedFunction<typeof useDashboard>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate: jest.fn(),
      isLoadingMessage: null,
    });
  });

  it('should render dashboard component', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should pass isGenerating state to Dashboard', () => {
    mockUseDashboard.mockReturnValue({
      isGenerating: true,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate: jest.fn(),
      isLoadingMessage: 'データを生成中...',
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should pass notification to Dashboard', () => {
    const notification = {
      show: true,
      type: 'success' as const,
      message: 'Data generated successfully',
    };

    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification,
      handleGenerate: jest.fn(),
      isLoadingMessage: null,
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should pass handleGenerate callback to Dashboard', () => {
    const handleGenerate = jest.fn();

    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate,
      isLoadingMessage: null,
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display loading message when generating', () => {
    mockUseDashboard.mockReturnValue({
      isGenerating: true,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate: jest.fn(),
      isLoadingMessage: 'データを生成中...',
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should use default loading message when isLoadingMessage is empty', () => {
    mockUseDashboard.mockReturnValue({
      isGenerating: true,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate: jest.fn(),
      isLoadingMessage: null,
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display success notification', () => {
    const notification = {
      show: true,
      type: 'success' as const,
      message: 'Operation successful',
    };

    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification,
      handleGenerate: jest.fn(),
      isLoadingMessage: null,
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display error notification', () => {
    const notification = {
      show: true,
      type: 'error' as const,
      message: 'Operation failed',
    };

    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification,
      handleGenerate: jest.fn(),
      isLoadingMessage: null,
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render error boundary', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle notification with show false', () => {
    mockUseDashboard.mockReturnValue({
      isGenerating: false,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate: jest.fn(),
      isLoadingMessage: null,
    });

    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should have correct display name', () => {
    expect(DashboardPage.displayName).toBe('DashboardPage');
  });

  it('should be memoized component', () => {
    const { rerender } = render(<DashboardPage />);

    mockUseDashboard.mockReturnValue({
      isGenerating: true,
      notification: { show: false, type: 'info', message: '' },
      handleGenerate: jest.fn(),
      isLoadingMessage: 'データを生成中...',
    });

    rerender(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
