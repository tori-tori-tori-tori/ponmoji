# テスト戦略ガイドライン

## このガイドラインの使い方

**読み込む条件**(次のいずれかが差分に含まれる):

- テストファイル(`*.test.ts(x)`、`*.spec.ts(x)`、`e2e/`、`__tests__/`)
- テストの設定(`vite.config.ts` の `test` ブロック、`vitest.*`、`playwright.config.*`、MSW のハンドラ)
- `apps/` または `packages/` 配下の `.ts` / `.tsx` の追加・変更(テストが要るかを判断するため)

**判定の付け方**:

- 各ルールに **判定** を付けている。`🚨 Must` は違反していればそのまま Must。`💭 Nit` は Nit
- **「例外の扱い」(§8)** に従って理由が書かれていれば、Must でも Nit に下げる
- **未導入の層のテストが無いことは指摘しない**(§2 の「導入状況」を見る)。導入は別 PR で行う
- OK / NG の例は代表例であり、同じ性質の書き方は同じ判定にする

---

## 1. 方針(なぜこの戦略か)

ponmoji はブラウザで動くフロントエンドのモノリス(TanStack Start)で、Studio のようにキャンバス描画が中心の画面を持つ。
Kent C. Dodds の Testing Trophy と Martin Fowler サイトの Practical Test Pyramid は、次の点で一致しており、ponmoji もそれに従う。

1. **使われ方に似ているテストほど安心感が大きい。** 実装詳細(関数名、state の形、CSS クラス)ではなく、ユーザーに見える振る舞いを検証する
2. **E2E は数本。** 遅く、不安定で、保守が高い。スモーク 1 本と主要な導線数本に絞る
3. **テストはできるだけ下の層へ押し下げる。** 上の層で見つけた不具合は、下の層で再現するテストにして残す
4. **モックは境界だけ。** 内部モジュールやコンポーネントをモックすると、組み合わせの不具合を見逃す

ponmoji 固有の判断:

- **Static 層が既に強い。** Vite+ の `vp check` が型情報つき lint と型チェックを毎回走らせる。型で表せる制約はテストではなく型で守る
- **キャンバスは DOM に中身が出ない。** 「UI と機能を分離する」原則に従い、フィット計算などのロジックは純粋関数として切り出して Unit で検証し、
  描画結果の見た目は視覚回帰(Playwright のスクリーンショット)で補う。コンポーネントの Integration テストでは、画面に出る文字(例: `56px / 1 行`)と aria 状態で判定する
- **Integration はブラウザで走らせる。** jsdom はキャンバス・レイアウト・フォントを持たないため、Studio のテストでは安心感が得られない。
  Vitest の Browser Mode(Chromium)を使い、Testing Library 流のクエリ(`getByRole` など)で操作する
- **カバレッジは門にしない。** 参考値として、ロジックのパッケージは 80% 前後を目安にする。UI のカバレッジは追わない

## 2. 層の定義と配分

| 層 | 何を検証するか | ツール | 配分の目安 | 導入状況 |
| --- | --- | --- | --- | --- |
| Static | 型、lint、未 await の Promise、未使用コード | `vp check`(Oxlint 型情報つき + tsc) | すべての PR で実行 | **導入済み** |
| Unit | ロジックを持つ関数・クラス 1 つ。協調者は実物(sociable)が既定 | Vitest(`vp test`、node 環境) | 最も多い。ロジック 1 つに 1 ファイル | **導入済み** |
| Integration | 画面 1 つ、またはコンポーネント数個の組み合わせを、ユーザーの操作で検証 | Vitest Browser Mode + `vitest-browser-react` + Testing Library 流クエリ。HTTP は MSW | Unit に次いで多い。画面ごとに主要な操作 | 未導入 |
| E2E | 本番ビルドをブラウザで通しで操作。デプロイやルーティングの壊れを検出 | Playwright | **合計 10 本以内**。スモーク 1 本 + 主要導線 | 未導入 |
| 視覚回帰 | キャンバスや主要画面の見た目の崩れ | Playwright `toHaveScreenshot`(フォントを自前配信してから) | スタンプの代表入力 数パターン | 未導入 |

