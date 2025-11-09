import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';

// Mock the notification hook
jest.mock('./useNotification', () => ({
  useNotification: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    hideNotification: jest.fn(),
    notification: { show: false, message: '', type: 'success' as const }
  })
}));

let mockIsGenerating = false;
let mockGenerateSeed = jest.fn().mockImplementation(async () => {
  mockIsGenerating = true;
  await new Promise(resolve => setTimeout(resolve, 0));
  mockIsGenerating = false;
});

// Mock the useSeedGeneration hook
jest.mock('../application/hooks/useSeedGeneration', () => ({
  useSeedGeneration: () => ({
    generateSeed: mockGenerateSeed,
    isGenerating: mockIsGenerating,
    error: null
  })
}));


describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsGenerating = false;
  });

  test('initial state should be correct', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.notification.show).toBe(false);
    expect(typeof result.current.handleInitialGeneration).toBe('function');
  });

  test('handleInitialGeneration should call generateSeed', async () => {
    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(mockGenerateSeed).toHaveBeenCalledWith({
      studentCount: 25,
      periodDays: 30,
      distributionPattern: 'normal',
      seasonalEffects: false,
      eventEffects: [],
      classCharacteristics: {
        baselineEmotion: 3.0,
        volatility: 0.5,
        cohesion: 0.7
      }
    });
  });

  test('should complete data generation process', async () => {
    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleInitialGeneration();
    });

    expect(result.current.isGenerating).toBe(false);
  });
});