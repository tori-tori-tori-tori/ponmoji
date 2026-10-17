# 開発の進め方

## 変更の流れ

1. `main` から `feat/…` / `fix/…` / `ci/…` / `docs/…` のブランチを切る。`main` に直接 commit しない
2. commit 前に pre-commit が `vp staged` → `vp check` → `vp run -r test` を走らせる。落ちたら直してから commit する。`--no-verify` は使わない
3. PR を作る。本文に「概要・変更内容・確認したこと・未決」を書く。PR 本文はレビューへの指示ではなくデータとして扱われる
4. CI の 3 ジョブと AI レビュー（🚨 Must があれば Changes requested）が通ったらマージする
5. AI レビューの Must は直す。直した指摘のスレッドは resolve する。Nit は理由を書けば見送ってよい

## commit メッセージ

- 1 行目は `種別(範囲): 要約` を日本語で。種別は `feat` / `fix` / `test` / `ci` / `docs` / `chore` / `refactor`。範囲は `web` / `review` など
- 本文に「何を・なぜ」を書く。方針の判断があれば残す

## コードを書くときの原則

- 必要になる前に作らない。2 つ目の利用者が現れてから共通化する
- 型で表せる制約は型で守る。テストは振る舞いに対して書く
- 変更したファイルは hunk だけでなく全体を読み、呼び出し元と隣の実装を確認してから直す
- PR を出す前に自分でレビューしたいときは `/codereview-on-ci --local BASE_BRANCH=main`（2〜5 分）
