import { useState, useCallback } from 'react';

export function useSeed() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/seed', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('データ生成に失敗しました');
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.error('データ生成エラー:', e);
      setError(e instanceof Error ? e : new Error('不明なエラーが発生しました'));
      throw e;
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