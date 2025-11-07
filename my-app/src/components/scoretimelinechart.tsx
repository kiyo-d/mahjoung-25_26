import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-neutral-900/90 border-neutral-800">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-neutral-200">シーズンスコア推移</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 16, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="gameNumber"
                type="number"
                domain={xDomain}
                ticks={xTicks}
                stroke="#a1a1aa"
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <YAxis
                domain={yScale.domain}
                ticks={yScale.ticks}
                stroke="#a1a1aa"
                tickFormatter={formatScore}
                tick={{ fontSize: 12 }}
                allowDecimals
              />
              <Tooltip content={renderTooltip} cursor={{ stroke: "#52525b", strokeWidth: 1 }} />
              {players.map(p => (
                <Line key={p.id} type="monotone" dataKey={p.id} stroke={p.color} strokeWidth={2.4} dot={false} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}