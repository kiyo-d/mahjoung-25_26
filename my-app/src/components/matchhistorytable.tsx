import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MatchRecord } from "@/types/propsType";
import sectionGrid from "@/assets/section-grid.svg";
import aurora from "@/assets/aurora-bands.svg";
import rank1 from "@/assets/rank-1.svg";
import rank2 from "@/assets/rank-2.svg";
import rank3 from "@/assets/rank-3.svg";
import rank4 from "@/assets/rank-4.svg";

const rankLabel: Record<MatchRecord["rank"], string> = {
  1: "1位",
  2: "2位",
  3: "3位",
  4: "4位",
};

const rankChipClass: Record<MatchRecord["rank"], string> = {
  1: "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
  2: "border-sky-500/50 bg-sky-500/10 text-sky-200",
  3: "border-amber-500/50 bg-amber-500/10 text-amber-200",
  4: "border-rose-500/50 bg-rose-500/10 text-rose-200",
};

const rankRowClass: Record<MatchRecord["rank"], string> = {
  1: "border-l-2 border-emerald-400/60 bg-emerald-400/5",
  2: "border-l-2 border-sky-400/60 bg-sky-400/5",
  3: "border-l-2 border-amber-400/60 bg-amber-400/5",
  4: "border-l-2 border-rose-400/60 bg-rose-400/5",
};

const rankIcon: Record<MatchRecord["rank"], string> = {
  1: rank1,
  2: rank2,
  3: rank3,
  4: rank4,
};

const nf = new Intl.NumberFormat("ja-JP");
const pointFormat = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
};

const formatPoints = (value: number) => {
  const formatted = pointFormat.format(Math.abs(value));
  if (value === 0) return "±0.0";
  return `${value > 0 ? "+" : "-"}${formatted}`;
};

const formatPercent = (value: number) => `${percentFormat.format(value * 100)}%`;

type MatchHistoryTableProps = {
  matches: MatchRecord[];
  title?: string;
};