### 何をどの層に置くか(ponmoji の例)

| 対象 | 層 | 例 |
| --- | --- | --- |
| `fit.ts`、`clampText`、`contrastRatio`、テーマの計算 | Unit | 幅・高さの制約で文字サイズが決まる。下限で `fits: false` |
| 将来の `packages/stamp`、`packages/theme`、価格・パックのロジック | Unit | 入力の組み合わせと境界値 |
| Studio 画面(入力 → フィット表示、フォント切替、色の選択、テーマ切替) | Integration | テキストを打つと `NNpx / N 行` が変わる。フォントを変えると数値が再計算される |
| API を呼ぶ画面(将来のストア、ダウンロード) | Integration(MSW) | 正常・空・エラー応答の 3 パターン |
| 全ルートを巡回して console エラーが無い | E2E スモーク | `/`、`/studio`、将来のストア |
| 「Studio を開く → 入力 → 実寸プレビューに反映」 | E2E 導線 | 1 本 |
| 代表入力 3〜5 パターンのスタンプの見た目 | 視覚回帰 | 「おつ」「おつかれさまでした」「あ\nい\nう\nえ」 |

### 置き場所と命名

```
apps/studio-web/src/studio/fit.ts
apps/studio-web/src/studio/fit.test.ts          # Unit: 対象と同じディレクトリ、同じ名前 + .test
apps/studio-web/src/studio/Studio.test.tsx      # Integration: 対象コンポーネントと同じディレクトリ
apps/studio-web/e2e/smoke.spec.ts               # E2E: アプリ直下の e2e/
apps/studio-web/e2e/studio.spec.ts
```

- テスト名は **「何を・どの条件で・どうなるか」** の 3 要素を日本語で書く(例: `長い 1 行は全体が縮んで収まる`)
- `describe` は対象(関数名・画面名)、`it` は振る舞い

---

## ルール一覧

| ID | ルール | 判定 |
| --- | --- | --- |
| TE-01 | ロジックを持つ関数・モジュールを追加・変更したら Unit テストを添える | 💭 Nit |
| TE-02 | ユーザー操作を伴う画面・コンポーネントを追加・変更したら Integration テストを添える(導入済みの場合) | 💭 Nit |
| TE-03 | 不具合の修正には、修正前に落ちて修正後に通る回帰テストを添える | 💭 Nit |
| TE-04 | ルートを追加したら E2E スモークの巡回対象に加える(導入済みの場合) | 💭 Nit |
| TE-05 | E2E は合計 10 本以内。下の層で書けるものを E2E に書かない | 💭 Nit |
| TE-10 | 振る舞いを検証する。実装詳細(内部 state、private 関数、呼び出し回数、CSS クラス)を assert しない | 💭 Nit |
| TE-11 | 要素は `getByRole` → `getByLabelText` → `getByText` → `getByTestId` の順で選ぶ。CSS セレクタ・XPath・DOM 構造で選ばない | 💭 Nit |
| TE-12 | 内部モジュール・自作コンポーネントをモックしない。モックは境界(HTTP、時刻、乱数、外部サービス、副作用)だけ | 🚨 Must |
| TE-13 | シャロウレンダリングをしない。子コンポーネントは実物を描画する | 💭 Nit |
| TE-14 | HTTP はコードを書き換えずネットワーク層(MSW)でスタブする。`fetch` を `vi.fn` で差し替えない | 💭 Nit |
| TE-15 | テストから本物の外部ネットワーク・外部サービスに接続しない | 🚨 Must |
| TE-20 | `sleep` / 固定時間の待機をしない。自動リトライする assertion(`expect.element`、`findBy*`、`toBeVisible`)か fake timers を使う | 🚨 Must |
| TE-21 | テストは互いに独立。実行順・共有の可変状態・前のテストの副作用に依存しない | 🚨 Must |
| TE-22 | assertion の無いテスト、到達しない assertion(呼ばれないコールバックの中だけ)、常に通るテストを書かない | 🚨 Must |
| TE-23 | エラーは `catch` で握らず `expect(...).toThrow()` / `rejects` で検証する | 💭 Nit |
| TE-24 | `.only` をコミットしない | 🚨 Must |
| TE-25 | テストを `.skip` にする・削除する・assertion を弱める変更には、理由と解消条件を書く | 🚨 Must |
| TE-26 | リトライは E2E だけ、最大 2 回。Unit / Integration にリトライを設定しない | 💭 Nit |
| TE-30 | AAA(Arrange / Act / Assert)で構造化し、1 テストで検証する振る舞いは 1 つ | 💭 Nit |
| TE-31 | 入力は現実的な値(`おつ`、`おつかれさまでした`)。`foo` / `test` / `aaa` を使わない | 💭 Nit |
| TE-32 | スナップショットはインラインで短いものだけ。DOM 全体や大きなオブジェクトのスナップショットを撮らない | 💭 Nit |
| TE-33 | テスト名は「何を・どの条件で・どうなるか」。`works` / `test1` のような名前にしない | 💭 Nit |
| TE-34 | 境界値と異常系(空、上限、サロゲートペア、エラー応答)を少なくとも 1 つ含める | 💭 Nit |
| TE-40 | 自明なコード(getter、定数、型だけの再エクスポート)とフレームワークの挙動をテストしない | 💭 Nit |
| TE-41 | カバレッジの数値を CI の門にしない。数値のためだけのテストを書かない | 💭 Nit |
| TE-42 | 見た目(色、余白、フォント)は視覚回帰で検証する。計算済みスタイルを数値で assert しない | 💭 Nit |
| TE-50 | テストは CI で毎 PR 実行する。CI で走らないテストを増やさない | 💭 Nit |
| TE-51 | E2E と視覚回帰は本番ビルド(`vp build` の成果物)に対して実行する。dev サーバーに対して実行しない | 💭 Nit |
| TE-52 | 不安定なテストは原因の issue を添えて隔離し、黙って `.skip` にしない | 🚨 Must |

