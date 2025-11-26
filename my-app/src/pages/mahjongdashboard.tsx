import { HeaderBar } from "@/components/header";
import { MatchHistoryTable } from "@/components/matchhistorytable";
import { Leaderboard } from "@/components/leaderboard";
import { PlayerSummaryPanel } from "@/components/playersummarypanel";
import { ScoreTimelineChart } from "@/components/scoretimelinechart";
import { buildMatchHistory } from "@/data/match-history";
import { buildPlayerSummaries } from "@/data/player-summary";
import { buildChartData } from "@/data/score";
import type { SeasonPayload } from "@/types/propsType";

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

const season = payload.seasons?.[0];
const seasonSummary = season?.summary;
const generatedAt = formatGeneratedAt(payload.generated_at);

const headerProps = {
  totalgames: seasonSummary?.total_games ?? 0,
  totalplayers: seasonSummary?.total_players ?? 0,
  date_start: seasonSummary?.start_date ?? "-",
  date_end: seasonSummary?.end_date ?? "-",
  generated_at: generatedAt,
};

const { players, timeline } = buildChartData(payload);
const playerSummaries = buildPlayerSummaries(payload);
const matchHistory = buildMatchHistory(payload);

export default function MahjongDashboard() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_#0f0f0f,_#000)] text-neutral-100">
      <HeaderBar {...headerProps} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Row: Chart (2 cols) + Leaderboard (1 col) */}
          <div className="lg:col-span-2">
            <ScoreTimelineChart players={players} timeline={timeline} />
          </div>
          <div className="lg:col-span-1 row-span-2 h-full">
            <Leaderboard players={playerSummaries} />
          </div>

          {/* Middle Row: Player Summary (Full Width on mobile/tablet, 2 cols on desktop) */}
          <div className="lg:col-span-2">
             <PlayerSummaryPanel players={playerSummaries} />
          </div>

          {/* Bottom Row: Match History (Full Width) */}
          <div className="md:col-span-2 lg:col-span-3">
            <MatchHistoryTable matches={matchHistory} />
          </div>
        </div>
      </main>
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 text-xs text-neutral-500 text-center sm:text-left">
        サンプルUI。データはダミー値。Excel/CSV → JSON連携を想定。
      </footer>
    </div>
  );
}
