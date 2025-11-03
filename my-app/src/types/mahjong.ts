// src/types/mahjong.ts
export type TimelinePoint = {
    hand: string;
    TAKIZAWA: number; KATSU: number; AGIHARA: number; TAI: number;
  };
  
  export type Player = {
    id: "TAKIZAWA" | "KATSU" | "AGIHARA" | "TAI";
    name: string; team: string; color: string;
  };
  
  export type RecentMatch = {
    date: string; room: string; rank: 1|2|3|4; score: number;
    nameplate: string; points: number;
  };
  
  export type PieDatum = { name: string; value: number; };
  export type BarDatum = { name: string; value: number; };