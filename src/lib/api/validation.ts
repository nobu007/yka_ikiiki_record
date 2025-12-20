import { z } from 'zod';

/**
 * データを指定されたスキーマで検証する
 * @throws {z.ZodError} バリデーションエラー時
 */
export function validateData<T>(data: unknown, schema: z.ZodSchema<T>): T {
  return schema.parse(data);
}

/**
 * データを検証し、エラーをハンドリングする
 * @returns [検証済みデータ, エラーメッセージ]
 */
export function validateDataSafe<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): [T | null, string | null] {
  try {
    const validated = schema.parse(data);
    return [validated, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return [null, errorMessage];
    }
    return [null, '不明なバリデーションエラーが発生しました'];
  }
}

/**
 * リクエストボディを検証する
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<[T | null, string | null]> {
  try {
    const body = await request.json();
    return validateDataSafe(body, schema);
  } catch {
    return [null, 'リクエストボディの解析に失敗しました'];
  }
}