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

const rankRowClass: Record<MatchRecord["rank"], string> = {
  1: "border-l-2 border-emerald-500/40 bg-emerald-500/5",
  2: "border-l-2 border-sky-500/40 bg-sky-500/5",
  3: "border-l-2 border-amber-500/40 bg-amber-500/5",
  4: "border-l-2 border-orange-500/40 bg-orange-500/5",
};

const medallionClass: Record<MatchRecord["rank"], { outer: string; inner: string }> = {
  1: {
    outer: "border-emerald-400/45 bg-emerald-50 text-emerald-800",
    inner: "border-emerald-300/45 bg-white/75",
  },
  2: {
    outer: "border-sky-400/45 bg-sky-50 text-sky-800",
    inner: "border-sky-300/45 bg-white/75",
  },
  3: {
    outer: "border-amber-400/45 bg-amber-50 text-amber-800",
    inner: "border-amber-300/45 bg-white/75",
  },
  4: {
    outer: "border-orange-400/45 bg-orange-50 text-orange-800",
    inner: "border-orange-300/45 bg-white/75",
  },
};

const pointFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const scoreFormat = new Intl.NumberFormat("ja-JP");

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

function formatPoints(value: number): string {
  if (Math.abs(value) < 1e-9) return "0.0";
  return `${value > 0 ? "+" : "-"}${pointFormat.format(Math.abs(value))}`;
}

function formatPercent(value: number): string {
  return `${pointFormat.format(value * 100)}%`;
}

function RankMedallion({ rank }: { rank: MatchRecord["rank"] }) {
  const tone = medallionClass[rank];

  return (
    <span
      aria-label={`${rank}位`}
      title={`${rank}位`}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_10px_24px_-18px_rgba(18,17,15,0.8)]",
        tone.outer,
      )}
    >
      <span className={cn("absolute inset-[5px] rounded-full border", tone.inner)} />
      <span className="relative z-10">{rank}</span>
    </span>
  );
}

type MatchHistoryTableProps = {
  matches: MatchRecord[];
  title?: string;
};

