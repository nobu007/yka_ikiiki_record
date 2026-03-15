import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerationControls from './GenerationControls';
import { DataGenerationConfig } from '@/domain/entities/DataGeneration';

describe('GenerationControls', () => {
  const mockConfig: DataGenerationConfig = {
    studentCount: 30,
    periodDays: 90,
    distributionPattern: 'normal',
    seasonalEffects: false
  };

  const mockOnUpdateStudentCount = jest.fn();
  const mockOnUpdatePeriodDays = jest.fn();
  const mockOnUpdateDistributionPattern = jest.fn();
  const mockOnToggleSeasonalEffects = jest.fn();

  beforeEach(() => {
    mockOnUpdateStudentCount.mockClear();
    mockOnUpdatePeriodDays.mockClear();
    mockOnUpdateDistributionPattern.mockClear();
    mockOnToggleSeasonalEffects.mockClear();
  });

  describe('rendering', () => {
    it('should render all control sections', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      expect(screen.getByText(/生徒数:/)).toBeInTheDocument();
      expect(screen.getByText(/記録期間:/)).toBeInTheDocument();
      expect(screen.getByText('感情分布パターン')).toBeInTheDocument();
      expect(screen.getByText('季節変動を有効にする')).toBeInTheDocument();
    });

    it('should display current student count', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      expect(screen.getByText('生徒数: 30名')).toBeInTheDocument();
    });

    it('should display current period days', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      expect(screen.getByText('記録期間: 90日')).toBeInTheDocument();
    });

    it('should render all distribution pattern buttons', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      expect(screen.getByText('正規分布')).toBeInTheDocument();
      expect(screen.getByText('二峰分布')).toBeInTheDocument();
      expect(screen.getByText('ストレス型')).toBeInTheDocument();
      expect(screen.getByText('ハッピー型')).toBeInTheDocument();
    });

    it('should highlight selected distribution pattern', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const normalButton = screen.getByText('正規分布');
      expect(normalButton).toHaveClass('bg-blue-500', 'text-white');

      const bimodalButton = screen.getByText('二峰分布');
      expect(bimodalButton).toHaveClass('bg-gray-100');
    });

    it('should have correct range input attributes for student count', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const input = screen.getByText(/生徒数:/).parentElement?.querySelector('input');
      expect(input).toHaveAttribute('min', '10');
      expect(input).toHaveAttribute('max', '500');
      expect(input).toHaveValue('30');
    });

    it('should have correct range input attributes for period days', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const input = screen.getByText(/記録期間:/).parentElement?.querySelector('input');
      expect(input).toHaveAttribute('min', '7');
      expect(input).toHaveAttribute('max', '365');
      expect(input).toHaveValue('90');
    });

    it('should render seasonal effects checkbox', () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should check checkbox when seasonal effects is enabled', () => {
      render(
        <GenerationControls
          config={{ ...mockConfig, seasonalEffects: true }}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('user interactions', () => {
    it('should call onUpdateStudentCount when slider changes', async () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const inputs = screen.getAllByRole('slider');
      const studentCountInput = inputs[0];
      fireEvent.input(studentCountInput, { target: { value: '50' } });

      expect(mockOnUpdateStudentCount).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateStudentCount).toHaveBeenCalledWith(50);
    });

    it('should call onUpdatePeriodDays when slider changes', async () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const inputs = screen.getAllByRole('slider');
      const periodDaysInput = inputs[1];
      fireEvent.input(periodDaysInput, { target: { value: '120' } });

      expect(mockOnUpdatePeriodDays).toHaveBeenCalledTimes(1);
      expect(mockOnUpdatePeriodDays).toHaveBeenCalledWith(120);
    });

    it('should call onUpdateDistributionPattern when pattern button clicked', async () => {
      const user = userEvent.setup();
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      await user.click(screen.getByText('二峰分布'));

      expect(mockOnUpdateDistributionPattern).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateDistributionPattern).toHaveBeenCalledWith('bimodal');
    });

    it('should call onToggleSeasonalEffects when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      await user.click(screen.getByRole('checkbox'));

      expect(mockOnToggleSeasonalEffects).toHaveBeenCalledTimes(1);
    });

    it('should handle all distribution pattern buttons', async () => {
      const user = userEvent.setup();
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      await user.click(screen.getByText('ストレス型'));
      expect(mockOnUpdateDistributionPattern).toHaveBeenLastCalledWith('stress');

      await user.click(screen.getByText('ハッピー型'));
      expect(mockOnUpdateDistributionPattern).toHaveBeenLastCalledWith('happy');

      await user.click(screen.getByText('正規分布'));
      expect(mockOnUpdateDistributionPattern).toHaveBeenLastCalledWith('normal');
    });

    it('should handle edge case values (minimum student count)', async () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const inputs = screen.getAllByRole('slider');
      const studentCountInput = inputs[0];
      fireEvent.input(studentCountInput, { target: { value: '10' } });

      expect(mockOnUpdateStudentCount).toHaveBeenCalledWith(10);
    });

    it('should handle edge case values (maximum student count)', async () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const inputs = screen.getAllByRole('slider');
      const studentCountInput = inputs[0];
      fireEvent.input(studentCountInput, { target: { value: '500' } });

      expect(mockOnUpdateStudentCount).toHaveBeenCalledWith(500);
    });

    it('should handle edge case values (minimum period days)', async () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const inputs = screen.getAllByRole('slider');
      const periodDaysInput = inputs[1];
      fireEvent.input(periodDaysInput, { target: { value: '7' } });

      expect(mockOnUpdatePeriodDays).toHaveBeenCalledWith(7);
    });

    it('should handle edge case values (maximum period days)', async () => {
      render(
        <GenerationControls
          config={mockConfig}
          onUpdateStudentCount={mockOnUpdateStudentCount}
          onUpdatePeriodDays={mockOnUpdatePeriodDays}
          onUpdateDistributionPattern={mockOnUpdateDistributionPattern}
          onToggleSeasonalEffects={mockOnToggleSeasonalEffects}
        />
      );

      const inputs = screen.getAllByRole('slider');
      const periodDaysInput = inputs[1];
      fireEvent.input(periodDaysInput, { target: { value: '365' } });

      expect(mockOnUpdatePeriodDays).toHaveBeenCalledWith(365);
    });
  });

  describe('memoization', () => {
    it('should have displayName set for debugging', () => {
      expect(GenerationControls.displayName).toBe('GenerationControls');
    });

    it('should be wrapped with React.memo', () => {
      const memoizedComponent = GenerationControls;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });
  });
});
