import { HeaderBar } from "@/components/header";
import { MatchHistoryTable } from "@/components/matchhistorytable";
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
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <ScoreTimelineChart players={players} timeline={timeline} />
        <PlayerSummaryPanel players={playerSummaries} />
        <MatchHistoryTable matches={matchHistory} />
      </div>
      <footer className="max-w-none mx-auto px-6 pb-8 text-xs text-neutral-500">
        サンプルUI。データはダミー値。Excel/CSV → JSON連携を想定。
      </footer>
    </div>
  );
}
