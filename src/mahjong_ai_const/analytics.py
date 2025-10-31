from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence

import numpy as np
import pandas as pd

FOUR_PLAYER_RECORD_SHEET = "点数表_四麻"


@dataclass(frozen=True)
class PlayerSegment:
    """Logical grouping of score, cumulative, and rank columns for a player."""

    name: str
    score: str
    cumulative: Optional[str]
    rank: Optional[str]


def _load_raw_four_player_sheet(path: Path) -> tuple[pd.DataFrame, str, list[PlayerSegment]]:
    """Load the four-player record sheet and detect per-player column segments."""
    df = pd.read_excel(path, sheet_name=FOUR_PLAYER_RECORD_SHEET, header=0)
    df = df.dropna(how="all")

    columns = df.columns.tolist()
    if not columns:
        raise ValueError("点数表_四麻 シートにヘッダーが見つかりませんでした。")

    date_column = columns[0]
    segments: List[PlayerSegment] = []

    def _contains_any(value: object, keywords: Iterable[str]) -> bool:
        if not isinstance(value, str):
            return False
        return any(keyword in value for keyword in keywords)

    cumulative_keywords = ("累", "合計", "total", "TOTAL")
    rank_keywords = ("順位", "着順", "rank", "RANK")

    i = 1
    while i < len(columns):
        name = columns[i]
        if not isinstance(name, str):
            i += 1
            continue
        if not name.strip() or name.startswith("Unnamed"):
            i += 1
            continue
        if _contains_any(name, cumulative_keywords) or _contains_any(name, rank_keywords):
            i += 1
            continue

        cumulative: Optional[str] = None
        rank: Optional[str] = None
        next_index = i + 1

        if next_index < len(columns) and _contains_any(columns[next_index], cumulative_keywords):
            cumulative = columns[next_index]
            next_index += 1

        if next_index < len(columns) and _contains_any(columns[next_index], rank_keywords):
            rank = columns[next_index]
            next_index += 1

        segments.append(PlayerSegment(name=name, score=name, cumulative=cumulative, rank=rank))
        i = next_index

    if not segments:
        raise ValueError("プレイヤー列を特定できませんでした。シート構成を確認してください。")

    return df, date_column, segments


def _to_long_game_records(
    df: pd.DataFrame, date_column: str, segments: Sequence[PlayerSegment]
) -> tuple[pd.DataFrame, pd.DataFrame]:
    data = df.copy()

    data[date_column] = pd.to_numeric(data[date_column], errors="coerce")
    base_date = pd.Timestamp("1899-12-30")
    data[date_column] = (base_date + pd.to_timedelta(data[date_column], unit="D")).ffill()

    segment_list = list(segments)
    active_player_count = min(4, len(segment_list))
    score_cols: List[str] = []
    rank_map: dict[str, str] = {}

    for segment in segment_list:
        data[segment.score] = pd.to_numeric(data[segment.score], errors="coerce")
        score_cols.append(segment.score)
        if segment.rank is not None and segment.rank in data.columns:
            data[segment.rank] = pd.to_numeric(data[segment.rank], errors="coerce")
            rank_map[segment.score] = segment.rank

    score_values = data[score_cols]
    non_na_counts = score_values.notna().sum(axis=1)
    non_zero_sums = score_values.abs().sum(axis=1)
    mask = (non_na_counts >= active_player_count) & (non_zero_sums > 0)

    filtered = data.loc[mask].copy()
    games = filtered.reset_index(drop=True)

    score_frame = games[score_cols].copy()
    score_col_order = {col: idx for idx, col in enumerate(score_cols)}
    selected_sets: List[set[str]] = []

    for idx in score_frame.index:
        row_scores = score_frame.loc[idx]
        selected: List[str] = []

        ranked_candidates: List[tuple[str, float, float]] = []
        for score_col, rank_col in rank_map.items():
            rank_value = games.at[idx, rank_col]
            if pd.isna(rank_value):
                continue
            try:
                rank_float = float(rank_value)
            except (TypeError, ValueError):
                continue
            if 1 <= rank_float <= active_player_count:
                ranked_candidates.append((score_col, rank_float, abs(row_scores[score_col])))
        if ranked_candidates:
            ranked_candidates.sort(key=lambda item: (item[1], -item[2], score_col_order[item[0]]))
            for score_col, _, _ in ranked_candidates:
                if score_col not in selected:
                    selected.append(score_col)
                if len(selected) == active_player_count:
                    break

        if len(selected) < active_player_count:
            candidates: List[tuple[str, float]] = []
            for score_col in score_cols:
                if score_col in selected:
                    continue
                value = row_scores[score_col]
                if pd.isna(value):
                    continue
                candidates.append((score_col, abs(value)))
            candidates.sort(key=lambda item: (-item[1], score_col_order[item[0]]))
            for score_col, _ in candidates:
                if score_col not in selected:
                    selected.append(score_col)
                if len(selected) == active_player_count:
                    break

        if len(selected) < active_player_count:
            for score_col in score_cols:
                if score_col in selected:
                    continue
                if pd.isna(row_scores[score_col]):
                    continue
                selected.append(score_col)
                if len(selected) == active_player_count:
                    break

        selected_sets.append(set(selected[:active_player_count]))

    for idx, allowed in enumerate(selected_sets):
        for score_col in score_cols:
            if score_col not in allowed:
                score_frame.iat[idx, score_col_order[score_col]] = np.nan

    valid_mask = score_frame.notna().sum(axis=1) == active_player_count
    score_frame = score_frame.loc[valid_mask].reset_index(drop=True)
    games = games.loc[valid_mask].reset_index(drop=True)
    games["game_index"] = games.index

    games.loc[:, score_cols] = score_frame
    rank_frame = score_frame.rank(axis=1, method="min", ascending=False)

    records: List[pd.DataFrame] = []
    for segment in segment_list:
        score_col = segment.score
        if score_col not in games.columns:
            continue
        player_rows = games.loc[:, [date_column, score_col, "game_index"]].copy()
        player_rows = player_rows.dropna(subset=[score_col])
        if player_rows.empty:
            continue
        player_rows.columns = ["date", "score", "game_index"]
        player_rows["player"] = segment.name
        player_rows["score"] = player_rows["score"].astype(float)
        rank_series = rank_frame.loc[player_rows.index, score_col]
        player_rows["rank"] = rank_series.astype(int).values
        records.append(player_rows[["game_index", "player", "date", "score", "rank"]])

    if not records:
        raise ValueError("点数データを抽出できませんでした。")

    long_records = pd.concat(records, ignore_index=True)
    long_records = long_records.sort_values(["date", "game_index", "player"]).reset_index(drop=True)
    return long_records, games


