import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HeadToHeadRecord } from "@/data/head-to-head";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDiff(value: number): string {
  if (Math.abs(value) < 1e-9) return "0.0";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

export function HeadToHeadTable({ records }: { records: HeadToHeadRecord[] }) {
  const matchupOptions = useMemo(
    () =>
      records.map((record) => ({
        key: `${record.playerA}__${record.playerB}`,
        label: `${record.playerA} 対 ${record.playerB}`,
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
  const competitiveGames = (selectedRecord?.winsA ?? 0) + (selectedRecord?.winsB ?? 0);
  const winShare = competitiveGames > 0 ? (selectedRecord?.winsA ?? 0) / competitiveGames : 0.5;

  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.58))]">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">
            対戦比較
          </p>
          <CardTitle className="text-3xl md:text-4xl">相性差比較</CardTitle>
          <p className="max-w-[34rem] text-sm leading-7 text-[var(--color-text-muted)]">
            任意の二者を選ぶと、勝敗、総ポイント差、平均差分を一画面で確認できます。
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {matchupOptions.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--color-border)] px-6 py-12 text-center text-sm text-[var(--color-text-subtle)]">
            対戦比較データがありません。
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-subtle)]">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">対戦カード</div>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger className="mt-3 h-11 rounded-[20px]">
                    <SelectValue placeholder="対戦カードを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchupOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRecord ? (
                  <div className="mt-6 rounded-[22px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">対戦数</div>
                    <div className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-text)]">
                      {selectedRecord.games}
                    </div>
                    <div className="mt-2 text-sm text-[var(--color-text-subtle)]">
                      今シーズン内での全対戦
                    </div>
                  </div>
                ) : null}
              </div>

              {selectedRecord ? (
                <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 shadow-[var(--shadow-subtle)]">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
                      <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">選手A</div>
                      <div className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{selectedRecord.playerA}</div>
                      <div className="mt-2 text-sm text-[var(--color-text-subtle)]">
                        {selectedRecord.winsA} 勝・{formatPercent(selectedRecord.winRateA)}
                      </div>
                    </div>

                    <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-inverse)] px-4 py-2 text-sm font-semibold text-white">
                      対
                    </div>

                    <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 px-4 py-4">
                      <div className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">選手B</div>
                      <div className="mt-3 text-2xl font-semibold text-[var(--color-text)]">{selectedRecord.playerB}</div>
                      <div className="mt-2 text-sm text-[var(--color-text-subtle)]">
                        {selectedRecord.winsB} 勝・{formatPercent(selectedRecord.games > 0 ? selectedRecord.winsB / selectedRecord.games : 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
                      <span>{selectedRecord.playerA}</span>
                      <span>勝率比</span>
                      <span>{selectedRecord.playerB}</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(18,17,15,0.08)]">
                      <span
                        className="block h-full rounded-full bg-[linear-gradient(90deg,#10a37f,#12110f)]"
                        style={{ width: `${Math.min(Math.max(winShare * 100, 8), 92)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">戦績</div>
                      <div className="mt-3 text-xl font-semibold text-[var(--color-text)]">
                        {selectedRecord.winsA} - {selectedRecord.winsB}
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-text-subtle)]">{selectedRecord.draws} 引き分け</div>
                    </div>
                    <div className="rounded-[22px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">総ポイント差</div>
                      <div className="mt-3 font-mono text-xl text-[var(--color-text)]">
                        {formatDiff(selectedRecord.totalPointDiff)}
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-text-subtle)]">プラスは選手A優勢</div>
                    </div>
                    <div className="rounded-[22px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">平均差分</div>
                      <div className="mt-3 font-mono text-xl text-[var(--color-text)]">
                        {formatDiff(selectedRecord.averagePointDiff)}
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-text-subtle)]">1戦あたり</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
