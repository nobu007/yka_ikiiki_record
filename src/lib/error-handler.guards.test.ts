import {
  AppError,
  ValidationError,
  NetworkError,
  isNetworkError,
  isValidationError,
  isNotFoundError,
  isTimeoutError,
  isServerError,
  ERROR_CODES,
} from "./error-handler";

describe("error-handler: Type Guards", () => {
  test("isNetworkError identifies network errors", () => {
    const networkError = new NetworkError("Network failed");
    expect(isNetworkError(networkError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isNetworkError(validationError)).toBe(false);
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
  });

  test("isNotFoundError identifies not found errors", () => {
    const notFoundError = new AppError("Not found", ERROR_CODES.NOT_FOUND, 404);
    expect(isNotFoundError(notFoundError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isNotFoundError(validationError)).toBe(false);
  });

  test("isTimeoutError identifies timeout errors", () => {
    const timeoutError = new AppError("Timeout", ERROR_CODES.TIMEOUT, 408);
    expect(isTimeoutError(timeoutError)).toBe(true);

    const validationError = new ValidationError("Invalid data");
    expect(isTimeoutError(validationError)).toBe(false);
  });

  test("isServerError identifies server errors", () => {
    const serverError = new AppError("Server error", ERROR_CODES.UNKNOWN, 500);
    expect(isServerError(serverError)).toBe(true);

    const clientError = new ValidationError("Client error");
    expect(isServerError(clientError)).toBe(false);
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
