# モノレポ構成ガイドライン

## このガイドラインの使い方

**読み込む条件**(次のいずれかが差分に含まれる):

- `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`、`.npmrc`
- ルートまたは各パッケージの `vite.config.ts`、`tsconfig*.json`
- `apps/` または `packages/` 配下のディレクトリの追加・移動・削除
- パッケージをまたぐ import(`@ponmoji/*` の import、`../` でパッケージ外に出る相対パス)
- `.github/workflows/`(CI のタスク分割や affected 判定に関わるもの)

**判定の付け方**:

- 各ルールに **判定** を付けている。`🚨 Must` は違反していればそのまま Must。`💭 Nit` は Nit
- ただし **「例外の扱い」(§9)に従って理由が書かれていれば、Must でも Nit に下げる**
- OK / NG の例は代表例であり、同じ性質の書き方は同じ判定にする
- 「将来の状態」向けのルール(パッケージが 2 つ以上、公開パッケージ、アプリが 2 つ以上)は、その状態になっていなければ適用しない

**前提となる方針**:

- 「バージョンはルート、振る舞いは各アプリ」
- 必要になる前に作らない。2 つ目の利用者が現れてから切り出す
- 境界はパッケージとして越える(`package.json` の依存と `exports`)。ディレクトリを直接たどらない
- 依存の向きは一方向(apps → packages、util ← ui ← feature)

---

## ルール一覧

| ID | ルール | 判定 |
| --- | --- | --- |
| MR-01 | デプロイ単位は `apps/`、それ以外は `packages/`。他の場所にパッケージを作らない | 🚨 Must |
| MR-02 | ワークスペースの glob は 1 階層(`apps/*`)。再帰 glob(`apps/**`)と入れ子のパッケージは禁止 | 🚨 Must |
| MR-03 | パッケージ名は `@ponmoji/<名前>`。ワークスペース内で一意 | 🚨 Must |
| MR-04 | ルート `package.json` は `private: true`。アプリやパッケージが使う依存をルートに置かない | 🚨 Must |
| MR-05 | ロックファイルをコミットする。依存変更には必ずロックファイルの差分が伴う | 🚨 Must |
| MR-10 | 内部パッケージは `workspace:*` で参照する | 🚨 Must |
| MR-11 | 複数パッケージで使う外部依存のバージョンは `pnpm-workspace.yaml` の catalog で 1 つに決める。各 `package.json` は `catalog:` で参照 | 💭 Nit |
| MR-12 | React・React DOM・TanStack Router/Start など「アプリ内に 1 つしか存在してはならない」ライブラリは、内部パッケージでは `peerDependencies`(開発用に `devDependencies`)。`dependencies` に置かない | 🚨 Must |
| MR-13 | import するものは自分の `package.json` に宣言する(幽霊依存の禁止) | 🚨 Must |
| MR-14 | `../` でパッケージの外に出ない。別パッケージのコードは名前で import する | 🚨 Must |
| MR-15 | pnpm の `overrides` は、重複や脆弱性など具体的な問題を解決するときだけ。理由をコメントで残す | 💭 Nit |
| MR-20 | パッケージを新設するのは、利用者が 2 つ以上あるか、ビルド要件・peer 依存・公開単位が異なるときだけ | 💭 Nit |
| MR-21 | コンポーネント 1 つ、関数 1 つの単位でパッケージを切らない | 💭 Nit |
| MR-22 | 内部パッケージは JIT(ビルドなし)を既定とする。`exports` でソースを直接公開する | 💭 Nit |
| MR-23 | 公開面は `exports` で明示する。`exports` に無いパスを import しない | 🚨 Must |
| MR-24 | バレルファイル(全体を再エクスポートする `index.ts`)を公開面にしない | 💭 Nit |
| MR-25 | 内部パッケージの中で `tsconfig` の `paths` を使わない | 🚨 Must |
| MR-30 | `packages/*` は `apps/*` を import しない | 🚨 Must |
| MR-31 | `apps/*` は他の `apps/*` を import しない | 🚨 Must |
| MR-32 | パッケージ間の依存は util ← ui ← feature の一方向。逆向きは禁止 | 🚨 Must |
| MR-33 | パッケージ間の循環依存の禁止 | 🚨 Must |
| MR-34 | 内部パッケージは特定アプリの環境変数・ルーティング・デプロイ先を前提にしない | 🚨 Must |
| MR-40 | ルートに置くのは、ツールチェーンのバージョン、catalog、`fmt` / `lint` / `staged`、`tsconfig.base.json`、`defaultPackage`、`run.tasks`、git hooks(`.vite-hooks/`)だけ | 🚨 Must |
| MR-41 | フレームワークのプラグイン、`server`、`resolve`、`build`、デプロイアダプタ、`test` ブロックは各アプリの `vite.config.ts` に置く | 🚨 Must |
| MR-42 | `lint` / `fmt` の設定はルートにだけ置く。アプリ固有の差は `lint.overrides` / `fmt.overrides` の `files` で表す | 🚨 Must |
| MR-43 | 各パッケージの `tsconfig.json` は共通設定を `extends` する。厳しさ(`strict` 等)を個別に緩めない | 🚨 Must |
| MR-44 | ルートの共有設定は変更を最小にする。アプリ 1 つの都合でルートを変えない | 💭 Nit |
| MR-50 | `run.tasks` にキャッシュを設定するときは、入力・出力・参照する環境変数をすべて申告する | 🚨 Must |
| MR-51 | `dev` や watch 系のタスクをキャッシュしない | 🚨 Must |
| MR-52 | 非決定的なタスク(時刻・乱数・ネットワーク結果を出力に含む)をキャッシュしない | 🚨 Must |
| MR-53 | 一瞬で終わるタスクはキャッシュしない | 💭 Nit |
| MR-60 | アプリが 2 つ以上あるとき、CI はパスフィルタか `--filter` で影響範囲だけを動かす | 💭 Nit |
| MR-61 | PR のコードを実行するジョブに書き込み権限や secrets を与えない | 🚨 Must |
| MR-62 | 共有パッケージの変更と、それを使う複数アプリの変更を 1 つの PR に混ぜない(共有 → 利用側の順に分ける) | 💭 Nit |
| MR-70 | 公開パッケージ(npm に出すもの)は changesets 等でバージョンと変更履歴を管理する | 💭 Nit |
| MR-71 | 公開パッケージは JIT ではなくコンパイル型にし、`types` と `default` の両方を `exports` に持つ | 🚨 Must |

