import React from 'react';

export default function RecentBooks({ books }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">近期在读与架上藏书</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="flex space-x-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/60">
            <img src={book.cover} alt={book.title} className="w-16 h-22 object-cover rounded-md shadow-md" />
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200 line-clamp-1">{book.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{book.author}</p>
                <span className="inline-block text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded mt-2">{book.category}</span>
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>阅读进度</span>
                  <span>{book.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${book.progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}