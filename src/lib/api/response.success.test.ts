import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from './response';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

describe('createSuccessResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Success Response', () => {
    it('should create success response without schema', () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = { success: true, data: mockData };

      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createSuccessResponse(mockData);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'Test',
          success: true
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should preserve existing success flag in data', () => {
      const mockData = { id: 1, success: false };
      const mockResponse = { success: false, id: 1 };

      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createSuccessResponse(mockData);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          success: false
        })
      );
    });
  });

  describe('Schema Validation', () => {
    it('should create success response with schema validation', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string()
      });

      const mockData = { id: 1, name: 'Test' };
      const mockResponse = { success: true, data: mockData };

      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createSuccessResponse(mockData, schema);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'Test',
          success: true
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle schema validation error', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string()
      });

      const invalidData = { id: 'invalid' };

      const mockErrorResponse = { success: false, error: 'Validation failed' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockErrorResponse);

      const result = createSuccessResponse(invalidData, schema);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('レスポンスの検証に失敗しました')
        }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('should format multiple validation errors', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email()
      });

      const invalidData = { id: 'invalid', name: 123, email: 'not-an-email' };

      const mockErrorResponse = { success: false, error: 'Multiple errors' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockErrorResponse);

      const result = createSuccessResponse(invalidData, schema);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('レスポンスの検証に失敗しました')
        }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('should handle non-ZodError in validation', () => {
      interface MockData {
        id: number;
      }

      const schema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Random error');
        })
      } as unknown as z.ZodSchema<MockData>;

      const mockData = { id: 1 };

      const mockErrorResponse = { success: false, error: 'Validation failed' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockErrorResponse);

      const result = createSuccessResponse(mockData, schema);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'レスポンスの検証に失敗しました'
        }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('Complex Data Types', () => {
    it('should handle nested object validation', () => {
      const schema = z.object({
        user: z.object({
          id: z.number(),
          profile: z.object({
            name: z.string()
          })
        })
      });

      const mockData = {
        user: {
          id: 1,
          profile: {
            name: 'Test User'
          }
        }
      };

      const mockResponse = { success: true, data: mockData };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createSuccessResponse(mockData, schema);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: 1,
            profile: expect.objectContaining({
              name: 'Test User'
            })
          }),
          success: true
        })
      );
    });

    it('should handle array data', () => {
      const schema = z.array(z.object({
        id: z.number(),
        name: z.string()
      }));

      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      const mockResponse = { success: true, data: mockData };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createSuccessResponse(mockData, schema);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
  });
});
