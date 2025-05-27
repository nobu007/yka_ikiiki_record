'use client';

import { useSeedGeneration } from '@/application/hooks/useSeedGeneration';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';

export default function DashboardContainer() {
  const { generateSeed, isGenerating, error } = useSeedGeneration();

  // 初期データの生成
  const handleInitialGeneration = async () => {
    try {
      // デフォルト設定で30日分のデータを生成
      await generateSeed({
        ...DEFAULT_CONFIG,
        periodDays: 30
      });
    } catch (e) {
      console.error('初期データ生成エラー:', e);
    }
  };

  return (
    <div>
      <button
        onClick={handleInitialGeneration}
        disabled={isGenerating}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isGenerating ? 'データ生成中...' : '初期データを生成'}
      </button>

      {error && (
        <div className="mt-2 p-2 text-red-500 bg-red-100 rounded">
          {error.message}
        </div>
      )}
    </div>
  );
}