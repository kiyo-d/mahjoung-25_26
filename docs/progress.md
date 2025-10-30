# 作業進捗メモ

## 完了した作業
- Excel 対局ログを Python 解析する `src/mahjong_ai_const/analytics.py` を作成し、統計量と順位を算出して JSON 形式で出力できるようにした。
- `scripts/generate_summary.py` で `dist/data/summary.json` を自動生成するコマンドラインを整備した。
- `web/` 配下にローカル閲覧用 UI を実装し、概要カード・プレイヤー成績表・詳細パネル・対局履歴を可視化できるようにした。
- プレイヤー選択時に詳細指標と最近の成績ハイライト、着順バーグラフが表示されるよう UI を刷新した。
- `docs/requirements.md`・`docs/usage.md`・`docs/changelog.md` を更新し、要件・操作手順・変更履歴を明文化した。

## これからの作業候補
- `tests/` に解析ロジックの単体テストを追加し、CI で自動検証できるようにする。
- `web/js/main.js` のコンポーネント分割やチャート描画拡充（勝率推移など）を検討する。
- `pyproject.toml` や `package.json` を整備し、フォーマッタ・リンタ・ビルドタスクを共通化する。
- 役満ギャラリーや画像アセット表示など、`assets/` を利用した追加コンテンツを拡張する。
