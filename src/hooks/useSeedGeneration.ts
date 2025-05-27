import { useState, useCallback } from 'react';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';

export function useSeedGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateSeed = useCallback(async (config: DataGenerationConfig) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error('データ生成に失敗しました');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '不明なエラーが発生しました');
      }

    } catch (e) {
      setError(e instanceof Error ? e : new Error('不明なエラーが発生しました'));
      throw e;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    error,
    generateSeed
  };
}