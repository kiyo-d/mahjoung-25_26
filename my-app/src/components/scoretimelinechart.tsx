import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TimelinePoint, Player } from "@/types/propsType";

export function ScoreTimelineChart({ timeline, players }:{
  timeline: TimelinePoint[]; players: Player[];
}) {
  return (
    <Card className="bg-neutral-900/90 border-neutral-800">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-neutral-200">シーズンスコア推移</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hand" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 48000]} stroke="#a1a1aa" tickFormatter={(v)=>v.toLocaleString()} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: 8 }} labelStyle={{ color: "#e5e7eb" }} />
              {players.map(p => (
                <Line key={p.id} type="monotone" dataKey={p.id} stroke={p.color} strokeWidth={2.4} dot={false} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}