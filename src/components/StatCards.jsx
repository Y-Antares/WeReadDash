import React from 'react';
import { BookOpen, Clock, Award, FileText } from 'lucide-react';

export default function StatCards({ user }) {
  const hours = Math.floor(user.totalReadingTimeMinutes / 60);

  const stats = [
    { title: "总阅读时长", value: `${hours} 小时`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "累计读书天数", value: `${user.readingDays} 天`, icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "已读完书籍", value: `${user.completedBooksCount} 本`, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "划线与笔记", value: `${user.notesCount} 条`, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400">{item.title}</p>
                <h3 className="text-2xl font-bold text-zinc-100 mt-1">{item.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}