/**
 * DynamicBarChart Error Handling Tests
 *
 * Tests error state handling and error display
 * INV-TEST-001
 */

import { render, screen } from '@testing-library/react';
import DynamicBarChart from './DynamicBarChart';
import type { ChartData } from './DynamicBarChart';

describe('DynamicBarChart Error Handling', () => {
  describe('Error State from Data Transformation (lines 52-53)', () => {
    it('should handle data that throws during map operation', () => {
      class BrokenData {
        private readonly _name: string;
        private readonly _value: number;
        private readonly shouldThrow: boolean;

        constructor(name: string, value: number, shouldThrow = false) {
          this._name = name;
          this._value = value;
          this.shouldThrow = shouldThrow;
        }

        get name(): string {
          if (this.shouldThrow) {
            throw new Error('Property access error');
          }
          return this._name;
        }

        get value(): number {
          return this._value;
        }
      }

      const problematicData = [
        new BrokenData('Valid', 3.5, false),
        new BrokenData('Broken', 0, true),
      ] as unknown as ChartData[];

      render(<DynamicBarChart data={problematicData} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle data with null values', () => {
      const dataWithNull = [
        { name: 'Valid', value: 3.5 },
        null,
      ] as unknown as ChartData[];

      render(<DynamicBarChart data={dataWithNull} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle data with undefined values', () => {
      const dataWithUndefined = [
        { name: 'Valid', value: 3.5 },
        undefined,
      ] as unknown as ChartData[];

      render(<DynamicBarChart data={dataWithUndefined} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle data that throws string instead of Error', () => {
      class StringThrowingData {
        get name() {
          throw 'String error message';
        }
        get value() {
          return 3.5;
        }
      }

      const stringThrowingData = [new StringThrowingData()] as unknown as ChartData[];

      render(<DynamicBarChart data={stringThrowingData} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle data that throws null', () => {
      class NullThrowingData {
        get name() {
          throw null;
        }
        get value() {
          return 3.5;
        }
      }

      const nullThrowingData = [new NullThrowingData()] as unknown as ChartData[];

      render(<DynamicBarChart data={nullThrowingData} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle data that throws undefined', () => {
      class UndefinedThrowingData {
        get name() {
          throw undefined;
        }
        get value() {
          return 3.5;
        }
      }

      const undefinedThrowingData = [new UndefinedThrowingData()] as unknown as ChartData[];

      render(<DynamicBarChart data={undefinedThrowingData} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });
  });

  describe('Y-Axis Configuration Coverage (lines 107-125)', () => {
    it('should apply y-axis formatter configuration', () => {
      const data: ChartData[] = [
        { name: 'Item 1', value: 3.14159 },
        { name: 'Item 2', value: 2.71828 },
      ];

      render(<DynamicBarChart data={data} height={400} isDark={false} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should apply y-axis configuration with dark mode', () => {
      const data: ChartData[] = [
        { name: 'Item 1', value: 4.5 },
      ];

      render(<DynamicBarChart data={data} height={350} isDark={true} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should apply grid padding configuration', () => {
      const data: ChartData[] = [
        { name: 'Item 1', value: 3.5 },
        { name: 'Item 2', value: 4.2 },
      ];

      render(<DynamicBarChart data={data} height={300} isDark={false} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should apply y-axis min, max, and tickAmount configuration', () => {
      const data: ChartData[] = [
        { name: 'Item 1', value: 0 },
        { name: 'Item 2', value: 5 },
      ];

      render(<DynamicBarChart data={data} height={400} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });
  });

  describe('Combined Edge Cases', () => {
    it('should handle error state with custom height', () => {
      class ErrorData {
        get name() {
          throw new Error('Test error');
        }
        get value() {
          return 3.5;
        }
      }

      const errorData = [new ErrorData()] as unknown as ChartData[];

      render(<DynamicBarChart data={errorData} height={500} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle error state with dark mode', () => {
      class ErrorData {
        get name() {
          throw 'String error';
        }
        get value() {
          return 3.5;
        }
      }

      const errorData = [new ErrorData()] as unknown as ChartData[];

      render(<DynamicBarChart data={errorData} isDark={true} />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });

    it('should handle error state with title', () => {
      class ErrorData {
        get name() {
          throw new Error('Title error');
        }
        get value() {
          return 3.5;
        }
      }

      const errorData = [new ErrorData()] as unknown as ChartData[];

      render(<DynamicBarChart data={errorData} title="Error Chart" />);
      expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
    });
  });
});
