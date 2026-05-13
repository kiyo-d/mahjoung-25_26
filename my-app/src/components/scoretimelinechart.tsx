import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

import type { Player, TimelinePoint } from "@/types/propsType";

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
};

const scoreFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatScore(value: number): string {
  return scoreFormat.format(value);
}

function formatDelta(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (Math.abs(value) < 1e-9) return "変化なし";
  return `${value > 0 ? "+" : ""}${scoreFormat.format(value)}`;
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "-";
  return parsed.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function ScoreTimelineChart({
  timeline,
  players,
}: {
  timeline: TimelinePoint[];
  players: Player[];
}) {
  const playerMap = useMemo<Record<string, Player>>(
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players],
  );

  const yScale = useMemo(() => {
    if (!timeline.length) {
      return { domain: [0, 0] as [number, number], ticks: [0] };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const point of timeline) {
      for (const player of players) {
        const value = point[player.id];
        if (typeof value !== "number") continue;
        if (value < min) min = value;
        if (value > max) max = value;
      }
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { domain: [0, 0] as [number, number], ticks: [0] };
    }

    const minWithZero = Math.min(min, 0);
    const maxWithZero = Math.max(max, 0);
    const rawRange = maxWithZero - minWithZero;
    const rangeForStep = rawRange === 0 ? Math.abs(maxWithZero) || 1 : rawRange;

    const niceNumber = (value: number, round: boolean) => {
      const exponent = Math.floor(Math.log10(value));
      const fraction = value / 10 ** exponent;
      let niceFraction: number;

      if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
      } else if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;

      return niceFraction * 10 ** exponent;
    };

    const desiredTickCount = 6;
    const niceRange = niceNumber(rangeForStep, false);
    const step = niceNumber(niceRange / (desiredTickCount - 1), true);

    const roundAxisValue = (value: number) => {
      if (Math.abs(value) < 1e-9) return 0;
      return Math.round(value * 10) / 10;
    };

    let lower =
      rawRange === 0 ? minWithZero - step : Math.floor(minWithZero / step) * step;
    let upper =
      rawRange === 0 ? maxWithZero + step : Math.ceil(maxWithZero / step) * step;

    if (lower === upper) {
      lower -= step;
      upper += step;
    }

    const ticks: number[] = [];
    for (let tick = lower; tick <= upper + step / 2; tick += step) {
      ticks.push(roundAxisValue(tick));
    }

    return {
      domain: [roundAxisValue(lower), roundAxisValue(upper)] as [number, number],
      ticks,
    };
  }, [players, timeline]);

  const xDomain = useMemo(() => {
    if (!timeline.length) return [0, 0] as [number, number];
    return [1, timeline[timeline.length - 1]?.gameNumber ?? 1] as [number, number];
  }, [timeline]);

  const xTicks = useMemo(() => {
    if (!timeline.length) return [] as number[];
    const lastGame = timeline[timeline.length - 1]?.gameNumber ?? 1;
    const ticks = new Set<number>();
    ticks.add(1);
    for (let tick = 10; tick <= lastGame; tick += 10) {
      ticks.add(tick);
    }
    ticks.add(lastGame);
    return Array.from(ticks).sort((a, b) => a - b);
  }, [timeline]);

  const derivedStats = useMemo(() => {
    const scoreHistory: Record<string, number>[] = [];
    const rankHistory: Record<string, number>[] = [];
    const gameIndexByNumber = new Map<number, number>();

    const playerOrder = players.map((player) => player.id);
    const orderIndex = new Map(playerOrder.map((id, index) => [id, index]));

    timeline.forEach((point, index) => {
      gameIndexByNumber.set(point.gameNumber, index);

      const scores: Record<string, number> = {};
      for (const id of playerOrder) {
        const value = point[id];
        if (typeof value === "number") {
          scores[id] = value;
        }
      }
      scoreHistory.push(scores);

      const sorted = [...playerOrder].sort((a, b) => {
        const scoreA = scores[a] ?? Number.NEGATIVE_INFINITY;
        const scoreB = scores[b] ?? Number.NEGATIVE_INFINITY;
        if (Math.abs(scoreA - scoreB) < 1e-6) {
          return (orderIndex.get(a) ?? 0) - (orderIndex.get(b) ?? 0);
        }
        return scoreB - scoreA;
      });

      const ranks: Record<string, number> = {};
      let currentRank = 1;
      let lastScore: number | null = null;

      sorted.forEach((id, sortIndex) => {
        const score = scores[id] ?? Number.NEGATIVE_INFINITY;
        if (lastScore !== null && score < lastScore - 1e-6) {
          currentRank = sortIndex + 1;
        }
        ranks[id] = currentRank;
        lastScore = score;
      });

      rankHistory.push(ranks);
    });

    return { gameIndexByNumber, rankHistory, scoreHistory };
  }, [players, timeline]);

  const lastPoint = timeline[timeline.length - 1];

  const scoreboard = useMemo(() => {
    if (!lastPoint) return [] as Array<{ id: string; score: number; rank: number }>;

    const currentRanks = derivedStats.rankHistory.at(-1) ?? {};

    return players
      .map((player) => ({
        id: player.id,
        score: Number(lastPoint[player.id] ?? 0),
        rank: currentRanks[player.id] ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [derivedStats.rankHistory, lastPoint, players]);

  const leader = scoreboard[0];
  const runnerUp = scoreboard[1];
  const leadMargin = leader && runnerUp ? leader.score - runnerUp.score : 0;
  const latestDate = lastPoint ? formatShortDate(lastPoint.date) : "-";
  const latestHand = lastPoint ? `第${lastPoint.gameNumber}戦` : "-";
  const topTrend = useMemo(() => {
    if (!leader || derivedStats.scoreHistory.length < 2) return 0;
    const latestScores = derivedStats.scoreHistory.at(-1) ?? {};
    const previousScores = derivedStats.scoreHistory.at(-2) ?? {};
    return Number(latestScores[leader.id] ?? 0) - Number(previousScores[leader.id] ?? 0);
  }, [derivedStats.scoreHistory, leader]);

  const renderTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload as TimelinePoint | undefined;
    if (!point) return null;

    const pointIndex = derivedStats.gameIndexByNumber.get(point.gameNumber) ?? -1;
    const previousScores = pointIndex > 0 ? derivedStats.scoreHistory[pointIndex - 1] : undefined;
    const previousRanks = pointIndex > 0 ? derivedStats.rankHistory[pointIndex - 1] : undefined;
    const currentRanks = pointIndex >= 0 ? derivedStats.rankHistory[pointIndex] : undefined;

    return (
      <div className="min-w-[250px] rounded-[24px] border border-[var(--color-border)] bg-[color:rgba(255,255,255,0.94)] p-4 shadow-[var(--shadow-floating)] backdrop-blur-xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
          {`第${point.gameNumber}戦・${formatShortDate(point.date)}`}
        </div>
        <div className="mt-2 text-sm text-[var(--color-text-muted)]">
          当日 {point.dailyIndex} 戦目
        </div>

        <div className="mt-4 space-y-2">
          {[...payload]
            .sort((a, b) => {
              const valueA = typeof a.value === "number" ? a.value : Number(a.value ?? Number.NEGATIVE_INFINITY);
              const valueB = typeof b.value === "number" ? b.value : Number(b.value ?? Number.NEGATIVE_INFINITY);
              return valueB - valueA;
            })
            .map((entry) => {
              const playerId = entry.dataKey as string;
              const player = playerMap[playerId];
              const score = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
              const previousScore = previousScores?.[playerId];
              const scoreDelta =
                typeof previousScore === "number" ? score - previousScore : Number.NaN;
              const rankNow = currentRanks?.[playerId];
              const rankPrev = previousRanks?.[playerId];
              const rankDelta =
                typeof rankNow === "number" && typeof rankPrev === "number" ? rankPrev - rankNow : 0;

              return (
                <div
                  key={playerId}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--color-border-soft)] bg-white/80 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: player?.color ?? "#111111" }}
                      />
                      <span className="truncate">{player?.name ?? playerId}</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-subtle)]">
                      {typeof rankNow === "number" ? `${rankNow}位` : "順位なし"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-medium text-[var(--color-text)]">
                      {formatScore(score)}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-subtle)]">
                      {Number.isFinite(scoreDelta) ? formatDelta(scoreDelta) : "初回"}
                      {rankDelta !== 0 ? `・順位 ${rankDelta > 0 ? "+" : ""}${rankDelta}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[color:rgba(255,255,255,0.72)] p-5 shadow-[var(--shadow-floating)] backdrop-blur-2xl md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-[34rem]">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">
              スコア推移
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-text)] md:text-4xl">
              シーズン全体の流れを一画面で。
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
              各対局ごとのスコア変化、順位の入れ替わり、直近の流れをグラフ上で追えます。
            </p>
          </div>

          <div className="hidden flex-wrap gap-2 md:flex">
            {scoreboard.map((entry) => {
              const player = playerMap[entry.id];
              return (
                <div
                  key={entry.id}
                  className="rounded-full border px-3 py-2 text-sm shadow-[var(--shadow-subtle)]"
                  style={{
                    borderColor: withAlpha(player?.color ?? "#111111", 0.22),
                    background: `linear-gradient(135deg, ${withAlpha(player?.color ?? "#111111", 0.14)}, rgba(255,255,255,0.9))`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: player?.color ?? "#111111" }}
                    />
                    <span className="font-medium text-[var(--color-text)]">
                      {entry.rank}位 {player?.name ?? entry.id}
                    </span>
                    <span className="font-mono text-[var(--color-text-subtle)]">
                      {formatScore(entry.score)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-3 md:rounded-[24px] md:px-4 md:py-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-subtle)] md:text-[11px] md:tracking-[0.28em]">
              現在の首位
            </div>
            <div className="mt-2 flex flex-col gap-1 md:mt-3 md:flex-row md:items-baseline md:justify-between md:gap-4">
              <span className="text-sm font-semibold leading-tight text-[var(--color-text)] md:text-lg">
                {leader ? playerMap[leader.id]?.name ?? leader.id : "-"}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-subtle)] md:text-sm">
                {leader ? formatScore(leader.score) : "-"}
              </span>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-3 md:rounded-[24px] md:px-4 md:py-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-subtle)] md:text-[11px] md:tracking-[0.28em]">
              首位差
            </div>
            <div className="mt-2 flex flex-col gap-1 md:mt-3 md:flex-row md:items-baseline md:justify-between md:gap-4">
              <span className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
                {formatScore(Math.max(leadMargin, 0))}
              </span>
              <span className="text-xs text-[var(--color-text-subtle)] md:text-sm">pt</span>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-3 md:rounded-[24px] md:px-4 md:py-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-subtle)] md:text-[11px] md:tracking-[0.28em]">
              直近の変動
            </div>
            <div className="mt-2 flex flex-col gap-1 md:mt-3 md:flex-row md:items-baseline md:justify-between md:gap-4">
              <span className="text-sm font-semibold leading-tight text-[var(--color-text)] md:text-lg">
                {latestHand}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-subtle)] md:text-sm">
                {formatDelta(topTrend)}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[var(--color-text-subtle)] md:text-xs">{latestDate}</div>
          </div>
        </div>

        <div className="h-[320px] rounded-[28px] border border-[var(--color-border)] bg-[color:rgba(255,255,255,0.68)] p-3 sm:h-[360px] md:h-[420px] md:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ left: 4, right: 14, top: 14, bottom: 8 }}>
              <defs>
                {players.map((player) => (
                  <linearGradient
                    key={`gradient-${player.id}`}
                    id={`score-line-${player.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={withAlpha(player.color, 0.55)} />
                    <stop offset="100%" stopColor={player.color} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="rgba(18,17,15,0.08)"
                strokeDasharray="3 8"
              />
              <ReferenceLine
                y={0}
                stroke="rgba(18,17,15,0.18)"
                strokeDasharray="4 6"
              />

              <XAxis
                dataKey="gameNumber"
                ticks={xTicks}
                domain={xDomain}
                tick={{ fill: "var(--color-text-subtle)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                domain={yScale.domain}
                ticks={yScale.ticks}
                tickFormatter={(value) => formatScore(value)}
                tick={{ fill: "var(--color-text-subtle)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: "rgba(18,17,15,0.18)", strokeDasharray: "4 6" }}
                content={renderTooltip}
                wrapperStyle={{ outline: "none" }}
              />

              {players.map((player) => (
                <Line
                  key={player.id}
                  type="monotone"
                  dataKey={player.id}
                  name={player.name}
                  stroke={`url(#score-line-${player.id})`}
                  strokeWidth={leader?.id === player.id ? 3.8 : 2.6}
                  opacity={leader?.id === player.id ? 1 : 0.9}
                  dot={false}
                  activeDot={{ r: 5, fill: player.color, stroke: "#ffffff", strokeWidth: 1.5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
