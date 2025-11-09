'use client';

import { useDashboard } from '@/hooks';
import { ErrorBoundary, LoadingOverlay, Notification } from '@/components/common';
import { DataSection, InstructionsSection } from '@/components/dashboard';

const DASHBOARD_CONFIG = {
  title: 'イキイキレコード - 教師ダッシュボード',
  description: '生徒の学習データを生成・管理するダッシュボードです',
  loadingMessage: 'データを生成中...'
} as const;

export default function DashboardPage() {
  const { isGenerating, notification, handleInitialGeneration, isLoadingMessage } = useDashboard();

  return (
    <ErrorBoundary>
      <LoadingOverlay 
        isLoading={isGenerating} 
        message={isLoadingMessage || DASHBOARD_CONFIG.loadingMessage} 
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {DASHBOARD_CONFIG.title}
              </h1>
              <p className="text-gray-600">
                {DASHBOARD_CONFIG.description}
              </p>
            </header>
            
            <Notification
              show={notification.show}
              message={notification.message}
              type={notification.type}
              onClose={() => notification.show && notification.type !== 'error' && void 0}
              autoClose={notification.type === 'success'}
            />
            
            <main className="space-y-8">
              <DataSection isGenerating={isGenerating} onGenerate={handleInitialGeneration} />
              <InstructionsSection />
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}