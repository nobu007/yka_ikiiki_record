import React from 'react';

const DASHBOARD_CONFIG = {
  instructions: {
    title: '使い方',
    steps: [
      '「初期データを生成」ボタンをクリックしてテストデータを作成します',
      '生成には数秒かかる場合があります',
      'データが生成されると、統計情報がダッシュボードに表示されます'
    ]
  }
} as const;

export const InstructionsSection = React.memo(function InstructionsSection() {
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
});