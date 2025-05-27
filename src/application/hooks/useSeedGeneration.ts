import { useState, useCallback } from 'react';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

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
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'データ生成に失敗しました');
      }

      return data.data;

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'データ生成中に予期せぬエラーが発生しました';
      setError(new Error(errorMessage));
      throw new Error(errorMessage);
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