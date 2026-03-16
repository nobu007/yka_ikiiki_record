import { fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/react';
import GenerationControls from './GenerationControls';
import {
  mockConfig,
  mockOnUpdateStudentCount,
  mockOnUpdatePeriodDays,
  mockOnUpdateDistributionPattern,
  mockOnToggleSeasonalEffects,
  renderGenerationControls,
  beforeEachSetup,
  getUserEvent
} from './GenerationControls.test.setup';

describe('GenerationControls - User Interactions', () => {
  beforeEach(() => {
    beforeEachSetup();
  });

  describe('student count slider', () => {
    it('should call onUpdateStudentCount when slider changes', () => {
      renderGenerationControls();

      const inputs = screen.getAllByRole('slider');
      const studentCountInput = inputs[0];
      fireEvent.input(studentCountInput, { target: { value: '50' } });

      expect(mockOnUpdateStudentCount).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateStudentCount).toHaveBeenCalledWith(50);
    });
  });

  describe('period days slider', () => {
    it('should call onUpdatePeriodDays when slider changes', () => {
      renderGenerationControls();

      const inputs = screen.getAllByRole('slider');
      const periodDaysInput = inputs[1];
      fireEvent.input(periodDaysInput, { target: { value: '120' } });

      expect(mockOnUpdatePeriodDays).toHaveBeenCalledTimes(1);
      expect(mockOnUpdatePeriodDays).toHaveBeenCalledWith(120);
    });
  });

  describe('distribution pattern buttons', () => {
    it('should call onUpdateDistributionPattern when pattern button clicked', async () => {
      const user = getUserEvent();
      renderGenerationControls();

      await user.click(screen.getByText('二峰分布'));

      expect(mockOnUpdateDistributionPattern).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateDistributionPattern).toHaveBeenCalledWith('bimodal');
    });

    it('should handle all distribution pattern buttons', async () => {
      const user = getUserEvent();
      renderGenerationControls();

      await user.click(screen.getByText('ストレス型'));
      expect(mockOnUpdateDistributionPattern).toHaveBeenLastCalledWith('stress');

      await user.click(screen.getByText('ハッピー型'));
      expect(mockOnUpdateDistributionPattern).toHaveBeenLastCalledWith('happy');

      await user.click(screen.getByText('正規分布'));
      expect(mockOnUpdateDistributionPattern).toHaveBeenLastCalledWith('normal');
    });
  });

  describe('seasonal effects checkbox', () => {
    it('should call onToggleSeasonalEffects when checkbox clicked', async () => {
      const user = getUserEvent();
      renderGenerationControls();

      await user.click(screen.getByRole('checkbox'));

      expect(mockOnToggleSeasonalEffects).toHaveBeenCalledTimes(1);
    });
  });
});
