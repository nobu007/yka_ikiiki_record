import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from './response';

// NextResponse.json is mocked in jest.setup.js (always returns status 200).
// We verify response BODY content here; status code assertions are skipped
// because the mock doesn't propagate the second argument of NextResponse.json().

describe('lib/api/response', () => {
  describe('createSuccessResponse', () => {
    it('returns response with data', async () => {
      const data = { success: true, message: 'ok' };
      const response = createSuccessResponse(data);

      expect(response).toBeDefined();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe('ok');
    });

    it('preserves success flag from data', async () => {
      const response = createSuccessResponse({ success: false, error: 'fail' });
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    it('defaults success to true when not provided', async () => {
      const data = { name: 'test' } as { name: string; success?: boolean };
      const response = createSuccessResponse(data);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('validates data against schema when provided', async () => {
      const schema = z.object({
        success: z.boolean(),
        count: z.number(),
      });
      const data = { success: true, count: 42 };
      const response = createSuccessResponse(data, schema);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.count).toBe(42);
    });

    it('returns error body when data fails schema validation', async () => {
      const schema = z.object({
        success: z.boolean(),
        count: z.number(),
      });
      const invalidData = { success: true, count: 'not-a-number' } as unknown as {
        success: boolean;
        count: number;
      };
      const response = createSuccessResponse(invalidData, schema);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('レスポンスの検証に失敗しました');
    });

    it('returns error body for non-Zod errors during validation', async () => {
      const throwingSchema = {
        parse: () => {
          throw new Error('unexpected');
        },
      } as unknown as z.ZodSchema;
      const response = createSuccessResponse({ success: true }, throwingSchema);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('レスポンスの検証に失敗しました');
    });

    it('works without schema (pass-through)', async () => {
      const data = { success: true, items: [1, 2, 3] };
      const response = createSuccessResponse(data);
      const body = await response.json();
      expect(body.items).toEqual([1, 2, 3]);
    });

    it('includes Zod error path details in validation failure', async () => {
      const schema = z.object({
        success: z.boolean(),
        nested: z.object({ value: z.number() }),
      });
      const invalidData = { success: true, nested: { value: 'bad' } } as unknown as {
        success: boolean;
        nested: { value: number };
      };
      const response = createSuccessResponse(invalidData, schema);
      const body = await response.json();
      expect(body.error).toContain('nested.value');
    });

    it('calls NextResponse.json with validated data', () => {
      const data = { success: true, value: 10 };
      createSuccessResponse(data);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, value: 10 })
      );
    });
  });

  describe('createErrorResponse', () => {
    it('returns error body with success false', async () => {
      const response = createErrorResponse('Something went wrong');
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Something went wrong');
    });

    it('calls NextResponse.json with error payload and status', () => {
      createErrorResponse('Not Found', 404);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Not Found' },
        { status: 404 }
      );
    });

    it('defaults to status 500', () => {
      createErrorResponse('Server Error');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Server Error' },
        { status: 500 }
      );
    });

    it('passes Japanese error messages correctly', async () => {
      const response = createErrorResponse('入力内容を確認してください', 400);
      const body = await response.json();
      expect(body.error).toBe('入力内容を確認してください');
    });
  });
});
