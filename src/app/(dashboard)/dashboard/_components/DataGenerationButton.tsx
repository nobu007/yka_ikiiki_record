"use client";

interface DataGenerationButtonProps {
  loading: boolean;
  onGenerate: () => void;
}

export default function DataGenerationButton({ loading, onGenerate }: DataGenerationButtonProps) {
  return (
    <div>
      <button
        onClick={onGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin">⚡</span>
            生成中...
          </>
        ) : (
          "📊 Demo データ生成"
        )}
      </button>
    </div>
  );
}