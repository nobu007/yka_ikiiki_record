import { NextRequest } from 'next/server';
import { SeedResponseSchema } from '@/schemas/api';
import { createSuccessResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';

export async function POST(req: NextRequest) {
  // withErrorHandler内で処理を実行
  return withErrorHandler(async () => {
    // 実際のデータ生成ロジックはここに実装
    // この例ではモックの成功レスポンスを返します
    const mockResponse = {
      success: true,
      message: 'テストデータの生成が完了しました',
      error: undefined
    };

    // スキーマによる検証とレスポンス生成
    return createSuccessResponse(mockResponse, SeedResponseSchema);
  });
}
