# WXT as the extension framework

[WXT](https://wxt.dev/) を採用し、Vite 8 + file-based entrypoints + HMR + `@wxt-dev/auto-icons` を含むモダンな開発体験を取り込む。Manifest V3 まわりの定型コード (manifest 合成、icon サイズ展開、content script CSS 注入) を WXT が肩代わりするため、ドメインロジック (`src/match.ts`, `src/storage.ts`) に時間を割ける。

## Considered Options

- **Vanilla TypeScript + `tsc`** (tabs-sort 流) — 依存は薄いが、icon 自動生成・Shadow DOM ヘルパ・HMR は自前で組む必要があり、個人開発のスピード感を損なう。
- **Vite + `@crxjs/vite-plugin`** — Vite ベースの王道だが、entrypoint 規約や HMR の癖を自前で整える手間が WXT より多く、WXT が提供する `createShadowRootUi` / `storage.defineItem` ヘルパも無い。
- **Plasmo** — UI フレームワーク前提の世界観が強く、vanilla TS で完結したい本プロジェクトとは思想が合わない。

## Consequences

- `wxt.config.ts` / `entrypoints/*` / `@wxt-dev/auto-icons` が前提知識として要求される。tabs-sort 流の構成に慣れている読み手は最初戸惑う可能性あり (README に補足済み)。
- WXT は v0.x の段階で API がまだ動くため、メジャーアップグレード時に `wxt prepare` / `storage.defineItem` などのシグネチャ追従が必要。
- `chrome.storage.sync` への薄いラッパとして `storage.defineItem('sync:settings', ...)` を使っている ([ADR-0002](./0002-settings-stored-in-chrome-storage-sync.md))。WXT を剥がすときは Chrome API への直接呼び出しに置き換える必要がある。
