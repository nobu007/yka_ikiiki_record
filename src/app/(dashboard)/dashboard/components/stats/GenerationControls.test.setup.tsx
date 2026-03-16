import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerationControls from './GenerationControls';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';

/**
 * Shared test utilities and mocks for GenerationControls tests
 */

export const mockConfig: DataGenerationConfig = {
  studentCount: 30,
  periodDays: 90,
  distributionPattern: 'normal',
  seasonalEffects: false
};

export const mockOnUpdateStudentCount = jest.fn();
export const mockOnUpdatePeriodDays = jest.fn();
export const mockOnUpdateDistributionPattern = jest.fn();
export const mockOnToggleSeasonalEffects = jest.fn();

/**
 * Renders GenerationControls with default props
 */
export function renderGenerationControls(config: DataGenerationConfig = mockConfig) {
  return render(
    <GenerationControls
      config={config}
      onUpdateStudentCount={mockOnUpdateStudentCount}
      onUpdatePeriodDays={mockOnUpdatePeriodDays}
      onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
      onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
    />
  );
}

/**
 * Clears all mock function calls
 */
export function clearAllMocks() {
  mockOnUpdateStudentCount.mockClear();
  mockOnUpdatePeriodDays.mockClear();
  mockOnUpdateDistributionPattern.mockClear();
  mockOnToggleSeasonalEffects.mockClear();
}

/**
 * Setup function to be called before each test
 */
export function beforeEachSetup() {
  clearAllMocks();
}

/**
 * Get user event instance for interactions
 */
export function getUserEvent() {
  return userEvent.setup();
}
