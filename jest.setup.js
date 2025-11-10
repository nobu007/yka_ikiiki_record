import '@testing-library/jest-dom';

// Reduce console noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Only show error logs that aren't from our error handler in test mode
    const message = args[0];
    if (typeof message === 'string' && message.includes('Error:')) {
      // Suppress detailed error logs from our error handler during tests
      return;
    }
    // Suppress React act() warnings in tests since they're expected in our current test setup
    if (typeof message === 'string' && message.includes('Warning: An update to')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock Next.js server components
global.Request = jest.fn();
global.Response = jest.fn();
global.Headers = jest.fn();

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    ...init,
    json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
    headers: new Map()
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      status: 200,
      json: jest.fn().mockResolvedValue(data)
    }))
  }
}));

// Mock fetch API with proper default responses
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ success: true, data: null })
  })
);

// Reset fetch mocks before each test
beforeEach(() => {
  fetch.mockClear();
});