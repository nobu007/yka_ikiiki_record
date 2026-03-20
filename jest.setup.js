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
jest.mock('next/server', () => {
  const NextResponseMock = jest.fn().mockImplementation((body, init) => ({
    status: init?.status || 200,
    headers: {
      get: jest.fn((name) => init?.headers?.[name]),
      set: jest.fn(),
    },
    text: async () => typeof body === 'string' ? body : JSON.stringify(body),
    json: async () => typeof body === 'string' ? JSON.parse(body) : body,
  }));
  NextResponseMock.json = jest.fn().mockImplementation((data, init) => ({
    status: init?.status || 200,
    headers: {
      get: jest.fn((name) => init?.headers?.[name]),
      set: jest.fn(),
    },
    json: async () => data,
    text: async () => JSON.stringify(data),
  }));
  return {
    NextRequest: jest.fn().mockImplementation((url, init) => ({
      url,
      ...init,
      json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
      headers: new Map()
    })),
    NextResponse: NextResponseMock,
  };
});

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
  jest.clearAllMocks();
  if (global.fetch) {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  }
});

// Clean up fetch mocks after each test (but preserve Next.js mocks)
afterEach(() => {
  if (global.fetch) {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
  }
});