// src/components/Dashboard.jsx
import React, { useState } from 'react';
import StatCards from './StatCards.jsx';
import ReadingTrendChart from './ReadingTrendChart.jsx';
import ReadingHeatmap from './ReadingHeatmap.jsx';
import RecentBooks from './RecentBooks.jsx';
import FriendModal from './FriendModal.jsx';

export default function Dashboard({ myData }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [friendData, setFriendData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCompare = async () => {
    if (!apiKeyInput.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/read-data.json?apiKey=${encodeURIComponent(apiKeyInput.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setFriendData(data);
        setIsModalOpen(true);
      } else {
        setErrorMsg(data.error || '获取失败，请检查 API Key');
      }
    } catch (err) {
      setErrorMsg('网络请求错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部个人信息与比对工具栏 */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-zinc-800 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <img src={myData.user.avatar} className="w-10 h-10 rounded-full border border-zinc-700" alt="Avatar" />
          <div>
            <h1 className="text-xl font-bold">{myData.user.name} 的阅读看板</h1>
            <p className="text-xs text-zinc-500">静态生成，数据来自 GitHub Actions</p>
          </div>
        </div>

        {/* 比对输入区 */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="输入朋友的 API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-100 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors w-48 sm:w-64"
            />
            <button
              onClick={handleCompare}
              disabled={loading || !apiKeyInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? '加载中...' : '查看朋友'}
            </button>
          </div>
          {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
        </div>
      </header>

      {/* 我的数据面板 */}
      <StatCards user={myData.user} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadingTrendChart data={myData.weeklyTrend} />
        <ReadingHeatmap heatmapData={myData.heatmap} />
      </div>
      <RecentBooks books={myData.books} />

      {/* 朋友的弹窗面板 */}
      {isModalOpen && friendData && (
        <FriendModal 
          friendData={friendData} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}