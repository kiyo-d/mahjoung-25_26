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
import type { RecentMatch } from "@/types/propsType";

const rankLabel: Record<RecentMatch["rank"], string> = {
  1: "1位",
  2: "2位",
  3: "3位",
  4: "4位",
};

const rankChipClass: Record<RecentMatch["rank"], string> = {
  1: "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
  2: "border-sky-500/50 bg-sky-500/10 text-sky-200",
  3: "border-amber-500/50 bg-amber-500/10 text-amber-200",
  4: "border-rose-500/50 bg-rose-500/10 text-rose-200",
};

const nf = new Intl.NumberFormat("ja-JP");
const pointFormat = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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

type RecentMatchTableProps = {
  matches: RecentMatch[];
  title?: string;
};

export function RecentMatchTable({ matches, title = "直近対局" }: RecentMatchTableProps) {
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");

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
      return dateMatch && playerMatch;
    });
  }, [matches, selectedDate, selectedPlayer]);

  return (
    <Card className="border-neutral-800 bg-neutral-900/80 text-neutral-100">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-50">{title}</CardTitle>
            <p className="mt-1 text-xs text-neutral-500">最近の卓結果をスコア順に一覧表示</p>
          </div>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            {filteredMatches.length} 件
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            日付で絞り込み
            <select
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
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
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
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
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredMatches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800 px-6 py-12 text-center text-sm text-neutral-500">
            まだ対局データがありません。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
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
                  <TableRow key={`${match.date}-${match.room}-${match.nameplate}`}>
                    <TableCell className="text-sm text-neutral-300">{formatDate(match.date)}</TableCell>
                    <TableCell className="text-sm text-neutral-400">{match.room}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          rankChipClass[match.rank],
                        )}
                      >
                        {rankLabel[match.rank]}
                      </span>
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
