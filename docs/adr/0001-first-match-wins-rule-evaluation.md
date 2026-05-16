# First-match-wins for Rule evaluation

Rule は配列の上から順に評価し、最初に hostname にマッチしたものを採用する。CSS / routing / firewall と同じ習慣でユーザーが順序を直感的に制御でき、glob と regex が混在しても評価が決定的になるため。

## Considered Options

- **Specificity wins** — 自動でより具体的なパターンを優先。glob と regex が混在すると specific 度の機械判定が信頼できず、ユーザーが「優先されるはず」と思った Rule が外される事故が起きうる。
- **Last-match-wins** — メンタルモデルが一般的でなく誤認識を生みやすい。

## Consequences

- options 画面では「具体的なルールを上に置く」UX 上のガイダンスが必要 (並び替えボタンは既に提供済み)。
- 本番ドメインを `*.example.com` (STAGING) より上に登録し損ねると本番タブが STAGING 色に化けるリスクがある。README の「本番は明示登録」ガイダンスと合わせて運用で吸収する。
