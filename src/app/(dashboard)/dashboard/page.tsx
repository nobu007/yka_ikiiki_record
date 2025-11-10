'use client';

import { useDashboard } from '@/hooks/useApp';
import { ErrorBoundary, LoadingOverlay } from '@/components/ui';
import { Dashboard } from '@/components/Dashboard';

export default function DashboardPage() {
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
        onNotificationClose={() => notification.show && notification.type !== 'error' && void 0}
      />
    </ErrorBoundary>
  );
}