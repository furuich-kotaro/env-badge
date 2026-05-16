# Env Badge

開いているタブが**本番・検証・ローカルのどれか**を、視界の周辺に出続けるバッジ／カラーバー／フレームで強制的に意識させる Chrome 拡張機能。
「本番だと気づかずに操作してしまう」事故を視覚的に防ぐためのセーフティネット。

## できること

- ホスト名へのルールマッチで環境を判定（glob / regex）
- 上端のカラーバー（斜めストライプ柄）＋ 太字バッジを常時描画して**周辺視野でも気づける**強度
- 表示モードは選べる:
  - `Badge only` — 角の太字バッジのみ
  - `Banner + badge`（デフォルト） — 上端／下端の太いカラーバー＋バッジ
  - `Frame + badge` — 画面 4 辺をぐるりと囲むカラーフレーム＋バッジ
  - `Banner + frame + badge` — 全部盛り（本番事故防止用の最強モード）
- サイズは Compact / Normal / Large(デフォルト) / **Huge** から選択
- ルールは複数登録でき、上から順に評価（最初にマッチしたものを採用）
- ラベル文字列・背景色・前景色をルール単位でカスタマイズ
- `chrome.storage.sync` で同じ Google アカウント間で設定同期
- Shadow DOM 経由で描画するためページの CSS と衝突しない

## デフォルトルール

| パターン (glob) | ラベル  | 種別        |
| --------------- | ------- | ----------- |
| `localhost`     | LOCAL   | local       |
| `127.0.0.1`     | LOCAL   | local       |
| `*.local`       | LOCAL   | local       |
| `staging.*`     | STAGING | staging     |
| `*.staging.*`   | STAGING | staging     |
| `*.dev.*`       | DEV     | development |

> 本番(`production`) ルールは**意図的にデフォルトでは設定していません**。
> 本番ドメインは人によって違うため、誤検知で安心感を植え付けるよりも、
> 各自で明示的に設定してもらう方が安全と判断しています。
> 本番ドメインを登録する際は、`Display style = Banner + frame + badge` ＋ `Size = Huge` にしておくと事故率はほぼゼロにできます。

## 技術スタック

- [WXT](https://wxt.dev/) — Vite ベースのモダンな拡張機能フレームワーク
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

`pnpm dev` を起動すると Chrome が立ち上がり、開発用ビルドが自動ロードされます（WXT 標準動作）。

## 本番ビルドして Chrome に手動ロード

```sh
pnpm build                  # .output/chrome-mv3 に成果物を出力
```

1. Chrome で `chrome://extensions` を開く
2. 右上の **デベロッパー モード** を ON にする
3. **パッケージ化されていない拡張機能を読み込む** を押す
4. このリポジトリの `.output/chrome-mv3` ディレクトリを選択

拡張機能アイコンをクリックするとオプション画面が開きます。
ビルドし直したあとは `chrome://extensions` の Env Badge カードにある更新ボタン（🔄）を押すと反映されます。

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
├── assets/
│   └── icon.svg            # auto-icons の元画像
├── entrypoints/
│   ├── background.ts       # action クリック → オプション画面を開く
│   ├── content/            # 全URLに注入する Shadow DOM 描画
│   │   ├── index.ts        # マッチング + マウントのライフサイクル
│   │   └── badge.ts        # バッジ / バナー / フレームの描画
│   └── options/            # 設定 UI (vanilla TS)
├── src/                    # 純粋ロジック (環境判定 / ストレージ / 型 / デフォルト)
├── tests/                  # Vitest
├── wxt.config.ts
├── package.json
├── tsconfig.json
├── biome.json
└── mise.toml
```

## ライセンス

MIT
