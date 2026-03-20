import {
  AppError,
  ValidationError,
  NetworkError,
  isAppError,
  isNetworkError,
  isValidationError,
  isNotFoundError,
  isTimeoutError,
  isServerError,
  ERROR_CODES,
} from "./error-handler";

describe("error-handler: Type Guards", () => {
  test("isAppError identifies AppError instances", () => {
    const appError = new AppError("Application error");
    expect(isAppError(appError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isAppError(validationError)).toBe(true);

    const networkError = new NetworkError("Network failed");
    expect(isAppError(networkError)).toBe(true);

    const plainError = new Error("Plain error");
    expect(isAppError(plainError)).toBe(false);

    const nullValue = null;
    expect(isAppError(nullValue)).toBe(false);

    const undefinedValue = undefined;
    expect(isAppError(undefinedValue)).toBe(false);

    const stringValue = "string error";
    expect(isAppError(stringValue)).toBe(false);
  });

  test("isAppError enables type narrowing", () => {
    const unknownError: unknown = new AppError("Test error");

    if (isAppError(unknownError)) {
      expect(unknownError.code).toBeDefined();
      expect(unknownError.statusCode).toBeDefined();
      expect(unknownError.message).toBeDefined();
    } else {
      fail("Should have narrowed to AppError");
    }
  });

  test("isNetworkError identifies network errors", () => {
    const networkError = new NetworkError("Network failed");
    expect(isNetworkError(networkError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isNetworkError(validationError)).toBe(false);

    const plainError = new Error("Plain error");
    expect(isNetworkError(plainError)).toBe(false);
  });

  test("isNetworkError enables type narrowing to NetworkError", () => {
    const unknownError: unknown = new NetworkError("Network failed");

    if (isNetworkError(unknownError)) {
      expect(unknownError.code).toBe(ERROR_CODES.NETWORK);
      expect(unknownError.statusCode).toBe(0);
    } else {
      fail("Should have narrowed to NetworkError");
    }
  });

  test("isNetworkError identifies errors with statusCode 0", () => {
    const errorWithZeroStatus = new AppError("Failed", ERROR_CODES.UNKNOWN, 0);
    expect(isNetworkError(errorWithZeroStatus)).toBe(true);
  });

  test("isValidationError identifies validation errors", () => {
    const validationError = new ValidationError("Invalid data");
    expect(isValidationError(validationError)).toBe(true);

    const networkError = new NetworkError("Network failed");
    expect(isValidationError(networkError)).toBe(false);

    const plainError = new Error("Plain error");
    expect(isValidationError(plainError)).toBe(false);
  });

  test("isValidationError enables type narrowing to ValidationError", () => {
    const unknownError: unknown = new ValidationError("Invalid data");

    if (isValidationError(unknownError)) {
      expect(unknownError.code).toBe(ERROR_CODES.VALIDATION);
      expect(unknownError.statusCode).toBe(400);
    } else {
      fail("Should have narrowed to ValidationError");
    }
  });

  test("isNotFoundError identifies not found errors", () => {
    const notFoundError = new AppError("Not found", ERROR_CODES.NOT_FOUND, 404);
    expect(isNotFoundError(notFoundError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isNotFoundError(validationError)).toBe(false);

    const plainError = new Error("Plain error");
    expect(isNotFoundError(plainError)).toBe(false);
  });

  test("isNotFoundError enables type narrowing to AppError", () => {
    const unknownError: unknown = new AppError(
      "Not found",
      ERROR_CODES.NOT_FOUND,
      404,
    );

    if (isNotFoundError(unknownError)) {
      expect(unknownError.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(unknownError.statusCode).toBe(404);
    } else {
      fail("Should have narrowed to AppError");
    }
  });

  test("isTimeoutError identifies timeout errors", () => {
    const timeoutError = new AppError("Timeout", ERROR_CODES.TIMEOUT, 408);
    expect(isTimeoutError(timeoutError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isTimeoutError(validationError)).toBe(false);

    const plainError = new Error("Plain error");
    expect(isTimeoutError(plainError)).toBe(false);
  });

  test("isTimeoutError enables type narrowing to AppError", () => {
    const unknownError: unknown = new AppError(
      "Timeout",
      ERROR_CODES.TIMEOUT,
      408,
    );

    if (isTimeoutError(unknownError)) {
      expect(unknownError.code).toBe(ERROR_CODES.TIMEOUT);
      expect(unknownError.statusCode).toBe(408);
    } else {
      fail("Should have narrowed to AppError");
    }
  });

  test("isServerError identifies server errors", () => {
    const serverError = new AppError("Server error", ERROR_CODES.UNKNOWN, 500);
    expect(isServerError(serverError)).toBe(true);

    const clientError = new ValidationError("Client error");
    expect(isServerError(clientError)).toBe(false);

    const plainError = new Error("Plain error");
    expect(isServerError(plainError)).toBe(false);
  });

  test("isServerError enables type narrowing to AppError", () => {
    const unknownError: unknown = new AppError(
      "Server error",
      ERROR_CODES.UNKNOWN,
      500,
    );

    if (isServerError(unknownError)) {
      expect(unknownError.statusCode).toBeGreaterThanOrEqual(500);
      expect(unknownError.code).toBeDefined();
    } else {
      fail("Should have narrowed to AppError");
    }
  });

  test("isServerError returns false for 4xx errors", () => {
    const notFoundError = new AppError("Not found", ERROR_CODES.NOT_FOUND, 404);
    expect(isServerError(notFoundError)).toBe(false);
  });

  test("isServerError returns true for 503 errors", () => {
    const serviceUnavailableError = new AppError(
      "Service unavailable",
      ERROR_CODES.UNKNOWN,
      503,
    );
    expect(isServerError(serviceUnavailableError)).toBe(true);
  });
});