---

## 1. ディレクトリとワークスペース

### MR-01 デプロイ単位は `apps/`、それ以外は `packages/` — 🚨 Must

```
OK
apps/studio-web/     # TanStack Start アプリ(Studio)
apps/worker/         # 画像生成の Worker
packages/theme/      # テーマ変数
packages/stamp/      # 描画ロジック

NG
libs/theme/          # 置き場所が増える
apps/web/packages/   # アプリの中にパッケージ
src/shared/          # ルート直下にコード
```

### MR-02 glob は 1 階層。入れ子パッケージの禁止 — 🚨 Must

```yaml
# OK
packages:
  - apps/*
  - packages/*
  - packages/tooling/*   # グループ化するならこの形。packages/tooling に package.json は置かない

# NG
packages:
  - apps/**              # パッケージマネージャーごとに挙動が違う
  - packages/**
```

`apps/web/package.json` と `apps/web/sub/package.json` が同時にある状態も NG。

### MR-03 名前は `@ponmoji/<名前>` — 🚨 Must

```json
// OK
{ "name": "@ponmoji/studio-web" }
{ "name": "@ponmoji/theme" }

// NG
{ "name": "web" }          // 衝突しうる
{ "name": "ponmoji-theme" } // 名前空間が無い
```

### MR-04 ルート `package.json` はツールチェーンのみ — 🚨 Must

```json
// OK
{
  "private": true,
  "devDependencies": { "vite-plus": "catalog:", "typescript": "^5.9.0" }
}

// NG
{
  "dependencies": { "react": "^19.2.0" }   // アプリの依存がルートにある
}
```

ルートに依存を置くと、それを使うパッケージの `package.json` から宣言が消え、幽霊依存(MR-13)になる。

### MR-05 ロックファイル — 🚨 Must

`package.json` の依存を変えた PR に `pnpm-lock.yaml` の差分が無ければ NG。逆に、`pnpm-lock.yaml` だけが変わり `package.json` に変更が無い PR は、理由(`pnpm update`、脆弱性対応)が本文に無ければ 💭 Nit。

---

## 2. 依存の管理

### MR-10 内部パッケージは `workspace:*` — 🚨 Must

```json
// OK
{ "dependencies": { "@ponmoji/theme": "workspace:*" } }

// NG
{ "dependencies": { "@ponmoji/theme": "^0.1.0" } }   // レジストリ解決になり、ローカルの変更が反映されない
{ "dependencies": { "@ponmoji/theme": "file:../../packages/theme" } }
```

### MR-11 外部依存のバージョンは catalog に — 💭 Nit

