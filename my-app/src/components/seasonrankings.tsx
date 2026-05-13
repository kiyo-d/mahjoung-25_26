import { motion } from "framer-motion";

import type { PlayerSummaryDetail } from "@/data/player-summary";

type RankingMetric = {
  id: string;
  label: string;
  description: string;
  formatter: (player: PlayerSummaryDetail) => string;
  score: (player: PlayerSummaryDetail) => number;
  detail?: (player: PlayerSummaryDetail) => string | null;
};

function formatMonthDay(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

const metrics: RankingMetric[] = [
  {
    id: "wins",
    label: "トップ回数",
    description: "1位獲得数",
    formatter: (player) => `${player.rankCounts.first} 回`,
    score: (player) => player.rankCounts.first,
  },
  {
    id: "win-rate",
    label: "1位率",
    description: "1位の割合",
    formatter: (player) => `${(player.winRate * 100).toFixed(1)}%`,
    score: (player) => player.winRate,
  },
  {
    id: "safe-rate",
    label: "ラス回避率",
    description: "4位回避率",
    formatter: (player) => `${((1 - player.lastRate) * 100).toFixed(1)}%`,
    score: (player) => 1 - player.lastRate,
  },
  {
    id: "best-score",
    label: "最高スコア",
    description: "1戦での最大値",
    formatter: (player) => `${player.bestScore.toFixed(1)} pt`,
    score: (player) => player.bestScore,
    detail: (player) =>
      player.bestScoreGame
        ? `${formatMonthDay(player.bestScoreGame.date)} の ${player.bestScoreGame.dailyIndex}戦目`
        : null,
  },
  {
    id: "last-count",
    label: "ラス回数",
    description: "4位回数",
    formatter: (player) => `${player.rankCounts.fourth} 回`,
    score: (player) => player.rankCounts.fourth,
  },
  {
    id: "last-rate",
    label: "ラス率",
    description: "4位の割合",
    formatter: (player) => `${(player.lastRate * 100).toFixed(1)}%`,
    score: (player) => player.lastRate,
  },
  {
    id: "top-avoid-rate",
    label: "トップ回避率",
    description: "1位回避率",
    formatter: (player) => `${((1 - player.winRate) * 100).toFixed(1)}%`,
    score: (player) => 1 - player.winRate,
  },
  {
    id: "worst-score",
    label: "最低スコア",
    description: "1戦での最小値",
    formatter: (player) => `${player.worstScore.toFixed(1)} pt`,
    score: (player) => -player.worstScore,
  },
];

export function SeasonRankings({ players }: { players: PlayerSummaryDetail[] }) {
  return (
    <section id="rankings" className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">
            注目ランキング
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-text)] md:text-4xl">
            シーズンの見どころを要点で整理。
          </h2>
        </div>
        <p className="max-w-[32rem] text-sm leading-7 text-[var(--color-text-muted)]">
          総合順位に入る前に、どの選手がどの指標で抜けているのかを短く把握できるようにしています。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const ranked = [...players].sort((a, b) => metric.score(b) - metric.score(a));
          const leader = ranked[0];

          return (
            <motion.article
              key={metric.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              className="rounded-[30px] border border-[var(--color-border)] bg-[color:rgba(255,255,255,0.7)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
                {metric.description}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--color-text)]">{metric.label}</h3>

              {leader ? (
                <>
                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                        {leader.name}
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-text-subtle)]">
                        {metric.formatter(leader)}
                      </div>
                      {metric.detail?.(leader) ? (
                        <div className="mt-1 text-xs text-[var(--color-text-subtle)]">
                          {metric.detail(leader)}
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
                      首位
                    </span>
                  </div>

                  <div className="mt-6 space-y-2">
                    {ranked.slice(1, 4).map((player, index) => (
                      <div
                        key={`${metric.id}-${player.id}`}
                        className="flex flex-col gap-2 rounded-[20px] border border-[var(--color-border)] bg-white/72 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-inverse)] text-xs font-semibold text-white">
                            {index + 2}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-[var(--color-text)]">{player.name}</div>
                            {metric.detail?.(player) ? (
                              <div className="text-xs text-[var(--color-text-subtle)]">
                                {metric.detail(player)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-sm text-[var(--color-text-subtle)] sm:text-right">{metric.formatter(player)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
