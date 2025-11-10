import React from 'react';

export const UsageInstructions: React.FC = () => {
  const instructions = [
    '「初期データを生成」ボタンをクリックしてテストデータを作成します',
    '生成が完了すると統計データが表示されます',
    'グラフやチャートで生徒の感情データを確認できます',
    '何度でもデータを再生成して異なるパターンを試せます'
  ];

  return (
    <section className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">使い方</h3>
      <ol className="space-y-3 text-sm text-gray-700">
        {instructions.map((instruction, index) => (
          <li key={index} className="flex">
            <span className="font-medium mr-2">{index + 1}.</span>
            <span>{instruction}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};