import { render, screen, fireEvent } from '@testing-library/react';
import ClassCharacteristicsEditor from './ClassCharacteristicsEditor';

describe('ClassCharacteristicsEditor', () => {
  const mockCharacteristics = {
    baselineEmotion: 3.0,
    volatility: 0.5,
    cohesion: 0.7
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('rendering', () => {
    it('should render all characteristic labels', () => {
      render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/基準感情値/)).toBeInTheDocument();
      expect(screen.getByText(/変動の大きさ/)).toBeInTheDocument();
      expect(screen.getByText(/クラスの結束度/)).toBeInTheDocument();
    });

    it('should display current values', () => {
      render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('基準感情値: 3')).toBeInTheDocument();
      expect(screen.getByText('変動の大きさ: 0.5')).toBeInTheDocument();
      expect(screen.getByText('クラスの結束度: 0.7')).toBeInTheDocument();
    });

    it('should have correct range input attributes', () => {
      const { container } = render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = container.querySelectorAll('input[type="range"]');
      expect(inputs).toHaveLength(3);

      expect(inputs[0]).toHaveAttribute('min', '2.5');
      expect(inputs[0]).toHaveAttribute('max', '3.5');
      expect(inputs[0]).toHaveAttribute('step', '0.1');
      expect(inputs[0]).toHaveValue('3');

      expect(inputs[1]).toHaveAttribute('min', '0.1');
      expect(inputs[1]).toHaveAttribute('max', '1.0');
      expect(inputs[1]).toHaveAttribute('step', '0.1');
      expect(inputs[1]).toHaveValue('0.5');

      expect(inputs[2]).toHaveAttribute('min', '0.1');
      expect(inputs[2]).toHaveAttribute('max', '1.0');
      expect(inputs[2]).toHaveAttribute('step', '0.1');
      expect(inputs[2]).toHaveValue('0.7');
    });
  });

  describe('user interactions', () => {
    it('should call onUpdate when baselineEmotion changes', () => {
      const { container } = render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = container.querySelectorAll('input[type="range"]');
      const input = inputs[0];
      if (!input) throw new Error('Input not found');
      fireEvent.change(input, { target: { value: '3.2' } });
      fireEvent.input(input, { target: { value: '3.2' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ baselineEmotion: 3.2 });
    });

    it('should call onUpdate when volatility changes', () => {
      const { container } = render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = container.querySelectorAll('input[type="range"]');
      const input = inputs[1];
      if (!input) throw new Error('Input not found');
      fireEvent.change(input, { target: { value: '0.8' } });
      fireEvent.input(input, { target: { value: '0.8' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ volatility: 0.8 });
    });

    it('should call onUpdate when cohesion changes', () => {
      const { container } = render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = container.querySelectorAll('input[type="range"]');
      const input = inputs[2];
      if (!input) throw new Error('Input not found');
      fireEvent.change(input, { target: { value: '0.9' } });
      fireEvent.input(input, { target: { value: '0.9' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ cohesion: 0.9 });
    });

    it('should handle edge case values (minimum)', () => {
      const { container } = render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = container.querySelectorAll('input[type="range"]');
      const input = inputs[0];
      if (!input) throw new Error('Input not found');
      fireEvent.change(input, { target: { value: '2.5' } });
      fireEvent.input(input, { target: { value: '2.5' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ baselineEmotion: 2.5 });
    });

    it('should handle edge case values (maximum)', () => {
      const { container } = render(
        <ClassCharacteristicsEditor
          characteristics={mockCharacteristics}
          onUpdate={mockOnUpdate}
        />
      );

      const inputs = container.querySelectorAll('input[type="range"]');
      const input = inputs[0];
      if (!input) throw new Error('Input not found');
      fireEvent.change(input, { target: { value: '3.5' } });
      fireEvent.input(input, { target: { value: '3.5' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ baselineEmotion: 3.5 });
    });
  });

  describe('memoization', () => {
    it('should have displayName set for debugging', () => {
      expect(ClassCharacteristicsEditor.displayName).toBe('ClassCharacteristicsEditor');
    });

    it('should be wrapped with memo', () => {
      const memoizedComponent = ClassCharacteristicsEditor;
      expect(memoizedComponent).toBeDefined();
      expect(typeof memoizedComponent).toBe('object');
    });
  });
});
