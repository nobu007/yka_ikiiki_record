import { NextResponse } from 'next/server';
import { createErrorResponse } from './response';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

describe('createErrorResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Code Handling', () => {
    it('should create error response with default status', () => {
      const mockResponse = { success: false, error: 'Test error' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse('Test error');

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Test error' },
        { status: 500 }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create error response with custom status', () => {
      const mockResponse = { success: false, error: 'Not found' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse('Not found', 404);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 400 status code', () => {
      const mockResponse = { success: false, error: 'Bad request' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse('Bad request', 400);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Bad request' },
        { status: 400 }
      );
    });

    it('should handle 401 status code', () => {
      const mockResponse = { success: false, error: 'Unauthorized' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse('Unauthorized', 401);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    });
  });

  describe('Error Message Edge Cases', () => {
    it('should handle empty error message', () => {
      const mockResponse = { success: false, error: '' };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse('');

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: '' },
        { status: 500 }
      );
    });

    it('should handle long error message', () => {
      const longMessage = 'A'.repeat(1000);
      const mockResponse = { success: false, error: longMessage };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse(longMessage);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: longMessage },
        { status: 500 }
      );
    });

    it('should handle special characters in error message', () => {
      const specialMessage = 'Error: <script>alert("xss")</script> & "quotes"';
      const mockResponse = { success: false, error: specialMessage };
      (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);

      const result = createErrorResponse(specialMessage);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, error: specialMessage },
        { status: 500 }
      );
    });
  });
});
