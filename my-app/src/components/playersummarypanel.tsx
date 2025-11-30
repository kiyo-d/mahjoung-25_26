import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerSummaryDetail } from "@/data/player-summary";
import sectionRings from "@/assets/section-rings.svg";
import aurora from "@/assets/aurora-bands.svg";

const numberFormat = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) return "-";
  return `${percentFormat.format(value * 100)}%`;
};

const formatScore = (value: number) => {
  if (!Number.isFinite(value)) return "-";
  return numberFormat.format(value);
};

const rankLabel: Record<number, string> = {
  1: "1位",
  2: "2位",
  3: "3位",
  4: "4位",
};

const rankTicks = [1, 2, 3, 4];

const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const finishBadgeStyles: Record<number, string> = {
  1: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  2: "border-sky-400/40 bg-sky-400/15 text-sky-200",
  3: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  4: "border-rose-400/40 bg-rose-400/15 text-rose-200",
};

const lightenColor = (hex: string, amount: number) => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const clampAmount = Math.min(Math.max(amount, 0), 1);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * clampAmount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

type RankChartDatum = {
  gameNumber: number;
  date: string;
  dailyIndex: number;
  rank: number | null;
};

type RankHistogramDatum = {
  rank: string;
  count: number;
};

type RankTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
};

type HistogramTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
};

type PlayerSummaryPanelProps = {
  players: PlayerSummaryDetail[];
};

