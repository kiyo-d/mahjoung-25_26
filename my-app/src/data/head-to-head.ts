import type { Season } from "@/types/propsType";

type PlayerScore = {
  name: string;
  score: number;
};

export type HeadToHeadRecord = {
  playerA: string;
  playerB: string;
  games: number;
  winsA: number;
  winsB: number;
  draws: number;
  averagePointDiff: number;
  totalPointDiff: number;
  winRateA: number;
};

type PairKey = `${string}__${string}`;

type Aggregate = {
  playerA: string;
  playerB: string;
  games: number;
  winsA: number;
  winsB: number;
  draws: number;
  pointDiffTotal: number;
};

function normalizePair(first: PlayerScore, second: PlayerScore): {
  playerA: PlayerScore;
  playerB: PlayerScore;
} {
  const order = first.name.localeCompare(second.name, "ja");
  if (order <= 0) {
    return { playerA: first, playerB: second };
  }
  return { playerA: second, playerB: first };
}

function toScore(value: number | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return value;
}

export function buildHeadToHeadRecords(season: Season | undefined): HeadToHeadRecord[] {
  if (!season || !Array.isArray(season.history)) {
    return [];
  }

  const aggregates = new Map<PairKey, Aggregate>();

  season.history.forEach((game) => {
    const players = (game.players ?? [])
      .map((player) => {
        const score = toScore(player.score);
        if (score === null) return null;
        return {
          name: player.name ?? "不明",
          score,
        } satisfies PlayerScore;
      })
      .filter((player): player is PlayerScore => player !== null);

    for (let i = 0; i < players.length; i += 1) {
      for (let j = i + 1; j < players.length; j += 1) {
        const { playerA, playerB } = normalizePair(players[i], players[j]);
        const key = `${playerA.name}__${playerB.name}` as PairKey;
        const aggregate = aggregates.get(key) ?? {
          playerA: playerA.name,
          playerB: playerB.name,
          games: 0,
          winsA: 0,
          winsB: 0,
          draws: 0,
          pointDiffTotal: 0,
        };

        const diff = playerA.score - playerB.score;
        aggregate.games += 1;
        aggregate.pointDiffTotal += diff;

        if (diff > 0) {
          aggregate.winsA += 1;
        } else if (diff < 0) {
          aggregate.winsB += 1;
        } else {
          aggregate.draws += 1;
        }

        aggregates.set(key, aggregate);
      }
    }
  });

  return [...aggregates.values()]
    .map((item) => {
      const averagePointDiff = item.games > 0 ? item.pointDiffTotal / item.games : 0;
      const winRateA = item.games > 0 ? item.winsA / item.games : 0;
      return {
        playerA: item.playerA,
        playerB: item.playerB,
        games: item.games,
        winsA: item.winsA,
        winsB: item.winsB,
        draws: item.draws,
        averagePointDiff,
        totalPointDiff: item.pointDiffTotal,
        winRateA,
      } satisfies HeadToHeadRecord;
    })
    .sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;
      if (b.winRateA !== a.winRateA) return b.winRateA - a.winRateA;
      return a.playerA.localeCompare(b.playerA, "ja");
    });
}