---

## 3. 何を書くか(TE-01〜05)

### TE-01 ロジックには Unit テスト — 💭 Nit

「ロジックを持つ」= 分岐、計算、変換、境界の処理がある。

```ts
// OK: fit.ts の変更と同じ PR に fit.test.ts の追加・更新がある
// OK: 型だけの変更、定数の値だけの変更にはテスト不要(TE-40)
// NG: fitText に新しい制約(最大行数)を足したが、fit.test.ts に対応するケースが無い
```

### TE-02 画面には Integration テスト — 💭 Nit

Integration が未導入の間は指摘しない。導入後は、画面の主要な操作 1 つにつき 1 ケース。

### TE-03 不具合の修正には回帰テスト — 💭 Nit

```ts
// OK
it('入力が空のとき、再描画が繰り返されない', async () => {
  const onFit = vi.fn()
  render(<Studio />)
  await expect.element(page.getByRole('textbox', { name: 'テキスト' })).toBeVisible()
  // レンダー回数が収束している
  expect(onFit.mock.calls.length).toBeLessThan(5)
})

// NG: 修正だけで、同じ不具合を再現するテストが無い
```

回帰テストが書けない場合(レースや環境依存)は、PR 本文に「再現テストを書けない理由」を書けば Nit にしない。

### TE-05 E2E は 10 本以内 — 💭 Nit

E2E に追加する前に「Integration で書けないか」を確認する。
E2E に書くべきもの: ルーティング、ビルド成果物の読み込み、SSR とハイドレーション、複数画面をまたぐ導線。
E2E に書くべきでないもの: 入力値ごとの計算結果、1 画面内の操作の網羅。

---

## 4. どう書くか: 振る舞いとクエリ(TE-10〜15)

### TE-10 実装詳細を assert しない — 💭 Nit

```tsx
// OK: ユーザーに見える結果
await userEvent.type(page.getByRole('textbox', { name: 'テキスト' }), 'おつ')
await expect.element(page.getByText('56px / 1 行')).toBeVisible()

// NG: 内部 state や呼び出し回数
expect(setDraft).toHaveBeenCalledWith({ text: 'おつ' })
expect(component.state.fit.fontSize).toBe(56)
expect(container.querySelector('.studio-fit')?.textContent).toBe('56px / 1 行')  // CSS クラス
```

