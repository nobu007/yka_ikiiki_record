import {
  AppError,
  ValidationError,
  NetworkError,
  normalizeError,
  getUserFriendlyMessage,
  ERROR_CODES,
} from "./error-handler";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

describe("error-handler: normalizeError & getUserFriendlyMessage", () => {
  describe("normalizeError", () => {
    test("returns AppError as-is", () => {
      const appError = new AppError("Test error");
      const result = normalizeError(appError);

      expect(result).toBe(appError);
    });

    test("converts generic Error to AppError", () => {
      const genericError = new Error("Generic error");
      const result = normalizeError(genericError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("Generic error");
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
      expect(result.statusCode).toBe(500);
    });

    test("converts TypeError to NetworkError", () => {
      const typeError = new TypeError("Failed to fetch");
      const result = normalizeError(typeError);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.message).toBe("Failed to fetch");
      expect(result.code).toBe(ERROR_CODES.NETWORK);
    });

    test("converts fetch-related error to NetworkError", () => {
      const fetchError = new Error("fetch failed");
      const result = normalizeError(fetchError);

      expect(result).toBeInstanceOf(NetworkError);
    });

    test("converts connection-related error to NetworkError", () => {
      const connectionError = new Error("connection lost");
      const result = normalizeError(connectionError);

      expect(result).toBeInstanceOf(NetworkError);
    });

    test("converts network-related error to NetworkError", () => {
      const networkError = new Error("network timeout");
      const result = normalizeError(networkError);

      expect(result).toBeInstanceOf(NetworkError);
    });

    test("converts string to AppError", () => {
      const stringError = "String error";
      const result = normalizeError(stringError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("String error");
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });

    test("handles unknown error type", () => {
      const unknownError = { some: "object" };
      const result = normalizeError(unknownError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("予期せぬエラーが発生しました");
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });

    test("handles null error", () => {
      const result = normalizeError(null);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("予期せぬエラーが発生しました");
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });

    test("handles undefined error", () => {
      const result = normalizeError(undefined);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("予期せぬエラーが発生しました");
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });
  });

  describe("getUserFriendlyMessage", () => {
    test("returns original message for validation errors", () => {
      const validationError = new ValidationError("Invalid data");
      const message = getUserFriendlyMessage(validationError);

      expect(message).toBe("Invalid data");
    });

    test("returns error message for unknown error codes", () => {
      const customError = new AppError("Custom message", ERROR_CODES.UNKNOWN);
      const message = getUserFriendlyMessage(customError);

      expect(message).toBe(ERROR_MESSAGES.UNEXPECTED);
    });

    test("handles generic errors", () => {
      const genericError = new Error("Generic error");
      const message = getUserFriendlyMessage(genericError);

      expect(message).toBe("予期せぬエラーが発生しました");
    });

    test("returns original message for error codes not in messageMap", () => {
      const customError = new AppError("Custom code message", "CUSTOM_CODE" as ErrorCodeType);
      const message = getUserFriendlyMessage(customError);

      expect(message).toBe("Custom code message");
    });
  });
});
