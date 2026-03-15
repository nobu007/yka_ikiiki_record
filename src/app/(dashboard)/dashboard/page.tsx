'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useApp';
import { ErrorBoundary, LoadingOverlay } from '@/components/ui';
import { Dashboard } from '@/components/Dashboard';

const DashboardPage = React.memo(function DashboardPage() {
  const { isGenerating, notification, handleGenerate, isLoadingMessage } = useDashboard();

  return (
    <ErrorBoundary>
      <LoadingOverlay
        isLoading={isGenerating}
        message={isLoadingMessage || 'データを生成中...'}
      />

      <Dashboard
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        notification={notification}
      />
    </ErrorBoundary>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;