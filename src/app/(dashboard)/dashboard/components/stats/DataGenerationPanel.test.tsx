import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataGenerationPanel from './DataGenerationPanel';

describe('DataGenerationPanel', () => {
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    mockOnGenerate.mockClear();
  });

  describe('rendering', () => {
    it('should render the panel with title', () => {
      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      expect(screen.getByText('データ生成設定')).toBeInTheDocument();
    });

    it('should render generate button in default state', () => {
      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      expect(screen.getByText('データを生成')).toBeInTheDocument();
      expect(screen.getByText('リセット')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <DataGenerationPanel onGenerate={mockOnGenerate} className="custom-class" />
      );

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveClass('custom-class');
    });

    it('should render child components', () => {
      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      expect(screen.getByText(/生徒数:/)).toBeInTheDocument();
      expect(screen.getByText(/記録期間:/)).toBeInTheDocument();
      expect(screen.getByText('イベントの追加')).toBeInTheDocument();
    });

    it('should not display error message when there is no error', () => {
      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      const errorDiv = screen.queryByText(/./, { selector: '.text-red-500' });
      expect(errorDiv).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onGenerate when generate button is clicked', async () => {
      mockOnGenerate.mockResolvedValue(undefined);

      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      const generateButton = screen.getByText('データを生成');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockOnGenerate).toHaveBeenCalledTimes(1);
      });
    });

    it('should show generating state while onGenerate is in progress', async () => {
      mockOnGenerate.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      const generateButton = screen.getByText('データを生成');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('生成中...')).toBeInTheDocument();
        expect(generateButton).toBeDisabled();
      });
    });

    it('should disable reset button while generating', async () => {
      mockOnGenerate.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      const generateButton = screen.getByText('データを生成');
      const resetButton = screen.getByText('リセット');

      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(resetButton).toBeDisabled();
      });
    });

    it('should display error message when generation fails', async () => {
      const testError = new Error('Generation failed');
      mockOnGenerate.mockRejectedValue(testError);

      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      const generateButton = screen.getByText('データを生成');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generation failed')).toBeInTheDocument();
      });
    });

    it('should allow reset after generation completes', async () => {
      mockOnGenerate.mockResolvedValue(undefined);

      render(<DataGenerationPanel onGenerate={mockOnGenerate} />);

      const generateButton = screen.getByText('データを生成');
      const resetButton = screen.getByText('リセット');

      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(resetButton).not.toBeDisabled();
      });
    });
  });

  describe('memoization behavior', () => {
    it('should have displayName set for debugging', () => {
      expect(DataGenerationPanel.displayName).toBe('DataGenerationPanel');
    });

    it('should be wrapped with memo', () => {
      const memoizedComponent = DataGenerationPanel;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });

    it('should export as default', () => {
      expect(typeof DataGenerationPanel).toBe('object');
    });
  });

  describe('component interface', () => {
    it('should accept required props', () => {
      const props = {
        onGenerate: async () => {},
        className: ''
      };

      expect(() => {
        React.createElement(DataGenerationPanel, props);
      }).not.toThrow();
    });
  });
});
