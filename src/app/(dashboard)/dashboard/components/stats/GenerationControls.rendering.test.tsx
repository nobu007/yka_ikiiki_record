import { screen } from '@testing-library/react';
import {
  mockConfig,
  renderGenerationControls,
  beforeEachSetup
} from './GenerationControls.test.setup';

describe('GenerationControls - Rendering', () => {
  beforeEach(() => {
    beforeEachSetup();
  });

  describe('basic component structure', () => {
    it('should render all control sections', () => {
      renderGenerationControls();

      expect(screen.getByText(/生徒数:/)).toBeInTheDocument();
      expect(screen.getByText(/記録期間:/)).toBeInTheDocument();
      expect(screen.getByText('感情分布パターン')).toBeInTheDocument();
      expect(screen.getByText('季節変動を有効にする')).toBeInTheDocument();
    });
  });

  describe('display values', () => {
    it('should display current student count', () => {
      renderGenerationControls();

      expect(screen.getByText('生徒数: 30名')).toBeInTheDocument();
    });

    it('should display current period days', () => {
      renderGenerationControls();

      expect(screen.getByText('記録期間: 90日')).toBeInTheDocument();
    });
  });

  describe('distribution pattern buttons', () => {
    it('should render all distribution pattern buttons', () => {
      renderGenerationControls();

      expect(screen.getByText('正規分布')).toBeInTheDocument();
      expect(screen.getByText('二峰分布')).toBeInTheDocument();
      expect(screen.getByText('ストレス型')).toBeInTheDocument();
      expect(screen.getByText('ハッピー型')).toBeInTheDocument();
    });

    it('should highlight selected distribution pattern', () => {
      renderGenerationControls();

      const normalButton = screen.getByText('正規分布');
      expect(normalButton).toHaveClass('bg-blue-500', 'text-white');

      const bimodalButton = screen.getByText('二峰分布');
      expect(bimodalButton).toHaveClass('bg-gray-100');
    });
  });

  describe('range inputs', () => {
    it('should have correct range input attributes for student count', () => {
      renderGenerationControls();

      const input = screen.getByText(/生徒数:/).parentElement?.querySelector('input');
      expect(input).toHaveAttribute('min', '10');
      expect(input).toHaveAttribute('max', '500');
      expect(input).toHaveValue('30');
    });

    it('should have correct range input attributes for period days', () => {
      renderGenerationControls();

      const input = screen.getByText(/記録期間:/).parentElement?.querySelector('input');
      expect(input).toHaveAttribute('min', '7');
      expect(input).toHaveAttribute('max', '365');
      expect(input).toHaveValue('90');
    });
  });

  describe('seasonal effects checkbox', () => {
    it('should render seasonal effects checkbox', () => {
      renderGenerationControls();

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should check checkbox when seasonal effects is enabled', () => {
      renderGenerationControls({
        ...mockConfig,
        seasonalEffects: true
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });
});