export function MatchHistoryTable({ matches, title = "対局履歴" }: MatchHistoryTableProps) {
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");
  const [focusRank, setFocusRank] = useState<"all" | "top" | "last">("all");

  const dateOptions = useMemo(() => {
    const uniqueDates = new Set<string>();
    matches.forEach((match) => {
      if (match.date) {
        uniqueDates.add(match.date);
      }
    });
    return Array.from(uniqueDates).sort((a, b) => {
      if (a === b) return 0;
      return a > b ? -1 : 1;
    });
  }, [matches]);

  const playerOptions = useMemo(() => {
    const uniquePlayers = new Set<string>();
    matches.forEach((match) => {
      if (match.nameplate) {
        uniquePlayers.add(match.nameplate);
      }
    });
    return Array.from(uniquePlayers).sort((a, b) => a.localeCompare(b, "ja"));
  }, [matches]);

  useEffect(() => {
    if (selectedDate !== "all" && !dateOptions.includes(selectedDate)) {
      setSelectedDate("all");
    }
  }, [dateOptions, selectedDate]);

  useEffect(() => {
    if (selectedPlayer !== "all" && !playerOptions.includes(selectedPlayer)) {
      setSelectedPlayer("all");
    }
  }, [playerOptions, selectedPlayer]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const dateMatch = selectedDate === "all" || match.date === selectedDate;
      const playerMatch = selectedPlayer === "all" || match.nameplate === selectedPlayer;
      const rankMatch =
        focusRank === "all" || (focusRank === "top" && match.rank === 1) || (focusRank === "last" && match.rank === 4);
      return dateMatch && playerMatch && rankMatch;
    });
  }, [focusRank, matches, selectedDate, selectedPlayer]);

  const viewStats = useMemo(() => {
    if (!filteredMatches.length) {
      return {
        total: 0,
        avgPoints: 0,
        topCount: 0,
        lastCount: 0,
        bestPoints: 0,
        worstPoints: 0,
      } as const;
    }

    const points = filteredMatches.map((match) => match.points);
    const total = filteredMatches.length;
    const avgPoints = points.reduce((acc, val) => acc + val, 0) / total;
    const topCount = filteredMatches.filter((match) => match.rank === 1).length;
    const lastCount = filteredMatches.filter((match) => match.rank === 4).length;
    const bestPoints = Math.max(...points);
    const worstPoints = Math.min(...points);

    return { total, avgPoints, topCount, lastCount, bestPoints, worstPoints } as const;
  }, [filteredMatches]);

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-neutral-900/80 via-neutral-950/90 to-neutral-950/95 text-neutral-100 shadow-[0_22px_70px_-60px_rgba(56,189,248,0.55)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-cyan-400/10 via-emerald-400/12 to-fuchsia-400/10" />
      <div className="pointer-events-none absolute -left-10 -top-6 h-56 w-[640px] opacity-55">
        <img src={sectionGrid} alt="match history grid" className="h-full w-full object-contain" loading="lazy" />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-0 h-52 w-[520px] opacity-70 mix-blend-screen">
        <img src={aurora} alt="aurora" className="h-full w-full object-cover" loading="lazy" />
      </div>
      <CardHeader className="relative z-10 pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-50">
              {title}
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">log</span>
            </CardTitle>
            <p className="mt-1 text-xs text-neutral-500">対局結果をスコア順に一覧表示</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{filteredMatches.length} 件</span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-100">{matches.length} 件 全体</span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs text-neutral-400 md:col-span-2">
            日付で絞り込み
            <select
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              disabled={dateOptions.length === 0}
            >
              <option value="all">すべての日付</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            プレイヤーで絞り込み
            <select
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              value={selectedPlayer}
              onChange={(event) => setSelectedPlayer(event.target.value)}
              disabled={playerOptions.length === 0}
            >
              <option value="all">すべてのプレイヤー</option>
              {playerOptions.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2 text-xs text-neutral-400">
            フォーカス
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-200">
              <button
                type="button"
                className={`flex-1 rounded-md px-2 py-1 transition ${
                  focusRank === "all" ? "bg-white/10 text-white" : "hover:bg-white/5"
                }`}
                onClick={() => setFocusRank("all")}
              >
                全体
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-2 py-1 transition ${
                  focusRank === "top" ? "bg-emerald-500/30 text-emerald-50" : "hover:bg-emerald-400/10"
                }`}
                onClick={() => setFocusRank("top")}
              >
                1位
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-2 py-1 transition ${
                  focusRank === "last" ? "bg-rose-500/30 text-rose-50" : "hover:bg-rose-400/10"
                }`}
                onClick={() => setFocusRank("last")}
              >
                4位
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4 pt-0">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent p-4 shadow-inner shadow-black/30">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">平均Pt</div>
            <div className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-emerald-100">
              {pointFormat.format(viewStats.avgPoints)}
              <span className="text-xs text-neutral-400">{focusRank === "all" ? "全体" : "絞り込み"}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent p-4 shadow-inner shadow-black/30">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">トップ率</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-semibold text-cyan-100">
                {viewStats.total ? formatPercent(viewStats.topCount / viewStats.total) : "-"}
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-neutral-200">{viewStats.topCount} 回</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: `${viewStats.total ? Math.min((viewStats.topCount / viewStats.total) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent p-4 shadow-inner shadow-black/30">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">ラス率</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-semibold text-amber-100">
                {viewStats.total ? formatPercent(viewStats.lastCount / viewStats.total) : "-"}
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-neutral-200">{viewStats.lastCount} 回</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                style={{ width: `${viewStats.total ? Math.min((viewStats.lastCount / viewStats.total) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-400/10 via-transparent to-transparent p-4 shadow-inner shadow-black/30">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">ベスト / ワースト</div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-mono text-emerald-100">{formatPoints(viewStats.bestPoints)}</span>
              <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 font-mono text-rose-100">{formatPoints(viewStats.worstPoints)}</span>
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-neutral-400">{focusRank === "all" ? "season" : "focused"} window</div>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800 px-6 py-12 text-center text-sm text-neutral-500">
            まだ対局データがありません。
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-neutral-950/75 p-3 shadow-inner shadow-black/30">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-20">日付</TableHead>
                  <TableHead className="w-28">卓</TableHead>
                  <TableHead className="w-16">着順</TableHead>
                  <TableHead className="w-32 text-right">素点</TableHead>
                  <TableHead className="w-24 text-right">ポイント</TableHead>
                  <TableHead>名前表示</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow
                    key={`${match.date}-${match.room}-${match.nameplate}-${match.points}`}
                    className={cn(
                      "transition hover:bg-white/5",
                      rankRowClass[match.rank],
                    )}
                  >
                    <TableCell className="text-sm text-neutral-300">{formatDate(match.date)}</TableCell>
                    <TableCell className="text-sm text-neutral-400">{match.room}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner shadow-black/40">
                          <img src={rankIcon[match.rank]} alt={rankLabel[match.rank]} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                            rankChipClass[match.rank],
                          )}
                        >
                          {rankLabel[match.rank]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-neutral-100">
                      {nf.format(match.score)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm",
                        match.points >= 0 ? "text-emerald-300" : "text-rose-300",
                      )}
                    >
                      {formatPoints(match.points)}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-300">{match.nameplate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
