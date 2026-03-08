import { validateData, validateDataSafe, validateRequestBody } from './validation';
import { z } from 'zod';

describe('validation', () => {
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

  describe('validateDataSafe', () => {
    it('should validate valid data successfully', () => {
      const validData = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const [result, error] = validateDataSafe(validData, testSchema);

      expect(result).toEqual(validData);
      expect(error).toBeNull();
    });

    it('should return error for invalid data', () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'invalid-email'
      };

      const [result, error] = validateDataSafe(invalidData, testSchema);

      expect(result).toBeNull();
      expect(error).toBeDefined();
      expect(typeof error).toBe('string');
    });

    it('should format multiple validation errors', () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'not-an-email'
      };

      const [result, error] = validateDataSafe(invalidData, testSchema);

      expect(result).toBeNull();
      expect(error).toContain('name:');
      expect(error).toContain('age:');
      expect(error).toContain('email:');
    });

    it('should handle partial valid data with optional fields', () => {
      const partialData = {
        name: 'Jane Doe',
        age: 30
      };

      const [result, error] = validateDataSafe(partialData, testSchema);

      expect(result).toEqual(partialData);
      expect(error).toBeNull();
    });

    it('should handle null/undefined data', () => {
      const [result1, error1] = validateDataSafe(null, testSchema);
      const [result2, error2] = validateDataSafe(undefined, testSchema);

      expect(result1).toBeNull();
      expect(error1).toBeDefined();
      expect(result2).toBeNull();
      expect(error2).toBeDefined();
    });

    it('should handle complex nested schemas', () => {
      const complexSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            preferences: z.array(z.string()).optional()
          })
        }),
        metadata: z.record(z.string(), z.unknown()).optional()
      });

      const complexData = {
        user: {
          profile: {
            name: 'Test User',
            preferences: ['option1', 'option2']
          }
        },
        metadata: {
          source: 'web',
          timestamp: Date.now().toString()
        }
      };

      const [result, error] = validateDataSafe(complexData, complexSchema);

      expect(result).toEqual(complexData);
      expect(error).toBeNull();
    });

    it('should handle array validation', () => {
      const arraySchema = z.array(z.object({
        id: z.number(),
        name: z.string()
      }));

      const arrayData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      const [result, error] = validateDataSafe(arrayData, arraySchema);

      expect(result).toEqual(arrayData);
      expect(error).toBeNull();
    });

    it('should handle non-ZodError exceptions', () => {
      const throwingSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Non-ZodError');
        })
      } as unknown as z.ZodSchema<{ id: number }>;

      const [result, error] = validateDataSafe({ id: 1 }, throwingSchema);

      expect(result).toBeNull();
      expect(error).toBe('不明なバリデーションエラーが発生しました');
    });

    it('should handle union types', () => {
      const unionSchema = z.union([
        z.object({ type: z.literal('user'), name: z.string() }),
        z.object({ type: z.literal('admin'), permissions: z.array(z.string()) })
      ]);

      const userData = { type: 'user' as const, name: 'John' };
      const [result1, error1] = validateDataSafe(userData, unionSchema);

      expect(result1).toEqual(userData);
      expect(error1).toBeNull();

      const adminData = { type: 'admin' as const, permissions: ['read', 'write'] };
      const [result2, error2] = validateDataSafe(adminData, unionSchema);

      expect(result2).toEqual(adminData);
      expect(error2).toBeNull();
    });
  });

  describe('validateRequestBody', () => {
    it('should validate valid JSON request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'Test User',
          age: 30
        })
      } as unknown as Request;

      const [result, error] = await validateRequestBody(mockRequest, testSchema);

      expect(result).toEqual({ name: 'Test User', age: 30 });
      expect(error).toBeNull();
    });

    it('should return error for invalid request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: '',
          age: -1
        })
      } as unknown as Request;

      const [result, error] = await validateRequestBody(mockRequest, testSchema);

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
      } as unknown as Request;

      const [result, error] = await validateRequestBody(mockRequest, testSchema);

      expect(result).toBeNull();
      expect(error).toBe('リクエストボディの解析に失敗しました');
    });

    it('should handle empty request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(null)
      } as unknown as Request;

      const [result, error] = await validateRequestBody(mockRequest, testSchema);

      expect(result).toBeNull();
      expect(error).toBeDefined();
    });

    it('should handle request body with extra fields', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'Test User',
          age: 30,
          extraField: 'should be ignored'
        })
      } as unknown as Request;

      const [result, error] = await validateRequestBody(mockRequest, testSchema);

      expect(error).toBeNull();
      expect(result?.name).toBe('Test User');
    });
  });
});