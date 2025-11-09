import '@testing-library/jest-dom';

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