
import { Calendar, Clock3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import crest from "@/assets/mahjong-emblem.svg";

export function HeaderBar({ totalgames, totalplayers, date_start, date_end, generated_at }: {
  totalgames: number;
  totalplayers: number;
  date_start: string;
  date_end: string;
  generated_at: string;
}) {
  return (
    <header className="sticky top-0 z-30 overflow-hidden border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl shadow-2xl shadow-black/50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-400/5" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rotate-[12deg] opacity-10 blur-[1px]">
        <img src={crest} alt="Mahjong crest watermark" className="h-full w-full" loading="lazy" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/40 via-teal-400/40 to-cyan-400/30 opacity-70 blur-xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-neutral-900/90 shadow-lg shadow-emerald-900/40 ring-1 ring-white/5">
                <img src={crest} alt="Mahjong crest" className="h-10 w-10" loading="lazy" />
              </div>
            </div>
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/90"
              >
                mahjong analytics / シーズンレポート
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45 }}
                className="flex flex-wrap items-baseline gap-2 text-white"
              >
                <span className="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-200 bg-clip-text text-transparent">2025-26</span>
                <span className="text-lg font-semibold text-neutral-400">SEASON</span>
              </motion.div>
              <p className="text-sm text-neutral-400">統計をなめらかに眺められるよう、カードを整えたダッシュボードです。</p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="hidden items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-neutral-50 shadow-lg shadow-black/30 lg:flex"
          >
            <Calendar className="h-4 w-4 text-emerald-200" />
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">期間</span>
              <span className="font-mono text-sm text-white">{date_start} <span className="text-emerald-400/70">→</span> {date_end}</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.45 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900/90 to-neutral-950/70 px-4 py-3 shadow-[0_18px_50px_-40px_rgba(16,185,129,0.6)]">
            <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                総対局数
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-emerald-100">games</span>
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-emerald-200">{totalgames.toLocaleString()}</div>
            <p className="text-xs text-neutral-500">サンプルデータを用いた累計値</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900/90 via-neutral-900/70 to-neutral-950/80 px-4 py-3 shadow-[0_18px_50px_-40px_rgba(59,130,246,0.55)]">
            <div className="pointer-events-none absolute -left-6 -bottom-6 h-16 w-16 rounded-full bg-sky-400/10 blur-2xl" />
            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 rotate-12 text-sky-300" />
                参加人数
              </span>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-sky-100">players</span>
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-sky-200">{totalplayers.toLocaleString()}</div>
            <p className="text-xs text-neutral-500">参加者のユニーク人数を集計</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900/90 via-neutral-900/80 to-neutral-950/80 px-4 py-3 shadow-[0_18px_50px_-40px_rgba(244,114,182,0.45)]">
            <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full bg-fuchsia-400/10 blur-2xl" />
            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-fuchsia-300" />
                最終更新
              </span>
              <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-fuchsia-100">timestamp</span>
            </div>
            <div className="mt-2 text-lg font-semibold text-neutral-100">{generated_at}</div>
            <p className="text-xs text-neutral-500">ダッシュボード生成日時</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

