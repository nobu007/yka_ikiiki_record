import { expectClasses, createMockedFunction } from './component-helpers';

describe('component-helpers', () => {
  describe('expectClasses', () => {
    it('should assert that element has all specified CSS classes', () => {
      const element = document.createElement('div');
      element.className = 'bg-green-50 border-green-200 text-green-800';

      expect(() => {
        expectClasses(element, 'bg-green-50', 'border-green-200', 'text-green-800');
      }).not.toThrow();
    });

    it('should throw when element is missing a class', () => {
      const element = document.createElement('div');
      element.className = 'bg-green-50 border-green-200';

      expect(() => {
        expectClasses(element, 'bg-green-50', 'text-green-800');
      }).toThrow();
    });

    it('should handle empty className list', () => {
      const element = document.createElement('div');
      element.className = 'some-class';

      expect(() => {
        expectClasses(element);
      }).not.toThrow();
    });

    it('should handle element with no classes', () => {
      const element = document.createElement('div');

      expect(() => {
        expectClasses(element, 'some-class');
      }).toThrow();
    });

    it('should handle multiple classes on element', () => {
      const element = document.createElement('div');
      element.className = 'class1 class2 class3 class4';

      expect(() => {
        expectClasses(element, 'class1', 'class3');
      }).not.toThrow();
    });
  });

  describe('createMockedFunction', () => {
    it('should cast a jest.fn() to properly typed mock function', () => {
      const testFunction = (a: number, _b: string): boolean => {
        return a > 0;
      };

      const mockFn = createMockedFunction(jest.fn(testFunction));
      mockFn.mockReturnValue(true);

      expect(mockFn).toBeDefined();
      expect(jest.isMockFunction(mockFn)).toBe(true);
      expect(mockFn(1, 'test')).toBe(true);
    });

    it('should allow setting mock return value', () => {
      const testFunction = (x: number): number => x * 2;
      const mockFn = createMockedFunction(jest.fn(testFunction));
      mockFn.mockReturnValue(42);

      expect(mockFn(5)).toBe(42);
    });

    it('should allow setting mock implementation', () => {
      const testFunction = (x: number): number => x * 2;
      const mockFn = createMockedFunction(jest.fn(testFunction));
      mockFn.mockImplementation((x) => x * 3);

      expect(mockFn(5)).toBe(15);
    });

    it('should track calls', () => {
      const testFunction = (_x: string): void => {};
      const mockFn = createMockedFunction(jest.fn(testFunction));

      mockFn('test1');
      mockFn('test2');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, 'test1');
      expect(mockFn).toHaveBeenNthCalledWith(2, 'test2');
    });

    it('should handle async functions', async () => {
      const asyncFunction = async (x: number): Promise<string> => {
        return `result-${x}`;
      };
      const mockFn = createMockedFunction(jest.fn(asyncFunction));
      mockFn.mockResolvedValue('mocked-result');

      await expect(mockFn(5)).resolves.toBe('mocked-result');
    });

    it('should handle functions with complex signatures', () => {
      type ComplexFn = (a: number, b: string, c: boolean) => { result: string };
      const complexFn: ComplexFn = () => ({ result: 'test' });
      const mockFn = createMockedFunction(jest.fn(complexFn));
      mockFn.mockReturnValue({ result: 'mocked' });

      expect(mockFn(1, 'test', true)).toEqual({ result: 'mocked' });
    });
  });
});
