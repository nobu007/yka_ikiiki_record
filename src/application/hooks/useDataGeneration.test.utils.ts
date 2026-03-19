import { renderHook } from '@testing-library/react';
import { useDataGeneration } from './useDataGeneration';
import { DATA_GENERATION_BOUNDS } from '@/domain/entities/DataGeneration';
import type { EventEffect } from '@/domain/entities/DataGeneration';

// Re-export domain constants for test convenience
export const { MIN_STUDENTS, MAX_STUDENTS, MIN_PERIOD_DAYS, MAX_PERIOD_DAYS } = DATA_GENERATION_BOUNDS;

export const VALID_STUDENT_COUNT = 50;
export const BELOW_MIN_STUDENT_COUNT = 5;
export const ABOVE_MAX_STUDENT_COUNT = 600;

export const VALID_PERIOD_DAYS = 30;
export const BELOW_MIN_PERIOD_DAYS = 5;
export const ABOVE_MAX_PERIOD_DAYS = 400;

// Test helper factories
export const createMockEvent = (overrides: Partial<EventEffect> = {}): EventEffect => ({
  name: 'Test Event',
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-01-16'),
  impact: 0.5,
  ...overrides
});

// Test setup helpers
export const setupTestHook = (mockOnGenerate: jest.Mock) => {
  return renderHook(() => useDataGeneration({ onGenerate: mockOnGenerate }));
};

export const createMockOnGenerate = () => {
  return jest.fn();
};
