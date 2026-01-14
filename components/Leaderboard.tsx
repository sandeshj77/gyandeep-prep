
import React from 'react';
import { Trophy, Medal, Star, Hash } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const mockLeaders = [
    { rank: 1, name: 'Suman Paudel', score: 14500, accuracy: 98, avatar: 'https://picsum.photos/id/64/100/100' },
    { rank: 2, name: 'Anjali Sharma', score: 14220, accuracy: 96, avatar: 'https://picsum.photos/id/65/100/100' },
    { rank: 3, name: 'Bikesh Shrestha', score: 13900, accuracy: 95, avatar: 'https://picsum.photos/id/66/100/100' },
    { rank: 4, name: 'Kiran Gurung', score: 12100, accuracy: 92, avatar: 'https://picsum.photos/id/67/100/100' },
    { rank: 5, name: 'Priya Thapa', score: 11850, accuracy: 94, avatar: 'https://picsum.photos/id/68/100/100' },
    { rank: 6, name: 'Roshan Karki', score: 11200, accuracy: 89, avatar: 'https://picsum.photos/id/69/100/100' },
  ];

  const [activeFilter, setActiveFilter] = React.useState('global');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Global Leaderboard</h2>
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex">
          {['global', 'monthly', 'category'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeFilter === f ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Rank 2 */}
        <div className="order-2 md:order-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center h-72 flex flex-col justify-center">
          <div className="relative inline-block mx-auto mb-4">
            <img src={mockLeaders[1].avatar} className="w-20 h-20 rounded-full border-4 border-slate-200" alt="" />
            <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">2</div>
          </div>
          <h3 className="font-bold text-lg">{mockLeaders[1].name}</h3>
          <p className="text-blue-700 font-bold">{mockLeaders[1].score.toLocaleString()} pts</p>
          <p className="text-xs text-slate-400 mt-2">{mockLeaders[1].accuracy}% Accuracy</p>
        </div>

        {/* Rank 1 */}
        <div className="order-1 md:order-2 bg-gradient-to-b from-blue-700 to-indigo-800 p-8 rounded-3xl shadow-2xl text-center h-80 flex flex-col justify-center transform md:scale-110 relative z-10 border-4 border-yellow-400">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-lg">
            <Trophy size={48} />
          </div>
          <div className="relative inline-block mx-auto mb-4">
            <img src={mockLeaders[0].avatar} className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl" alt="" />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 border-white">1</div>
          </div>
          <h3 className="font-bold text-xl text-white">{mockLeaders[0].name}</h3>
          <p className="text-yellow-300 font-bold text-lg">{mockLeaders[0].score.toLocaleString()} pts</p>
          <p className="text-xs text-blue-100 mt-2">{mockLeaders[0].accuracy}% Accuracy</p>
        </div>

        {/* Rank 3 */}
        <div className="order-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center h-64 flex flex-col justify-center">
          <div className="relative inline-block mx-auto mb-4">
            <img src={mockLeaders[2].avatar} className="w-18 h-18 rounded-full border-4 border-orange-200" alt="" />
            <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">3</div>
          </div>
          <h3 className="font-bold text-lg">{mockLeaders[2].name}</h3>
          <p className="text-blue-700 font-bold">{mockLeaders[2].score.toLocaleString()} pts</p>
          <p className="text-xs text-slate-400 mt-2">{mockLeaders[2].accuracy}% Accuracy</p>
        </div>
      </div>

      {/* Others List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {mockLeaders.slice(3).map((leader) => (
          <div key={leader.rank} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
            <div className="w-8 font-black text-slate-400 text-center">#{leader.rank}</div>
            <img src={leader.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt="" />
            <div className="flex-1">
              <div className="font-bold text-slate-800">{leader.name}</div>
              <div className="text-xs text-slate-400">Regular Preparing</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-700">{leader.score.toLocaleString()}</div>
              <div className="text-[10px] uppercase font-black text-slate-400">{leader.accuracy}% Acc.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
