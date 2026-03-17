import { fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/react';
import GenerationControls from './GenerationControls';
import {
  mockOnUpdateStudentCount,
  mockOnUpdatePeriodDays,
  renderGenerationControls,
  beforeEachSetup
} from './GenerationControls.test.setup';

describe('GenerationControls - Edge Cases', () => {
  beforeEach(() => {
    beforeEachSetup();
  });

  describe('boundary values for student count', () => {
    it('should handle edge case values (minimum student count)', () => {
      renderGenerationControls();

      const inputs = screen.getAllByRole('slider');
      const studentCountInput = inputs[0];
      if (!studentCountInput) throw new Error('Student count input not found');
      fireEvent.input(studentCountInput, { target: { value: '10' } });

      expect(mockOnUpdateStudentCount).toHaveBeenCalledWith(10);
    });

    it('should handle edge case values (maximum student count)', () => {
      renderGenerationControls();

      const inputs = screen.getAllByRole('slider');
      const studentCountInput = inputs[0];
      if (!studentCountInput) throw new Error('Student count input not found');
      fireEvent.input(studentCountInput, { target: { value: '500' } });

      expect(mockOnUpdateStudentCount).toHaveBeenCalledWith(500);
    });
  });

  describe('boundary values for period days', () => {
    it('should handle edge case values (minimum period days)', () => {
      renderGenerationControls();

      const inputs = screen.getAllByRole('slider');
      const periodDaysInput = inputs[1];
      if (!periodDaysInput) throw new Error('Period days input not found');
      fireEvent.input(periodDaysInput, { target: { value: '7' } });

      expect(mockOnUpdatePeriodDays).toHaveBeenCalledWith(7);
    });

    it('should handle edge case values (maximum period days)', () => {
      renderGenerationControls();

      const inputs = screen.getAllByRole('slider');
      const periodDaysInput = inputs[1];
      if (!periodDaysInput) throw new Error('Period days input not found');
      fireEvent.input(periodDaysInput, { target: { value: '365' } });

      expect(mockOnUpdatePeriodDays).toHaveBeenCalledWith(365);
    });
  });
});

describe('GenerationControls - Memoization', () => {
  it('should have displayName set for debugging', () => {
    expect(GenerationControls.displayName).toBe('GenerationControls');
  });

  it('should be wrapped with memo', () => {
    const memoizedComponent = GenerationControls;
    expect(memoizedComponent).toBeDefined();
    expect(typeof memoizedComponent).toBe('object');
  });
});
