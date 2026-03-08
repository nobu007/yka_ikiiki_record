import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataGeneration } from './useDataGeneration';
import { DEFAULT_CONFIG } from '@/domain/entities/DataGeneration';
import type { EventEffect } from '@/domain/entities/DataGeneration';

// Test constants
export const MIN_STUDENTS = 10;
export const MAX_STUDENTS = 500;
export const MIN_PERIOD_DAYS = 7;
export const MAX_PERIOD_DAYS = 365;

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
