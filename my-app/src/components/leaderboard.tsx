import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerSummaryDetail } from "@/data/player-summary";

type LeaderboardRow = {
  rank: number;
  team: string;
  tag?: string;
  color?: string;
  points: number;
  diff: string | number;
  games: number;
  trend?: number;
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

    function drawArrow(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      dir: "up" | "down",
    ) {
      context.save();
      context.translate(x, y);
      context.beginPath();
      if (dir === "up") {
        context.moveTo(0, 10);
        context.lineTo(8, -6);
        context.lineTo(-8, -6);
      } else {
        context.moveTo(0, -10);
        context.lineTo(8, 6);
        context.lineTo(-8, 6);
      }
      context.closePath();
      context.fillStyle = dir === "up" ? "#10b981" : "#ef4444";
      context.fill();
      context.restore();
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

      context.fillStyle = "#fff";
      context.font = '28px "Yu Gothic UI", Meiryo, sans-serif';
      context.textBaseline = "top";
      context.fillText("最終累計スコア", 4, -2);

      context.font = "14px sans-serif";
      context.fillStyle = "rgba(255,255,255,0.85)";
      const rightSectionWidth = w - rightX;
      context.fillText("チーム / プレイヤー", 8, 22);
      context.fillText("トータルポイント", rightX + rightSectionWidth * 0.35, 22);
      context.fillText("ポイント差", rightX + rightSectionWidth * 0.66, 22);
      context.fillText("試合数", rightX + rightSectionWidth * 0.9, 22);

      data.forEach((row, index) => {
        const y = index * rowH + 54;
        if (index % 2 === 1) {
          context.fillStyle = "rgba(255,255,255,0.03)";
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

        roundRect(
          context,
          0,
          y + barPad / 2,
          barW - 8,
          rowH - barPad,
          6,
          true,
          false,
          "rgba(17,17,17,0.55)",
        );
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

        context.fillStyle = "rgba(0,0,0,0.55)";
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
        context.fillStyle = "#fff";
        context.font = "20px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(row.rank.toString(), -padding + 26, y + rowH / 2);

        context.font = "12px sans-serif";
        context.fillStyle = "rgba(255,255,255,0.85)";
        context.textAlign = "left";
        context.fillText((row.tag ?? "").toUpperCase(), 8, y + 8);

        context.font = 'bold 20px "Yu Gothic UI", Meiryo, sans-serif';
        context.fillStyle = "rgba(255,255,255,0.95)";
        context.fillText(row.team, 8, y + rowH / 2 - 10);

        context.textAlign = "right";
        context.font = '28px "Segoe UI", sans-serif';
        context.fillStyle = "rgba(255,255,255,0.95)";
        const pointsX = rightX + rightSectionWidth * 0.35 + 60;
        context.fillText(row.points.toFixed(1), pointsX, y + rowH / 2 - 12);

        context.font = "16px sans-serif";
        context.fillStyle = "rgba(255,255,255,0.85)";
        const diffX = rightX + rightSectionWidth * 0.66 + 16;
        context.fillText(String(row.diff), diffX, y + rowH / 2 - 6);

        context.fillStyle = "rgba(255,255,255,0.85)";
        const gamesX = rightX + rightSectionWidth * 0.92;
        context.fillText(`${row.games} 戦`, gamesX, y + rowH / 2 - 6);

        if (row.trend && row.trend !== 0) {
          drawArrow(context, pointsX + 16, y + rowH / 2 - 4, row.trend > 0 ? "up" : "down");
        }
      });

      context.restore();

      context.fillStyle = "rgba(255,255,255,0.04)";
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

    return sorted.map((player, index) => {
      const history = player.rankHistory.filter((entry) => typeof entry.rank === "number");
      const lastRank = history[history.length - 1]?.rank ?? null;
      const prevRank = history[history.length - 2]?.rank ?? null;
      const trend =
        prevRank && lastRank
          ? Math.sign(prevRank - lastRank) * Math.min(Math.abs(prevRank - lastRank), 3)
          : 0;
      const diffValue = player.totalScore - leader;
      const formattedDiff = diffValue === 0
        ? "±0.0"
        : `${diffValue > 0 ? "+" : ""}${diffValue.toFixed(1)}`;

      return {
        rank: index + 1,
        team: player.name,
        tag: player.id,
        color: player.color,
        points: player.totalScore,
        diff: formattedDiff,
        games: player.gamesPlayed,
        trend,
      } satisfies LeaderboardRow;
    });
  }, [players]);

  const MIN_CANVAS_WIDTH = 960;
  const hasMeasured = containerWidth > 0;
  const canvasWidth = hasMeasured ? Math.max(containerWidth, MIN_CANVAS_WIDTH) : 0;
  const isScrollable = hasMeasured && containerWidth < MIN_CANVAS_WIDTH;

  return (
    <Card className="bg-neutral-900/60 border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-neutral-100">リーダーボード</CardTitle>
        <p className="text-sm text-neutral-400">最終累計スコアのランキング</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          <div
            ref={scrollRef}
            className="w-full overflow-x-auto"
          >
            <div className="min-w-[960px]">
              {canvasWidth > 0 ? (
                <LeaderboardCanvas
                  rows={rows}
                  width={canvasWidth}
                  height={Math.max(360, rows.length * 60 + 120)}
                />
              ) : null}
            </div>
          </div>
          {isScrollable ? (
            <div className="pointer-events-none absolute inset-y-3 right-0 w-16 bg-gradient-to-l from-neutral-900/90 to-transparent flex flex-col items-center justify-center text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-300">
              <span className="rotate-90">Swipe</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
