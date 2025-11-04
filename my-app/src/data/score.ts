import type { SeasonPayload, Player, PlayerId, TimelinePoint } from "@/types/propsType";

// 日本語名 → 内部ID
const NAME_TO_ID: Record<string, PlayerId> = {
  "きよ": "KIYO",
  "やまだ": "YAMADA",
  "こたろー": "KOTARO",
  "れい": "REI",
  "よしたに": "YOSHITANI",
  "ひなた": "HINATA",
};

// 線色（任意）
const ID_COLOR: Record<PlayerId, string> = {
  KIYO: "#22c55e",
  YAMADA: "#60a5fa",
  KOTARO: "#f97316",
  REI: "#eab308",
  YOSHITANI: "#a78bfa",
  HINATA: "#f43f5e",
};

// 表示順を固定（凡例や線順が安定）
const ORDER: PlayerId[] = ["KIYO", "YAMADA", "KOTARO", "REI", "YOSHITANI", "HINATA"];

// "YYYY-MM-DD" → "MM/DD"
function fmtMD(date: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, m, d] = date.split("-");
  return `${m}/${d}`;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10 + Number.EPSILON) / 10;
}

/**
 * JSON → { players, timeline } に変換
 * 方針:
 *  - timelineは累積（cumulative）
 *  - handは "MM/DD-n戦目"（同日内通番 n は1始まり）
 *  - 未参加は前回値を水平維持（carry-forward）
 */
export function buildChartData(payload: SeasonPayload): {
  players: Player[];
  timeline: TimelinePoint[];
} {
  const season = payload.seasons?.[0];
  if (!season) return { players: [], timeline: [] };

  // 1) Player配列を作成（名前→ID変換、色付与）
  const rawPlayers: Player[] = season.players
    .map((p) => {
      const id = NAME_TO_ID[p.name];
      if (!id) return null;
      return { id, name: p.name, color: ID_COLOR[id] };
    })
    .filter((x): x is Player => !!x);

  // 2) 固定順へ並べ替え（存在するもののみ）
  const players = ORDER
    .map((id) => rawPlayers.find((p) => p.id === id))
    .filter((p): p is Player => !!p);

  // 3) 累積バッファを0で初期化
  const cumulative: Record<PlayerId, number> = {
    KIYO: 0, YAMADA: 0, KOTARO: 0, REI: 0, YOSHITANI: 0, HINATA: 0,
  };

  // 4) 同日内通番のカウンタ
  const perDateCount = new Map<string, number>();

  // 5) 対局を時系列に処理し、行を構築
  const timeline: TimelinePoint[] = season.history.map((g, index) => {
    // 5-1) 同日通番を更新
    const nth = (perDateCount.get(g.date) ?? 0) + 1;
    perDateCount.set(g.date, nth);

    // 5-2) ラベル生成
    const handLabel = `${fmtMD(g.date)}-${nth}戦目`;
    const gameNumber = index + 1;

    // 5-3) まず全員に前回の累積値をコピー（未参加でも線が切れない）
    const row: TimelinePoint = {
      hand: handLabel,
      date: g.date,
      dailyIndex: nth,
      gameNumber,
    };
    for (const id of ORDER) {
      row[id] = roundToTenth(cumulative[id]);
    }

    // 5-4) 参加者のスコアを累積加算して上書き
    for (const entry of g.players) {
      const id = NAME_TO_ID[entry.name];
      if (!id) continue;
      const updated = cumulative[id] + entry.score;
      cumulative[id] = updated;             // 累積更新（丸めず保持）
      row[id] = roundToTenth(updated);      // 行へ反映（表示用に丸め）
    }

    return row;
  });

  return { players, timeline };
}
