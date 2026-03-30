import { POST } from "./route";
import { UserSchema } from "@/schemas/api";

const SafeUserSchema = UserSchema.omit({ passwordHash: true });
const mockFindByEmail = jest.fn();

jest.mock("@/infrastructure/repositories/InMemoryUserRepository", () => {
  return {
    InMemoryUserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: mockFindByEmail,
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      emailExists: jest.fn(),
      disconnect: jest.fn(),
    })),
  };
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFindByEmail.mockImplementation(async (email: string) => {
      if (email.toLowerCase() === "teacher@example.com") {
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
      if (email.toLowerCase() === "admin@example.com") {
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
      if (email.toLowerCase() === "user123@example.com") {
        return {
          id: 123,
          email: "user123@example.com",
          passwordHash: "salt$5c5363287ae0830450ff5bd719124406eac555e9d433f36322b11695bea1a5ab",
          name: "テストユーザー",
          role: "TEACHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });
  });

  test("returns token and user on successful login", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("teacher@example.com");
  });

  test("returns 401 when email does not exist", async () => {
    const request = {
      json: async () => ({
        email: "nonexistent@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 401 when password is incorrect", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
        password: "wrong_password",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 400 when request body is invalid JSON", async () => {
    const request = {
      json: async () => {
        throw new SyntaxError("Invalid JSON");
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 400 when email is missing", async () => {
    const request = {
      json: async () => ({
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("email");
  });

  test("returns 400 when email format is invalid", async () => {
    const request = {
      json: async () => ({
        email: "not-an-email",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("email");
  });

  test("returns 400 when password is missing", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("password");
  });

  test("returns 400 when password is empty string", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
        password: "",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("password");
  });

  test("token contains user ID and timestamp", async () => {
    const request = {
      json: async () => ({
        email: "user123@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toMatch(/^session_123_\d+_/);
  });

  test("returns user with correct schema", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const userValidation = SafeUserSchema.safeParse(data.user);
    expect(userValidation.success).toBe(true);

    expect(data.user.id).toBe(1);
    expect(data.user.email).toBe("teacher@example.com");
    expect(data.user.name).toBe("田中先生");
    expect(data.user.role).toBe("TEACHER");
    expect(data.user.passwordHash).toBeUndefined();
  });

  test("handles ADMIN role login", async () => {
    const request = {
      json: async () => ({
        email: "admin@example.com",
        password: "admin123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe("ADMIN");
  });

  test("case-insensitive email lookup", async () => {
    const request = {
      json: async () => ({
        email: "TEACHER@EXAMPLE.COM",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("includes timestamps in response", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.createdAt).toBeDefined();
    expect(data.user.updatedAt).toBeDefined();
  });

  test("does not expose passwordHash in response", async () => {
    const request = {
      json: async () => ({
        email: "teacher@example.com",
        password: "password123",
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.passwordHash).toBeUndefined();
  });
});
