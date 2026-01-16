import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerSummaryDetail } from "@/data/player-summary";

type LeaderboardRow = {
  rank: number;
  team: string;
  tag?: string;
  color?: string;
  points: number;
  diffToLeader: string;
  diffToPrevious: string;
  games: number;
};

type LeaderboardCanvasProps = {
  rows: LeaderboardRow[];
  width?: number;
  height?: number;
};

function LeaderboardCanvas({ rows, width = 1200, height = 520 }: LeaderboardCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    c.width = width * DPR;
    c.height = height * DPR;
    c.style.width = `${width}px`;
    c.style.height = `${height}px`;
    ctx.resetTransform?.();
    ctx.scale(DPR, DPR);

    function roundRect(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r = 6,
      fill?: boolean,
      stroke?: boolean,
      fillColor?: string,
    ) {
      context.beginPath();
      context.moveTo(x + r, y);
      context.arcTo(x + w, y, x + w, y + h, r);
      context.arcTo(x + w, y + h, x, y + h, r);
      context.arcTo(x, y + h, x, y, r);
      context.arcTo(x, y, x + w, y, r);
      context.closePath();
      if (fill) {
        if (fillColor) {
          context.save();
          context.fillStyle = fillColor;
          context.fill();
          context.restore();
        } else {
          context.fill();
        }
      }
      if (stroke) {
        context.stroke();
      }
    }

    function hexToRgba(hex: string, a: number) {
      const cHex = hex.replace("#", "");
      const bigint = parseInt(cHex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function drawLeaderboard(
      context: CanvasRenderingContext2D,
      w: number,
      h: number,
      data: LeaderboardRow[],
    ) {
      const padding = 28;
      const rowCount = Math.max(data.length, 1);
      const minRowHeight = 52;
      const availableHeight = Math.max(h - padding * 2, rowCount * minRowHeight);
      const rowH = Math.floor(availableHeight / rowCount);
      const leftWidth = Math.round(w * 0.44);
      const rightX = leftWidth + padding;
      const barPad = 6;

      context.clearRect(0, 0, w, h);
      context.fillStyle = "rgba(0,0,0,0)";
      context.fillRect(0, 0, w, h);

      context.save();
      context.translate(padding, padding);

      context.fillStyle = "#111111";
      context.font = '26px "Yu Gothic UI", Meiryo, sans-serif';
      context.textBaseline = "top";
      context.fillText("最終累計スコア", 4, -2);

      context.font = "14px sans-serif";
      context.fillStyle = "rgba(17,17,17,0.75)";
      const rightSectionWidth = w - rightX;
      context.textAlign = "left";
      context.fillText("チーム / プレイヤー", 8, 22);
      context.textAlign = "right";
      context.fillText("トータルポイント", rightX + rightSectionWidth * 0.32 + 40, 22);
      context.fillText("首位との差", rightX + rightSectionWidth * 0.58 + 16, 22);
      context.fillText("上との差", rightX + rightSectionWidth * 0.75 + 16, 22);
      context.fillText("試合数", rightX + rightSectionWidth * 0.92, 22);

      data.forEach((row, index) => {
        const y = index * rowH + 54;
        if (index % 2 === 1) {
          context.fillStyle = "rgba(0,0,0,0.03)";
          roundRect(
            context,
            0,
            y,
            leftWidth + (w - rightX) - 10,
            rowH - 4,
            6,
            true,
            false,
          );
        }

        const barW = Math.min(leftWidth - 24, 360);
        const color = row.color ?? "#6b7280";

        roundRect(context, 0, y + barPad / 2, barW - 8, rowH - barPad, 6, true, false, "rgba(17,17,17,0.06)");
        context.fillStyle = hexToRgba(color, 0.12);
        roundRect(
          context,
          0,
          y + barPad / 2,
          barW - 8,
          rowH - barPad,
          6,
          true,
          false,
        );

        context.fillStyle = "rgba(17,17,17,0.08)";
        roundRect(
          context,
          -padding + 6,
          y + barPad / 2,
          40,
          rowH - barPad,
          6,
          true,
          false,
        );
        context.fillStyle = "#111111";
        context.font = "20px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(row.rank.toString(), -padding + 26, y + rowH / 2);

        context.font = "12px sans-serif";
        context.fillStyle = "rgba(17,17,17,0.7)";
        context.textAlign = "left";
        context.fillText((row.tag ?? "").toUpperCase(), 8, y + 8);

        context.font = 'bold 20px "Yu Gothic UI", Meiryo, sans-serif';
        context.fillStyle = "rgba(17,17,17,0.95)";
        context.fillText(row.team, 8, y + rowH / 2 - 10);

        context.textAlign = "right";
        context.font = '28px "Segoe UI", sans-serif';
        context.fillStyle = "rgba(17,17,17,0.95)";
        const pointsX = rightX + rightSectionWidth * 0.32 + 40;
        context.fillText(row.points.toFixed(1), pointsX, y + rowH / 2 - 12);

        context.font = "16px sans-serif";
        context.fillStyle = "rgba(17,17,17,0.7)";
        const diffLeaderX = rightX + rightSectionWidth * 0.58 + 16;
        context.fillText(row.diffToLeader, diffLeaderX, y + rowH / 2 - 6);

        const diffPrevX = rightX + rightSectionWidth * 0.75 + 16;
        context.fillText(row.diffToPrevious, diffPrevX, y + rowH / 2 - 6);

        context.fillStyle = "rgba(17,17,17,0.7)";
        const gamesX = rightX + rightSectionWidth * 0.92;
        context.fillText(`${row.games} 戦`, gamesX, y + rowH / 2 - 6);

      });

      context.restore();

      context.fillStyle = "rgba(0,0,0,0.04)";
      roundRect(context, padding, h - 34, w - padding * 2, 20, 6, true, false);
    }

    const rowCount = Math.max(rows.length, 1);
    const minRowHeight = 52;
    const padding = 28;
    const computedHeight = Math.max(height, padding * 2 + rowCount * minRowHeight);
    if (computedHeight !== height) {
      const DPR = window.devicePixelRatio || 1;
      c.height = computedHeight * DPR;
      c.style.height = `${computedHeight}px`;
      ctx.resetTransform?.();
      ctx.scale(DPR, DPR);
    }

    drawLeaderboard(ctx, width, computedHeight, rows);
  }, [rows, width, height]);

  return <canvas ref={ref} />;
}

