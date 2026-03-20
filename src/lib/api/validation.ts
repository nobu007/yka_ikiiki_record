import { z } from "zod";
import { API_ERROR_MESSAGES } from "@/lib/constants/messages";

/**
 * Validates data against a Zod schema, throwing on validation failure.
 *
 * @template T - The expected type after validation
 * @param {unknown} data - The data to validate
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate against
 * @returns {T} The validated and typed data
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```ts
 * try {
 *   const validated = validateData(rawData, MySchema);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error(error.errors);
 *   }
 * }
 * ```
 */
export function validateData<T>(data: unknown, schema: z.ZodSchema<T>): T {
  return schema.parse(data);
}

/**
 * Safely validates data against a Zod schema without throwing.
 *
 * @template T - The expected type after validation
 * @param {unknown} data - The data to validate
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate against
 * @returns {[T | null, string | null]} Tuple of [validatedData, errorMessage]
 * - If validation succeeds: [validatedData, null]
 * - If validation fails: [null, errorMessage]
 *
 * @example
 * ```ts
 * const [data, error] = validateDataSafe(rawData, MySchema);
 * if (error) {
 *   console.error("Validation failed:", error);
 *   return;
 * }
 * // Use validated data
 * ```
 */
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

/**
 * Validates a request body against a Zod schema.
 *
 * @template T - The expected type after validation
 * @param {Request} request - The HTTP request to parse and validate
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate against
 * @returns {Promise<[T | null, string | null]>} Tuple of [validatedData, errorMessage]
 * - If parsing and validation succeed: [validatedData, null]
 * - If parsing or validation fails: [null, errorMessage]
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const [data, error] = await validateRequestBody(request, SeedRequestSchema);
 *   if (error) {
 *     return createErrorResponse(error, 400);
 *   }
 *   // Use validated data
 * }
 * ```
 */
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
