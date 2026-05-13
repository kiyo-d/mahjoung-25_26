import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerSummaryDetail } from "@/data/player-summary";

type LeaderboardRow = {
  rank: number;
  name: string;
  id: string;
  color: string;
  points: number;
  diffToLeader: number;
  diffToPrevious: number | null;
  games: number;
};

const pointFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatDiff(value: number | null): string {
  if (value === null) return "首位";
  if (Math.abs(value) < 1e-9) return "0.0";
  return `${value > 0 ? "+" : ""}${pointFormat.format(value)}`;
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Leaderboard({ players }: { players: PlayerSummaryDetail[] }) {
  const rows = useMemo<LeaderboardRow[]>(() => {
    if (!players.length) return [];

    const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const leader = sorted[0]?.totalScore ?? 0;

    return sorted.map((player, index) => ({
      rank: index + 1,
      name: player.name,
      id: player.id,
      color: player.color,
      points: player.totalScore,
      diffToLeader: player.totalScore - leader,
      diffToPrevious: index === 0 ? null : (sorted[index - 1]?.totalScore ?? 0) - player.totalScore,
      games: player.gamesPlayed,
    }));
  }, [players]);

  const topThree = rows.slice(0, 3);
  const pointFloor = Math.min(...rows.map((row) => row.points), 0);
  const pointRange = Math.max(...rows.map((row) => row.points), 0) - pointFloor || 1;

  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.58))]">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">
              総合順位
            </p>
            <CardTitle className="mt-2 text-3xl md:text-4xl">
              順位
            </CardTitle>
          </div>
          <p className="max-w-[30rem] text-sm leading-7 text-[var(--color-text-muted)]">
            点差、試合数、前後との差を一目で把握できるように整理した順位表です。
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {topThree.map((row, index) => (
            <div
              key={row.id}
              className="rounded-[28px] border border-[var(--color-border)] bg-white/78 p-4 shadow-[var(--shadow-subtle)]"
              style={{
                background: `linear-gradient(135deg, ${withAlpha(row.color, 0.14)}, rgba(255,255,255,0.92))`,
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
                {index === 0 ? "現在の首位" : index === 1 ? "追走位置" : "3番手"}
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">{row.name}</div>
                  <div className="mt-2 text-sm text-[var(--color-text-subtle)]">{row.games} 戦</div>
                </div>
                <div className="font-mono text-lg text-[var(--color-text)]">{pointFormat.format(row.points)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const fillWidth = ((row.points - pointFloor) / pointRange) * 60 + 28;

            return (
              <div
                key={row.id}
                className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-subtle)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-4 lg:min-w-[230px]">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-inverse)] text-sm font-semibold text-white">
                      {row.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="truncate text-lg font-semibold text-[var(--color-text)]">{row.name}</span>
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
                        {row.id}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(18,17,15,0.08)]">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.min(fillWidth, 100)}%`,
                          background: `linear-gradient(90deg, ${withAlpha(row.color, 0.45)}, ${row.color})`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 text-right sm:grid-cols-3 lg:min-w-[360px]">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">総スコア</div>
                      <div className="mt-2 font-mono text-base text-[var(--color-text)]">{pointFormat.format(row.points)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">首位との差</div>
                      <div className="mt-2 font-mono text-base text-[var(--color-text)]">{formatDiff(row.diffToLeader)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">ひとつ上との差</div>
                      <div className="mt-2 font-mono text-base text-[var(--color-text)]">{formatDiff(row.diffToPrevious)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
