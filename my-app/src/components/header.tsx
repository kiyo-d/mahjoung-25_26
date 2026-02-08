
import { Calendar, Clock3, Menu, X } from "lucide-react";
import { useState } from "react";

import crest from "@/assets/mahjong-emblem.svg";

type HeaderBarProps = {
  totalgames: number;
  totalplayers: number;
  date_start: string;
  date_end: string;
  generated_at: string;
  seasonLabel: string;
  seasonOptions?: string[];
  selectedSeasonIndex?: number;
  onSelectSeason?: (index: number) => void;
};

export function HeaderBar({
  totalgames,
  totalplayers,
  date_start,
  date_end,
  generated_at,
  seasonLabel,
  seasonOptions = [],
  selectedSeasonIndex = 0,
  onSelectSeason,
}: HeaderBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { label: "サマリー", href: "#overview" },
    { label: "推移チャート", href: "#trend" },
    { label: "対局履歴", href: "#history" },
  ];

  return (
    <header className="z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <img src={crest} alt="Mahjong crest" className="h-6 w-6" loading="lazy" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">mahjong analytics</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">{seasonLabel}</span>
                <span className="text-sm text-[var(--color-text-subtle)]">Season Report</span>
                {seasonOptions.length > 1 ? (
                  <select
                    value={selectedSeasonIndex}
                    onChange={(e) => onSelectSeason?.(Number(e.target.value))}
                    className="ml-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text)] focus:outline-none"
                    aria-label="シーズン切り替え"
                  >
                    {seasonOptions.map((label, idx) => (
                      <option key={label} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[var(--color-text-subtle)] md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="font-medium hover:text-[var(--color-text)]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#history"
              className="rounded-full bg-[var(--color-text)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              対局履歴を見る
            </a>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text)] md:hidden"
            aria-label="メニューを開閉"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {isMenuOpen ? (
          <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-subtle)] md:hidden">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="block font-medium text-[var(--color-text)]">
                {item.label}
              </a>
            ))}
            <a
              href="#history"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-text)] px-4 py-2 text-sm font-semibold text-white"
            >
              対局履歴を見る
            </a>
          </div>
        ) : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
              総対局数
              <span className="text-[10px] tracking-[0.3em] text-[var(--color-text-subtle)]">games</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{totalgames.toLocaleString()}</div>
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">サンプルデータを用いた累計値</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
              参加人数
              <span className="text-[10px] tracking-[0.3em] text-[var(--color-text-subtle)]">players</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{totalplayers.toLocaleString()}</div>
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">参加者のユニーク人数を集計</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
              シーズン期間
              <span className="text-[10px] tracking-[0.3em] text-[var(--color-text-subtle)]">period</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-text)]">
              <Calendar className="h-4 w-4 text-[var(--color-text-subtle)]" />
              <span className="font-medium">{date_start} → {date_end}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
              <Clock3 className="h-3.5 w-3.5" />
              <span>最終更新 {generated_at}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
