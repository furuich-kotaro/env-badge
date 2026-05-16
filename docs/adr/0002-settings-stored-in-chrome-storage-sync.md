# Settings persisted in chrome.storage.sync

ユーザー設定 (Rule 一覧、表示位置・サイズ・スタイル・透明度・ストライプ・showWhenUnknown) を `chrome.storage.sync` の単一 item (`settings`) に保存する。複数 PC / Chrome プロファイル間で設定が自動同期される利便性を、サイズ上限 (1 item あたり 8KB、合計 100KB) より優先する。

## Considered Options

- **chrome.storage.local** — 5MB まで保存可能で制限の心配は薄いが、PC ごとに設定を作り直す必要がある。「本番ドメインのルールを書き忘れた PC」が事故源になるためデメリットが大きい。
- **sync + local の使い分け** — UI を二重化しコードを複雑化させる割に、現スコープで sync の上限に到達する見込みが薄いため不採用。

## Consequences

- ルールを 100 件超積むと 8KB 上限に近づく可能性がある。将来 import/export を実装する際は超過を検知してユーザーに通知すること。
- WXT の `storage.defineItem('sync:settings', ...)` を使っており、ストレージ種別を変えるときはキー名と移行ロジックを書く必要がある。
