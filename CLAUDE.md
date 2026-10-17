# ponmoji

Slack / Discord / Teams 向けスタンプ（カスタム絵文字）をパック単位で配布するサービス。
`apps/web` が TanStack Start のアプリで、`/studio` がテキストからスタンプを作る画面。

## コマンド（ルートで実行）

| コマンド     | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| `pnpm check` | format + 型情報つき lint + 型チェック（Vite+ `vp check`） |
| `pnpm fix`   | 上の自動修正                                              |
| `pnpm test`  | Unit（node）と Integration（Chromium）のテスト            |
| `pnpm build` | 全パッケージのビルド                                      |
| `pnpm dev`   | `apps/web` の dev サーバー（3000 番）                     |

Node は `.node-version`、pnpm は `package.json` の `packageManager` が正本。ローカルは mise(`mise install`)でその版に揃える。
commit 前に `.vite-hooks/pre-commit` が `vp staged` → `vp check` → `vp run -r test` を走らせる。
PR には CI（Static analysis / Test / Build）と AI コードレビュー（`codereview-on-ci` スキル）が付く。

## 守ること

`.claude/rules/` にある。レビューで使うガイドライン（`.claude/skills/codereview-on-ci/guidelines/`）と同じルール ID で、
OK / NG の具体例はガイドライン側にある。迷ったらガイドラインを開く。
