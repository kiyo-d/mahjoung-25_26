import { ArrowUpRight, Calendar, Clock3, Menu, X } from "lucide-react";
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

const navItems = [
  { label: "概要", href: "#overview" },
  { label: "注目指標", href: "#rankings" },
  { label: "対戦比較", href: "#head-to-head" },
  { label: "選手詳細", href: "#players" },
  { label: "対局履歴", href: "#history" },
];

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
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color:rgba(251,249,244,0.82)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <a href="#overview" className="flex min-w-0 items-center gap-4 no-underline">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[var(--shadow-subtle)]">
              <img src={crest} alt="麻雀エンブレム" className="h-6 w-6" loading="lazy" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-text-subtle)]">
                麻雀アナリティクス
              </p>
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="truncate font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-text)] md:text-2xl">
                  {seasonLabel}
                </span>
                <span className="text-sm text-[var(--color-text-subtle)]">シーズンダッシュボード</span>
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-[var(--color-text-subtle)] xl:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="font-medium transition hover:text-[var(--color-text)]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {seasonOptions.length > 1 ? (
              <label className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2 text-xs text-[var(--color-text-subtle)] shadow-[var(--shadow-subtle)]">
                <span className="uppercase tracking-[0.26em]">シーズン</span>
                <select
                  value={selectedSeasonIndex}
                  onChange={(event) => onSelectSeason?.(Number(event.target.value))}
                  className="bg-transparent text-sm font-semibold text-[var(--color-text)] outline-none"
                  aria-label="シーズンを選択"
                >
                  {seasonOptions.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <a
              href="#players"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-inverse)] px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:translate-y-[-1px] hover:opacity-95"
            >
              選手詳細へ
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-2 text-[var(--color-text)] md:hidden"
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-3 grid gap-2 md:hidden">
          {seasonOptions.length > 1 ? (
            <label className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-[var(--shadow-subtle)]">
              <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">シーズン</span>
              <select
                value={selectedSeasonIndex}
                onChange={(event) => onSelectSeason?.(Number(event.target.value))}
                className="min-w-0 bg-transparent text-right font-semibold outline-none"
                aria-label="シーズンを選択"
              >
                {seasonOptions.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text-subtle)]">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-subtle)]">
              <div className="text-[11px] uppercase tracking-[0.28em]">対局数</div>
              <div className="mt-2 font-mono text-base text-[var(--color-text)]">{totalgames.toLocaleString()}</div>
            </div>
            <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-subtle)]">
              <div className="text-[11px] uppercase tracking-[0.28em]">期間</div>
              <div className="mt-2 text-sm text-[var(--color-text)]">
                {date_start} 〜 {date_end}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 hidden flex-wrap gap-2 text-sm text-[var(--color-text-subtle)] md:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 shadow-[var(--shadow-subtle)]">
            <span className="text-[11px] uppercase tracking-[0.28em]">対局数</span>
            <span className="font-mono text-[var(--color-text)]">{totalgames.toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 shadow-[var(--shadow-subtle)]">
            <span className="text-[11px] uppercase tracking-[0.28em]">参加人数</span>
            <span className="font-mono text-[var(--color-text)]">{totalplayers.toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 shadow-[var(--shadow-subtle)]">
            <Calendar className="h-4 w-4" />
            <span>
              {date_start} 〜 {date_end}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 shadow-[var(--shadow-subtle)]">
            <Clock3 className="h-4 w-4" />
            <span>更新 {generated_at}</span>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 space-y-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-panel)] md:hidden">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] no-underline"
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text-subtle)]">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.28em]">参加人数</div>
                <div className="mt-2 font-mono text-base text-[var(--color-text)]">{totalplayers.toLocaleString()}</div>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.28em]">更新</div>
                <div className="mt-2 text-sm text-[var(--color-text)]">{generated_at}</div>
              </div>
            </div>

            <a
              href="#players"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-surface-inverse)] px-4 py-2.5 text-sm font-semibold text-white no-underline"
              onClick={closeMenu}
            >
              選手詳細へ
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        ) : null}
      </div>
    </header>
  );
}
