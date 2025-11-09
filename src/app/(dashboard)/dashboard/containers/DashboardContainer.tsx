'use client';

import { useState } from 'react';
import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner, LoadingOverlay } from '@/components/common/LoadingSpinner';

export default function DashboardContainer() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { generateSeed, isGenerating, error } = useSeedGeneration();

  // 初期データの生成
  const handleInitialGeneration = async () => {
    try {
      setShowSuccess(false);
      // デフォルト設定で30日分のデータを生成
      await generateSeed({
        ...DEFAULT_CONFIG,
        periodDays: 30
      });
      setShowSuccess(true);
      // 3秒後に成功メッセージを非表示
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error('初期データ生成エラー:', e);
    }
  };

  return (
    <ErrorBoundary>
      <LoadingOverlay isLoading={isGenerating} message="データを生成中..." />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>
          
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

          {/* 成功メッセージ */}
          {showSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>テストデータの生成が完了しました</span>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>エラーが発生しました: {error.message}</span>
              </div>
            </div>
          )}

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