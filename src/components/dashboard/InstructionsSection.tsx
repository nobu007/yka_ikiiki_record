import React from 'react';

const INSTRUCTIONS_CONFIG = {
  title: '使い方ガイド',
  subtitle: 'イキイキレコードの活用方法',
  steps: [
    {
      title: 'データの生成',
      description: '「テストデータを生成」ボタンをクリックして、サンプル学習データを作成します。',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
    },
    {
      title: 'データの確認',
      description: '生成されたデータは感情分析や学習パターンを含み、ダッシュボードで視覚的に確認できます。',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      title: '分析と活用',
      description: '生成されたデータを基に、生徒の学習状況や感情変化を分析し、教育支援に活用します。',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ],
  tips: [
    'データ生成は数秒で完了します',
    '生成されたデータはブラウザ内に保存されます',
    '何度でもデータを再生成できます'
  ]
} as const;

export const InstructionsSection = React.memo(function InstructionsSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {INSTRUCTIONS_CONFIG.title}
        </h2>
        <p className="text-gray-600">
          {INSTRUCTIONS_CONFIG.subtitle}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {INSTRUCTIONS_CONFIG.steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <span className="text-blue-600 font-semibold text-sm">
                  {index + 1}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">
                {step.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg 
                className="h-6 w-6 text-blue-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={step.icon} 
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <svg 
            className="h-5 w-5 text-yellow-600 mr-2" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
              clipRule="evenodd" 
            />
          </svg>
          <h4 className="text-sm font-medium text-yellow-800">
            ヒント
          </h4>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          {INSTRUCTIONS_CONFIG.tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});