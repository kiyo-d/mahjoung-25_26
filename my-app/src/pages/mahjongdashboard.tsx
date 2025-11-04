import { HeaderBar } from "@/components/header";
import { ScoreTimelineChart } from "@/components/scoretimelinechart";
import { buildChartData } from "@/data/score";
import type { SeasonPayload } from "@/types/propsType";


import summary from "@dist/data/summary.json"

const payload = summary as unknown as SeasonPayload;
const { players, timeline } = buildChartData(payload);


function formatGeneratedAt(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
const s = summary.seasons[0].summary;
const headerProps = {
    totalgames: s.total_games,
    totalplayers: s.total_players,
    date_start: s.start_date,
    date_end: s.end_date,
    generated_at: formatGeneratedAt(summary.generated_at)
  };


export default function MahjongDashboard() {
    return (
        <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_#0f0f0f,_#000)] text-neutral-100">
        <HeaderBar {...headerProps}  />
        <div className="max-w-6xl mx-auto px-6 py-6">
        <ScoreTimelineChart players={players} timeline={timeline} />
      </div>
        
        <footer className="max-w-none mx-auto px-6 pb-8 text-xs text-neutral-500">
          サンプルUI。データはダミー値。Excel/CSV → JSON連携を想定。
        </footer>
      </div>
    );
  }