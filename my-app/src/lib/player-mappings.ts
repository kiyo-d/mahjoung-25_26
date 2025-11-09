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
  KIYO: "#FFB7C5",
  YAMADA: "#0077CC",
  KOTARO: "#FF2D9C",
  REI: "#eab308",
  YOSHITANI: "#B49657",
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
