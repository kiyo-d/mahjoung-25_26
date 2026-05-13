import { ID_COLOR, NAME_TO_ID, PLAYER_ORDER } from "@/lib/player-mappings";
import type { PlayerId, Season } from "@/types/propsType";

type BestScoreGame = {
  date: string;
  gameNumber: number;
  dailyIndex: number;
};

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
  bestScoreGame?: BestScoreGame;
  worstScore: number;
  rankCounts: { first: number; second: number; third: number; fourth: number };
  rankHistory: Array<{ gameNumber: number; date: string; dailyIndex: number; rank: number | null }>;
};

type BestScoreSnapshot = BestScoreGame & {
  score: number;
};

export function buildPlayerSummaries(season: Season | undefined): PlayerSummaryDetail[] {
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
  const bestScoreById: Partial<Record<PlayerId, BestScoreSnapshot>> = {};

  const trackedPlayers = season.players
    .map((player) => {
      const id = NAME_TO_ID[player.name];
      if (!id) return null;
      return { id, player };
    })
    .filter((entry): entry is { id: PlayerId; player: (typeof season.players)[number] } => !!entry);

  season.history?.forEach((game, index) => {
    const date = game.date ?? "";
    const dailyIndex = (perDateCount.get(date) ?? 0) + 1;
    perDateCount.set(date, dailyIndex);

    const gameNumber = index + 1;
    const participants = new Map<
      string,
      {
        rank: number | null;
        score: number | null;
      }
    >();

    for (const participant of game.players ?? []) {
      participants.set(participant.name, {
        rank: typeof participant.rank === "number" ? participant.rank : null,
        score: typeof participant.score === "number" ? participant.score : null,
      });
    }

    for (const { id, player } of trackedPlayers) {
      const participant = participants.get(player.name);

      rankTimeline[id].push({
        gameNumber,
        date,
        dailyIndex,
        rank: participant?.rank ?? null,
      });

      if (typeof participant?.score === "number") {
        const currentBest = bestScoreById[id];
        if (!currentBest || participant.score > currentBest.score) {
          bestScoreById[id] = {
            score: participant.score,
            date,
            gameNumber,
            dailyIndex,
          };
        }
      }
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
    bestScoreGame: bestScoreById[id]
      ? {
          date: bestScoreById[id].date,
          gameNumber: bestScoreById[id].gameNumber,
          dailyIndex: bestScoreById[id].dailyIndex,
        }
      : undefined,
    worstScore: player.worst_score,
    rankCounts: player.rank_counts,
    rankHistory: rankTimeline[id],
  }));
}
