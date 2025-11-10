import Link from "next/link";
import { MESSAGES } from '@/lib/config';

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
            {MESSAGES.ui.landing.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
            生徒の学習データを生成・管理する次世代ダッシュボード
          </p>
        </header>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">感情分析</h3>
              <p className="text-sm text-gray-600">生徒の感情変化を可視化し、学習効果を分析</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">データ生成</h3>
              <p className="text-sm text-gray-600">リアルなテストデータを動的に生成</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">傾向分析</h3>
              <p className="text-sm text-gray-600">曜日・時間帯別の学習パターンを把握</p>
            </div>
          </div>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {MESSAGES.ui.landing.dashboardButton}
          </Link>
        </div>
      </div>
    </main>
  );
}