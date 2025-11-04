// src/types/mahjong.ts
export type PlayerId =
  | "KIYO"
  | "YAMADA"
  | "KOTARO"
  | "REI"
  | "YOSHITANI"
  | "HINATA";

export type TimelinePoint = { hand: string } & Partial<Record<PlayerId, number>>;

export type Player = {
    id: PlayerId;
    name: string;
    team?: string;
    color: string;
  };

export type RecentMatch = {
    date: string;
    room: string;
    rank: 1 | 2 | 3 | 4;
    score: number;
    nameplate: string;
    points: number;
  };

export type PieDatum = { name: string; value: number };
export type BarDatum = { name: string; value: number };

export type SeasonPayload = {
  generated_at: string; // ISO8601（例: "2025-10-31T21:12:22.752416+00:00"）
  source: string;       // "data" など
  seasons: Array<{
    summary: {
      season: string;
      workbook: string;
      total_games: number;
      total_players: number;
      start_date: string; // "YYYY-MM-DD"
      end_date: string;   // "YYYY-MM-DD"
    };
    players: Array<{
      rank: number;
      name: string;
      games_played: number;
      total_score: number;
      average_score: number;
      average_rank: number;
      win_rate: number;
      top_rate: number;
      last_rate: number;
      best_score: number;
      worst_score: number;
      rank_counts: { first: number; second: number; third: number; fourth: number };
    }>;
    history: Array<{
      game_index: number;
      date: string; // "YYYY-MM-DD"
      players: Array<{ name: string; score: number; rank: 1 | 2 | 3 | 4 }>;
      winner: string;
      total_points: number;
    }>;
  }>;
};