export function Leaderboard({ players }: { players: PlayerSummaryDetail[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateWidth = () => {
      setContainerWidth(Math.floor(element.getBoundingClientRect().width));
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const rows = useMemo<LeaderboardRow[]>(() => {
    if (!players.length) return [];

    const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const leader = sorted[0]?.totalScore ?? 0;

    const formatDiff = (value: number | null) => {
      if (value === null) return "—";
      if (value === 0) return "±0.0";
      return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
    };

    return sorted.map((player, index) => {
      const diffToLeaderValue = player.totalScore - leader;
      const previousScore = index > 0 ? sorted[index - 1]?.totalScore ?? null : null;
      const diffToPreviousValue = previousScore === null
        ? null
        : previousScore - player.totalScore;

      return {
        rank: index + 1,
        team: player.name,
        tag: player.id,
        color: player.color,
        points: player.totalScore,
        diffToLeader: formatDiff(diffToLeaderValue),
        diffToPrevious: formatDiff(diffToPreviousValue),
        games: player.gamesPlayed,
      } satisfies LeaderboardRow;
    });
  }, [players]);

  const MIN_CANVAS_WIDTH = 960;
  const hasMeasured = containerWidth > 0;
  const canvasWidth = hasMeasured ? Math.max(containerWidth, MIN_CANVAS_WIDTH) : 0;
  const isScrollable = hasMeasured && containerWidth < MIN_CANVAS_WIDTH;

  const podium = rows.slice(0, 3);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="relative z-10 pb-3">
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text)]">
          リーダーボード
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">
            ranking
          </span>
        </CardTitle>
        <p className="text-sm text-[var(--color-text-subtle)]">最終累計スコアのランキング</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {podium.map((item, index) => (
            <div
              key={item.team}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">#{item.rank}</p>
              <div className="mt-1 flex items-center justify-between text-sm text-[var(--color-text)]">
                <span className="font-semibold">{item.team}</span>
                <span className="font-mono text-[var(--color-text)]">{item.points.toFixed(1)}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-subtle)]">
                {index === 0 ? "首位" : index === 1 ? "2位" : "3位"} プレイヤー
              </p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-4">
        <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <div
            ref={scrollRef}
            className="w-full overflow-x-auto"
          >
            <div className="min-w-[960px]">
              {canvasWidth > 0 ? (
                <LeaderboardCanvas
                  rows={rows}
                  width={canvasWidth}
                  height={Math.max(380, rows.length * 60 + 140)}
                />
              ) : null}
            </div>
          </div>
          {isScrollable ? (
            <div className="pointer-events-none absolute inset-y-3 right-1 flex w-16 flex-col items-center justify-center text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--color-text-subtle)]">
              <span className="rotate-90">Swipe</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
