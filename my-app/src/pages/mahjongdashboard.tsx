import { useMemo, useState } from "react";

import { HeadToHeadTable } from "@/components/headtoheadtable";
import { HeaderBar } from "@/components/header";
import { Leaderboard } from "@/components/leaderboard";
import { MatchHistoryTable } from "@/components/matchhistorytable";
import { PlayerSummaryPanel } from "@/components/playersummarypanel";
import { ScoreTimelineChart } from "@/components/scoretimelinechart";
import { buildHeadToHeadRecords } from "@/data/head-to-head";
import { buildMatchHistory } from "@/data/match-history";
import { buildPlayerSummaries } from "@/data/player-summary";
import { buildChartData } from "@/data/score";
import type { Season, SeasonPayload } from "@/types/propsType";

import summary from "@dist/data/summary.json";

const payload = summary as unknown as SeasonPayload;

function formatGeneratedAt(iso?: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const seasonOptions = payload.seasons?.map((s, idx) => ({
  label: s.summary?.season ?? `Season ${idx + 1}`,
  value: idx,
})) ?? [];

export default function MahjongDashboard() {
  const [seasonIndex, setSeasonIndex] = useState(0);

  const season: Season | undefined = payload.seasons?.[seasonIndex];
  const seasonSummary = season?.summary;
  const generatedAt = formatGeneratedAt(payload.generated_at);

  const { players, timeline } = useMemo(() => buildChartData(season), [season]);
  const playerSummaries = useMemo(() => buildPlayerSummaries(season), [season]);
  const matchHistory = useMemo(() => buildMatchHistory(season), [season]);
  const headToHeadRecords = useMemo(() => buildHeadToHeadRecords(season), [season]);

  const sortedPlayers = [...playerSummaries].sort((a, b) => b.totalScore - a.totalScore);
  const hasPlayers = sortedPlayers.length > 0;
  const leader = hasPlayers ? sortedPlayers[0] : null;
  const mostGames = hasPlayers
    ? sortedPlayers.reduce((best, player) => (player.gamesPlayed > best.gamesPlayed ? player : best))
    : null;
  const bestWinRate = hasPlayers
    ? sortedPlayers.reduce((best, player) => ((player.winRate ?? 0) > (best?.winRate ?? 0) ? player : best))
    : null;

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)]">
      <HeaderBar
        totalgames={seasonSummary?.total_games ?? 0}
        totalplayers={seasonSummary?.total_players ?? 0}
        date_start={seasonSummary?.start_date ?? "-"}
        date_end={seasonSummary?.end_date ?? "-"}
        generated_at={generatedAt}
        seasonLabel={seasonSummary?.season ?? "-"}
        seasonOptions={seasonOptions.map((opt) => opt.label)}
        selectedSeasonIndex={seasonIndex}
        onSelectSeason={setSeasonIndex}
      />
      <main className="mx-auto max-w-6xl space-y-14 px-6 py-12">
        <section id="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">leader</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-subtle)]">総合トップ</p>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">{leader?.name ?? "-"}</p>
                </div>
                <span className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                  {leader?.totalScore.toFixed(1)} pt
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-subtle)]">累計ポイントが最も高いプレイヤー</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">endurance</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-subtle)]">最多対局</p>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">{mostGames?.name ?? "-"}</p>
                </div>
                <span className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                  {mostGames?.gamesPlayed ?? 0} 局
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-subtle)]">最も多く対局したプレイヤー</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">momentum</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-subtle)]">最高トップ率</p>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">{bestWinRate?.name ?? "-"}</p>
                </div>
                <span className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                  {((bestWinRate?.winRate ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-subtle)]">トップ率が最も高いプレイヤー</p>
            </div>
          </div>
        </section>

        <section id="trend" className="space-y-6">
          <ScoreTimelineChart players={players} timeline={timeline} />
        </section>

        <section id="leaderboard" className="space-y-6">
          <Leaderboard players={playerSummaries} />
        </section>

        <section id="head-to-head" className="space-y-6">
          <HeadToHeadTable records={headToHeadRecords} />
        </section>

        <section id="players" className="space-y-6">
          <PlayerSummaryPanel players={playerSummaries} />
        </section>

        <section id="history" className="space-y-6">
          <MatchHistoryTable matches={matchHistory} />
        </section>
      </main>
      <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-[var(--color-text-subtle)]">
        データはExcel/CSVから生成したJSONをもとに表示しています。
      </footer>
    </div>
  );
}
