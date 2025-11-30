import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import sectionRings from "@/assets/section-rings.svg";
import aurora from "@/assets/aurora-bands.svg";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { TimelinePoint, Player } from "@/types/propsType";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
};

const formatScore = (value: number): string =>
  value.toLocaleString("ja-JP", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

const formatDelta = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  const formatted = Math.abs(rounded).toLocaleString("ja-JP", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return `±${formatted}`;
};

export function ScoreTimelineChart({ timeline, players }:{
  timeline: TimelinePoint[]; players: Player[];
}) {
  const playerMap = useMemo<Record<string, Player>>(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
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
        if (typeof value === "number") {
          if (value < min) min = value;
          if (value > max) max = value;
        }
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
      rawRange === 0
        ? minWithZero - step
        : Math.floor(minWithZero / step) * step;
    let upper =
      rawRange === 0
        ? maxWithZero + step
        : Math.ceil(maxWithZero / step) * step;

    if (lower === upper) {
      lower -= step;
      upper += step;
    }

    const ticks: number[] = [];
    for (let tick = lower; tick <= upper + step / 2; tick += step) {
      ticks.push(roundAxisValue(tick));
    }

    return { domain: [roundAxisValue(lower), roundAxisValue(upper)] as [number, number], ticks };
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
    if (lastGame !== 1) {
      ticks.add(lastGame);
    }
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
        if (lastScore !== null && score < (lastScore ?? 0) - 1e-6) {
          currentRank = sortIndex + 1;
        }
        ranks[id] = currentRank;
        lastScore = score;
      });
      rankHistory.push(ranks);
    });

    return { scoreHistory, rankHistory, gameIndexByNumber };
  }, [players, timeline]);

  const lastPoint = timeline[timeline.length - 1];
  const lastGameNumber = lastPoint?.gameNumber ?? 0;
  const lastGameDate = lastPoint?.date ?? "-";
  const scoreboard = useMemo(() => {
    if (!lastPoint) return [] as { id: string; score: number }[];
    return players
      .map((player) => ({ id: player.id, score: Number(lastPoint[player.id] ?? 0) }))
      .sort((a, b) => b.score - a.score);
  }, [lastPoint, players]);
  const leadMargin = scoreboard.length >= 2 ? scoreboard[0].score - scoreboard[1].score : 0;
  const leaderName = scoreboard.length > 0 ? players.find((p) => p.id === scoreboard[0].id)?.name ?? "-" : "-";
  const topTrend = useMemo(() => {
    if (scoreboard.length === 0 || derivedStats.scoreHistory.length < 2) return 0;
    const latest = derivedStats.scoreHistory.at(-1) ?? {};
    const prev = derivedStats.scoreHistory.at(-2) ?? {};
    return Number(latest[scoreboard[0].id] ?? 0) - Number(prev[scoreboard[0].id] ?? 0);
  }, [derivedStats.scoreHistory, scoreboard]);

  const renderTooltip = (tooltipProps: ChartTooltipProps) => {
    const { active, payload } = tooltipProps;
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload as TimelinePoint | undefined;
    if (!point) return null;

     const pointIndex = derivedStats.gameIndexByNumber.get(point.gameNumber) ?? -1;
     const previousScores = pointIndex > 0 ? derivedStats.scoreHistory[pointIndex - 1] : undefined;
     const previousRanks = pointIndex > 0 ? derivedStats.rankHistory[pointIndex - 1] : undefined;
     const currentRanks = pointIndex >= 0 ? derivedStats.rankHistory[pointIndex] : undefined;

    const eventDate = new Date(point.date);
    const formattedDate = Number.isNaN(eventDate.getTime())
      ? point.date
      : eventDate.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });

    return (
      <div className="min-w-[220px] rounded-lg border border-neutral-800 bg-neutral-900/95 p-3 shadow-xl">
        <div className="text-xs uppercase tracking-wide text-neutral-400">通算 {point.gameNumber} 戦目</div>
        <div className="text-sm font-medium text-neutral-200">{formattedDate}（{point.hand}）</div>
        <div className="text-xs text-neutral-400">この日 {point.dailyIndex} 戦目</div>
        <div className="mt-2 space-y-1">
          {[...payload]
            .sort((a, b) => {
              const valueA =
                typeof a.value === "number"
                  ? a.value
                  : typeof a.value === "string"
                    ? Number.parseFloat(a.value)
                    : Number.NEGATIVE_INFINITY;
              const valueB =
                typeof b.value === "number"
                  ? b.value
                  : typeof b.value === "string"
                    ? Number.parseFloat(b.value)
                    : Number.NEGATIVE_INFINITY;
              if (Number.isNaN(valueA) && Number.isNaN(valueB)) return 0;
              if (Number.isNaN(valueA)) return 1;
              if (Number.isNaN(valueB)) return -1;
              return valueB - valueA;
            })
            .map((entry) => {
            const dataKey = entry.dataKey as string;
            const playerId = dataKey as keyof typeof playerMap;
            const player = playerMap[playerId];
            const rawValue =
              typeof entry.value === "number"
                ? entry.value
                : typeof entry.value === "string"
                  ? Number.parseFloat(entry.value)
                  : Number.NaN;
            const previousValue = previousScores?.[dataKey];
            const scoreDelta =
              Number.isFinite(rawValue) && typeof previousValue === "number"
                ? rawValue - previousValue
                : undefined;
            const hasPreviousValue = typeof previousValue === "number";
            const hasSignificantDelta =
              typeof scoreDelta === "number" && Math.abs(scoreDelta) > 1e-6;
            const shouldShowDeltaRow = hasSignificantDelta || !hasPreviousValue;
            const rankNow = currentRanks?.[dataKey];
            const rankPrev = previousRanks?.[dataKey];
            const rankDiff =
              typeof rankNow === "number" && typeof rankPrev === "number"
                ? rankPrev - rankNow
                : 0;

            const scoreChangeClass = hasSignificantDelta
              ? scoreDelta! > 0
                ? "text-emerald-400"
                : "text-rose-400"
              : "text-neutral-500";

            const rankChangeClass =
              rankDiff !== 0
                ? rankDiff > 0
                  ? "text-emerald-400"
                  : "text-rose-400"
                : "text-neutral-500";
            return (
              <div key={dataKey} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-neutral-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color ?? player?.color ?? "#fff" }}
                  />
                  <span>{player?.name ?? dataKey}</span>
                </span>
                <span className="flex flex-col items-end gap-0.5 text-right">
                  <span className="font-medium text-neutral-100 tabular-nums">
                    {typeof entry.value === "number"
                      ? formatScore(entry.value)
                      : "-"}
                  </span>
                  {shouldShowDeltaRow ? (
                    <span className={`flex items-center gap-1 text-xs ${scoreChangeClass}`}>
                      {hasSignificantDelta ? (scoreDelta! > 0 ? "↑" : "↓") : null}
                      <span>{hasSignificantDelta ? formatDelta(scoreDelta!) : "前戦なし"}</span>
                    </span>
                  ) : null}
                  {rankDiff !== 0 && typeof rankNow === "number" ? (
                    <span className={`flex items-center gap-1 text-xs ${rankChangeClass}`}>
                      {rankDiff > 0 ? "↑" : "↓"}
                      {`${Math.abs(rankDiff)} rank`}
                    </span>
                  ) : null}
                </span>
              </div>
            );
            })}
        </div>
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-neutral-900/80 via-neutral-950/85 to-neutral-950/95 shadow-[0_28px_80px_-60px_rgba(16,185,129,0.6)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-sky-400/8 to-fuchsia-400/6" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 right-3 h-64 w-64 opacity-70">
          <img src={sectionRings} alt="section rings" className="h-full w-full object-contain" loading="lazy" />
        </div>
        <div className="absolute -left-10 -bottom-6 h-52 w-[520px] opacity-60 mix-blend-screen">
          <img src={aurora} alt="aurora" className="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>
      <CardHeader className="relative z-10 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-neutral-50">
              シーズンスコア推移
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100">trend</span>
            </CardTitle>
            <p className="mt-1 text-sm text-neutral-400">累計スコアの波と差分を重ねて可視化</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>累計ライン</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span>ゲーム番号</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-100">leader</p>
            <div className="mt-1 flex items-center justify-between text-sm text-neutral-100">
              <span className="font-semibold">{leaderName}</span>
              <span className="font-mono text-emerald-200">{formatScore(scoreboard[0]?.score ?? 0)} pt</span>
            </div>
            <p className="text-[11px] text-neutral-500">首位と2位の差 {formatDelta(leadMargin)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-sky-100">latest</p>
            <div className="mt-1 flex items-center justify-between text-sm text-neutral-100">
              <span className="font-semibold">{lastGameNumber} 戦目</span>
              <span className="font-mono text-sky-200">{lastGameDate}</span>
            </div>
            <p className="text-[11px] text-neutral-500">更新日付とゲーム通算番号</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-100">momentum</p>
            <div className="mt-1 flex items-center justify-between text-sm text-neutral-100">
              <span className="font-semibold">直近増減</span>
              <span className="font-mono text-fuchsia-200">{formatDelta(topTrend)}</span>
            </div>
            <p className="text-[11px] text-neutral-500">前ゲームからのスコア差分</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0">
        <div className="rounded-2xl border border-white/5 bg-neutral-950/80 p-4 shadow-inner shadow-black/30">
          <div className="mt-2 h-[380px] w-full rounded-xl bg-gradient-to-br from-white/2 via-white/1 to-white/0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ left: 20, right: 10, top: 16, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="gameNumber"
                  ticks={xTicks}
                  domain={xDomain}
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  axisLine={{ stroke: "#2f2f2f" }}
                  tickLine={{ stroke: "#2f2f2f" }}
                  height={42}
                  label={{ value: "ゲーム", position: "insideBottom", offset: -8, fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  domain={yScale.domain}
                  ticks={yScale.ticks}
                  tickFormatter={formatScore}
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  axisLine={{ stroke: "#2f2f2f" }}
                  tickLine={{ stroke: "#2f2f2f" }}
                  width={68}
                  label={{ value: "スコア", angle: -90, position: "insideLeft", offset: 14, fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip content={renderTooltip} cursor={{ stroke: "#3b82f6", strokeDasharray: "4 4" }} />
                {players.map((player) => (
                  <Line
                    key={player.id}
                    type="monotone"
                    dataKey={player.id}
                    name={player.name}
                    stroke={player.color}
                    strokeWidth={2.6}
                    dot={false}
                    activeDot={{ r: 4, fill: player.color }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
