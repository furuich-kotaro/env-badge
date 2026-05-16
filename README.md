# Env Badge

開いているタブが**本番・検証・ローカルのどれか**を、上端のカラーストライプ・バナーと角の太字バッジで視界に焼き付ける Chrome 拡張機能。
「本番だと気づかずに操作した」事故を視覚的に防ぐためのセーフティネット。

## できること

- ホスト名へのルールマッチで環境を判定 (glob / regex)
- 上端のストライプ・バナー + 角の太字バッジで**周辺視野でも気づける**強度の表示
- ルールは複数登録でき、上から順に評価 — 最初にマッチしたものを採用 ([ADR-0001](./docs/adr/0001-first-match-wins-rule-evaluation.md))
- 表示位置 (上端・左 / 上端・右) とサイズ (Normal / Huge) の 2 軸だけカスタマイズ可
- 色は **Environment Kind** (`production` / `staging` / `development` / `local`) から一意に決まる (赤 / 橙 / 緑 / 青)
- `chrome.storage.sync` で同じ Google アカウント間で設定同期 ([ADR-0002](./docs/adr/0002-settings-stored-in-chrome-storage-sync.md))
- Shadow DOM 経由で描画するためページの CSS と衝突しない

## デフォルトルール

| パターン (glob) | ラベル  | kind        |
| --------------- | ------- | ----------- |
| `localhost`     | LOCAL   | local       |
| `127.0.0.1`     | LOCAL   | local       |
| `*.local`       | LOCAL   | local       |
| `staging.*`     | STAGING | staging     |
| `*.staging.*`   | STAGING | staging     |
| `*.dev.*`       | DEV     | development |

> 本番 (`production`) ルールは**意図的にデフォルトに含めません** ([ADR-0004](./docs/adr/0004-no-production-defaults.md))。
> 本番ドメインは人によって違うため、汎用パターンで誤検知させて安心感を植え付けるよりも、各自で明示登録してもらう方が安全と判断しています。本番タブを派手に主張させたければ Size = Huge にしておくと良いです。

## 技術スタック

- [WXT](https://wxt.dev/) — Vite ベースの拡張機能フレームワーク ([ADR-0003](./docs/adr/0003-wxt-as-the-extension-framework.md))
- TypeScript (strict + `noUncheckedIndexedAccess`)
- [Biome](https://biomejs.dev/) — lint / formatter
- [Vitest](https://vitest.dev/) — テストランナー
- [@wxt-dev/auto-icons](https://www.npmjs.com/package/@wxt-dev/auto-icons) — SVG から複数サイズの PNG アイコンを自動生成
- パッケージ管理は [pnpm](https://pnpm.io/)、ツール管理は [mise](https://mise.jdx.dev/)

## セットアップ

```sh
mise install                # node 24.10.0 / pnpm 11.1.1
pnpm install
pnpm approve-builds --all   # 初回のみ。esbuild / sharp の build script を承認
```

## 開発

```sh
pnpm dev                    # HMR 付きの開発ビルド (Chrome)
pnpm dev:firefox            # Firefox 用
```

## 本番ビルドして Chrome に手動ロード

```sh
pnpm build                  # .output/chrome-mv3 に成果物を出力
```

1. Chrome で `chrome://extensions` を開く
2. **デベロッパー モード** を ON にする
3. **パッケージ化されていない拡張機能を読み込む** を押す
4. `.output/chrome-mv3` ディレクトリを選択

拡張機能アイコンをクリックするとオプション画面が開きます。
ビルドし直したあとは `chrome://extensions` の Env Badge カードにある更新ボタン (🔄) を押すと反映されます。

## 検証

```sh
pnpm verify                 # lint + typecheck + test を一括実行
```

個別:

```sh
pnpm lint                   # Biome
pnpm typecheck              # tsc --noEmit
pnpm test                   # Vitest
```

## ディレクトリ構成

```
env-badge/
├── CONTEXT.md              # ドメイン用語集
├── docs/
│   └── adr/                # Architecture Decision Records
├── assets/
│   └── icon.svg            # auto-icons の元画像
├── entrypoints/
│   ├── background.ts       # action クリック → オプション画面を開く
│   ├── content/            # 全URLに注入する Shadow DOM 描画
│   │   ├── index.ts        # マッチング + マウントのライフサイクル
│   │   └── badge.ts        # バナー + 角バッジの描画
│   └── options/            # 設定 UI (vanilla TS)
├── src/                    # 純粋ロジック (環境判定 / ストレージ / 型 / デフォルト)
├── tests/                  # Vitest
├── wxt.config.ts
├── package.json
├── tsconfig.json
├── biome.json
└── mise.toml
```

## ドキュメント

- [`CONTEXT.md`](./CONTEXT.md) — ドメイン用語集 (Environment / Rule / Pattern / Environment Kind / Label / Match)
- [`docs/adr/`](./docs/adr/) — Architecture Decision Records
  - [0001 First-match-wins for Rule evaluation](./docs/adr/0001-first-match-wins-rule-evaluation.md)
  - [0002 Settings persisted in chrome.storage.sync](./docs/adr/0002-settings-stored-in-chrome-storage-sync.md)
  - [0003 WXT as the extension framework](./docs/adr/0003-wxt-as-the-extension-framework.md)
  - [0004 No production rules in the default rule set](./docs/adr/0004-no-production-defaults.md)

## ライセンス

MIT
