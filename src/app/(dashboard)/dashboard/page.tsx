'use client';

import React, { useCallback } from 'react';
import { useDashboard } from '@/hooks/useApp';
import { ErrorBoundary, LoadingOverlay } from '@/components/ui';
import { Dashboard } from '@/components/Dashboard';

const DashboardPage = React.memo(function DashboardPage() {
  const { isGenerating, notification, handleGenerate, isLoadingMessage } = useDashboard();

  const handleNotificationClose = useCallback(() => {
    if (notification.show && notification.type !== 'error') {
      // Close notification logic handled by Notification component internally
    }
  }, [notification.show, notification.type]);

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
        onNotificationClose={handleNotificationClose}
      />
    </ErrorBoundary>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;