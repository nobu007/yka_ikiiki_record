import { useState, useCallback } from 'react';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';
import { AppError, NetworkError, normalizeError, logError } from '@/lib/error-handler';

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export function useSeedGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

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
        throw new NetworkError(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      if (!data.success) {
        throw new AppError(data.error || 'データ生成に失敗しました', 'GENERATION_ERROR');
      }

      return data.data;

    } catch (e) {
      const appError = normalizeError(e);
      logError(e, 'useSeedGeneration');
      setError(appError);
      throw appError;
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