import { Stats } from '../entities/Stats';

/**
 * 統計情報のリポジトリインターフェース
 * データの永続化層とドメイン層の橋渡しを行う
 */
export interface StatsRepository {
  /**
   * 統計情報を取得
   */
  getStats(): Promise<Stats>;

  /**
   * テストデータを生成
   */
  generateSeedData(): Promise<void>;
}