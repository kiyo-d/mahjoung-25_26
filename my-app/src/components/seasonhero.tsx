import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { ScoreTimelineChart } from "@/components/scoretimelinechart";
import type { Player, TimelinePoint } from "@/types/propsType";

type SeasonHeroProps = {
  seasonLabel: string;
  totalGames: number;
  timeline: TimelinePoint[];
  players: Player[];
};

const scoreFormat = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "-";
  return parsed.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function SeasonHero({ seasonLabel, totalGames, timeline, players }: SeasonHeroProps) {
  const latestSnapshot = useMemo(() => {
    const latestPoint = timeline.at(-1);
    if (!latestPoint) {
      return {
        leaderName: "-",
        leadMargin: 0,
        latestGame: "-",
      };
    }

    const standings = players
      .map((player) => ({
        ...player,
        score: Number(latestPoint[player.id] ?? 0),
      }))
      .sort((a, b) => b.score - a.score);

    const leader = standings[0];
    const runnerUp = standings[1];

    return {
      leaderName: leader?.name ?? "-",
      leadMargin: leader && runnerUp ? leader.score - runnerUp.score : 0,
      latestGame: `第${latestPoint.gameNumber}戦・${formatShortDate(latestPoint.date)}`,
    };
  }, [players, timeline]);

  return (
    <section
      id="overview"
      className="relative isolate overflow-hidden rounded-[40px] border border-[var(--color-border)] bg-[color:rgba(255,255,255,0.62)] shadow-[var(--shadow-floating)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,163,127,0.18),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(217,197,164,0.3),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.78))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(18,17,15,0.04))]" />

      <div className="relative grid gap-6 px-4 py-5 md:px-8 md:py-8 xl:grid-cols-[minmax(280px,420px)_1fr] xl:gap-10 xl:px-12 xl:py-12">
        <motion.div {...fadeUp} className="flex flex-col justify-between gap-8 xl:min-h-[680px]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.36em] text-[var(--color-text-subtle)]">
                シーズン概要
              </p>
              <h1 className="max-w-[11ch] font-[var(--font-display)] text-4xl font-semibold leading-[0.92] tracking-tight text-[var(--color-text)] sm:text-5xl md:text-6xl xl:text-7xl">
                {seasonLabel}
              </h1>
            </div>

            <p className="max-w-[34rem] text-sm leading-7 text-[var(--color-text-muted)] md:text-base">
              順位推移、流れ、相性差を静かに見渡せるように整えた、今シーズンの全体ビューです。
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <a
                href="#players"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-surface-inverse)] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:translate-y-[-1px] hover:opacity-95 sm:w-auto"
              >
                選手詳細を見る
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#history"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] no-underline transition hover:border-[var(--color-border-strong)] sm:w-auto"
              >
                対局履歴を見る
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-3 shadow-[var(--shadow-subtle)] md:px-4 md:py-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)] md:text-[11px] md:tracking-[0.3em]">対局数</p>
              <p className="mt-2 font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-text)] sm:text-2xl md:mt-3 md:text-3xl">
                {totalGames.toLocaleString()}
              </p>
            </div>
            <div className="min-w-0 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-3 shadow-[var(--shadow-subtle)] md:px-4 md:py-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)] md:text-[11px] md:tracking-[0.3em]">首位</p>
              <p className="mt-2 text-sm font-semibold leading-tight text-[var(--color-text)] sm:text-base md:mt-3 md:text-lg">{latestSnapshot.leaderName}</p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-subtle)] md:mt-2 md:text-xs">
                2位との差 {scoreFormat.format(Math.max(latestSnapshot.leadMargin, 0))} pt
              </p>
            </div>
            <div className="min-w-0 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-3 shadow-[var(--shadow-subtle)] md:px-4 md:py-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-subtle)] md:text-[11px] md:tracking-[0.3em]">最新対局</p>
              <p className="mt-2 text-sm font-semibold leading-tight text-[var(--color-text)] sm:text-base md:mt-3 md:text-lg">{latestSnapshot.latestGame}</p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-subtle)] md:mt-2 md:text-xs">
                参加者 {players.length.toLocaleString()} 名
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ delay: 0.08, duration: 0.65, ease: "easeOut" }}
          className="min-w-0"
        >
          <ScoreTimelineChart players={players} timeline={timeline} />
        </motion.div>
      </div>
    </section>
  );
}
