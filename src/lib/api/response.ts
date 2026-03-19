import { NextResponse } from "next/server";
import { z } from "zod";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

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

export function createErrorResponse(message: string, status = 500) {
  const response = {
    success: false,
    error: message,
  };
  return NextResponse.json(response, { status });
}
