import { validateData } from './validation';
import { z } from 'zod';

describe('validation - Core', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
    email: z.string().email().optional()
  });

  describe('validateData', () => {
    it('should validate valid data successfully', () => {
      const validData = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const result = validateData(validData, testSchema);

      expect(result).toEqual(validData);
    });

    it('should throw ZodError for invalid data', () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'invalid-email'
      };

      expect(() => validateData(invalidData, testSchema)).toThrow(z.ZodError);
    });

    it('should throw error for null data', () => {
      expect(() => validateData(null, testSchema)).toThrow(z.ZodError);
    });

    it('should throw error for undefined data', () => {
      expect(() => validateData(undefined, testSchema)).toThrow(z.ZodError);
    });

    it('should return typed result', () => {
      interface TestData {
        name: string;
        age: number;
      }

      const typedSchema = z.object({
        name: z.string(),
        age: z.number()
      });

      const data = { name: 'Test', age: 25 };
      const result = validateData<TestData>(data, typedSchema);

      expect(result.name).toBe('Test');
      expect(result.age).toBe(25);
    });
  });
});