```yaml
# OK  pnpm-workspace.yaml
catalog:
  react: 19.2.0
  react-dom: 19.2.0
  '@tanstack/react-router': 1.170.45
```

```json
// OK  apps/web/package.json
{ "dependencies": { "react": "catalog:" } }

// NG  パッケージごとに範囲がばらばら
{ "dependencies": { "react": "^19.2.0" } }   // apps/web
{ "dependencies": { "react": "^19.1.0" } }   // packages/ui
```

1 パッケージでしか使わない依存は catalog に入れなくてよい。**2 つ目の利用者が現れた時点で catalog に移す。**

### MR-12 単一インスタンスのライブラリは peer に — 🚨 Must

```json
// OK  packages/ui/package.json
{
  "peerDependencies": { "react": "*" },
  "devDependencies": { "react": "catalog:" }
}

// NG
{
  "dependencies": { "react": "catalog:" }   // 消費側と別の React が入り、hooks が壊れる
}
```

対象: `react`、`react-dom`、`@tanstack/react-router`、`@tanstack/react-start`、そのほか context や singleton を持つライブラリ。
アプリ(`apps/*`)側では `dependencies` でよい。

### MR-13 幽霊依存の禁止 — 🚨 Must

```ts
// packages/stamp/src/render.ts
import { clsx } from 'clsx'   // NG: packages/stamp/package.json に clsx が無い(他のパッケージ経由で解決されている)
```

pnpm は既定で幽霊依存を防ぐが、`shamefully-hoist` や `public-hoist-pattern` の設定変更で緩められる。これらを `.npmrc` に足す変更も NG。

### MR-14 `../` でパッケージを越えない — 🚨 Must

```ts
// apps/web/src/routes/index.tsx
import { tokens } from '@ponmoji/theme'                 // OK
import { tokens } from '../../../packages/theme/src'    // NG
import { tokens } from '~/../../packages/theme/src'     // NG(エイリアス経由でも同じ)
```

同じパッケージ内の `../` は問題ない。

### MR-15 `overrides` は理由付きで — 💭 Nit

```yaml
# OK
overrides:
  # vite-plus が同梱する Vite に統一する(vp migrate が生成)
  vite@*: 'catalog:'
  # CVE-2026-XXXX の修正版に固定。upstream が追随したら外す
  some-lib@<2.1.3: 2.1.3

# NG
overrides:
  react: 19.2.0   # 理由が無い。catalog で揃えるべきもの
```

---

## 3. パッケージの設計

### MR-20 / MR-21 切り出す基準と粒度 — 💭 Nit

切り出してよい条件(いずれか):

- 利用者(アプリまたはパッケージ)が 2 つ以上ある
- ビルド要件が違う(Node 向け / ブラウザ向け、WASM を含む)
- peer 依存が違う
- 独立して公開・バージョン管理する

```
OK
packages/stamp/     # apps/web と apps/worker の両方が使う描画ロジック

NG
packages/button/    # コンポーネント 1 つ
packages/format-date/
packages/utils/     # 中身が無いのに「いずれ使う」で先に作る
```

目安は、ローンチ時点で 3〜5 パッケージまで。

### MR-22 JIT を既定に — 💭 Nit

```json
// OK  packages/theme/package.json(ビルドしない)
{
  "name": "@ponmoji/theme",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./tokens": "./src/tokens.ts"
  },
  "scripts": { "check": "tsc --noEmit" }
}
```

コンパイル型に切り替える条件: 消費側が TypeScript を処理できない、ビルドが遅くキャッシュしたい、公開する(MR-71)。

### MR-23 `exports` に無いパスを import しない — 🚨 Must

```ts
import { tokens } from '@ponmoji/theme/tokens'        // OK: exports にある
import { tokens } from '@ponmoji/theme/src/tokens'    // NG: 内部ファイルに直接触る
```

`exports` が無いパッケージを新設する変更は、`exports` を足すよう 💭 Nit。

### MR-24 バレルファイルを公開面にしない — 💭 Nit

```json
// OK: 入口を用途ごとに分ける
"exports": { "./tokens": "./src/tokens.ts", "./fonts": "./src/fonts.ts" }

// NG: index.ts が全部を re-export し、"." だけ公開
"exports": { ".": "./src/index.ts" }   // index.ts: export * from './tokens'; export * from './fonts'; ...
```

小さいパッケージで `"."` 1 つが自然なら OK。NG は「大きくなっても `"."` に全部ぶら下げ続ける」こと。

### MR-25 内部パッケージで `paths` を使わない — 🚨 Must

```json
// NG  packages/stamp/tsconfig.json
{ "compilerOptions": { "paths": { "~/*": ["./src/*"] } } }
```

