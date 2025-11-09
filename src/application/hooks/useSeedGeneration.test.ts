import { renderHook, act } from '@testing-library/react';
import { useSeedGeneration } from './useSeedGeneration';
import { AppError, NetworkError } from '@/lib/error-handler';

// Mock fetch
global.fetch = jest.fn();

describe('useSeedGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useSeedGeneration());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.generateSeed).toBe('function');
  });

  it('should handle successful data generation', async () => {
    const mockResponse = { success: true, data: { message: 'Data generated' } };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSeedGeneration());
    const mockConfig = { studentCount: 10, periodDays: 30 };

    await act(async () => {
      await result.current.generateSeed(mockConfig);
    });

    expect(fetch).toHaveBeenCalledWith('/api/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: mockConfig }),
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle network error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useSeedGeneration());
    const mockConfig = { studentCount: 10, periodDays: 30 };

    await act(async () => {
      try {
        await result.current.generateSeed(mockConfig);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeInstanceOf(NetworkError);
  });

  it('should handle API error response', async () => {
    const mockResponse = { success: false, error: 'Generation failed' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSeedGeneration());
    const mockConfig = { studentCount: 10, periodDays: 30 };

    await act(async () => {
      try {
        await result.current.generateSeed(mockConfig);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeInstanceOf(AppError);
    expect(result.current.error?.message).toBe('Generation failed');
  });

  it('should handle fetch rejection', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'));

    const { result } = renderHook(() => useSeedGeneration());
    const mockConfig = { studentCount: 10, periodDays: 30 };

    await act(async () => {
      try {
        await result.current.generateSeed(mockConfig);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeInstanceOf(NetworkError);
  });

  it('should set loading state correctly during generation', async () => {
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (fetch as jest.Mock).mockReturnValueOnce(mockPromise);

    const { result } = renderHook(() => useSeedGeneration());
    const mockConfig = { studentCount: 10, periodDays: 30 };

    let generationPromise: Promise<void>;
    
    await act(async () => {
      generationPromise = result.current.generateSeed(mockConfig);
    });

    expect(result.current.isGenerating).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });
      await generationPromise!;
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
  });
});