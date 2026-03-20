import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standard API response structure for all endpoints.
 *
 * Provides a consistent format for successful and error responses across
 * the application, with optional data payload and message/error fields.
 *
 * @template T - Type of the data payload (if present)
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

/**
 * Creates a successful JSON response with optional schema validation.
 *
 * @template T - The type of data being returned
 * @param {T & { success?: boolean }} data - The response data to validate and return
 * @param {z.ZodSchema<T>} [schema] - Optional Zod schema for runtime validation
 * @returns {NextResponse} JSON response with success: true
 *
 * @example
 * ```ts
 * // Without validation
 * return createSuccessResponse({ data: myData });
 *
 * // With Zod validation
 * return createSuccessResponse(responseData, StatsResponseSchema);
 * ```
 */
export function createSuccessResponse<T>(
  data: T & { success?: boolean },
  schema?: z.ZodSchema<T>,
) {
  try {
    const validatedData = schema ? schema.parse(data) : data;

    const responseData = {
      ...validatedData,
      success: data.success !== undefined ? data.success : true,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return createErrorResponse(
        "レスポンスの検証に失敗しました: " + errorMessage,
        400,
      );
    }
    return createErrorResponse("レスポンスの検証に失敗しました", 500);
  }
}

/**
 * Creates an error response with the specified status code.
 *
 * @param {string} message - Error message describing what went wrong
 * @param {number} [status=500] - HTTP status code (defaults to 500 Internal Server Error)
 * @returns {NextResponse} JSON response with success: false and error message
 *
 * @example
 * ```ts
 * // Default 500 error
 * return createErrorResponse("Database connection failed");
 *
 * // Custom status code
 * return createErrorResponse("Resource not found", 404);
 * ```
 */
export function createErrorResponse(message: string, status = 500) {
  const response = {
    success: false,
    error: message,
  };
  return NextResponse.json(response, { status });
}
