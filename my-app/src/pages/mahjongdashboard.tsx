import { useMemo } from "react";
import { HeaderBar } from "@/components/header";


import { timeline } from "@/data/timeline";

export default function MahjongDashboard() {
    const totalHands = useMemo(() => timeline.length, []);
    return (
      <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_#0f0f0f,_#000)] text-neutral-100">
        <HeaderBar totalHands={totalHands} />
        
        <footer className="max-w-none mx-auto px-6 pb-8 text-xs text-neutral-500">
          サンプルUI。データはダミー値。Excel/CSV → JSON連携を想定。
        </footer>
      </div>
    );
  }