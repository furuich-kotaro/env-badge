# No production rules in the default rule set

デフォルトの **Rule** セットには `local` / `staging` / `development` 系の Pattern のみを同梱し、`production` を意図する Rule は**意図的にひとつも含めない**。本番ドメインはユーザーごとに違うため、汎用的に「それっぽい」パターンを同梱すると誤検知で安心感を植え付け、本来狙う「本番事故の視覚的予防」を逆に弱めてしまう。

## Considered Options

- **`prod.*` / `*.prod.*` / `*.production.*` を同梱する** — カバー率が低く、ヒットしなかった本番ドメインが「未マッチで何も出ない」ままになる。同梱されている安心感だけが残り、最悪のパターン。
- **`production` をマッチしないが、未マッチ時に強制 UNKNOWN を出す** — 日常サイト (Google 等) もすべて UNKNOWN になりノイズ化、警告として意味を失う。

## Consequences

- README で「本番ドメインは明示登録、目立たせたければ Size = Huge」と繰り返しガイドする必要がある (反映済み)。
- 「Env Badge を入れたのに本番事故が起きた」場合のほぼ全ては「本番 Rule 未登録」が一次原因になるため、トラブルシューティング時にまずここを疑うこと。