export function PlayerSummaryPanel({ players }: PlayerSummaryPanelProps) {
  const [selectedId, setSelectedId] = useState<PlayerSummaryDetail["id"] | null>(() => players[0]?.id ?? null);
  const [range, setRange] = useState<"season" | "recent">("season");

  const selected = useMemo(() => {
    if (!players.length) return null;
    return players.find((player) => player.id === selectedId) ?? players[0];
  }, [players, selectedId]);

  const chartData = useMemo<RankChartDatum[]>(() => {
    if (!selected) return [];
    const base = selected.rankHistory.map((entry) => ({
      gameNumber: entry.gameNumber,
      date: entry.date,
      dailyIndex: entry.dailyIndex,
      rank: entry.rank,
    }));
    if (range === "recent") {
      return base.slice(-12);
    }
    return base;
  }, [range, selected]);

  const histogramData = useMemo<RankHistogramDatum[]>(() => {
    if (!selected) return [];

    if (range === "recent") {
      const recent = selected.rankHistory
        .filter((entry) => typeof entry.rank === "number")
        .slice(-12) as Array<RankChartDatum & { rank: number }>;
      const counts = recent.reduce(
        (acc, curr) => {
          const key = rankLabel[curr.rank] ?? "-";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return [
        { rank: "1位", count: counts["1位"] ?? 0 },
        { rank: "2位", count: counts["2位"] ?? 0 },
        { rank: "3位", count: counts["3位"] ?? 0 },
        { rank: "4位", count: counts["4位"] ?? 0 },
      ];
    }

    return [
      { rank: "1位", count: selected.rankCounts.first },
      { rank: "2位", count: selected.rankCounts.second },
      { rank: "3位", count: selected.rankCounts.third },
      { rank: "4位", count: selected.rankCounts.fourth },
    ];
  }, [range, selected]);

  const ratioMetrics = useMemo(
    () =>
      selected
        ? ([
            { label: "トップ率", value: selected.winRate, color: "bg-emerald-500" },
            { label: "連対率", value: selected.topRate, color: "bg-sky-500" },
            { label: "ラス率", value: selected.lastRate, color: "bg-rose-500" },
          ] as const)
        : [],
    [selected],
  );

  const headlineStats = useMemo(
    () =>
      selected
        ? ([
            { label: "平均着順", value: numberFormat.format(selected.averageRank) },
            { label: "平均スコア", value: formatScore(selected.averageScore) },
            { label: "最高スコア", value: formatScore(selected.bestScore) },
            { label: "最低スコア", value: formatScore(selected.worstScore) },
          ] as const)
        : [],
    [selected],
  );

  const lastFinishes = useMemo(() => {
    if (!selected) return [];
    return selected.rankHistory
      .filter((entry) => typeof entry.rank === "number")
      .slice(-8)
      .reverse()
      .map((entry) => ({ key: entry.gameNumber, rank: entry.rank as number }));
  }, [selected]);

  const heroBackground = useMemo(() => {
    if (!selected) return undefined;
    return {
      background: `linear-gradient(140deg, ${withAlpha(selected.color, 0.32)} 0%, ${withAlpha(selected.color, 0.16)} 42%, rgba(18, 18, 23, 0.94) 88%)`,
      borderColor: withAlpha(selected.color, 0.28),
      boxShadow: `inset 0 1px 0 ${withAlpha("#ffffff", 0.05)}, 0 28px 65px -48px ${withAlpha(selected.color, 0.8)}`,
    };
  }, [selected]);

  const heroOrbStyle = useMemo(() => {
    if (!selected) return undefined;
    return {
      background: `radial-gradient(circle, ${withAlpha(selected.color, 0.45)} 0%, ${withAlpha(selected.color, 0.05)} 68%)`,
    };
  }, [selected]);

  const totalScoreStyles = useMemo(() => {
    if (!selected) return undefined;
    return {
      background: `linear-gradient(135deg, ${withAlpha(selected.color, 0.32)} 0%, rgba(16, 16, 19, 0.92) 65%)`,
      borderColor: withAlpha(selected.color, 0.36),
      boxShadow: `inset 0 1px 0 ${withAlpha("#ffffff", 0.08)}, 0 12px 36px -24px ${withAlpha(selected.color, 0.65)}`,
    };
  }, [selected]);

  const finishedRanks = useMemo(() => {
    if (!selected) return [] as number[];
    return selected.rankHistory
      .filter((entry) => typeof entry.rank === "number")
      .map((entry) => entry.rank as number);
  }, [selected]);

  const recentSample = useMemo(() => finishedRanks.slice(-12), [finishedRanks]);

  const recentAverageRank = useMemo(() => {
    if (!recentSample.length) return null;
    const total = recentSample.reduce((acc, rank) => acc + rank, 0);
    return total / recentSample.length;
  }, [recentSample]);

  const topFinishRate = useMemo(() => {
    if (!recentSample.length) return null;
    const topFinishes = recentSample.filter((rank) => rank <= 2).length;
    return topFinishes / recentSample.length;
  }, [recentSample]);

  const lastAvoidRate = useMemo(() => {
    if (!recentSample.length) return null;
    const safeFinishes = recentSample.filter((rank) => rank !== 4).length;
    return safeFinishes / recentSample.length;
  }, [recentSample]);

  const longestTopStreak = useMemo(() => {
    let best = 0;
    let current = 0;
    recentSample.forEach((rank) => {
      if (rank === 1) {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    });
    return best;
  }, [recentSample]);

  const primaryAccent = useMemo(() => {
    if (!selected) return undefined;
    return {
      backgroundColor: withAlpha(selected.color, 0.18),
      borderColor: withAlpha(selected.color, 0.32),
      color: lightenColor(selected.color, 0.28),
    };
  }, [selected]);

  const histogramFillId = useMemo(() => (selected ? `rank-hist-${selected.id}` : "rank-hist"), [selected]);

  const histogramStroke = useMemo(() => (selected ? withAlpha(selected.color, 0.65) : "#52525b"), [selected]);

  const histogramTooltip = useMemo(() => {
    if (!selected) {
      return undefined;
    }

    const accent = lightenColor(selected.color, 0.25);
    const subtle = withAlpha(selected.color, 0.25);

    const formatter = ({ active, payload }: HistogramTooltipProps) => {
      if (!active || !payload?.length) return null;
      const entry = payload[0];
      const dataPoint = entry?.payload as RankHistogramDatum | undefined;
      if (!dataPoint) return null;

      return (
        <div className="min-w-[160px] rounded-lg border border-neutral-800/80 bg-neutral-950/95 p-3 text-sm shadow-lg shadow-black/40">
          <div className="text-xs uppercase tracking-wide text-neutral-400">取得順位</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-semibold" style={{ color: accent }}>
              {dataPoint.rank}
            </span>
            <span className="font-mono text-base text-neutral-100">{dataPoint.count}回</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <span
              className="block h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accent}, ${subtle})` }}
            />
          </div>
        </div>
      );
    };

    return formatter;
  }, [selected]);

  const renderTooltip = useMemo(() => {
    const formatter = ({ active, payload }: RankTooltipProps) => {
      if (!active || !payload?.length) return null;
      const dataPoint = payload[0]?.payload as RankChartDatum | undefined;
      if (!dataPoint) return null;

      const eventDate = new Date(dataPoint.date);
      const formattedDate = Number.isNaN(eventDate.getTime())
        ? dataPoint.date
        : eventDate.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });

      return (
        <div className="min-w-[180px] rounded-lg border border-neutral-800 bg-neutral-900/95 p-3 text-sm text-neutral-100">
          <div className="text-xs uppercase tracking-wide text-neutral-400">通算 {dataPoint.gameNumber} 戦目</div>
          <div className="mt-1 text-sm text-neutral-200">{formattedDate}</div>
          <div className="text-xs text-neutral-500">この日 {dataPoint.dailyIndex} 戦目</div>
          <div className="mt-2 text-lg font-semibold">
            {typeof dataPoint.rank === "number" ? rankLabel[dataPoint.rank] : "出場なし"}
          </div>
        </div>
      );
    };
    return formatter;
  }, []);

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-neutral-900/80 via-neutral-950/90 to-neutral-950/95 text-neutral-100 shadow-[0_28px_80px_-60px_rgba(16,185,129,0.6)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-emerald-400/8 via-cyan-400/10 to-fuchsia-400/12" />
      <div className="pointer-events-none absolute inset-x-10 top-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute -right-14 -top-14 h-64 w-[520px] opacity-70">
        <img src={sectionRings} alt="player summary halo" className="h-full w-full object-contain" loading="lazy" />
      </div>
      <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-[520px] opacity-70 mix-blend-screen">
        <img src={aurora} alt="aurora" className="h-full w-full object-cover" loading="lazy" />
      </div>
      <CardHeader className="relative z-10 gap-3 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-50">
              プレイヤーサマリー
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100">profile</span>
            </CardTitle>
            <p className="text-xs text-neutral-500">シーズン成績をプレイヤー別に比較できます</p>
          </div>
          <div className="space-y-2 text-xs text-neutral-400">
            <div className="flex items-center justify-between gap-2">
              <span>プレイヤー選択</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-neutral-300">profiles</span>
            </div>
            <div className="flex w-full gap-2 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-2">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-[1px] hover:shadow ${
                    selected?.id === player.id
                      ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-50"
                      : "border-white/10 bg-neutral-900/70 text-neutral-200 hover:border-emerald-400/30"
                  }`}
                  onClick={() => setSelectedId(player.id)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-7">
        {selected ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
              <div
                className="relative overflow-hidden rounded-2xl border bg-neutral-950/70 p-6 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.9)] backdrop-blur"
                style={heroBackground}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full blur-3xl"
                  style={heroOrbStyle}
                />
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-4">
                    <span
                      className="inline-flex items-center gap-2 rounded-full border bg-neutral-900/60 px-3 py-1 text-xs font-medium tracking-wide"
                      style={primaryAccent}
                    >
                      <span className="h-2 w-2 rounded-full border border-white/30" style={{ backgroundColor: selected.color }} />
                      {selected.name}
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">総合順位</div>
                      <div className="mt-2 flex flex-wrap items-baseline gap-3">
                        <span className="text-4xl font-semibold text-neutral-50">{selected.rank}位</span>
                        <span className="rounded-full border border-neutral-700/60 bg-neutral-900/60 px-3 py-1 text-xs font-medium text-neutral-200">
                          {selected.gamesPlayed}戦
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl border px-6 py-4 text-right shadow-inner shadow-black/40"
                    style={totalScoreStyles}
                  >
                    <div className="text-xs text-neutral-400">総スコア</div>
                    <div className="mt-1 text-5xl font-bold tracking-tight text-emerald-300">{formatScore(selected.totalScore)}</div>
                    <div className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">累計</div>
                  </div>
                </div>
                <div className="relative z-10 mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  {headlineStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/5 bg-neutral-900/70 px-4 py-3"
                    >
                      <div className="text-xs text-neutral-400">{stat.label}</div>
                      <div className="mt-1 font-mono text-base text-neutral-100">{stat.value}</div>
                    </div>
                  ))}
                </div>
                {lastFinishes.length ? (
                  <div className="relative z-10 mt-6 space-y-2">
                    <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">直近の取得順位</div>
                    <div className="flex flex-wrap gap-2">
                      {lastFinishes.map((entry) => {
                        const badgeStyle =
                          finishBadgeStyles[entry.rank as keyof typeof finishBadgeStyles] ??
                          "border-neutral-700 bg-neutral-800 text-neutral-300";
                        return (
                          <span
                            key={entry.key}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}
                          >
                            {rankLabel[entry.rank as keyof typeof rankLabel]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                <div className="relative z-10 mt-6 space-y-3 rounded-2xl border border-white/5 bg-neutral-900/70 p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                    <span>直近12戦のコンディション</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">momentum</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-transparent px-4 py-3 shadow-inner shadow-black/30">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">平均順位</div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold text-neutral-50">{recentAverageRank !== null ? numberFormat.format(recentAverageRank) : "-"}</span>
                        <span className="text-xs text-neutral-500">直近</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/5 via-transparent to-transparent px-4 py-3 shadow-inner shadow-black/30">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">連対率</div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold text-emerald-200">{topFinishRate !== null ? formatPercent(topFinishRate) : "-"}</span>
                        <span className="text-xs text-neutral-500">直近</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent px-4 py-3 shadow-inner shadow-black/30">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">ラス回避</div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold text-cyan-200">{lastAvoidRate !== null ? formatPercent(lastAvoidRate) : "-"}</span>
                        <span className="text-xs text-neutral-500">直近</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-400/6 via-transparent to-transparent px-4 py-3 shadow-inner shadow-black/30">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">トップ連勝</div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-semibold text-fuchsia-200">{longestTopStreak || "-"}</span>
                        <span className="text-xs text-neutral-500">連続</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                  <span>成績比率</span>
                  <span>割合</span>
                </div>
                <div className="mt-5 space-y-5 text-sm">
                  {ratioMetrics.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-baseline justify-between text-xs text-neutral-300">
                        <span>{metric.label}</span>
                        <span className="font-mono text-sm text-neutral-100">{formatPercent(metric.value)}</span>
                      </div>
                      <div className="group relative h-2 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className={`${metric.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(metric.value, 1) * 100}%` }}
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-full border border-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-neutral-800/60 bg-neutral-900/70 p-4 text-sm">
                  <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">順位回数</div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-white/5 bg-neutral-900/70 px-3 py-2">
                      <dt className="text-xs text-neutral-400">1位</dt>
                      <dd className="font-mono text-neutral-100">{selected.rankCounts.first}回</dd>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-neutral-900/70 px-3 py-2">
                      <dt className="text-xs text-neutral-400">2位</dt>
                      <dd className="font-mono text-neutral-100">{selected.rankCounts.second}回</dd>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-neutral-900/70 px-3 py-2">
                      <dt className="text-xs text-neutral-400">3位</dt>
                      <dd className="font-mono text-neutral-100">{selected.rankCounts.third}回</dd>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-neutral-900/70 px-3 py-2">
                      <dt className="text-xs text-neutral-400">4位</dt>
                      <dd className="font-mono text-neutral-100">{selected.rankCounts.fourth}回</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span>順位推移</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-[0.2em] text-neutral-300">{range === "recent" ? "直近12戦" : "シーズン全体"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                        range === "season"
                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-100"
                          : "border-white/10 bg-white/5 text-neutral-300 hover:border-emerald-300/40"
                      }`}
                      onClick={() => setRange("season")}
                    >
                      全期間
                    </button>
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                        range === "recent"
                          ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-neutral-300 hover:border-cyan-300/40"
                      }`}
                      onClick={() => setRange("recent")}
                    >
                      直近12戦
                    </button>
                  </div>
                </div>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 12, right: 16, left: 12, bottom: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="gameNumber"
                        stroke="#a1a1aa"
                        tick={{ fontSize: 12 }}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={{ stroke: "#3f3f46" }}
                      />
                      <YAxis
                        domain={[1, 4]}
                        ticks={rankTicks}
                        stroke="#a1a1aa"
                        tick={{ fontSize: 12 }}
                        allowDecimals={false}
                        reversed
                        tickFormatter={(value) => rankLabel[value as keyof typeof rankLabel] ?? `${value}位`}
                      />
                      <Tooltip cursor={{ stroke: "#52525b", strokeWidth: 1 }} content={renderTooltip} />
                      <Line
                        type="monotone"
                        dataKey="rank"
                        stroke={selected.color}
                        strokeWidth={2.6}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                  <span>取得順位分布</span>
                  <span>回数</span>
                </div>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                      <defs>
                        <linearGradient id={histogramFillId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={lightenColor(selected.color, 0.4)} />
                          <stop offset="100%" stopColor={withAlpha(selected.color, 0.35)} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="rank" stroke="#a1a1aa" tick={{ fontSize: 12 }} axisLine={{ stroke: "#3f3f46" }} />
                      <YAxis
                        allowDecimals={false}
                        stroke="#a1a1aa"
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: "#3f3f46" }}
                        tickFormatter={(value) => `${value}回`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(24, 24, 27, 0.82)" }}
                        content={histogramTooltip}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Bar dataKey="count" radius={[7, 7, 0, 0]} fill={`url(#${histogramFillId})`} stroke={histogramStroke} strokeWidth={1.2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-800 px-6 py-12 text-center text-sm text-neutral-500">
            プレイヤーデータがありません。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
