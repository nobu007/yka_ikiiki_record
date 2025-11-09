import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DataSectionProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

const DATA_SECTION_CONFIG = {
  title: 'データ管理',
  description: 'テストデータを生成してダッシュボードの機能を確認できます。',
  buttonText: '初期データを生成',
  loadingText: 'データ生成中...'
} as const;

const buttonClasses = `
  px-4 py-2 bg-blue-600 text-white rounded-md 
  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
  disabled:opacity-50 disabled:cursor-not-allowed 
  transition-colors duration-200 flex items-center
`;

export const DataSection = React.memo(({ isGenerating, onGenerate }: DataSectionProps) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-gray-700 mb-3">{DATA_SECTION_CONFIG.title}</h2>
    <p className="text-gray-600 mb-4">{DATA_SECTION_CONFIG.description}</p>
    
    <div className="flex items-center space-x-4">
      <button onClick={onGenerate} disabled={isGenerating} className={buttonClasses}>
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            {DATA_SECTION_CONFIG.loadingText}
          </>
        ) : (
          DATA_SECTION_CONFIG.buttonText
        )}
      </button>
    </div>
  </div>
));