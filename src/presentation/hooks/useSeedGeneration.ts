import { useAsync } from '@/hooks/useAsync';

export const useSeedGeneration = () => {
  const { execute: generateSeed, isLoading, error } = useAsync({
    onError: (error: Error) => {
      console.error('テストデータの生成に失敗しました:', error);
    }
  });

  const generateSeedData = async () => {
    const response = await fetch('/api/seed', {
      method: 'POST',
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'テストデータの生成に失敗しました');
    }

    return data;
  };

  return {
    generateSeed: () => generateSeed(generateSeedData),
    isLoading,
    error
  };
};