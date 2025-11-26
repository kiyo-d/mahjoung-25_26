import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PlayerSummaryDetail } from "@/data/player-summary";
import { cn } from "@/lib/utils";

type LeaderboardRow = {
  rank: number;
  team: string;
  tag?: string;
  color?: string;
  points: number;
  diffToLeader: string;
  diffToPrevious: string;
  games: number;
};

export function Leaderboard({ players }: { players: PlayerSummaryDetail[] }) {
  const rows = useMemo<LeaderboardRow[]>(() => {
    if (!players.length) return [];

    const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const leader = sorted[0]?.totalScore ?? 0;

    const formatDiff = (value: number | null) => {
      if (value === null) return "—";
      if (value === 0) return "±0.0";
      return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
    };

    return sorted.map((player, index) => {
      const diffToLeaderValue = player.totalScore - leader;
      const previousScore = index > 0 ? sorted[index - 1]?.totalScore ?? null : null;
      const diffToPreviousValue = previousScore === null
        ? null
        : previousScore - player.totalScore;

      return {
        rank: index + 1,
        team: player.name,
        tag: player.id,
        color: player.color,
        points: player.totalScore,
        diffToLeader: formatDiff(diffToLeaderValue),
        diffToPrevious: formatDiff(diffToPreviousValue),
        games: player.gamesPlayed,
      } satisfies LeaderboardRow;
    });
  }, [players]);

  return (
    <Card className="glass-panel border-0 h-full flex flex-col">
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="text-neutral-100 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-emerald-500 rounded-full" />
          リーダーボード
        </CardTitle>
        <p className="text-sm text-neutral-400 pl-4">最終累計スコアランキング</p>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <div className="grid grid-cols-[3rem_1fr_4rem] sm:grid-cols-[3rem_1fr_5rem_4rem] gap-2 px-6 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-white/5">
          <div className="text-center">#</div>
          <div>Player</div>
          <div className="text-right">Score</div>
          <div className="text-right hidden sm:block">Games</div>
        </div>
        <ScrollArea className="h-[400px] lg:h-[calc(100%-3rem)] w-full">
          <div className="px-4 py-2 space-y-1">
            {rows.map((row) => (
              <div
                key={row.tag}
                className="group relative grid grid-cols-[3rem_1fr_4rem] sm:grid-cols-[3rem_1fr_5rem_4rem] gap-2 items-center p-3 rounded-xl transition-all hover:bg-white/5"
              >
                {/* Rank Badge */}
                <div className="flex justify-center">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      row.rank === 1 && "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50",
                      row.rank === 2 && "bg-slate-400/20 text-slate-300 ring-1 ring-slate-400/50",
                      row.rank === 3 && "bg-amber-700/20 text-amber-600 ring-1 ring-amber-700/50",
                      row.rank > 3 && "text-neutral-500"
                    )}
                  >
                    {row.rank}
                  </span>
                </div>

                {/* Player Name & Tag */}
                <div className="min-w-0">
                  <div className="font-bold text-neutral-200 truncate group-hover:text-emerald-300 transition-colors">
                    {row.team}
                  </div>
                  <div className="text-xs text-neutral-500 truncate font-mono">
                    {row.tag}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={cn(
                    "font-mono text-lg font-bold tracking-tight",
                    row.points > 0 ? "text-emerald-400" : row.points < 0 ? "text-rose-400" : "text-neutral-400"
                  )}>
                    {row.points.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-neutral-600 font-mono">
                    {row.diffToLeader}
                  </div>
                </div>

                {/* Games (Hidden on mobile) */}
                <div className="text-right hidden sm:block">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-900/50 border border-white/5 text-xs text-neutral-400 font-mono">
                    {row.games}戦
                  </span>
                </div>
                
                {/* Hover Glow Effect */}
                <div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(90deg, ${row.color}00 0%, ${row.color}10 50%, ${row.color}00 100%)`
                    }}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
