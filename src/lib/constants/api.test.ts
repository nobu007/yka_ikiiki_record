import {
  API_ERROR_MESSAGES,
  HTTP_STATUS,
  DEFAULT_API_RESPONSE,
  API_ENDPOINTS,
  API_OPERATIONS,
} from "./api";

describe("API_ERROR_MESSAGES", () => {
  describe("VALIDATION", () => {
    it("has REQUEST and RESPONSE messages", () => {
      expect(typeof API_ERROR_MESSAGES.VALIDATION.REQUEST).toBe("string");
      expect(typeof API_ERROR_MESSAGES.VALIDATION.RESPONSE).toBe("string");
    });
  });

  describe("AUTH", () => {
    it("has UNAUTHORIZED and FORBIDDEN messages", () => {
      expect(typeof API_ERROR_MESSAGES.AUTH.UNAUTHORIZED).toBe("string");
      expect(typeof API_ERROR_MESSAGES.AUTH.FORBIDDEN).toBe("string");
    });
  });

  describe("SERVER", () => {
    it("has INTERNAL, NOT_FOUND, and BAD_REQUEST messages", () => {
      expect(typeof API_ERROR_MESSAGES.SERVER.INTERNAL).toBe("string");
      expect(typeof API_ERROR_MESSAGES.SERVER.NOT_FOUND).toBe("string");
      expect(typeof API_ERROR_MESSAGES.SERVER.BAD_REQUEST).toBe("string");
    });
  });

  describe("DATA", () => {
    it("has all CRUD error messages", () => {
      expect(typeof API_ERROR_MESSAGES.DATA.NOT_FOUND).toBe("string");
      expect(typeof API_ERROR_MESSAGES.DATA.INVALID).toBe("string");
      expect(typeof API_ERROR_MESSAGES.DATA.CREATE_FAILED).toBe("string");
      expect(typeof API_ERROR_MESSAGES.DATA.UPDATE_FAILED).toBe("string");
      expect(typeof API_ERROR_MESSAGES.DATA.DELETE_FAILED).toBe("string");
    });
  });
});

describe("HTTP_STATUS", () => {
  it("has correct success status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
  });

  it("has correct client error status codes", () => {
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });

  it("has correct server error status codes", () => {
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

describe("DEFAULT_API_RESPONSE", () => {
  it("has success and error messages", () => {
    expect(typeof DEFAULT_API_RESPONSE.SUCCESS_MESSAGE).toBe("string");
    expect(typeof DEFAULT_API_RESPONSE.ERROR_MESSAGE).toBe("string");
  });
});

describe("API_ENDPOINTS", () => {
  it("has SEED and STATS endpoints", () => {
    expect(API_ENDPOINTS.SEED).toBe("/api/seed");
    expect(API_ENDPOINTS.STATS).toBe("/api/stats");
  });

  it("all endpoints start with /api/", () => {
    Object.values(API_ENDPOINTS).forEach((ep) => {
      expect(ep).toMatch(/^\/api\//);
    });
  });
});

describe("API_OPERATIONS", () => {
  it("has correct operation names for all endpoints", () => {
    expect(API_OPERATIONS.GET_STATS).toBe("GET /api/stats");
    expect(API_OPERATIONS.GET_HEALTH).toBe("GET /api/health");
    expect(API_OPERATIONS.GET_SEED).toBe("GET /api/seed");
    expect(API_OPERATIONS.POST_SEED).toBe("POST /api/seed");
  });

  it("all operations follow HTTP_METHOD /path format", () => {
    Object.values(API_OPERATIONS).forEach((op) => {
      expect(op).toMatch(/^(GET|POST|PUT|DELETE|PATCH) \/api\//);
    });
  });

  it("is readonly (as const)", () => {
    expect(API_OPERATIONS).toEqual(
      expect.objectContaining({
        GET_STATS: expect.any(String),
        GET_HEALTH: expect.any(String),
        GET_SEED: expect.any(String),
        POST_SEED: expect.any(String),
      }),
    );
  });
});
