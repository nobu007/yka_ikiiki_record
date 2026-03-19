import { z } from "zod";
import { API_ERROR_MESSAGES } from "@/lib/constants/messages";

export function validateData<T>(data: unknown, schema: z.ZodSchema<T>): T {
  return schema.parse(data);
}

export function validateDataSafe<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): [T | null, string | null] {
  try {
    const validated = schema.parse(data);
    return [validated, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return [null, errorMessage];
    }
    return [null, API_ERROR_MESSAGES.UNKNOWN_VALIDATION_ERROR];
  }
}

export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<[T | null, string | null]> {
  try {
    const body = await request.json();
    return validateDataSafe(body, schema);
  } catch {
    return [null, API_ERROR_MESSAGES.REQUEST_BODY_PARSE_FAILED];
  }
}
