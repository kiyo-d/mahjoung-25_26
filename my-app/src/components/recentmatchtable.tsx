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
  return (
    <Card className="border-neutral-800 bg-neutral-900/80 text-neutral-100">
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-50">{title}</CardTitle>
            <p className="mt-1 text-xs text-neutral-500">最近の卓結果をスコア順に一覧表示</p>
          </div>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            {matches.length} 件
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {matches.length === 0 ? (
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
                {matches.map((match) => (
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
