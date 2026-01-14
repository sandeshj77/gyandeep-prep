
import React from 'react';
import { UserProfile, Question, Category } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Flame, Target, Trophy, TrendingUp, Award, BookOpen, ChevronRight, X, Play } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  categories: Category[];
  allQuestions: Question[];
  onSelectCategory: (catId: string, type?: string | null) => void;
}

const mockPerformanceData = [
  { name: 'Mon', score: 40 },
  { name: 'Tue', score: 30 },
  { name: 'Wed', score: 65 },
  { name: 'Thu', score: 45 },
  { name: 'Fri', score: 85 },
  { name: 'Sat', score: 70 },
  { name: 'Sun', score: 90 },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, categories, allQuestions, onSelectCategory }) => {
  const [selectedCatForType, setSelectedCatForType] = React.useState<string | null>(null);
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const getTypesForCategory = (catId: string) => {
    const questions = allQuestions.filter(q => q.category === catId);
    const types = new Set<string>();
    questions.forEach(q => {
      if (q.type) types.add(q.type);
    });
    return Array.from(types);
  };

  const handleCategoryClick = (catId: string) => {
    const types = getTypesForCategory(catId);
    if (types.length > 0) {
      setSelectedCatForType(catId);
    } else {
      onSelectCategory(catId, null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">Namaste, {user.name}! 🙏</h2>
        <p className="mt-2 text-blue-100 italic text-lg max-w-2xl">"{quote}"</p>
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
            <Flame className="text-orange-400" size={18} />
            <span className="font-semibold">{user.streak} Day Streak</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
            <Award className="text-yellow-400" size={18} />
            <span className="font-semibold">Rank #{user.rank}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Played', value: user.totalQuizzes, icon: <BookOpen className="text-blue-500" />, color: 'bg-blue-50' },
          { label: 'Avg Accuracy', value: `${user.accuracy}%`, icon: <Target className="text-green-500" />, color: 'bg-green-50' },
          { label: 'Global Rank', value: user.rank, icon: <Trophy className="text-yellow-600" />, color: 'bg-yellow-50' },
          { label: 'Max Streak', value: `${user.maxStreak} Days`, icon: <TrendingUp className="text-purple-500" />, color: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-2xl border border-slate-100 shadow-sm`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white p-2 rounded-lg shadow-sm">{stat.icon}</div>
              <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recommended Quizzes */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Select Preparation Module</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="bg-white hover:bg-blue-50 p-6 rounded-3xl border border-slate-200 text-center transition-all group hover:border-blue-200 shadow-sm relative overflow-hidden"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="font-bold text-slate-800 group-hover:text-blue-700">{cat.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">
                {allQuestions.filter(q => q.category === cat.id).length} MCQs Available
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Performance Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="score" stroke="#1d4ed8" strokeWidth={3} dot={{r: 4, fill: '#1d4ed8'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Quick Access */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Mastery Levels</h3>
          <div className="space-y-4">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{cat.name}</span>
                  <span className="text-slate-500">{Math.floor(Math.random() * 40) + 20}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.floor(Math.random() * 40) + 20}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Topic Picker Modal */}
      {selectedCatForType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">Select Sub-Topic</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Focus your preparation</p>
              </div>
              <button onClick={() => setSelectedCatForType(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => { onSelectCategory(selectedCatForType, null); setSelectedCatForType(null); }}
                className="w-full flex justify-between items-center p-5 bg-slate-50 hover:bg-blue-50 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-all group"
              >
                <div className="text-left">
                  <div className="font-bold text-slate-800 group-hover:text-blue-700">Mix Practice (All Topics)</div>
                  <div className="text-[10px] text-slate-400 font-black">Comprehensive Review</div>
                </div>
                <Play size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>

              {getTypesForCategory(selectedCatForType).map(type => (
                <button 
                  key={type}
                  onClick={() => { onSelectCategory(selectedCatForType, type); setSelectedCatForType(null); }}
                  className="w-full flex justify-between items-center p-5 bg-white hover:bg-blue-50 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-all group"
                >
                  <div className="text-left">
                    <div className="font-bold text-slate-800 group-hover:text-blue-700">{type}</div>
                    <div className="text-[10px] text-slate-400 font-black">
                      {allQuestions.filter(q => q.category === selectedCatForType && q.type === type).length} Specialized MCQs
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
