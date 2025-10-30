# ローカル麻雀成績Webページ 要件定義書

## 1. プロジェクト概要
- 目的: Excel麻雀対局データからPythonで集計し、JavaScriptで閲覧性の高いローカルWeb成績表を提供する。
- 成果物: Python解析スクリプト、正規化データ(JSON/CSV)、静的Web UI、利用手順ドキュメント。

## 2. ステークホルダー
- プロダクトオーナー: 社内麻雀運営チーム。
- 開発: Python解析担当、フロントエンド(JS)担当。
- 利用者: 対局参加者、運営。

## 3. スコープ
- Excel(data/)の読み込みと前処理。
- 集計結果のJSON生成(dist/data/summary.json想定)。
- ローカルで完結するシングルページUI作成。
- データ更新時の再集計スクリプト提供。

## 4. データソースと前処理要件
- 入力: data/配下の年度別Excel(例:麻雀記録_2025_26.xlsx)。
- Pythonで以下を実施: 日付正規化、プレイヤー別成績(平均点、着順、和了率、放銃率)、役満・特記事項の抽出。
- 欠損値は0または"N/A"で補完。異常値はログ出力し、docs/data_issues.mdに記録。

## 5. 出力データ仕様
- 主フォーマット: JSON(UTF-8)。
- 階層例:
  `json
  {
    "summary": {"season": "2025-26", "total_games": 120},
    "players": [
      {"name": "PlayerA", "avg_score": 32.5, "win_rate": 0.28, "yakuman": 2}
    ],
    "history": [
      {"date": "2025-04-12", "east": "PlayerA", "scores": {"PlayerA": 45000}}
    ]
  }
  `
- CSVエクスポートは任意(管理者用)。

## 6. Web UI要件
- 技術: Vanilla JS + モジュールバンドラ(Vite)またはTypeScript対応構成。
- 画面構成: シーズンサマリー、プレイヤー詳細、対局履歴タイムライン、役満ギャラリー(画像はdata/参照)。
- 機能: ソート/フィルタ、グラフ描画(D3.jsまたはChart.js)、モバイル閲覧(レスポンシブ)。
- 更新: dist/data/summary.jsonの差し替えでUIを再読込。

## 7. 非機能要件
- パフォーマンス: 200件対局データを2秒以内に描画。
- セキュリティ: 完全ローカル運用、外部送信なし。
- 品質: Python/JSともにESLint+Prettier/ruff整形、pytest+Jest(もしくはVitest)で主要ロジックをテスト。

## 8. 開発・運用フロー
1. Excel更新→Pythonスクリプト(scripts/generate_summary.py)実行。
2. JSON出力をdist/data/へ配置。
3. 
pm run buildで静的アセット出力、
pm run previewで最終確認。
4. docs/changelog.mdへ更新履歴を追記。

## 9. リスクと課題
- Excelフォーマット変更時の影響。→ バリデーション層を追加。
- 手動更新の手間。→ 将来的に自動バッチ化を検討。
- UIデザイン知見不足。→ 参考デザイン(モック)を初期スプリントで用意。
