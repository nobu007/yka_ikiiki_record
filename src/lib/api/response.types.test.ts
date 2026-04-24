import { ApiResponse } from './response';

describe('ApiResponse Type', () => {
  describe('Success Response Types', () => {
    it('should type success response correctly', () => {
      const successResponse: ApiResponse<{ id: number }> = {
        success: true,
        data: { id: 1 }
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data?.id).toBe(1);
    });
  });

  describe('Error Response Types', () => {
    it('should type error response correctly', () => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Error occurred'
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Error occurred');
    });
  });

  describe('Message Response Types', () => {
    it('should type response with message correctly', () => {
      const messageResponse: ApiResponse<string> = {
        success: true,
        data: 'Success data',
        message: 'Operation completed'
      };

      expect(messageResponse.success).toBe(true);
      expect(messageResponse.message).toBe('Operation completed');
    });
  });
});
