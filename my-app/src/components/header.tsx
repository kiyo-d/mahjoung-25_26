
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function HeaderBar({ totalgames, totalplayers, date_start, date_end, generated_at}: { totalgames: number, totalplayers: number, date_start: string, date_end: string, generated_at: string }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-neutral-950/50 border-b border-white/5 shadow-2xl shadow-black/50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-2"
        >
          <h1 className="m-0 text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">2025-26</span>
            <span className="text-neutral-500 font-light">SEASON</span>
          </h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-2 items-center"
          >
             <span className="text-xs sm:text-sm px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300">総対局数 <span className="text-emerald-400 font-mono font-bold ml-1">{totalgames}</span></span>
             <span className="text-xs sm:text-sm px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300">参加人数 <span className="text-emerald-400 font-mono font-bold ml-1">{totalplayers}</span></span>
             <span className="text-xs sm:text-sm px-2.5 py-1 text-neutral-500">Last update: {generated_at}</span>
          </motion.div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2 text-emerald-300 text-sm sm:text-base border border-emerald-500/20 rounded-full px-4 py-1.5 bg-emerald-500/10 self-end md:self-auto"
        >
          <Calendar className="w-4 h-4" /> 
          <span className="font-mono">{date_start}</span>
          <span className="text-emerald-500/50">→</span>
          <span className="font-mono">{date_end}</span>
        </motion.div>
      </div>
    </header>
  );
}

