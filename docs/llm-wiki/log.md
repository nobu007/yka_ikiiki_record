# llm-wiki log — yka_ikiiki_record

現在有効な状態と根拠のみ。過去の証跡・実行記録はここに置かない（git 履歴参照）。

## 2026-11-02 — main CI build ゲート:根本原因連鎖を検証、修正スタックを tas/auto-care/20261102 に再適用

- 状態: main の CI（`.github/workflows/ci.yml`）は Node 18 ピンのため Build ステップが即死する（next@16 は Node >=20.9.0 必須。実測: main 最新 run 40366163760 が17秒で失敗）。その背後に、(1) `.npmrc` ignore-scripts=true による prisma generate 欠落（postinstall 不実行、`prisma/seed.ts` の PrismaClient 型解決失敗で再現）、(2) `.audit/analysis/gap.yml` の不正 YAML（Infrastructure validate job を落とす。リポジトリ全 YAML/JSON 再照合で唯一の違反）、(3) ~500 の tsc 型負債（`next build` 型チェックを落とす）が積み上がっている。この多層構造のため、main が直るまで各 PR の再実行は無意味（26 PR 滞留）。
- 検証済み修正: `tas/auto-care/20261102`（4f160661 + e66ed7da。tas/auto-care/20261026 の 453f5815 + 4d290d66 を main 系 HEAD 2ba37d68 へ再適用。suppress 無し — ignoreBuildErrors / any / @ts-ignore 不使用）。2026-11-02 時点で main 未着地。
- Evidence: yka_ikiiki_record:.github/workflows/ci.yml sha256:fa0319f4db2898a6a2778a845a80eef40d78ccc7fb60d11b7ee00500a51f8da1
- Evidence: yka_ikiiki_record:.audit/analysis/gap.yml sha256:5474fab5ef68535ff7af31700987ef8a41476b343fef70442904d7f65e9663da
- Observation: 修正ブランチ上で `pnpm install --frozen-lockfile` → `pnpm exec prisma generate` → `pnpm run build` exit 0、jest 227 suites / 2490 tests 全通過（Node v26.12.1 / pnpm v10.33.0、2026-11-02 実施）。修正前コントロール（base HEAD 2ba37d68）は build が prisma/seed.ts:1 で型エラー失敗。
- 未検証の残り: CI の Lint / E2E（Playwright）ステップは記録上ついに一度も実行到位していない（Build が常に先に失敗）。着地後の PR CI が判断する。gap.yml 以外の YAML/JSON 違反はなし（2026-11-02 全ファイル再照合）。
