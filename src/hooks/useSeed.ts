import { useState, useCallback } from 'react';
import { SeedResponse, SeedResponseSchema } from '@/types/api';

export function useSeed() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      // Zodでバリデーション
      const result = SeedResponseSchema.parse(data);

      if (!result.success) {
        throw new Error(result.error || 'データ生成に失敗しました');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('データ生成中にエラーが発生しました');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generate,
    isLoading,
    error
  };
}