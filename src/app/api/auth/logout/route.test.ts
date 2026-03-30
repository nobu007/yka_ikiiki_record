import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  test("returns success on valid logout with Bearer token", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer valid_token_123";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Logged out successfully");
    expect(data.error).toBeUndefined();
  });

  test("returns 401 when authorization header is missing", async () => {
    const request = {
      headers: {
        get: (_name: string) => null,
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 401 when authorization header does not start with Bearer", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "InvalidFormat token_123";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("returns 401 when authorization header has only 'Bearer' without token", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test("accepts Bearer token with any format", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer any_random_token_string";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Logged out successfully");
  });

  test("accepts empty token after Bearer", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer ";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("case-sensitive Bearer keyword", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "bearer token_123";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  test("handles authorization header with extra spaces", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer  token_with_spaces";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("logout does not validate token format", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer invalid_token_format";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("returns consistent response structure", async () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === "authorization") return "Bearer session_123_456";
          return null;
        },
      },
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(data)).toContain("success");
    expect(Object.keys(data)).toContain("message");
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("message");
  });
});