def _compute_player_stats(records: pd.DataFrame) -> pd.DataFrame:
    placements = (
        records.groupby(["player", "rank"])
        .size()
        .unstack(fill_value=0)
        .reindex(columns=[1, 2, 3, 4], fill_value=0)
        .rename(columns={1: "rank_1", 2: "rank_2", 3: "rank_3", 4: "rank_4"})
    )

    base = records.groupby("player").agg(
        total_score=("score", "sum"),
        games_played=("score", "size"),
        average_score=("score", "mean"),
        average_rank=("rank", "mean"),
        best_score=("score", "max"),
        worst_score=("score", "min"),
    )

    stats = base.join(placements, how="left").fillna(0)
    for column in ["games_played", "rank_1", "rank_2", "rank_3", "rank_4"]:
        stats[column] = stats[column].astype(int)

    denominator = stats["games_played"].replace(0, np.nan)
    stats["win_rate"] = (stats["rank_1"] / denominator).fillna(0.0)
    stats["top_rate"] = ((stats["rank_1"] + stats["rank_2"]) / denominator).fillna(0.0)
    stats["last_rate"] = (stats["rank_4"] / denominator).fillna(0.0)

    stats = stats.reset_index().rename(columns={"player": "player"})
    stats["ordinal_rank"] = stats["total_score"].rank(method="dense", ascending=False).astype(int)
    stats = stats.sort_values(["total_score", "ordinal_rank", "average_rank"], ascending=[False, False, False])
    return stats.reset_index(drop=True)


def _infer_season_label(workbook: Path) -> str:
    stem = workbook.stem
    import re

    match = re.search(r"(\d{4})[_-]?(\d{2})", stem)
    if match:
        start, end = match.groups()
        return f"{start}-{end}"
    return stem


def _format_date(value: pd.Timestamp) -> Optional[str]:
    if pd.isna(value):
        return None
    return value.date().isoformat()


def build_history(records: pd.DataFrame) -> list[dict]:
    history: List[dict] = []
    if records.empty:
        return history

    grouped = records.groupby("game_index")
    for game_index, frame in grouped:
        frame = frame.sort_values("rank")
        date_value = frame["date"].iloc[0]
        item = {
            "game_index": int(game_index),
            "date": _format_date(pd.to_datetime(date_value)),
            "players": [
                {
                    "name": row.player,
                    "score": float(row.score),
                    "rank": int(row.rank),
                }
                for row in frame.itertuples()
            ],
        }
        if item["players"]:
            winner = item["players"][0]
            item["winner"] = winner["name"]
        item["total_points"] = float(frame["score"].sum())
        history.append(item)

    history.sort(key=lambda entry: entry["game_index"])
    return history


def build_player_payload(stats: pd.DataFrame) -> list[dict]:
    players: List[dict] = []
    for row in stats.itertuples(index=False):
        players.append(
            {
                "rank": int(row.ordinal_rank),
                "name": row.player,
                "games_played": int(row.games_played),
                "total_score": float(row.total_score),
                "average_score": float(row.average_score),
                "average_rank": float(row.average_rank),
                "win_rate": float(row.win_rate),
                "top_rate": float(row.top_rate),
                "last_rate": float(row.last_rate),
                "best_score": float(row.best_score),
                "worst_score": float(row.worst_score),
                "rank_counts": {
                    "first": int(row.rank_1),
                    "second": int(row.rank_2),
                    "third": int(row.rank_3),
                    "fourth": int(row.rank_4),
                },
            }
        )
    return players


def build_summary(workbook: Path) -> dict:
    records_sheet, date_column, segments = _load_raw_four_player_sheet(workbook)
    records, games = _to_long_game_records(records_sheet, date_column, segments)
    stats = _compute_player_stats(records)

    start_date = pd.to_datetime(records["date"].min()) if not records.empty else pd.NaT
    end_date = pd.to_datetime(records["date"].max()) if not records.empty else pd.NaT

    summary = {
        "season": _infer_season_label(workbook),
        "workbook": workbook.name,
        "total_games": int(games.shape[0]),
        "total_players": int(stats.shape[0]),
        "start_date": _format_date(start_date),
        "end_date": _format_date(end_date),
    }

    return {
        "summary": summary,
        "players": build_player_payload(stats),
        "history": build_history(records),
    }
