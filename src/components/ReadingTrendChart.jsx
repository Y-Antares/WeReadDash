import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function ReadingTrendChart({ data }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">近 7 天阅读时长趋势 (分钟)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#f4f4f5' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMinutes)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}