# ローカル閲覧手順

1. Python 集計
   - `python scripts/generate_summary.py` を実行し、`dist/data/summary.json` を再生成する。
2. Web サーバー起動
   - `python -m http.server --directory .` などでリポジトリ直下を配信する。
   - ブラウザで `http://localhost:8000/web/` を開く。
3. データ更新
   - Excel を差し替えたら再度ステップ 1 を実行し、ページの「最新データを再読込」ボタンで UI を更新する。

補足:
- `dist/data/summary.json` の構造は `seasons -> summary / players / history` の入れ子になっている。
- 複数年度の Excel を `data/` 配下に置けば、自動的にシーズン切替ドロップダウンが増える。
- プレイヤー行をクリックすると詳細パネルが更新され、平均点・着順率・着順グラフ・直近 8 対局が表示される。
