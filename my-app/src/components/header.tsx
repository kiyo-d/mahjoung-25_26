import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function HeaderBar({ totalHands }: { totalHands: number }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b-2 border-emerald-400 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4 sm:px-6 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col gap-2"
        >
          <h1 className="m-0 text-pretty text-xl font-black tracking-tight text-emerald-50 sm:text-3xl">
            第<span className="mx-1 text-emerald-400 drop-shadow-[0_0_10px_#065f46]">2</span>試合
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center rounded-md border border-emerald-700/80 bg-emerald-900/40 px-2.5 py-1 text-emerald-200">
              総局数 / {totalHands}局
            </span>
            <span className="inline-flex items-center rounded-md border border-emerald-700/80 bg-emerald-900/40 px-2.5 py-1 text-emerald-200">
              流局数 / 5局
            </span>
          </div>
        </motion.div>
        <div className="flex items-center justify-start gap-2 rounded-md border border-emerald-600 bg-emerald-900/20 px-2.5 py-1.5 text-xs text-emerald-300 sm:justify-end sm:px-3 sm:text-base sm:justify-self-end sm:self-start">
          <Calendar className="h-4 w-4" />
          <span className="whitespace-nowrap">10月21日</span>
        </div>
      </div>
    </header>
  );
}
