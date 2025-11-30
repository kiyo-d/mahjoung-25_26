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
import aurora from "@/assets/aurora-bands.svg";

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
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_-8%,rgba(16,185,129,0.12),transparent),radial-gradient(900px_circle_at_82%_0%,rgba(94,234,212,0.1),transparent),linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0v48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-white" />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70">
        <img src={aurora} alt="aurora" className="h-full w-full object-cover mix-blend-screen" />
      </div>
      <div className="pointer-events-none absolute -right-10 top-48 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-14 top-80 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative z-10">
        <HeaderBar {...headerProps} />
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 shadow-2xl shadow-emerald-900/40">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-100">leader</p>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-300">最終首位</p>
                  <p className="text-xl font-semibold text-white">{leader?.name ?? "-"}</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-xs text-emerald-50">{leader?.totalScore.toFixed(1)} pt</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">総合スコアで並び替えたトッププレイヤー</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 shadow-2xl shadow-sky-900/40">
              <div className="pointer-events-none absolute -left-12 -top-10 h-36 w-36 rounded-full bg-sky-400/10 blur-2xl" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-sky-100">endurance</p>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-300">最多出場</p>
                  <p className="text-xl font-semibold text-white">{mostGames?.name ?? "-"}</p>
                </div>
                <span className="rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-1 text-xs text-sky-50">{mostGames?.gamesPlayed ?? 0} 戦</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">シーズンの場数が最も多いプレイヤー</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 shadow-2xl shadow-fuchsia-900/40">
              <div className="pointer-events-none absolute -right-12 -bottom-10 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-2xl" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100">momentum</p>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-300">トップ率が高い</p>
                  <p className="text-xl font-semibold text-white">{bestWinRate?.name ?? "-"}</p>
                </div>
                <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/15 px-3 py-1 text-xs text-fuchsia-50">{((bestWinRate?.winRate ?? 0) * 100).toFixed(1)}%</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">トップ率で勢いのあるプレイヤーを表示</p>
            </div>
          </div>

          <ScoreTimelineChart players={players} timeline={timeline} />
          <Leaderboard players={playerSummaries} />
          <PlayerSummaryPanel players={playerSummaries} />
          <MatchHistoryTable matches={matchHistory} />
        </div>
        <footer className="mx-auto max-w-none px-6 pb-8 text-xs text-neutral-500">
          サンプルUI。データはダミー値。Excel/CSV → JSON連携を想定。
        </footer>
      </div>
    </div>
  );
}
