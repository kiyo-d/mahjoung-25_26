import { ID_COLOR, NAME_TO_ID, PLAYER_ORDER } from "@/lib/player-mappings";
import type { PlayerId, SeasonPayload } from "@/types/propsType";

export type PlayerSummaryDetail = {
  id: PlayerId;
  name: string;
  color: string;
  rank: number;
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  averageRank: number;
  winRate: number;
  topRate: number;
  lastRate: number;
  bestScore: number;
  worstScore: number;
  rankCounts: { first: number; second: number; third: number; fourth: number };
  rankHistory: Array<{ gameNumber: number; date: string; dailyIndex: number; rank: number | null }>;
};

export function buildPlayerSummaries(payload: SeasonPayload): PlayerSummaryDetail[] {
  const season = payload.seasons?.[0];
  if (!season) return [];

  const perDateCount = new Map<string, number>();
  const rankTimeline: Record<PlayerId, PlayerSummaryDetail["rankHistory"]> = {
    KIYO: [],
    YAMADA: [],
    KOTARO: [],
    REI: [],
    YOSHITANI: [],
    HINATA: [],
  };

  const trackedPlayers = season.players
    .map((player) => {
      const id = NAME_TO_ID[player.name];
      if (!id) return null;
      return { id, player };
    })
    .filter((entry): entry is { id: PlayerId; player: (typeof season.players)[number] } => !!entry);

  season.history?.forEach((game, index) => {
    const date = game.date ?? "";
    const nth = (perDateCount.get(date) ?? 0) + 1;
    perDateCount.set(date, nth);

    const gameNumber = index + 1;
    const participants = new Map<string, number>();
    for (const participant of game.players ?? []) {
      if (typeof participant.name === "string" && typeof participant.rank === "number") {
        participants.set(participant.name, participant.rank);
      }
    }

    for (const { id, player } of trackedPlayers) {
      const rank = participants.get(player.name);
      rankTimeline[id].push({
        gameNumber,
        date,
        dailyIndex: nth,
        rank: typeof rank === "number" ? rank : null,
      });
    }
  });

  const ordered = PLAYER_ORDER
    .map((id) => trackedPlayers.find((entry) => entry.id === id))
    .filter((entry): entry is { id: PlayerId; player: (typeof season.players)[number] } => !!entry);

  return ordered.map(({ id, player }) => ({
    id,
    name: player.name,
    color: ID_COLOR[id],
    rank: player.rank,
    gamesPlayed: player.games_played,
    totalScore: player.total_score,
    averageScore: player.average_score,
    averageRank: player.average_rank,
    winRate: player.win_rate,
    topRate: player.top_rate,
    lastRate: player.last_rate,
    bestScore: player.best_score,
    worstScore: player.worst_score,
    rankCounts: player.rank_counts,
    rankHistory: rankTimeline[id],
  }));
}