JIT では消費側がトランスパイルするため `~/` が解決できない。パッケージ内の相対 import は `./` で書く。
`apps/*` の `tsconfig.json` で `paths` を使うのは OK。

---

## 4. 依存の向き(境界)

```
apps/web ──▶ packages/feature-* ──▶ packages/ui-* ──▶ packages/util-*
apps/worker ─┘                       │                   ▲
                                     └───────────────────┘
packages/data-access-* ──▶ packages/util-*
```

| 種類 | 中身 | 依存してよい相手 |
| --- | --- | --- |
| app(`apps/*`) | デプロイ単位 | すべての packages |
| feature | 画面やユースケースの単位 | feature / ui / data-access / util |
| ui | 見た目のコンポーネント。状態や API を持たない | ui / util |
| data-access | API クライアント、ストア | data-access / util |
| util | 純粋な関数、定数、型。フレームワークに依存しない | util |

パッケージの種類は `package.json` の `"ponmoji": { "type": "ui" }` のようなメタデータか、README の冒頭に書く。書かれていなければ名前と中身から判断する。

### MR-30 / MR-31 — 🚨 Must

```ts
// packages/stamp/src/render.ts
import { config } from '@ponmoji/web/config'      // NG: パッケージがアプリに依存
import { config } from '../../../apps/web/src/config'   // NG

// apps/worker/src/index.ts
import { render } from '@ponmoji/web/stamp'       // NG: アプリがアプリに依存。packages/stamp に切り出す
```

### MR-32 / MR-33 — 🚨 Must

```ts
// packages/util-color/src/index.ts
import { Button } from '@ponmoji/ui'   // NG: util が ui に依存(逆向き)

// packages/ui ⇄ packages/theme が互いに import   // NG: 循環
```

### MR-34 アプリの前提を持ち込まない — 🚨 Must

```ts
// packages/stamp/src/fonts.ts
const base = import.meta.env.VITE_FONT_CDN         // NG: 特定アプリの環境変数
const url = `/studio/fonts/${name}`                // NG: 特定アプリのルーティング

// OK: 引数で受け取る
export function fontUrl(baseUrl: string, name: string) { ... }
```

---

## 5. 設定の置き場所

### MR-40 / MR-41 — 🚨 Must

| ルート | 各アプリ・パッケージ |
| --- | --- |
| `.node-version`、`packageManager`、`engines` | 自分の依存一覧(`catalog:` / `workspace:` で参照) |
| `pnpm-workspace.yaml`(catalog、overrides) | `vite.config.ts` のプラグイン、`server`、`resolve`、`build`、デプロイアダプタ、`test` |
| ルート `vite.config.ts` の `fmt` / `lint` / `staged` / `defaultPackage` / `run.tasks` | `tsconfig.json`(`extends` + `paths` / `types` / `include`) |
| `tsconfig.base.json` | 環境変数、ルート定義、アプリのコード |
| `.gitignore`、CI、git hooks | |

```ts
// NG  ルート vite.config.ts
export default defineConfig({
  plugins: [tanstackStart(), viteReact()],   // アプリの振る舞いがルートにある
  server: { port: 3000 },
})
```

```ts
// NG  apps/web/vite.config.ts
export default defineConfig({
  lint: { rules: { ... } },   // MR-42: lint はルートだけ
})
```

### MR-42 `lint` / `fmt` はルートだけ — 🚨 Must

Vite+ の `vp check` はルートの設定だけを見る。アプリごとに変えたい場合:

```ts
// OK  ルート vite.config.ts
lint: {
  overrides: [
    { files: ['apps/worker/**'], rules: { 'no-console': 'off' } },
  ],
}
```

### MR-43 `tsconfig` は共通設定を継承 — 🚨 Must

```json
// OK
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "paths": { "~/*": ["./src/*"] } } }

// NG
{ "compilerOptions": { "strict": false } }                       // 継承せず緩めている
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "strict": false } }   // 継承して緩めている
```

共通設定の置き場所は、パッケージが 1 つの間はルートの `tsconfig.base.json` でよい。
`packages/` が 2 つ以上になったら `packages/typescript-config` に移してよい(移さなくても NG ではない)。

### MR-44 ルートの共有設定を安定させる — 💭 Nit

ルートの `vite.config.ts`、`tsconfig.base.json`、catalog の変更は全パッケージのキャッシュを無効化する。
「アプリ 1 つで使う lint ルールをルートの `rules` に足す」は NG。`overrides` で範囲を絞る(MR-42)。

---

## 6. タスクとキャッシュ(`vp run`)

