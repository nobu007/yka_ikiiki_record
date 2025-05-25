# アプリケーションアーキテクチャ設計

## レイヤー構成

アプリケーションは以下の4つの主要レイヤーで構成されています：

### 1. ドメイン層 (`src/domain/`)
- エンティティとビジネスロジックの中核
- ビジネスルールとドメインモデルを定義
- 外部依存を持たない純粋なビジネスロジック

### 2. アプリケーション層 (`src/application/`)
- ユースケースの実装
- ドメインサービスの調整
- データフローの制御
- **hooks**: アプリケーションロジックのReactバインディング
  - APIとの通信
  - データの取得と更新
  - ビジネスロジックの実行

### 3. インフラストラクチャ層 (`src/infrastructure/`)
- 外部サービスとの統合
- データベースアクセス
- API通信の実装
- リポジトリの実装

### 4. プレゼンテーション層 (`src/presentation/`)
- ユーザーインターフェース
- コンポーネント
- ページ
- **hooks**: UI固有のロジック
  - ローカルステート管理
  - UIイベントハンドリング
  - フォーム制御
  - アニメーション

## 依存関係のルール

1. 内側のレイヤーは、外側のレイヤーに依存してはいけない
2. すべての依存は内側に向かって流れる
3. 外側のレイヤーは、インターフェースを通じて内側のレイヤーと通信

```
プレゼンテーション層 → アプリケーション層 → ドメイン層 ← インフラストラクチャ層
```

## Hooksの配置ルール

1. アプリケーションHooks (`src/application/hooks/`)
   - ビジネスロジックを含むhooks
   - APIとの通信を行うhooks
   - ドメインサービスを利用するhooks

2. プレゼンテーションHooks (`src/presentation/hooks/`)
   - UI固有のステート管理
   - イベントハンドリング
   - アプリケーションhooksのラッパー

### 具体例

```typescript
// src/application/hooks/useStats.ts
export const useStats = () => {
  // APIとの通信
  // データの加工
  // ドメインサービスの利用
};

// src/presentation/hooks/useStatsDisplay.ts
export const useStatsDisplay = () => {
  const { stats, loading } = useStats();
  // UIステートの管理
  // 表示用データの整形
  // イベントハンドラ
};
```

## 改善計画

1. 現在の `src/hooks/` を `src/application/hooks/` に移動
2. プレゼンテーション固有のロジックを `src/presentation/hooks/` に配置
3. 重複したhooksを整理し、適切なレイヤーに配置
4. レイヤー間の依存関係を明確に定義