### TE-11 クエリの優先順位 — 💭 Nit

```tsx
// OK(優先順)
page.getByRole('button', { name: 'Discord' })
page.getByLabelText('テキスト')
page.getByText('56px / 1 行')
page.getByTestId('stamp-canvas')   // aria で表せないキャンバスなど、最後の手段

// NG
container.querySelector('.studio-swatch[aria-pressed="true"]')
page.locator('div > div:nth-child(2) > button')
page.locator('xpath=//button[1]')
```

`getByTestId` を使うときは、`data-testid` を足した理由(role でもラベルでも表せない)がコードコメントにあること。

### TE-12 内部モジュールをモックしない — 🚨 Must

```ts
// NG
vi.mock('./fit')                       // 内部ロジックの差し替え
vi.mock('./StampCanvas', () => ({ StampCanvas: () => null }))   // 自作コンポーネントの差し替え

// OK: 境界のモック
server.use(http.get('/api/packs', () => HttpResponse.json([])))   // HTTP(MSW)
vi.useFakeTimers()                                                // 時刻
vi.spyOn(crypto, 'randomUUID').mockReturnValue('...')            // 乱数
```

例外: 描画が極端に重い子コンポーネント(WebGL など)を、Integration の速度のためにスタブする場合。理由をコメントに書けば Nit に下げる。

### TE-14 HTTP は MSW — 💭 Nit

```ts
// OK
server.use(http.get('/api/packs', () => HttpResponse.json(packs)))

// NG
globalThis.fetch = vi.fn().mockResolvedValue({ json: async () => packs })
vi.mock('~/api/client')
```

### TE-15 本物の外部ネットワークに出ない — 🚨 Must

Google Fonts、GitHub API、自社 API の本番環境などに、テストから接続しない。
E2E でも、自分が管理しない外部サービスは `page.route` でスタブする。
例外: E2E を staging 環境に対して実行する場合の自社 API。

---

## 5. 安定性(TE-20〜26)

### TE-20 `sleep` をしない — 🚨 Must

```ts
// NG
await new Promise((r) => setTimeout(r, 500))
await page.waitForTimeout(1000)

// OK
await expect.element(page.getByText('56px / 1 行')).toBeVisible()   // 自動リトライ
await expect(page.getByRole('img')).toBeVisible()                   // Playwright の web-first assertion
vi.useFakeTimers(); vi.advanceTimersByTime(500)                     // 時間をテストが制御する
```

### TE-21 テストの独立 — 🚨 Must

```ts
// NG: モジュールスコープの可変状態を複数テストで共有
let draft = initialDraft
it('A', () => { draft = { ...draft, text: 'おつ' } })
it('B', () => { expect(draft.text).toBe('おつ') })   // A に依存

// OK: 各テストで arrange する。共通の準備は beforeEach か関数に
```

E2E では、テストごとに storage / cookie を分け(Playwright の既定)、ログイン状態は setup project で 1 回作って再利用する。

### TE-22 assertion の無いテスト — 🚨 Must

```ts
// NG
it('描画できる', () => { render(<Studio />) })                      // assertion が無い
it('エラーになる', async () => {
  try { await load() } catch (e) { expect(e).toBeDefined() }        // load が成功すると何も検証されない(TE-23)
})

// OK
it('描画できる', async () => {
  render(<Studio />)
  await expect.element(page.getByRole('heading', { name: 'ponmoji studio' })).toBeVisible()
})
it('エラーになる', async () => { await expect(load()).rejects.toThrow('not found') })
```

### TE-24 / TE-25 `.only`、`.skip`、削除 — 🚨 Must

```ts
it.only('...')      // NG: コミットしない
it.skip('...')      // NG: 理由と解消条件が無い
// OK
it.skip('フォント読み込み後の再描画 — Browser Mode で document.fonts.load が解決しない。issue #12 で対応', ...)
```

テストを削除する・期待値を緩める変更は、PR 本文に理由が無ければ Must。
「CI を通すため」は理由にならない。

### TE-26 リトライ — 💭 Nit

```ts
// OK  playwright.config.ts
retries: process.env.CI ? 2 : 0

// NG  vite.config.ts の test ブロック
test: { retry: 3 }   // Unit / Integration が不安定なのは設計の問題。リトライで隠さない
```

