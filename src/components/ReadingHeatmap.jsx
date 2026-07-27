import React from 'react';

export default function ReadingHeatmap({ heatmapData }) {
  // 定义颜色梯度 (从无阅读到高强度阅读)
  const getColorClass = (count) => {
    switch (count) {
      case 1: return "bg-emerald-950 border-emerald-900";
      case 2: return "bg-emerald-700 border-emerald-600";
      case 3: return "bg-emerald-500 border-emerald-400";
      default: return "bg-zinc-800/50 border-zinc-700/30";
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">阅读热力图</h3>
        <span className="text-xs text-zinc-400">近 90 天记录</span>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
        {heatmapData.map((item, idx) => (
          <div
            key={idx}
            title={`${item.date}: 强度 ${item.count}`}
            className={`w-3.5 h-3.5 rounded-sm border ${getColorClass(item.count)} transition-all hover:scale-125`}
          />
        ))}
      </div>
    </div>
  );
}