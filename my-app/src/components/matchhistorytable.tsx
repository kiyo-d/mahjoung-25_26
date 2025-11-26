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

type MatchHistoryTableProps = {
  matches: MatchRecord[];
  title?: string;
};

export function MatchHistoryTable({ matches, title = "対局履歴" }: MatchHistoryTableProps) {
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
            <p className="mt-1 text-xs text-neutral-500">対局結果をスコア順に一覧表示</p>
          </div>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            {filteredMatches.length} 件
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            日付で絞り込み
            <select
              aria-label="日付で絞り込み"
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
              aria-label="プレイヤーで絞り込み"
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="text-xs border-white/5 hover:bg-transparent">
                    <TableHead className="w-20 text-neutral-500">日付</TableHead>
                    <TableHead className="w-28 text-neutral-500">卓</TableHead>
                    <TableHead className="w-16 text-neutral-500">着順</TableHead>
                    <TableHead className="w-32 text-right text-neutral-500">素点</TableHead>
                    <TableHead className="w-24 text-right text-neutral-500">ポイント</TableHead>
                    <TableHead className="text-neutral-500">名前表示</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => (
                    <TableRow key={`${match.date}-${match.room}-${match.nameplate}`} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="text-sm text-neutral-300 font-mono">{formatDate(match.date)}</TableCell>
                      <TableCell className="text-sm text-neutral-400">{match.room}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                            match.rank === 1 && "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50",
                            match.rank === 2 && "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50",
                            match.rank === 3 && "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50",
                            match.rank === 4 && "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50",
                          )}
                        >
                          {match.rank}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-neutral-300">
                        {nf.format(match.score)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm font-bold",
                          match.points >= 0 ? "text-emerald-400" : "text-rose-400",
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredMatches.map((match) => (
                <div 
                  key={`${match.date}-${match.room}-${match.nameplate}`}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono text-neutral-400">{formatDate(match.date)}</span>
                       <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500">{match.room}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-200">{match.nameplate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                            match.rank === 1 && "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50",
                            match.rank === 2 && "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50",
                            match.rank === 3 && "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50",
                            match.rank === 4 && "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50",
                          )}
                        >
                          {match.rank}
                      </span>
                      <span className="text-sm text-neutral-400 font-mono">
                        {nf.format(match.score)}
                      </span>
                    </div>
                    <span
                        className={cn(
                          "text-lg font-mono font-bold",
                          match.points >= 0 ? "text-emerald-400" : "text-rose-400",
                        )}
                      >
                        {formatPoints(match.points)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
