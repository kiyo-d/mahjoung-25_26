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

type PlayerSummaryPanelProps = {
  players: PlayerSummaryDetail[];
};

export function PlayerSummaryPanel({ players }: PlayerSummaryPanelProps) {
  const [selectedId, setSelectedId] = useState<PlayerSummaryDetail["id"] | null>(() => players[0]?.id ?? null);

  const selected = useMemo(() => {
    if (!players.length) return null;
    return players.find((player) => player.id === selectedId) ?? players[0];
  }, [players, selectedId]);

  const chartData = useMemo<RankChartDatum[]>(() => {
    if (!selected) return [];
    return selected.rankHistory.map((entry) => ({
      gameNumber: entry.gameNumber,
      date: entry.date,
      dailyIndex: entry.dailyIndex,
      rank: entry.rank,
    }));
  }, [selected]);

  const histogramData = useMemo<RankHistogramDatum[]>(() => {
    if (!selected) return [];
    return [
      { rank: "1位", count: selected.rankCounts.first },
      { rank: "2位", count: selected.rankCounts.second },
      { rank: "3位", count: selected.rankCounts.third },
      { rank: "4位", count: selected.rankCounts.fourth },
    ];
  }, [selected]);

  const ratioMetrics = useMemo(
    () =>
      selected
        ? ([
            { label: "トップ率", value: selected.topRate, color: "bg-emerald-500" },
            { label: "連対率", value: selected.winRate, color: "bg-sky-500" },
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
    <Card className="border-neutral-800 bg-neutral-950/80 text-neutral-100">
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-50">プレイヤーサマリー</CardTitle>
            <p className="text-xs text-neutral-500">シーズン成績をプレイヤー別に比較できます</p>
          </div>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            プレイヤー選択
            <select
              className="w-48 rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:cursor-not-allowed"
              value={selected?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value as PlayerSummaryDetail["id"])}
              disabled={!players.length}
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-7">
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
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                  <span>順位推移</span>
                  <span>時系列</span>
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
                      <Tooltip cursor={{ fill: "#18181b" }} formatter={(value) => [`${value as number}回`, "取得回数"]} />
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