---

## 6. 書き方の作法(TE-30〜34)

### TE-30 AAA と 1 テスト 1 振る舞い — 💭 Nit

```ts
// OK
it('長い 1 行は全体が縮んで収まる', () => {
  // Arrange
  const text = 'おつかれさまでした'
  // Act
  const r = fitText({ text, measure: squareMeasure })
  // Assert
  expect(r.fontSize).toBe(12)
  expect(r.fits).toBe(true)
})

// NG: 1 つの it で入力を変えながら 5 つの振る舞いを検証(どれが落ちたか分からない)
```

### TE-31 現実的な入力 — 💭 Nit

```ts
fitText({ text: 'おつかれさまでした', ... })   // OK
fitText({ text: 'aaaa', ... })                 // NG(日本語・全角・絵文字を含む実際の入力で検証する)
```

### TE-32 スナップショット — 💭 Nit

```ts
expect(r).toMatchInlineSnapshot(`{ fontSize: 56, fits: true }`)   // OK: 短くインライン
expect(container).toMatchSnapshot()                               // NG: DOM 全体。変更のたびに更新されるだけで何も守らない
```

### TE-34 境界値と異常系 — 💭 Nit

ロジックのテストには、正常系に加えて次のうち該当するものを 1 つ以上含める:
空、上限ちょうど、上限 +1、サロゲートペア(絵文字)、改行だけ、エラー応答、タイムアウト。

---

## 7. 書かないもの(TE-40〜42)

```ts
// NG: 自明なコード
it('STAMP_SIZE は 128', () => expect(STAMP_SIZE).toBe(128))

// NG: フレームワークの挙動
it('Link をクリックすると遷移する', ...)   // TanStack Router のテスト

// NG: 計算済みスタイルの数値
expect(getComputedStyle(el).color).toBe('rgb(29, 28, 29)')   // 視覚回帰で見る
```

---

## 8. 例外の扱い

次の条件を満たす場合、Must を Nit に下げる(Nit は Nit のまま):

1. PR 本文またはテストのコメントに、**なぜルールに従えないか**と**いつ解消するか**(または恒久的な理由)が書かれている
2. 影響が 1 ファイルに閉じている

例外として認めないもの(理由があっても Must のまま):

- TE-15(本物の外部ネットワークへの接続)
- TE-24(`.only` のコミット)
- TE-25 のうち「CI を通すため」を理由にしたテストの削除・無効化

---

## 9. レビュー時のチェック手順

1. **テストの有無**: 差分のロジック・画面・不具合修正に対応するテストがあるか(TE-01〜04)。未導入の層は飛ばす
2. **テストの削除・無効化**: `.skip`、削除、期待値の緩和に理由があるか(TE-25、TE-52)。`.only` が無いか(TE-24)
3. **安定性**: `sleep`、共有状態、assertion の無いテスト(TE-20〜22)
4. **モック**: `vi.mock` の対象が内部モジュールでないか(TE-12)。`fetch` の差し替えが無いか(TE-14)。外部接続が無いか(TE-15)
5. **クエリと assertion**: 実装詳細や CSS セレクタに依存していないか(TE-10、11)
6. **作法**: 名前、AAA、入力、スナップショット、境界値(TE-30〜34)

違反を見つけたら、コメントに **ルール ID** を書く(例: `[AI] 🚨 Must: TE-20 固定時間の待機をしている`)。

---

## 10. 導入の順序(参考。ガイドラインではなく計画)

1. **今**: Unit(Vitest)と Static(`vp check`)。CI に `vp check` と `vp run -r test` を追加する
2. **Studio の操作が増えたら**: Vitest Browser Mode + `vitest-browser-react` を導入し、Studio の Integration テストを書く
3. **ストアなど API を呼ぶ画面ができたら**: MSW を導入する
4. **デプロイ先が決まったら**: Playwright を導入し、スモーク 1 本 + Studio の導線 1 本。本番ビルドに対して実行する
5. **フォントを自前配信にしたら**: スタンプの視覚回帰を 3〜5 パターン追加する
