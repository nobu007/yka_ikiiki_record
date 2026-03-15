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

### ✅ P1: 品質基盤の完全確立（完了）

**完了条件**: Lintエラー0件 + 全レイヤー95% coverage

**達成状況** (2026-03-16):
- ✅ すべてのテスト: 818/818 passing
- ✅ Lintエラー: 0件
- ✅ TypeScript厳格モード: 100%準拠
- ✅ 全体カバレッジ: 98.28% statements, 90.9% branches, 97.99% functions
- ✅ Domain層: 100% coverage
- ✅ Infrastructure層: 100% coverage
- ✅ Application層: 100% statements, 83.33% branches
- ✅ Lib層: 98.11% statements, 94.44% branches
- ✅ Utils層: 100% statements, 94.28% branches
- ✅ Hooks層: 100% statements, 91.66% branches
- ✅ Components/common: 98.38% statements, 93.1% branches
- ✅ Components/ui: 100% statements, 94.11% branches
- ✅ Components/dashboard: 100% statements, 100% branches
- ✅ Components/charts: 96.12% statements, 88.63% branches
- ✅ Dashboard stats components: 100% coverage全項目

**完了タスク**:
1. ✅ Lintエラー解消: page.test.tsx:23 の式文エラーをif-elseブロックに変換
2. ✅ Dashboard stats components カバレッジ改善: 6ファイル中6ファイルが100%達成
3. ✅ テストファイル分割完了: SRP準拠の21個focused files
4. ✅ ChartWrapper test coverage: 41.66% → 100%

### P2: アーキテクチャ品質向上（現在優先）

**完了条件**: Clean Architecture違反の解消 + 残存カバレッジ改善

**現状** (2026-03-16):
- ⚠️ app/(dashboard)/dashboard/page.tsx: 90.9% statements, 40% branches (lines 12)
- ⚠️ app/api/seed/route.ts: 83.87% statements, 50% branches (lines 36,88,107-110)
- ⚠️ components/charts/DynamicBarChart.tsx: 88.23% statements, 89.47% branches (lines 53-54,108-126)
- ⚠️ components/charts/EmotionChart.tsx: 93.75% statements, 57.14% branches (line 80)
- ⚠️ components/Dashboard.tsx: 97.5% statements, 92.85% branches (line 44)
- ⚠️ lib/error-handler.ts: 98.11% statements, 94.44% branches (line 87)

**未完了の課題**:
1. Dashboard page.tsx: React Server Componentsとクライアントコンポーネントの分離
2. API seed route: エラーハンドリングブランチのカバー
3. DynamicBarChart: 条件描画ロジックの完全カバレッジ
4. EmotionChart: グラフ描画分岐の改善
5. lib/error-handler: エラーケースの網羅

**次の一手**（優先順位順）:

1. **Dashboard page.tsx のアーキテクチャ改善**（1時間）
   - Server ComponentとClient Componentの責務分離
   - ブランチカバレッジ: 40% → 95%以上
   - Clean Architecture違反の解消（app/配下のロジック排除）

2. **DynamicBarChart のカバレッジ完成**（30分）
   - 未カバー行: 53-54,108-126（条件描画ロジック）
   - ブランチカバレッジ: 89.47% → 95%以上

3. **APIルートのエラーハンドリング強化**（30分）
   - seed route: lines 36,88,107-110のカバー
   - ブランチカバレッジ: 50% → 95%以上

4. **EmotionChart の描画分岐カバー**（20分）
   - line 80の分岐テスト追加
   - ブランチカバレッジ: 57.14% → 95%以上

5. **全体カバレッジの最終調整**（30分）
   - 現在: 98.28% statements, 90.9% branches
   - 目標: 98%+ statements, 95%+ branches

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

### ✅ Phase 1: 品質基盤確立（完了）
1. ✅ Lintエラーの解消（6337件 → 3件 → 0件）
2. ✅ TypeScript厳格モードの完全準拠
3. ✅ テストカバレッジの基礎確立（98.28% statements, 90.9% branches）
4. ✅ Dashboard stats components の完全カバレッジ達成

### Phase 2: アーキテクチャ品質向上（現在実施中 - 残り3〜4時間）
1. ⏳ **Dashboard page.tsx のClean Architecture準拠**
   - Server/Client component分離
   - ブランチカバレッジ改善: 40% → 95%+
2. DynamicBarChart のカバレッジ完成: 89.47% → 95%+
3. APIルートのエラーハンドリング強化: 50% → 95%+
4. EmotionChart の描画分岐カバー: 57.14% → 95%+

### Phase 3: 機能拡張（Phase 2完了後）
1. データ永続化レイヤーの実装
2. 追加APIエンドポイントの実装
3. E2Eテストの実装

### Phase 4: 本番準備（Phase 3完了後）
1. パフォーマンス最適化
2. セキュリティ強化
3. デプロイパイプラインの構築

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
**更新理由**: P1完了を記録。Lintエラー0件、全テスト818/818 passing、カバレッジ98.28% statements / 90.9% branches達成。次はP2: アーキテクチャ品質向上として、Dashboard page.tsxのClean Architecture違反解消と残存カバレッジ改善を実施
**現在のフェーズ**: Phase 2: アーキテクチャ品質向上（残り3〜4時間で完了予定）
