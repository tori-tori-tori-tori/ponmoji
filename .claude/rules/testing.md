---
paths:
  - "apps/**"
  - "packages/**"
---

# テストのルール

詳細と OK / NG 例: `.claude/skills/codereview-on-ci/guidelines/testing.md`（同じ `TE-xx`）。
方針は「使われ方に似たテストほど安心感が大きい」「E2E は数本」「テストは下の層へ押し下げる」「モックは境界だけ」。

## 層と置き場所

| 層 | ツール | 対象 | 置き場所 |
| --- | --- | --- | --- |
| Unit | Vitest（node） | ロジックを持つ関数・モジュール | 対象と同じディレクトリに `<名前>.test.ts` |
| Integration | Vitest Browser Mode（Chromium）+ `vitest-browser-react` | 画面・コンポーネントをユーザー操作で | 対象と同じディレクトリに `<名前>.test.tsx` |
| E2E / 視覚回帰 | Playwright（未導入） | 本番ビルドの導線、スタンプの見た目 | `apps/studio-web/e2e/` |

キャンバスの中身は DOM に出ない。ロジックは純粋関数に切り出して Unit で検証し、画面のテストは表示文字と aria 状態で判定する。

## 何を書くか

- ロジックを追加・変更したら Unit テストを添える（TE-01）。画面の操作を追加・変更したら Integration テストを添える（TE-02）
- 不具合の修正には、修正前に落ちて修正後に通る回帰テストを添える（TE-03）
- E2E は合計 10 本以内。下の層で書けるものを E2E に書かない（TE-05）
- 自明なコード、フレームワークの挙動、計算済みスタイルの数値はテストしない（TE-40〜42）
- カバレッジの数値のためのテストを書かない（TE-41）

## どう書くか

- 振る舞いを検証する。内部 state・private 関数・呼び出し回数・CSS クラスを assert しない（TE-10）
- 要素は `getByRole` → `getByLabelText` → `getByText` → `getByTestId` の順。CSS セレクタ・XPath で選ばない（TE-11）
- 内部モジュール・自作コンポーネントを `vi.mock` しない。モックは HTTP（MSW）・時刻・乱数・外部サービスだけ（TE-12〜14）。本物の外部ネットワークに出ない（TE-15）
- `sleep` / 固定時間の待機をしない。`expect.element(...)` や `toBeVisible` の自動リトライか fake timers を使う（TE-20）
- テストは互いに独立。共有の可変状態を持たない（TE-21）。assertion の無いテストを書かない（TE-22）。エラーは `rejects.toThrow` で検証（TE-23）
- `.only` をコミットしない（TE-24）。`.skip`・削除・期待値の緩和には理由と解消条件を書く（TE-25）。不安定なテストは原因の issue を添えて隔離し、黙って `.skip` にしない（TE-52）
- リトライは E2E だけ、最大 2 回。Unit / Integration にリトライを設定しない（TE-26）。E2E と視覚回帰は本番ビルドに対して CI で実行する（TE-50、51）
- AAA で構造化し、1 テスト 1 振る舞い（TE-30）。入力は現実的な日本語（`おつ`、`おつかれさまでした`）（TE-31）。スナップショットは短くインラインだけ（TE-32）
- テスト名は「何を・どの条件で・どうなるか」を日本語で（TE-33）。境界値と異常系を 1 つ以上含める（TE-34）

## このリポジトリでの注意

- `vitest-browser-react` の `render` は Promise を返す。必ず `await` する
- Browser Mode の `toHaveTextContent` は文字列の完全一致で、正規表現を受け付けない。変化する数値を含む表示は `toBeVisible` で待ってから `element().textContent` を正規表現で検証する
- Integration テストでは Google Fonts を読まない（フォールバック書体で動く）。フォント依存の数値を固定値で assert しない
