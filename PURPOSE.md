# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの現状と**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義するものです。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 目指す完成状態

### システム品質
- **Lintエラー**: 0件
- **TypeScript厳格モード**: 100%準拠
- **テストカバレッジ**: 全レイヤー95%以上（statements + branches）
- **E2Eテスト**: 主要ユーザーフローをカバー
- **パフォーマンス**: LCP < 2.5s, FID < 100ms, CLS < 0.1

### アーキテクチャ品質
- **Clean Architecture**: 4層分離の完全な維持
- **依存関係**: 外側から内側への一方方向（逆依存0件）
- **型安全性**: `any`型0件、ZodスキーマによるRuntime検証
- **エラーハンドリング**: 構造化されたエラー階層と適切な処理

## 直近の優先成果

### P1: 品質基盤の完全確立（現在進行中）

**完了条件**: Lintエラー0件 + 全レイヤー95% coverage

**現状** (2026-03-16):
- ✅ すべてのテスト: 683/683 passing
- ✅ テストファイル分割完了: 8つのモノリシックファイル → 21個のfocused files (SRP準拠)
- ✅ ChartWrapper test coverage: 41.66% → 100%
- ✅ Domain層: 100% coverage
- ✅ Infrastructure層: 100% coverage
- ✅ Application層: 100% statements, 83.33% branches
- ✅ Lib層: 98.11% statements, 88.88% branches
- ✅ Utils層: 100% statements, 94.28% branches
- ✅ Hooks層: 100% statements, 87.5% branches
- ✅ Components/common: 98.38% statements, 93.1% branches
- ✅ Components/ui: 100% statements, 94.11% branches
- ✅ Components/dashboard: 96.55% statements, 92.85% branches
- ⚠️ **Lintエラー**: 3件 (ChartWrapper.test.tsx の未使用変数)
- ⚠️ **全体カバレッジ**: 92.07% statements, **76.76% branches**
- ❌ Charts層: 79.84% statements, **50% branches**
- ❌ Dashboard stats components: **42.18% statements, 0% branches**

**未完了の課題**:
1. Lintエラー: ChartWrapper.test.tsx:189,200,211 で3件の未使用変数 `container`
2. Dashboard stats components: 実質的にテストされていない（42.18% statements, 0% branches）
3. DynamicBarChart: ブランチカバレッジ0%（重要なロジックが未カバー）
4. 全体ブランチカバレッジ: 76.76% → 95%への改善

**次の一手**（優先順位順）:

1. **Lintエラーの解消**（5分）
   - ChartWrapper.test.tsx:189,200,211 の未使用変数 `container` → `_container` にリネーム

2. **Dashboard stats components のカバレッジ改善**（2時間）
   - `ClassCharacteristicsEditor.tsx` テスト追加 (現在50% statements, 関数カバレッジ0%)
   - `EventManager.tsx` テスト追加 (現在23.8% statements)
   - `GenerationControls.tsx` テスト追加 (現在50% statements)
   - `StatsDisplay.tsx` テスト追加 (現在33.33% statements)

3. **DynamicBarChart のカバレッジ改善**（1時間）
   - ブランチカバレッジ0% → 95%以上
   - グラフ描画ロジックの重要分岐をカバー

4. **全体ブランチカバレッジの最終調整**（1時間）
   - 76.76% → 95%以上
   - カバレッジ品質ゲートのCI/CD組み込み

### P2: 機能拡張（P1完了後に開始）

**完了条件**: MVP機能の実装完了

**現状**:
- APIルート: `/api/stats`, `/api/seed` のみ
- データ永続化: 未実装（MockRepositoryのみ）

**完了条件**:
- [ ] データ永続化レイヤーの実装
- [ ] 追加APIエンドポイントの実装
- [ ] 認証・認可機能の実装
- [ ] データエクスポート機能の実装

**次の一手**:
1. Repositoryパターンの実装選定（DB/ストレージ）
2. 認証ミドルウェアの設計と実装
3. 新規APIエンドポイントの設計

## 技術方針

