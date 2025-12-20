import '@testing-library/jest-dom';

// Enhanced fetch mock types
declare global {
  const fetch: jest.MockedFunction<typeof fetch>;
}

// Mock types for testing
interface MockFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
    }
  }
}