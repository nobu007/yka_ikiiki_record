# GOAL — 短期計画

> 2026-10-17 作成（OI-20261017-28）。長期は [../ORDER.md](../ORDER.md)、課題は [BACKLOG.md](BACKLOG.md)。

## 直近の目標（この順で）

### G1. MS-012 のブロック解除（担当: Human Operator）

- 現状: E2Eテストの data-testid 対応と playwright.config.ts / .env.example の修正は実装済み
  （charter.yml MS-012 progress_note、2026-03-30）。残るブロックは使用環境の `.env` で
  `DATABASE_PROVIDER='mirage'` を設定し dev server を再起動すること。
- 出口条件: E2E テスト39件が通過し、データ生成成功メッセージが検出される。
- 証拠（2026-10-17 検証）: `src/components/common/Notification.tsx` に data-testid 実装済み。

### G2. 本番デプロイ実行（担当: Human Operator）

- PURPOSE.md「P1」の手順が正本。出口条件は ORDER.md 段階2を参照。

### G3. 計画文書の整合維持（担当: エージェント / TAS）

- PURPOSE.md の「現在の状況」セクションは 2026-03-21 時点の記録であり陳腐化している
  （テスト数 1393 vs charter.yml 記載 2470、参照先ファイル不在 — 詳細は BACKLOG.md B-003）。
- PURPOSE.md の更新ルールに従い、デプロイ完了時・実質的コード変更時に更新する。
  更新ルール発火前の定期的な書き換えはしない。

## 実装完了と運用実証の区別（2026-10-17 時点）

- **実装完了（証拠あり）**: 段階1の全コンポーネント、マイルストーン MS-001〜MS-011
  （charter.yml progress_note に完了日とテスト数の記録あり）。
- **運用実証（証拠なし・未達）**: 本番デプロイ、E2E 全件実行（MS-012 が blocked）、
  教育現場での実使用。これらの未完了項目は消さない。
