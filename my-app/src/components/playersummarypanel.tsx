import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerSummaryDetail } from "@/data/player-summary";

type PlayerSummaryPanelProps = {
  players: PlayerSummaryDetail[];
};

type DetailChartDatum = {
  gameNumber: number;
  date: string;
  dailyIndex: number;
  rank: number | null;
  rollingRank: number | null;
};

const scoreFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const percentFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const rankLabel: Record<number, string> = {
  1: "1位",
  2: "2位",
  3: "3位",
  4: "4位",
};

const finishPalette: Record<number, string> = {
  1: "#10a37f",
  2: "#4c7cf0",
  3: "#dca342",
  4: "#f26a4b",
};

function formatScore(value: number): string {
  return Number.isFinite(value) ? scoreFormat.format(value) : "-";
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${percentFormat.format(value * 100)}%` : "-";
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lightenColor(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "-";
  return parsed.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function PlayerSummaryPanel({ players }: PlayerSummaryPanelProps) {
  const [selectedId, setSelectedId] = useState<PlayerSummaryDetail["id"] | null>(() => players[0]?.id ?? null);
  const [range, setRange] = useState<"season" | "recent">("season");
  const [mobileView, setMobileView] = useState<"trend" | "distribution" | "metrics">("trend");

  useEffect(() => {
    if (!players.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !players.some((player) => player.id === selectedId)) {
      setSelectedId(players[0]?.id ?? null);
    }
  }, [players, selectedId]);

  const selected = useMemo(
    () => players.find((player) => player.id === selectedId) ?? players[0] ?? null,
    [players, selectedId],
  );

  const historyWindow = useMemo(() => {
    if (!selected) return [];
    return range === "recent" ? selected.rankHistory.slice(-12) : selected.rankHistory;
  }, [range, selected]);

  const chartData = useMemo<DetailChartDatum[]>(() => {
    const rolling: number[] = [];

    return historyWindow.map((entry) => {
      if (typeof entry.rank === "number") {
        rolling.push(entry.rank);
      }
      const sample = rolling.slice(-5);
      const rollingRank = sample.length ? sample.reduce((sum, rank) => sum + rank, 0) / sample.length : null;
      return {
        gameNumber: entry.gameNumber,
        date: entry.date,
        dailyIndex: entry.dailyIndex,
        rank: entry.rank,
        rollingRank,
      };
    });
  }, [historyWindow]);

  const finishMix = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>;
    historyWindow.forEach((entry) => {
      if (typeof entry.rank === "number") counts[entry.rank] += 1;
    });
    return [1, 2, 3, 4].map((rank) => ({
      label: rankLabel[rank],
      count: counts[rank],
      fill: finishPalette[rank],
    }));
  }, [historyWindow]);

  const rateData = useMemo(() => {
    if (!selected) return [];
    return [
      { label: "1位率", value: selected.winRate * 100, fill: selected.color },
      { label: "2着以内率", value: selected.topRate * 100, fill: lightenColor(selected.color, 0.18) },
      { label: "ラス回避率", value: (1 - selected.lastRate) * 100, fill: "rgba(18,17,15,0.92)" },
    ];
  }, [selected]);

  const recentSample = useMemo(
    () => historyWindow.filter((entry) => typeof entry.rank === "number").map((entry) => entry.rank as number),
    [historyWindow],
  );

  const recentAverageRank = useMemo(() => {
    if (!recentSample.length) return null;
    return recentSample.reduce((sum, rank) => sum + rank, 0) / recentSample.length;
  }, [recentSample]);

  const topTwoRate = useMemo(() => {
    if (!recentSample.length) return null;
    return recentSample.filter((rank) => rank <= 2).length / recentSample.length;
  }, [recentSample]);

  const safeRate = useMemo(() => {
    if (!recentSample.length) return null;
    return recentSample.filter((rank) => rank !== 4).length / recentSample.length;
  }, [recentSample]);

  const winStreak = useMemo(() => {
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

  const recentFinishes = useMemo(
    () =>
      selected?.rankHistory
        .filter((entry) => typeof entry.rank === "number")
        .slice(-8)
        .reverse()
        .map((entry) => entry.rank as number) ?? [],
    [selected],
  );

  const summaryStats = selected
    ? [
        { label: "総スコア", value: formatScore(selected.totalScore) },
        { label: "平均順位", value: formatScore(selected.averageRank) },
        { label: "平均スコア", value: formatScore(selected.averageScore) },
        { label: "最高スコア", value: formatScore(selected.bestScore) },
      ]
    : [];

  const trendFillId = selected ? `player-trend-${selected.id}` : "player-trend";

  if (!selected) {
    return (
      <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.58))]">
        <CardContent className="pt-6 md:pt-8">
          <div className="rounded-[28px] border border-dashed border-[var(--color-border)] px-6 py-16 text-center text-sm text-[var(--color-text-subtle)]">
            選手データがありません。
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderSelectorButton = (player: PlayerSummaryDetail, compact: boolean) => {
    const isSelected = player.id === selected.id;

    return (
      <button
        key={player.id}
        type="button"
        className={`flex items-center justify-between rounded-[22px] border text-left transition ${
          compact ? "min-w-[182px] shrink-0 gap-3 px-4 py-3" : "w-full px-4 py-3"
        }`}
        style={
          isSelected
            ? {
                borderColor: withAlpha(player.color, 0.22),
                background: `linear-gradient(135deg, ${withAlpha(player.color, 0.16)}, rgba(255,255,255,0.92))`,
              }
            : undefined
        }
        onClick={() => setSelectedId(player.id)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: player.color }} />
            <span className="truncate text-sm font-semibold text-[var(--color-text)]">{player.name}</span>
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-subtle)]">順位 {player.rank} 位・{player.gamesPlayed} 戦</div>
        </div>
        <div className="font-mono text-sm text-[var(--color-text)]">{formatScore(player.totalScore)}</div>
      </button>
    );
  };

  const renderTrendSection = (compact: boolean) => (
    <section
      className={`rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[var(--shadow-panel)] ${
        compact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">推移</div>
          <h4 className={`mt-2 font-semibold text-[var(--color-text)] ${compact ? "text-xl" : "text-2xl"}`}>
            着順推移
          </h4>
        </div>
        <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
          {range === "recent" ? "直近12戦" : "シーズン全体"}
        </span>
      </div>

      <div className={`mt-5 ${compact ? "h-[260px]" : "h-[340px]"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 12, bottom: 8 }}>
            <defs>
              <linearGradient id={trendFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={withAlpha(selected.color, 0.3)} />
                <stop offset="100%" stopColor={withAlpha(selected.color, 0.04)} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(18,17,15,0.08)" strokeDasharray="3 8" />
            <ReferenceLine y={2} stroke="rgba(18,17,15,0.16)" strokeDasharray="4 6" />
            <XAxis
              dataKey="gameNumber"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-subtle)", fontSize: compact ? 11 : 12 }}
              minTickGap={compact ? 40 : 26}
            />
            <YAxis
              domain={[1, 4]}
              ticks={[1, 2, 3, 4]}
              reversed
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-subtle)", fontSize: compact ? 11 : 12 }}
              tickFormatter={(value) => rankLabel[value as keyof typeof rankLabel] ?? String(value)}
              width={compact ? 48 : 56}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid var(--color-border)",
                background: "rgba(255,255,255,0.94)",
                backdropFilter: "blur(12px)",
              }}
              formatter={(value, name) => {
                if (name === "rank") {
                  return [typeof value === "number" ? rankLabel[value] : "-", "着順"];
                }
                return [typeof value === "number" ? formatScore(value) : "-", "移動平均"];
              }}
              labelFormatter={(label, payload) => {
                const entry = payload?.[0]?.payload as DetailChartDatum | undefined;
                return entry ? `第${entry.gameNumber}戦・${formatShortDate(entry.date)}・当日${entry.dailyIndex}戦目` : label;
              }}
            />
            <Area type="monotone" dataKey="rank" stroke={selected.color} fill={`url(#${trendFillId})`} strokeWidth={3} />
            <Line type="monotone" dataKey="rollingRank" stroke="rgba(18,17,15,0.72)" strokeWidth={2} dot={false} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );

  const renderDistributionSection = (compact: boolean) => (
    <section
      className={`rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[var(--shadow-panel)] ${
        compact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">着順分布</div>
          <h4 className={`mt-2 font-semibold text-[var(--color-text)] ${compact ? "text-xl" : "text-2xl"}`}>
            分布
          </h4>
        </div>
        <span className="text-xs text-[var(--color-text-subtle)]">{recentSample.length} 戦</span>
      </div>

      <div className={`mt-5 ${compact ? "h-[190px]" : "h-[220px]"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={finishMix} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(18,17,15,0.08)" strokeDasharray="3 8" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-subtle)", fontSize: compact ? 11 : 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-subtle)", fontSize: compact ? 11 : 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid var(--color-border)",
                background: "rgba(255,255,255,0.94)",
                backdropFilter: "blur(12px)",
              }}
              formatter={(value) => [`${value} 戦`, "回数"]}
            />
            <Bar dataKey="count" radius={[16, 16, 6, 6]}>
              {finishMix.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );

  const renderMetricsSection = (compact: boolean) => (
    <section
      className={`rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[var(--shadow-panel)] ${
        compact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">直近指標</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">平均順位</div>
          <div className={`mt-3 font-mono text-[var(--color-text)] ${compact ? "text-xl" : "text-2xl"}`}>
            {recentAverageRank !== null ? formatScore(recentAverageRank) : "-"}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">2着以内率</div>
          <div className={`mt-3 font-mono text-[var(--color-text)] ${compact ? "text-xl" : "text-2xl"}`}>
            {topTwoRate !== null ? formatPercent(topTwoRate) : "-"}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">ラス回避率</div>
          <div className={`mt-3 font-mono text-[var(--color-text)] ${compact ? "text-xl" : "text-2xl"}`}>
            {safeRate !== null ? formatPercent(safeRate) : "-"}
          </div>
        </div>
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">連続トップ</div>
          <div className={`mt-3 font-mono text-[var(--color-text)] ${compact ? "text-xl" : "text-2xl"}`}>
            {winStreak}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.58))]">
      <CardHeader className="border-b border-[var(--color-border-soft)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[42rem]">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">選手詳細</p>
            <CardTitle className="mt-2 text-3xl md:text-4xl">選手サマリー</CardTitle>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
              モバイルでは選択中の選手を先に見せ、必要な深掘りだけを切り替えて読める構成にしています。
            </p>
          </div>

          <div className="grid w-full grid-cols-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-1 shadow-[var(--shadow-subtle)] sm:inline-flex sm:w-auto sm:items-center sm:gap-2">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                range === "season" ? "bg-[var(--color-surface-inverse)] text-white" : "text-[var(--color-text-subtle)]"
              }`}
              onClick={() => setRange("season")}
            >
              シーズン全体
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                range === "recent" ? "bg-[var(--color-surface-inverse)] text-white" : "text-[var(--color-text-subtle)]"
              }`}
              onClick={() => setRange("recent")}
            >
              直近12戦
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 md:pt-8">
        <div className="mb-6 xl:hidden">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-subtle)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">選手切替</p>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {players.map((player) => renderSelectorButton(player, true))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden space-y-4 xl:block">
            <div className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-subtle)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">選手一覧</p>
              <div className="mt-4 space-y-2">
                {players.map((player) => renderSelectorButton(player, false))}
              </div>
            </div>
          </aside>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
            >
              <section
                className="rounded-[34px] border border-[var(--color-border)] p-4 shadow-[var(--shadow-panel)] md:p-6"
                style={{
                  background: `linear-gradient(145deg, ${withAlpha(selected.color, 0.15)} 0%, rgba(255,255,255,0.92) 48%, rgba(255,255,255,0.84) 100%)`,
                }}
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_280px] xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selected.color }} />
                          選択中の選手
                        </div>
                        <h3 className="mt-4 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-text)] md:text-5xl">
                          {selected.name}
                        </h3>
                        <p className="mt-4 max-w-[36rem] text-sm leading-7 text-[var(--color-text-muted)]">
                          {recentAverageRank !== null && recentAverageRank < selected.averageRank
                            ? "直近の成績はシーズン平均より安定しており、流れは上向きです。"
                            : "シーズン全体の実績と直近の状態を同時に見比べられるようにしています。"}
                        </p>
                      </div>

                      <div className="rounded-[28px] border border-[var(--color-border)] bg-white/80 px-5 py-4 shadow-[var(--shadow-subtle)]">
                        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">シーズン順位</div>
                        <div className="mt-3 flex items-end gap-3">
                          <span className="font-[var(--font-display)] text-6xl font-semibold tracking-tight text-[var(--color-text)]">{selected.rank}</span>
                          <span className="pb-2 text-sm text-[var(--color-text-subtle)]">位</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      {summaryStats.map((stat) => (
                        <div key={stat.label} className="rounded-[24px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
                          <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">{stat.label}</div>
                          <div className="mt-3 font-mono text-lg text-[var(--color-text)] md:text-xl">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border border-[var(--color-border)] bg-white/76 px-5 py-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">直近着順</div>
                          <h4 className="mt-2 text-xl font-semibold text-[var(--color-text)]">最新8戦</h4>
                        </div>
                        <span className="text-xs text-[var(--color-text-subtle)]">{range === "recent" ? "直近12戦基準" : "シーズン基準"}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {recentFinishes.map((rank, index) => (
                          <span
                            key={`${selected.id}-${index}-${rank}`}
                            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                            style={{
                              borderColor: withAlpha(finishPalette[rank], 0.24),
                              backgroundColor: withAlpha(finishPalette[rank], 0.12),
                              color: finishPalette[rank],
                            }}
                          >
                            {rankLabel[rank]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-[var(--color-border)] bg-white/78 p-5">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">率のバランス</div>
                    <div className="mt-4 relative">
                      <div className="h-[220px] md:h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart data={rateData} innerRadius="28%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={14}>
                            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                            <RadialBar dataKey="value" background={{ fill: "rgba(18,17,15,0.08)" }} cornerRadius={999}>
                              {rateData.map((entry) => (
                                <Cell key={entry.label} fill={entry.fill} />
                              ))}
                            </RadialBar>
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">対局数</div>
                        <div className="mt-2 font-[var(--font-display)] text-5xl font-semibold tracking-tight text-[var(--color-text)]">{selected.gamesPlayed}</div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {rateData.map((metric) => (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-text)]">{metric.label}</span>
                            <span className="font-mono text-[var(--color-text-subtle)]">{percentFormat.format(metric.value)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[rgba(18,17,15,0.08)]">
                            <span className="block h-full rounded-full" style={{ width: `${metric.value}%`, backgroundColor: metric.fill }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-4 xl:hidden">
                <div className="grid grid-cols-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-1 shadow-[var(--shadow-subtle)]">
                  {[
                    { key: "trend", label: "推移" },
                    { key: "distribution", label: "分布" },
                    { key: "metrics", label: "直近" },
                  ].map((view) => (
                    <button
                      key={view.key}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                        mobileView === view.key ? "bg-[var(--color-surface-inverse)] text-white" : "text-[var(--color-text-subtle)]"
                      }`}
                      onClick={() => setMobileView(view.key as typeof mobileView)}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>

                {mobileView === "trend" ? renderTrendSection(true) : null}
                {mobileView === "distribution" ? renderDistributionSection(true) : null}
                {mobileView === "metrics" ? renderMetricsSection(true) : null}
              </div>

              <div className="hidden gap-6 xl:grid xl:grid-cols-[minmax(0,1.36fr)_0.92fr]">
                {renderTrendSection(false)}

                <div className="space-y-6">
                  {renderDistributionSection(false)}
                  {renderMetricsSection(false)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
