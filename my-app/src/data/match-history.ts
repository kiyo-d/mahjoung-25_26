import type { MatchRecord, SeasonPayload } from "@/types/propsType";

const BASE_SCORE = 30000;
const RANK_BONUS: Record<MatchRecord["rank"], number> = {
  1: 50,
  2: 10,
  3: -10,
  4: -30,
};

function isValidRank(rank: number | undefined): rank is MatchRecord["rank"] {
  return rank === 1 || rank === 2 || rank === 3 || rank === 4;
}

function formatMonthDay(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();
  return `${month}/${day}`;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function deriveRawScore(score: number | undefined, rank: MatchRecord["rank"]): number | null {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }

  // If the score already looks like a raw value (>= 1000点単位)、そのまま利用
  if (Math.abs(score) >= 1000) {
    return Math.round(score);
  }

  const bonus = RANK_BONUS[rank];
  const raw = (score - bonus) * 1000 + BASE_SCORE;
  return Math.round(raw);
}

function derivePoints(rawScore: number | null, rank: MatchRecord["rank"], fallback?: number): number {
  if (rawScore === null) {
    return typeof fallback === "number" && !Number.isNaN(fallback) ? roundToTenth(fallback) : 0;
  }

  const basePoints = (rawScore - BASE_SCORE) / 1000;
  const points = basePoints + RANK_BONUS[rank];
  return roundToTenth(points);
}

function buildRoomLabel(gameNumber: number, date: string, dailyIndex: number): string {
  const prefix = gameNumber > 0 ? `第${gameNumber}戦` : "対局";
  const dateLabel = formatMonthDay(date);
  if (!dateLabel) {
    return prefix;
  }
  return `${prefix} (${dateLabel}-${dailyIndex}戦目)`;
}

export function buildMatchHistory(payload: SeasonPayload): MatchRecord[] {
  const season = payload.seasons?.[0];
  if (!season || !Array.isArray(season.history)) {
    return [];
  }

  const chronological = [...season.history].sort((a, b) => {
    const timeA = Date.parse(a.date ?? "");
    const timeB = Date.parse(b.date ?? "");

    if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
      return timeA - timeB;
    }

    return (a.game_index ?? 0) - (b.game_index ?? 0);
  });

  const perDateCount = new Map<string, number>();
  let globalGameNumber = 0;

  const games = chronological.map((game) => {
    const date = game.date ?? "";
    const nth = (perDateCount.get(date) ?? 0) + 1;
    perDateCount.set(date, nth);
    globalGameNumber += 1;

    const room = buildRoomLabel(globalGameNumber, date, nth);

    const participants = (game.players ?? [])
      .map((player) => {
        const rank = isValidRank(player.rank) ? player.rank : 4;
        const rawScore = deriveRawScore(player.score, rank);
        const points = derivePoints(rawScore, rank, player.score);

        return {
          date,
          room,
          rank,
          score: rawScore ?? Math.round((player.score ?? 0) * 1000),
          nameplate: player.name ?? "不明",
          points,
        } satisfies MatchRecord;
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.nameplate.localeCompare(b.nameplate, "ja");
      });

    return participants;
  });

  const flattened: MatchRecord[] = [];
  for (let i = games.length - 1; i >= 0; i -= 1) {
    flattened.push(...games[i]);
  }

  return flattened;
}
