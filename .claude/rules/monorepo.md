# モノレポの構成ルール

詳細と OK / NG 例: `.claude/skills/codereview-on-ci/guidelines/monorepo.md`（同じ `MR-xx`）。
方針は「バージョンはルート、振る舞いは各アプリ」「境界はパッケージとして越える」「依存は一方向」。

## 置き場所

- デプロイ単位は `apps/`、それ以外は `packages/`。他の場所にパッケージを作らない（MR-01）
- ワークスペースの glob は 1 階層。再帰 glob と入れ子のパッケージは禁止（MR-02）
- パッケージ名は `@ponmoji/<名前>`（MR-03）
- ルート `package.json` はツールチェーンだけ。アプリが使う依存をルートに置かない（MR-04）
- 依存を変えたらロックファイルの差分を含める（MR-05）

## 依存

- 内部パッケージは `workspace:*`（MR-10）。2 つ以上で使う外部依存は `pnpm-workspace.yaml` の catalog に入れ、`catalog:` で参照（MR-11）
- React・TanStack など単一インスタンスが前提のものは、内部パッケージでは `peerDependencies`（＋ `devDependencies`）。`dependencies` に置かない（MR-12）
- import するものは自分の `package.json` に宣言する（MR-13）。`../` でパッケージの外に出ない（MR-14）
- `overrides` は具体的な問題を直すときだけ。理由をコメントに残す（MR-15）

## パッケージの設計

- 新設は、利用者が 2 つ以上あるか、ビルド要件・peer 依存・公開単位が異なるときだけ（MR-20）。コンポーネント 1 つで切らない（MR-21）
- 内部パッケージは JIT（ビルドなし）。`exports` でソースを公開し、`exports` に無いパスを import しない（MR-22、23）
- 内部パッケージの中で `tsconfig` の `paths` を使わない（MR-25）。`apps/*` では使ってよい

## 依存の向き

- `packages/*` は `apps/*` を import しない。`apps/*` は他の `apps/*` を import しない（MR-30、31）
- パッケージ間は util ← ui ← feature の一方向。循環禁止（MR-32、33）
- 内部パッケージは特定アプリの環境変数・ルーティング・デプロイ先を前提にしない。引数で受け取る（MR-34）

## 設定の置き場所

- ルート: Node / pnpm のバージョン、catalog、`fmt` / `lint` / `staged`、`tsconfig.base.json`、`defaultPackage`、`run.tasks`、git hooks（MR-40）
- 各アプリ: プラグイン、`server`、`resolve`、`build`、デプロイアダプタ、`test` ブロック、`tsconfig.json` の `paths` / `types`（MR-41）
- `lint` / `fmt` はルートだけ。アプリ固有の差は `overrides` の `files` で（MR-42）
- `tsconfig.json` は共通設定を `extends` し、`strict` 等を緩めない（MR-43）
- ルートの共有設定は頻繁に触らない。1 アプリの都合でルートを変えない（MR-44）

## タスクと CI

- `run.tasks` にキャッシュを設定するときは入力・出力・環境変数をすべて申告する（MR-50）。`dev` と非決定的なタスクはキャッシュしない（MR-51、52）
- PR のコードを実行するジョブに書き込み権限や secrets を与えない。`run:` に `${{ github.event.* }}` を直接埋め込まない（MR-61）
- 共有パッケージの破壊的変更と、複数アプリの追随を 1 つの PR に混ぜない（MR-62）
