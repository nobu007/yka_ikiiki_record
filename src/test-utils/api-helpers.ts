/**
 * API Testing Helper Utilities
 *
 * Provides reusable helpers for API mocking and testing
 */

export type MockFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json?: () => Promise<unknown>;
};

export function setupMockFetch() {
  if (!global.fetch) {
    global.fetch = jest.fn();
  }
  return global.fetch as jest.MockedFunction<typeof fetch>;
}

export function createMockResponse(
  data: unknown,
  status: number = 200
): MockFetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data
  };
}

export function createSuccessResponse(data: unknown): MockFetchResponse {
  return createMockResponse({ success: true, data }, 200);
}

export function createErrorResponse(error: string, status: number = 500): MockFetchResponse {
  return createMockResponse({ success: false, error }, status);
}

export function mockFetchSuccess(mockFetch: jest.MockedFunction<typeof fetch>, data: unknown) {
  mockFetch.mockResolvedValueOnce(createSuccessResponse(data) as Response);
}

export function mockFetchError(mockFetch: jest.MockedFunction<typeof fetch>, error: string, status: number = 500) {
  mockFetch.mockResolvedValueOnce(createErrorResponse(error, status) as Response);
}

export function mockFetchNetworkError(mockFetch: jest.MockedFunction<typeof fetch>, message: string = 'Network error') {
  mockFetch.mockRejectedValueOnce(new Error(message));
}

export function cleanupMockFetch(mockFetch: jest.MockedFunction<typeof fetch>) {
  mockFetch.mockReset();
}
