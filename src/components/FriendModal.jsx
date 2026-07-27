// src/components/FriendModal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import StatCards from './StatCards.jsx';
import ReadingTrendChart from './ReadingTrendChart.jsx';
import ReadingHeatmap from './ReadingHeatmap.jsx';
import RecentBooks from './RecentBooks.jsx';

export default function FriendModal({ friendData, onClose }) {
  // 弹窗时锁定底层滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* 弹窗内容 */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* 弹窗顶部栏 */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <img src={friendData.user.avatar} className="w-8 h-8 rounded-full border border-zinc-700" alt="Avatar" />
            <h2 className="text-lg font-bold text-zinc-100">{friendData.user.name} 的阅读看板</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="关闭面板"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 弹窗滚动内容区 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <StatCards user={friendData.user} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReadingTrendChart data={friendData.weeklyTrend} />
            <ReadingHeatmap heatmapData={friendData.heatmap} />
          </div>
          <RecentBooks books={friendData.books} />
        </div>
        
      </div>
    </div>
  );
}