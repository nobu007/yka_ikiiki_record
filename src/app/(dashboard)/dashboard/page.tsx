'use client';

import { useDashboard } from '@/hooks';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner, LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Notification } from '@/components/common/Notification';

// 定数を抽出
const DASHBOARD_CONFIG = {
  title: 'ダッシュボード',
  dataSection: {
    title: 'データ管理',
    description: 'テストデータを生成してダッシュボードの機能を確認できます。',
    buttonText: '初期データを生成',
    loadingText: 'データ生成中...',
    loadingMessage: 'データを生成中...'
  },
  instructions: {
    title: '使い方',
    steps: [
      '「初期データを生成」ボタンをクリックしてテストデータを作成します',
      '生成には数秒かかる場合があります',
      'データが生成されると、統計情報がダッシュボードに表示されます'
    ]
  }
} as const;

export default function DashboardPage() {
  const { 
    isGenerating, 
    notification, 
    handleInitialGeneration 
  } = useDashboard();

  return (
    <ErrorBoundary>
      <LoadingOverlay isLoading={isGenerating} message={DASHBOARD_CONFIG.loadingMessage} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{DASHBOARD_CONFIG.title}</h1>
          
          <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
          />
          
          <DataSection 
            isGenerating={isGenerating}
            onGenerate={handleInitialGeneration}
          />

          <InstructionsSection />
        </div>
      </div>
    </ErrorBoundary>
  );
}

// データ管理セクションコンポーネント
function DataSection({ isGenerating, onGenerate }: {
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        {DASHBOARD_CONFIG.dataSection.title}
      </h2>
      <p className="text-gray-600 mb-4">
        {DASHBOARD_CONFIG.dataSection.description}
      </p>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              {DASHBOARD_CONFIG.dataSection.loadingText}
            </>
          ) : (
            DASHBOARD_CONFIG.dataSection.buttonText
          )}
        </button>
      </div>
    </div>
  );
}

// 説明セクションコンポーネント
function InstructionsSection() {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-md">
      <h3 className="text-md font-semibold text-blue-800 mb-2">
        {DASHBOARD_CONFIG.instructions.title}
      </h3>
      <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
        {DASHBOARD_CONFIG.instructions.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
}