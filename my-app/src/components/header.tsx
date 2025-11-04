import { Calendar} from "lucide-react";
import { motion } from "framer-motion";


  

export function HeaderBar({ totalgames, totalplayers, date_start, date_end, generated_at}: { totalgames: number, totalplayers: number, date_start: string, date_end: string, generated_at: string }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70 border-b-2 border-emerald-400 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
    <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
    <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="m-0 text-2xl sm:text-3xl font-black tracking-tight text-emerald-50">
    20<span className="mx-1 text-emerald-400 drop-shadow-[0_0_10px_#065f46]">25-26</span>シーズン
    <span className="align-middle ml-3 text-xs sm:text-sm px-2.5 py-1 rounded-md border border-emerald-700/80 bg-emerald-900/40 text-emerald-200">総対局数 / {totalgames}局</span>
    <span className="align-middle ml-2 text-xs sm:text-sm px-2.5 py-1 rounded-md border border-emerald-700/80 bg-emerald-900/40 text-emerald-200">参加人数 / {totalplayers}人</span>
    <span className="allign-middle ml-2 text-xs sm:text-sm px-2.5 py-1 rounded-md">最終更新日時: {generated_at}</span>
    </motion.h1>
    <div className="flex items-center gap-2 text-emerald-300 text-sm sm:text-base border border-emerald-600 rounded-md px-3 py-1 bg-emerald-900/20">
    <Calendar className="w-4 h-4" /> {date_start}~{date_end}
    </div>
    </div>
    </header>
  );
}