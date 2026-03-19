import {
  AppError,
  ValidationError,
  NetworkError,
  ERROR_CODES,
} from "./error-handler";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

describe("error-handler: Error Classes", () => {
  test("AppError creates proper error instance", () => {
    const error = new AppError("Test error", ERROR_CODES.VALIDATION, 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe(ERROR_CODES.VALIDATION);
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });

  test("ValidationError creates proper error instance", () => {
    const error = new ValidationError("Invalid input");

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Invalid input");
    expect(error.code).toBe(ERROR_CODES.VALIDATION);
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("ValidationError");
  });

  test("NetworkError creates proper error instance", () => {
    const error = new NetworkError("Network failed", 503);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error.message).toBe("Network failed");
    expect(error.code).toBe(ERROR_CODES.NETWORK);
    expect(error.statusCode).toBe(503);
    expect(error.name).toBe("NetworkError");
  });

  test("ValidationError includes details", () => {
    const details = { field: "email", value: "invalid" };
    const error = new ValidationError("Invalid email", details);

    expect(error.details).toEqual(details);
    expect(error.statusCode).toBe(400);
  });

  test("NetworkError uses default message when not provided", () => {
    const error = new NetworkError();
    expect(error.message).toBe(ERROR_MESSAGES.NETWORK);
  });

  test("NetworkError uses default statusCode when not provided", () => {
    const error = new NetworkError("Custom message");
    expect(error.statusCode).toBe(0);
  });
});
