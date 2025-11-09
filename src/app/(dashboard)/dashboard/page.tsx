'use client';

import { useDashboard } from '@/hooks';
import { ErrorBoundary, LoadingOverlay, Notification } from '@/components/common';
import { DataSection, InstructionsSection } from '@/components/dashboard';

const DASHBOARD_TITLE = 'ダッシュボード';
const LOADING_MESSAGE = 'データを生成中...';

export default function DashboardPage() {
  const { isGenerating, notification, handleInitialGeneration } = useDashboard();

  return (
    <ErrorBoundary>
      <LoadingOverlay isLoading={isGenerating} message={LOADING_MESSAGE} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{DASHBOARD_TITLE}</h1>
          
          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
          />
          
          <DataSection isGenerating={isGenerating} onGenerate={handleInitialGeneration} />
          <InstructionsSection />
        </div>
      </div>
    </ErrorBoundary>
  );
}