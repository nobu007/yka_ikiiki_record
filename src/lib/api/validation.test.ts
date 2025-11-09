import { validateDataSafe } from './validation';
import { z } from 'zod';

describe('validation', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
    email: z.string().email().optional()
  });

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
      metadata: z.record(z.any()).optional()
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
        timestamp: Date.now()
      }
    };

    const [result, error] = validateDataSafe(complexData, complexSchema);

    expect(result).toEqual(complexData);
    expect(error).toBeNull();
  });
});