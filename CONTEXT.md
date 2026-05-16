# Env Badge

開いているタブの**環境** (本番 / 検証 / ローカル等) をユーザーに視覚的に強制認識させるための Chrome 拡張機能。「本番だと気づかずに操作した」事故を防ぐためのセーフティネットがドメインの中心。

## Language

**Environment** (環境):
ホストが属する論理区分 (本番・検証・開発・ローカル等)。Env Badge が判別の対象とする概念。
_Avoid_: 「サイト」「サーバ」「ステージ」

**Rule**:
ユーザーが設定する1件の判定設定。1つの **Pattern** と 1つの **Environment Kind** と 1つの **Label** を持つ。
_Avoid_: 「条件」「マッチャー」

**Pattern**:
Rule がマッチ対象とする文字列。`glob` または `regex` のいずれか1モードを取り、**現在のタブの `hostname` 文字列にのみ**評価される。
_Avoid_: 「正規表現」「URL ルール」(URL 全体ではなく hostname 限定であることを明示するため)

**Environment Kind**:
Rule の分類タグ (`production` / `staging` / `development` / `local` / `custom`)。**バッジ色のプリセット選択肢としてのみ**機能する語彙であり、識別単位ではない。ユーザーが kind を変えると `background` / `foreground` のデフォルトが切り替わる。
_Avoid_: 「ステージ」「環境タイプ」(単独で識別子のように使うと **Environment** との混同を生む)

**Label**:
バッジに描画される短い文字列 (例: `PROD`, `STG`, `LOCAL`)。**Environment Kind** とは独立に決めてよく、`kind: staging` でも label を `STG-AU` のようにカスタマイズできる。
_Avoid_: 「タグ」「環境名」

**Match**:
現在のタブの `hostname` を、有効化された Rule に対して**配列の先頭から評価し、最初に該当した Rule をその場の判定結果として確定する**動作。マッチ結果 (`MatchedEnv`) は **Label** と背景色・前景色を保持する。
_Avoid_: 「ヒット」「該当判定」

**Display Mode**:
バッジ表示の重ね方を表す設定。`badge` (角の太字チップのみ) / `banner` (上端または下端のカラーバー + バッジ) / `frame` (画面 4 辺の枠 + バッジ) / `all` (3 つすべて) のいずれか 1 つ。デフォルトは `banner`。
_Avoid_: 「テーマ」「スタイル」(`style` プロパティ名は CSS 由来の慣習に乗っているが、ドメイン上は **Display Mode** と呼ぶ)

**Probe**:
options 画面の URL/hostname 入力欄。**Match** ロジックをユーザー操作なしに試せる開発支援機能であり、ストレージや表示モードには影響しない。
_Avoid_: 「テスター」「シミュレータ」

## Relationships

- 1つの **Rule** は 1つの **Pattern** と 1つの **Environment Kind** と 1つの **Label** を持つ
- **Pattern** は `hostname` のみを評価対象とする (port, pathname, search, hash は対象外)
- **Environment Kind** は色のデフォルト導出にのみ使われ、識別単位ではない
- 複数の **Rule** が同じ hostname にマッチしたときは **配列の先頭から評価され、最初にマッチした Rule を採用する** ([ADR-0001](./docs/adr/0001-first-match-wins-rule-evaluation.md))
- **Match** は **top-frame の hostname** のみを対象とし、埋め込み iframe には介入しない (1 タブ = 1 判定 = 1 表示の不変条件)
- **Match** がいずれの Rule にもヒットしない場合、**デフォルトでは何も描画しない** (本番ドメインは明示登録する前提。`showWhenUnknown` を ON にすると UNKNOWN バッジを出せる)
- `production` を意図する Rule は**デフォルトの Rule セットに含めない** ([ADR-0004](./docs/adr/0004-no-production-defaults.md))

## Example dialogue

> **Dev:** "`*.staging.example.com` のルールは登録した。本番 `app.example.com` を開いたら何が表示される?"
> **Domain expert:** "本番ドメインの **Rule** を登録していないなら、**Match** は失敗してデフォルトでは何も出ない。本番事故防止のためには `app.example.com` を `production` **Environment Kind** で明示登録するのが Env Badge の哲学。"

## Flagged ambiguities

- 「環境」という単語が単独で出てきたら、それは **Environment** か **Environment Kind** か、必ず文脈で区別する。前者はホストが帰属する論理区分、後者は色プリセットを選ぶための語彙タグ。