export function MatchHistoryTable({ matches, title = "対局履歴" }: MatchHistoryTableProps) {
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState("all");
  const [focusRank, setFocusRank] = useState<"all" | "top" | "last">("all");

  const dateOptions = useMemo(() => {
    const unique = new Set<string>();
    matches.forEach((match) => {
      if (match.date) unique.add(match.date);
    });
    return Array.from(unique).sort((a, b) => (a > b ? -1 : 1));
  }, [matches]);

  const playerOptions = useMemo(() => {
    const unique = new Set<string>();
    matches.forEach((match) => {
      if (match.nameplate) unique.add(match.nameplate);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "ja"));
  }, [matches]);

  useEffect(() => {
    if (selectedDate !== "all" && !dateOptions.includes(selectedDate)) setSelectedDate("all");
  }, [dateOptions, selectedDate]);

  useEffect(() => {
    if (selectedPlayer !== "all" && !playerOptions.includes(selectedPlayer)) setSelectedPlayer("all");
  }, [playerOptions, selectedPlayer]);

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const dateMatch = selectedDate === "all" || match.date === selectedDate;
        const playerMatch = selectedPlayer === "all" || match.nameplate === selectedPlayer;
        const rankMatch =
          focusRank === "all" ||
          (focusRank === "top" && match.rank === 1) ||
          (focusRank === "last" && match.rank === 4);
        return dateMatch && playerMatch && rankMatch;
      }),
    [focusRank, matches, selectedDate, selectedPlayer],
  );

  const stats = useMemo(() => {
    if (!filteredMatches.length) {
      return { avg: 0, topRate: 0, lastRate: 0, best: 0, worst: 0 };
    }
    const total = filteredMatches.length;
    const points = filteredMatches.map((match) => match.points);
    const topCount = filteredMatches.filter((match) => match.rank === 1).length;
    const lastCount = filteredMatches.filter((match) => match.rank === 4).length;
    return {
      avg: points.reduce((sum, value) => sum + value, 0) / total,
      topRate: topCount / total,
      lastRate: lastCount / total,
      best: Math.max(...points),
      worst: Math.min(...points),
    };
  }, [filteredMatches]);

  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.58))]">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">履歴</p>
            <CardTitle className="mt-2 text-3xl md:text-4xl">{title}</CardTitle>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
              日付、選手、着順条件で絞り込みながら、全対局を読みやすく追えるようにしています。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-1 text-[var(--color-text)]">
              {filteredMatches.length} 件
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1 text-[var(--color-text-subtle)]">
              全 {matches.length} 件
            </span>
          </div>
        </div>

        <div className="mt-2 grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-xs text-[var(--color-text-subtle)] md:col-span-2">
            日付
            <select
              className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            >
              <option value="all">すべての日付</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-xs text-[var(--color-text-subtle)]">
            選手
            <select
              className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none"
              value={selectedPlayer}
              onChange={(event) => setSelectedPlayer(event.target.value)}
            >
              <option value="all">すべての選手</option>
              {playerOptions.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2 text-xs text-[var(--color-text-subtle)]">
            着目条件
            <div className="inline-flex rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-1">
              {[
                { key: "all", label: "全体" },
                { key: "top", label: "1位" },
                { key: "last", label: "4位" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`flex-1 rounded-[14px] px-3 py-1.5 text-xs font-semibold transition ${
                    focusRank === option.key
                      ? "bg-[var(--color-surface-inverse)] text-white"
                      : "text-[var(--color-text-subtle)]"
                  }`}
                  onClick={() => setFocusRank(option.key as typeof focusRank)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">平均pt</div>
            <div className="mt-3 font-mono text-2xl text-[var(--color-text)]">{pointFormat.format(stats.avg)}</div>
          </div>
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">1位率</div>
            <div className="mt-3 font-mono text-2xl text-[var(--color-text)]">{formatPercent(stats.topRate)}</div>
          </div>
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">4位率</div>
            <div className="mt-3 font-mono text-2xl text-[var(--color-text)]">{formatPercent(stats.lastRate)}</div>
          </div>
          <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">最高 / 最低</div>
            <div className="mt-3 flex items-center justify-between gap-2 font-mono text-sm text-[var(--color-text)]">
              <span>{formatPoints(stats.best)}</span>
              <span>{formatPoints(stats.worst)}</span>
            </div>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--color-border)] px-6 py-12 text-center text-sm text-[var(--color-text-subtle)]">
            条件に一致する対局がありません。
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {filteredMatches.map((match) => (
                <article
                  key={`${match.date}-${match.room}-${match.nameplate}-${match.points}`}
                  className={cn(
                    "rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-subtle)]",
                    rankRowClass[match.rank],
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-text-subtle)]">
                        {formatDate(match.date)} ・ {match.room}
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-[var(--color-text)]">{match.nameplate}</h4>
                    </div>
                    <RankMedallion rank={match.rank} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-[var(--color-border)] bg-white/80 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">素点</div>
                      <div className="mt-2 font-mono text-lg text-[var(--color-text)]">
                        {scoreFormat.format(match.score)}
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-[var(--color-border)] bg-white/80 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">Pt</div>
                      <div
                        className={cn(
                          "mt-2 font-mono text-lg",
                          match.points >= 0 ? "text-emerald-700" : "text-orange-700",
                        )}
                      >
                        {formatPoints(match.points)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-3 shadow-[var(--shadow-subtle)] md:block">
              <Table className="min-w-[760px]">
                <TableHeader className="bg-transparent">
                  <TableRow>
                    <TableHead className="w-24">日付</TableHead>
                    <TableHead className="w-36">卓情報</TableHead>
                    <TableHead className="w-24">着順</TableHead>
                    <TableHead className="w-28 text-right">素点</TableHead>
                    <TableHead className="w-24 text-right">Pt</TableHead>
                    <TableHead>選手</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => (
                    <TableRow
                      key={`${match.date}-${match.room}-${match.nameplate}-${match.points}`}
                      className={cn("transition hover:bg-[var(--color-surface-muted)]", rankRowClass[match.rank])}
                    >
                      <TableCell className="text-sm text-[var(--color-text)]">{formatDate(match.date)}</TableCell>
                      <TableCell className="text-sm text-[var(--color-text-subtle)]">{match.room}</TableCell>
                      <TableCell className="text-sm">
                        <RankMedallion rank={match.rank} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-[var(--color-text)]">
                        {scoreFormat.format(match.score)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm",
                          match.points >= 0 ? "text-emerald-700" : "text-orange-700",
                        )}
                      >
                        {formatPoints(match.points)}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--color-text)]">{match.nameplate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
