import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HeadToHeadRecord } from "@/data/head-to-head";

function formatWinRate(value: number): string {
  if (Number.isNaN(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
}

function formatDiff(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "±";
  return `${sign}${value.toFixed(1)}`;
}

export function HeadToHeadTable({ records }: { records: HeadToHeadRecord[] }) {
  const matchupOptions = useMemo(
    () =>
      records.map((record) => ({
        key: `${record.playerA}__${record.playerB}`,
        label: `${record.playerA} vs ${record.playerB}`,
        record,
      })),
    [records],
  );

  const [selectedKey, setSelectedKey] = useState<string | undefined>(matchupOptions[0]?.key);

  useEffect(() => {
    if (!selectedKey && matchupOptions.length > 0) {
      setSelectedKey(matchupOptions[0]?.key);
      return;
    }
    if (selectedKey && !matchupOptions.some((option) => option.key === selectedKey)) {
      setSelectedKey(matchupOptions[0]?.key);
    }
  }, [matchupOptions, selectedKey]);

  const selectedRecord = matchupOptions.find((option) => option.key === selectedKey)?.record ?? null;
  const totalDiff = selectedRecord?.totalPointDiff ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text)]">
          直接対決の成績
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">
            head-to-head
          </span>
        </CardTitle>
        <p className="text-sm text-[var(--color-text-subtle)]">
          同卓した時のポイント差を集計してペアごとの勝敗を表示します。
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {matchupOptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-8 text-center text-sm text-[var(--color-text-subtle)]">
            対戦データがまだありません
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-[minmax(240px,360px)_1fr] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-subtle)]">matchup</p>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="対戦ペアを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchupOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-xs text-[var(--color-text-subtle)]">累計ポイント差 (A視点)</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
                  {formatDiff(totalDiff)}
                  <span className="ml-2 text-sm font-normal text-[var(--color-text-subtle)]">pt</span>
                </p>
                <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                  プラスはAがリード、マイナスはBがリード。
                </p>
              </div>
            </div>

            {selectedRecord ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <p className="text-xs text-[var(--color-text-subtle)]">対局数</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{selectedRecord.games}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <p className="text-xs text-[var(--color-text-subtle)]">勝敗 (A vs B)</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                    {selectedRecord.winsA}-{selectedRecord.winsB}
                  </p>
                  <p className="text-xs text-[var(--color-text-subtle)]">引分 {selectedRecord.draws}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <p className="text-xs text-[var(--color-text-subtle)]">A勝率</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                    {formatWinRate(selectedRecord.winRateA)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <p className="text-xs text-[var(--color-text-subtle)]">平均ポイント差 (A視点)</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                    {formatDiff(selectedRecord.averagePointDiff)}
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
