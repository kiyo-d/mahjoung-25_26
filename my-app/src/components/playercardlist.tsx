// src/components/mahjong/PlayerCardList.tsx
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { motion } from "framer-motion";
// import type { Player } from "@/types/propsType";

// export function PlayerCardList({ players }: { players: Player[] }) {
//   return (
//     <div className="space-y-4">
//       {players.map(p => (
//         <motion.div key={p.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
//           <Card className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-neutral-700 overflow-hidden">
//             <CardContent className="p-0">
//               <div className="flex items-center gap-4 p-4" style={{ backgroundImage: `linear-gradient(to right, ${p.color}1A 8%, rgba(30,30,30,0.9) 92%)` }}>
//                 <div className="w-12 h-12 rounded-2xl shrink-0 border border-white/20" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
//                 <div className="flex-1 min-w-0">
//                   <div className="text-lg font-semibold tracking-tight truncate">{p.name}</div>
//                   <div className="text-xs text-neutral-400 truncate">{p.team}</div>
//                 </div>
//                 <Badge className="bg-neutral-800/60 border-neutral-600">{p.id}</Badge>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   );
//}
