import { useMemo, useState } from "react";

import { HeadToHeadTable } from "@/components/headtoheadtable";
import { HeaderBar } from "@/components/header";
import { Leaderboard } from "@/components/leaderboard";
import { MatchHistoryTable } from "@/components/matchhistorytable";
import { PlayerSummaryPanel } from "@/components/playersummarypanel";
import { SeasonHero } from "@/components/seasonhero";
import { SeasonRankings } from "@/components/seasonrankings";
import { buildHeadToHeadRecords } from "@/data/head-to-head";
import { buildMatchHistory } from "@/data/match-history";
import { buildPlayerSummaries } from "@/data/player-summary";
import { buildChartData } from "@/data/score";
import type { Season, SeasonPayload } from "@/types/propsType";

import summary from "@dist/data/summary.json";

const payload = summary as unknown as SeasonPayload;

function resolveLatestSeasonIndex(seasons: Season[] | undefined): number {
  if (!seasons || seasons.length === 0) return 0;

  let latestIndex = 0;
  let latestTime = Number.NEGATIVE_INFINITY;

  seasons.forEach((season, index) => {
    const dateText = season.summary?.end_date ?? "";
    const parsed = Date.parse(dateText);
    const score = Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
    if (score >= latestTime) {
      latestTime = score;
      latestIndex = index;
    }
  });

  return latestIndex;
}

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

const seasonOptions =
  payload.seasons?.map((season, index) => ({
    label: season.summary?.season ?? `シーズン ${index + 1}`,
    value: index,
  })) ?? [];

export default function MahjongDashboard() {
  const [seasonIndex, setSeasonIndex] = useState(() =>
    resolveLatestSeasonIndex(payload.seasons),
  );

  const season: Season | undefined = payload.seasons?.[seasonIndex];
  const seasonSummary = season?.summary;
  const generatedAt = formatGeneratedAt(payload.generated_at);

  const { players, timeline } = useMemo(() => buildChartData(season), [season]);
  const playerSummaries = useMemo(() => buildPlayerSummaries(season), [season]);
  const matchHistory = useMemo(() => buildMatchHistory(season), [season]);
  const headToHeadRecords = useMemo(() => buildHeadToHeadRecords(season), [season]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(16,163,127,0.14),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(214,193,154,0.18),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[380px] h-[640px] bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.35),transparent)]" />

      <HeaderBar
        totalgames={seasonSummary?.total_games ?? 0}
        totalplayers={seasonSummary?.total_players ?? 0}
        date_start={seasonSummary?.start_date ?? "-"}
        date_end={seasonSummary?.end_date ?? "-"}
        generated_at={generatedAt}
        seasonLabel={seasonSummary?.season ?? "-"}
        seasonOptions={seasonOptions.map((option) => option.label)}
        selectedSeasonIndex={seasonIndex}
        onSelectSeason={setSeasonIndex}
      />

      <main className="relative mx-auto flex max-w-[1400px] flex-col gap-8 px-4 pb-20 pt-6 md:px-6 md:pb-24 md:pt-8">
        <section className="order-1">
          <SeasonHero
            seasonLabel={seasonSummary?.season ?? "麻雀シーズン"}
            totalGames={seasonSummary?.total_games ?? 0}
            timeline={timeline}
            players={players}
          />
        </section>

        <section id="players" className="order-2 min-w-0 xl:order-4">
          <PlayerSummaryPanel players={playerSummaries} />
        </section>

        <div className="order-3 grid gap-6 xl:order-3 xl:grid-cols-[1.2fr_0.92fr]">
          <section id="leaderboard" className="min-w-0">
            <Leaderboard players={playerSummaries} />
          </section>

          <section id="head-to-head" className="min-w-0">
            <HeadToHeadTable records={headToHeadRecords} />
          </section>
        </div>

        <section className="order-4 xl:order-2">
          <SeasonRankings players={playerSummaries} />
        </section>

        <section id="history" className="order-5 min-w-0">
          <MatchHistoryTable matches={matchHistory} />
        </section>
      </main>

      <footer className="relative mx-auto max-w-[1400px] px-4 pb-10 text-sm text-[var(--color-text-subtle)] md:px-6">
        データ生成: workbook の集計結果を JSON に変換し、このダッシュボードに表示しています。
      </footer>
    </div>
  );
}
