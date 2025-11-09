import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DataSectionProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

const FEATURES = [
  '30日分の学習データ',
  '感情分析サンプル',
  '季節要因の考慮',
  'イベント影響のシミュレーション'
] as const;

const FeatureList = () => (
  <div className="bg-white rounded-md p-4 mb-6">
    <h3 className="text-sm font-medium text-gray-700 mb-3">生成されるデータ:</h3>
    <ul className="space-y-2">
      {FEATURES.map((feature) => (
        <li key={feature} className="flex items-center text-sm text-gray-600">
          <svg 
            className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

const GenerateButton = ({ isGenerating, onClick }: { isGenerating: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick} 
    disabled={isGenerating} 
    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
    aria-describedby="generate-help"
  >
    {isGenerating ? (
      <>
        <LoadingSpinner size="sm" color="white" className="mr-2" />
        生成中...
      </>
    ) : (
      <>
        <svg 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
        テストデータを生成
      </>
    )}
  </button>
);

export const DataSection = ({ isGenerating, onGenerate }: DataSectionProps) => (
  <section className="bg-gray-50 rounded-lg p-6">
    <header className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        テストデータ生成
      </h2>
      <p className="text-gray-600 mb-4 leading-relaxed">
        ダッシュボードの機能を確認するために、サンプルデータを生成します。
      </p>
      <FeatureList />
    </header>
    
    <div className="flex items-center justify-center">
      <GenerateButton isGenerating={isGenerating} onClick={onGenerate} />
    </div>
    
    <p id="generate-help" className="mt-4 text-sm text-gray-500 text-center">
      {isGenerating 
        ? 'データ生成には数秒かかる場合があります。'
        : 'ボタンをクリックしてテストデータを生成してください。'
      }
    </p>
  </section>
);