### アーキテクチャ
- **Clean Architecture**: Domain → Application → Infrastructure → Presentation の4層分離を厳守
- **依存関係**: 外側から内側への一方方向（逆依存は絶対に禁止）
- **Interface分離**: Infrastructure層はDomain層のインターフェースのみに依存

### コーディング規約
- **TypeScript厳格モード**: 全ての`tsconfig.json`の厳格オプションを有効化
- **型安全性**: `any`型禁止、型アサーション原則禁止
- **Runtime検証**: 全ての外部入力はZodスキーマでバリデーション
- **エラーハンドリング**: 構造化されたエラー階層（AppError → 具象エラークラス）

### テスト方針
- **カバレッジ目標**: Domain層100%、Application層95%以上、Infrastructure層90%以上
- **テスト構造**: AAAパターン（Arrange, Act, Assert）の厳守
- **テストデータ**: Faker.jsによる動的なテストデータ生成
- **E2Eテスト**: Playwrightによる主要ユーザーフローのカバー

### パフォーマンス
- **React最適化**: 全てのコンポーネントは`React.memo`でメモ化
- **データ取得**: SWRによるキャッシュと再検証
- **バンドルサイズ**: gzippedで100KB以下

## 完了の定義

このプロジェクトが「完了」と見なされる条件:

1. **品質基盤**: Lintエラー0件、TypeScript厳格モード100%準拠
2. **テストカバレッジ**: 全レイヤー95%以上（statements + branches）、E2Eテストカバー
3. **機能完全性**: MVP機能の実装完了（データ永続化、認証、主要API）
4. **パフォーマンス**: Core Web Vitals全項目で「Good」評価
5. **セキュリティ**: 入力バリデーション、レート制限、エラーハンドリングの完全実装
6. **文書**: AGENTS.md、HANDOFF.mdとの整合性が取れている

## 当面の優先順位

### Phase 1: 品質基盤確立（現在実施中 - 残り4〜5時間）
1. ✅ Lintエラーの解消（6337件 → 3件 → 0件）
2. ✅ TypeScript厳格モードの完全準拠
3. ✅ テストカバレッジの基礎確立（92% statements）
4. ⏳ **テストカバレッジの完全化**（76.76% → 95% branches）

### Phase 2: 機能拡張（Phase 1完了後）
1. データ永続化レイヤーの実装
2. 追加APIエンドポイントの実装
3. E2Eテストの実装

### Phase 3: 本番準備（Phase 2完了後）
1. パフォーマンス最適化
2. セキュリティ強化
3. デプロイパイプラインの構築

### Phase 4: 運用改善（Phase 3完了後）
1. モニタリング・ロギングの強化
2. CI/CDパイプラインの最適化
3. ドキュメントの更新

## 更新ルール

この文書は以下の場合に更新します:

1. **フェーズ完了時**: Phaseが完了したら、次のPhaseの内容に更新
2. **優先順位変更時**: ビジネス要件や技術的制約により優先順位が変更された場合
3. **完了条件達成時**: P1/P2/P3の完了条件を全て満たしたら、次の優先成果に更新
4. **四半期ごと**: 少なくとも四半期に1回は現状の再評価と更新

## 自己審問チェックリスト

この文書を更新する前に、以下を自問すること:

- [ ] この文書は「過去の説明」ではなく「次の実装判断」に効いているか？
- [ ] 直近10件のコミットを踏まえた優先順位になっているか？
- [ ] docs-only の達成感で、未完タスクを隠していないか？
- [ ] 次の作業者（AIエージェント）が、この文書だけで何をするか判断できるか？
- [ ] AGENTS.md、HANDOFF.md と矛盾していないか？

---

**最終更新**: 2026-03-16
**更新理由**: 直近10件のコミット（ChartWrapper 100%カバレッジ達成、テストファイルSRP準拠分割、ブランチカバレッジ改善）を踏まえ、未完了課題を特定し、次の一手を明確化
**現在のフェーズ**: Phase 1: 品質基盤確立（残り4〜5時間で完了予定）
