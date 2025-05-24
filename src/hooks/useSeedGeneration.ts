import { useAsync } from './useAsync';

interface SeedGenerationOptions {
  days?: number;
}

async function generateSeedData(options: SeedGenerationOptions = {}) {
  const response = await fetch('/api/seed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ days: options.days || 30 }),
  });

  if (!response.ok) {
    throw new Error(`データ生成に失敗しました (${response.status})`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'データ生成に失敗しました');
  }

  return data;
}

export function useSeedGeneration(options: SeedGenerationOptions = {}) {
  const { execute, isLoading, error } = useAsync({
    onError: (err) => {
      console.error('データ生成エラー:', err);
    },
  });

  const generate = () => execute(() => generateSeedData(options));

  return {
    generate,
    isLoading,
    error,
  };
}