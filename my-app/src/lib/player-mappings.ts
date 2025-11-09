import type { PlayerId } from "@/types/propsType";

export const NAME_TO_ID: Record<string, PlayerId> = {
  "きよ": "KIYO",
  "やまだ": "YAMADA",
  "こたろー": "KOTARO",
  "れい": "REI",
  "よしたに": "YOSHITANI",
  "ひなた": "HINATA",
};

export const ID_TO_NAME: Record<PlayerId, string> = {
  KIYO: "きよ",
  YAMADA: "やまだ",
  KOTARO: "こたろー",
  REI: "れい",
  YOSHITANI: "よしたに",
  HINATA: "ひなた",
};

export const ID_COLOR: Record<PlayerId, string> = {
  KIYO: "#22c55e",
  YAMADA: "#60a5fa",
  KOTARO: "#f97316",
  REI: "#eab308",
  YOSHITANI: "#a78bfa",
  HINATA: "#f43f5e",
};

export const PLAYER_ORDER: PlayerId[] = [
  "KIYO",
  "YAMADA",
  "KOTARO",
  "REI",
  "YOSHITANI",
  "HINATA",
];
