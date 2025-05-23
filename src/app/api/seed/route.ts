import { NextResponse } from 'next/server';
import { SeedResponseSchema } from '@/types/api';

export async function POST() {
  try {
    // 実際のデータ生成ロジックはここに実装
    // この例ではモックの成功レスポンスを返します
    const mockResponse = {
      success: true,
      message: 'テストデータの生成が完了しました'
    };

    // Zodでバリデーション
    const validatedResponse = SeedResponseSchema.parse(mockResponse);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Seed API Error:', error);

    const errorResponse = {
      success: false,
      error: 'データ生成中にエラーが発生しました'
    };

    // エラーレスポンスもバリデーション
    const validatedErrorResponse = SeedResponseSchema.parse(errorResponse);

    return NextResponse.json(validatedErrorResponse, { status: 500 });
  }
}
