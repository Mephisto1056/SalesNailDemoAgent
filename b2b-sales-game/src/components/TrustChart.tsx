'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrustTrend } from '@/types';

interface TrustChartProps {
  data: TrustTrend[];
}

export function TrustChart({ data }: TrustChartProps) {
  // Transform data for Recharts: Group by turn
  // Input: [{ turn: 1, npc: "A", trust: 50 }, { turn: 1, npc: "B", trust: 20 }, ...]
  // Output: [{ name: "Turn 1", "A": 50, "B": 20 }, ...]

  const chartData = React.useMemo(() => {
    const turns = Array.from(new Set(data.map(d => d.turn))).sort((a, b) => a - b);
    const npcs = Array.from(new Set(data.map(d => d.npc_name)));

    return turns.map(turn => {
      const turnData: Record<string, string | number> = { name: `Round ${turn}` };
      npcs.forEach(npc => {
        const record = data.find(d => d.turn === turn && d.npc_name === npc);
        if (record) {
          turnData[npc] = record.trust_score;
        }
      });
      return turnData;
    });
  }, [data]);

  const npcs = Array.from(new Set(data.map(d => d.npc_name)));
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57"];

  return (
    <div className="w-full h-[300px] bg-slate-900/50 p-4 rounded-xl border border-white/10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend />
          {npcs.map((npc, index) => (
            <Line 
              key={npc}
              type="monotone" 
              dataKey={npc} 
              stroke={colors[index % colors.length]} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
