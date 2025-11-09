import { useState, useCallback } from 'react';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';
import { AppError, NetworkError, normalizeError, logError } from '@/lib/error-handler';

export function useSeedGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const generateSeed = useCallback(async (config: DataGenerationConfig): Promise<void> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new NetworkError(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new AppError(data.error || 'データ生成に失敗しました', 'GENERATION_ERROR');
      }
    } catch (e) {
      const appError = normalizeError(e);
      logError(appError, 'useSeedGeneration.generateSeed');
      setError(appError);
      throw appError;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, error, generateSeed };
}