### MR-50 入力・出力・環境変数を申告 — 🚨 Must

```ts
// OK  ルート vite.config.ts
run: {
  tasks: {
    'generate:fonts': {
      cache: {
        inputs: ['scripts/generate-fonts.ts', 'assets/fonts/**'],
        outputs: ['apps/web/public/fonts/**'],
        env: ['FONT_SUBSET'],
      },
    },
  },
}

// NG: 出力の申告が無い(キャッシュヒット時に何も復元されない)
// NG: スクリプトが読む環境変数が env に無い(値を変えても古い結果が返る)
```

### MR-51 / MR-52 / MR-53 キャッシュしないもの

- `dev`、`preview`、watch 系 → 🚨 Must
- 時刻・乱数・外部 API の結果を出力に含むタスク → 🚨 Must
- 数百 ms で終わるタスク(キャッシュの読み書きの方が遅い) → 💭 Nit

---

## 7. CI と PR の運用

### MR-60 影響範囲だけを動かす — 💭 Nit

アプリが 2 つ以上あるとき:

```yaml
# OK
on:
  pull_request:
    paths:
      - 'apps/web/**'
      - 'packages/**'
      - 'pnpm-lock.yaml'
```

または `vp run --filter ...[origin/main] build`。
**アプリが 1 つの間はこの仕組みを入れない**(必要になる前の準備は負債)。

### MR-61 PR のコードを実行するジョブに権限を与えない — 🚨 Must

```yaml
# NG
on: pull_request
permissions:
  contents: write        # PR のコード(テスト、ビルドスクリプト)が書き込める
steps:
  - run: pnpm test
    env:
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}   # PR のコードから読める
```

`run:` に `${{ github.event.pull_request.title }}` 等を直接埋め込むのも NG(コマンド注入)。

### MR-62 PR の範囲 — 💭 Nit

```
OK
PR 1: packages/stamp に fontUrl() を追加
PR 2: apps/web で fontUrl() を使う
PR 3: apps/worker で fontUrl() を使う

NG
PR 1: packages/stamp の API 変更 + apps/web の画面改修 + apps/worker の移行 + lint 設定変更
```

1 PR で複数パッケージを触ること自体は NG ではない。NG は「共有パッケージの破壊的変更と、複数の利用側の追随を 1 つにまとめる」こと。

---

## 8. 公開パッケージ(npm に出す場合)

### MR-70 バージョン管理 — 💭 Nit

changesets 等で、変更ごとにバージョンと changelog を残す。`package.json` の `version` を手で上げる PR は NG。

### MR-71 公開パッケージはコンパイル型 — 🚨 Must

```json
// OK
{
  "exports": {
    ".": { "types": "./src/index.ts", "default": "./dist/index.js" }
  },
  "files": ["dist"],
  "scripts": { "build": "vp pack" }
}

// NG: ソースをそのまま公開(消費側が TypeScript を処理できる保証がない)
{ "exports": { ".": "./src/index.ts" }, "publishConfig": { "access": "public" } }
```

---

## 9. 例外の扱い

次の条件を満たす場合、Must を Nit に下げる(Nit は Nit のまま):

1. PR 本文またはコードのコメントに、**なぜルールに従えないか**と**いつ解消するか**(または恒久的な理由)が書かれている
2. 影響範囲が 1 パッケージに閉じている

例外として認めないもの(理由があっても Must のまま):

- MR-12(単一インスタンスのライブラリを `dependencies` に置く)
- MR-30 / MR-31 / MR-33(境界の逆向き・循環)
- MR-61(PR のコードを実行するジョブへの権限付与)

---

## 10. レビュー時のチェック手順

差分に §「読み込む条件」のファイルが含まれていたら、次の順に見る。

1. **ディレクトリ**: 新しい `package.json` の置き場所と名前(MR-01〜03)
2. **依存**: 追加・変更された `dependencies` / `devDependencies` / `peerDependencies` の種類と参照方法(MR-10〜15)。`pnpm-lock.yaml` の差分の有無(MR-05)
3. **import**: 新しい import 文のうち、`@ponmoji/*` と `../` でパッケージ外に出るもの。向きと `exports` を確認(MR-14、23、30〜33)
4. **設定**: `vite.config.ts` / `tsconfig.json` の置き場所と中身(MR-40〜44)
5. **タスク**: `run.tasks` の `cache` の申告(MR-50〜53)
6. **CI**: `permissions` と secrets の扱い(MR-61)

違反を見つけたら、コメントに **ルール ID** を書く(例: `[AI] 🚨 Must: MR-30 packages/stamp が apps/web を import している`)。
