'use client';

import { useDashboard } from '@/hooks';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner, LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Notification } from '@/components/common/Notification';

export default function DashboardPage() {
  const { 
    isGenerating, 
    notification, 
    handleInitialGeneration 
  } = useDashboard();

  return (
    <ErrorBoundary>
      <LoadingOverlay isLoading={isGenerating} message="データを生成中..." />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>
          
          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
          />
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">データ管理</h2>
            <p className="text-gray-600 mb-4">
              テストデータを生成してダッシュボードの機能を確認できます。
            </p>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleInitialGeneration}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    データ生成中...
                  </>
                ) : (
                  '初期データを生成'
                )}
              </button>
            </div>
          </div>

          {/* 説明セクション */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="text-md font-semibold text-blue-800 mb-2">使い方</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>「初期データを生成」ボタンをクリックしてテストデータを作成します</li>
              <li>生成には数秒かかる場合があります</li>
              <li>データが生成されると、統計情報がダッシュボードに表示されます</li>
            </ul>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}