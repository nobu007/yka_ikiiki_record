import { GET } from "./route";

const mockFindById = jest.fn();

jest.mock("@/infrastructure/repositories/InMemoryUserRepository", () => {
  return {
    InMemoryUserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: mockFindById,
      findAll: jest.fn(),
      findByRole: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      emailExists: jest.fn(),
      disconnect: jest.fn(),
    })),
  };
});

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFindById.mockImplementation(async (id: number) => {
      if (id === 1) {
        return {
          id: 1,
          email: "teacher@example.com",
          passwordHash: "salt$5c5363287ae0830450ff5bd719124406eac555e9d433f36322b11695bea1a5ab",
          name: "田中先生",
          role: "TEACHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (id === 2) {
        return {
          id: 2,
          email: "admin@example.com",
          passwordHash: "salt$94c71d5c329e1316413b96759bfebfeecff0cfb7a205ea5c2eacf344719483cf",
          name: "管理者",
          role: "ADMIN",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (id === 42) {
        return {
          id: 42,
          email: "admin@example.com",
          passwordHash: "salt$hash",
          name: "管理者",
          role: "ADMIN",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (id === 123) {
        return {
          id: 123,
          email: "user123@example.com",
          passwordHash: "salt$hash",
          name: "テストユーザー",
          role: "TEACHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (id === 999999) {
        return {
          id: 999999,
          email: "user999999@example.com",
          passwordHash: "salt$hash",
          name: "大規模テストユーザー",
          role: "TEACHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });
  });

  test("returns authenticated:true with valid token and existing user", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_1_1234567890_abc";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.id).toBe(1);
    expect(data.user.email).toBe("teacher@example.com");
    expect(data.user.passwordHash).toBeUndefined();
  });

  test("returns authenticated:false when no authorization header", async () => {
    const request = {
      headers: {
        get: (_name: string) => null,
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(false);
    expect(data.user).toBeUndefined();
  });

  test("returns authenticated:false when authorization header is not Bearer", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "InvalidFormat token";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(false);
  });

  test("returns authenticated:false when token format is invalid", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer invalid_token";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(false);
  });

  test("returns authenticated:false when user does not exist", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_999_1234567890_abc";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(false);
    expect(data.user).toBeUndefined();
  });

  test("extracts user ID correctly from token", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_42_1234567890_xyz";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(true);
    expect(data.user.id).toBe(42);
    expect(mockFindById).toHaveBeenCalledWith(42);
  });

  test("handles ADMIN role correctly", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_2_1234567890_admin";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(true);
    expect(data.user.role).toBe("ADMIN");
  });

  test("handles TEACHER role correctly", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_1_1234567890_teacher";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(true);
    expect(data.user.role).toBe("TEACHER");
  });

  test("does not expose passwordHash in session response", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_1_1234567890_abc";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.passwordHash).toBeUndefined();
  });

  test("includes timestamps in user response", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_1_1234567890_abc";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.createdAt).toBeDefined();
    expect(data.user.updatedAt).toBeDefined();
  });

  test("handles large user IDs in token", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_999999_1234567890_abc";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(true);
    expect(data.user.id).toBe(999999);
  });

  test("handles token with multiple underscores", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_1_123_456_789_abc_def";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(true);
  });

  test("returns consistent response structure for unauthenticated request", async () => {
    const request = {
      headers: {
        get: (_name: string) => null,
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(data)).toContain("success");
    expect(Object.keys(data)).toContain("authenticated");
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("authenticated", false);
  });

  test("returns consistent response structure for authenticated request", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_1_1234567890_abc";
          return null;
        },
      },
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(data)).toContain("success");
    expect(Object.keys(data)).toContain("authenticated");
    expect(Object.keys(data)).toContain("user");
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("authenticated", true);
    expect(data).toHaveProperty("user");
  });
});
