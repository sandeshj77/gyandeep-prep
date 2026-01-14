
import React from 'react';
import { Mail, Lock, User, Briefcase, ShieldCheck, ChevronDown } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    examPreference: 'Loksewa Aayog'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      name: formData.name || 'Student',
      email: formData.email,
      examPreference: formData.examPreference,
      isAdmin: formData.email.toLowerCase().includes('admin'),
      totalQuizzes: 0,
      accuracy: 0,
      rank: 1250,
      streak: 3,
      maxStreak: 12,
      badges: ['First Step']
    };
    onLogin(user);
  };

  const loginAsAdmin = () => {
    onLogin({
      name: 'GyanDeep Admin',
      email: 'admin@gyandeep.com',
      examPreference: 'All Exams',
      isAdmin: true,
      totalQuizzes: 0,
      accuracy: 100,
      rank: 1,
      streak: 99,
      maxStreak: 99,
      badges: ['System Master']
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-blue-700 p-8 text-white text-center">
          <div className="inline-block bg-white text-blue-700 p-3 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl font-bold">GD</span>
          </div>
          <h2 className="text-2xl font-bold">ज्ञानदीप (GyanDeep)</h2>
          <p className="opacity-90 mt-1">Nepal's #1 Preparation Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email or Phone</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                placeholder="Use 'admin' in email to manage"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Primary Exam Goal</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <select
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                value={formData.examPreference}
                onChange={e => setFormData({...formData, examPreference: e.target.value})}
              >
                <option value="Loksewa Aayog">Loksewa Aayog (Civil Service)</option>
                <option value="Banking & Finance">Banking & Finance</option>
                <option value="TSC">Teacher Service Commission</option>
                <option value="Security Forces">Nepal Police / Army</option>
                <option value="Aptitude Exams">Entrance / Aptitude</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-4 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-xl hover:shadow-blue-200/50 mt-4 transform active:scale-[0.98]">
            {isLogin ? 'Log In Now' : 'Create My Account'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-slate-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-3 text-slate-400">System Access</span></div>
          </div>

          <button 
            type="button"
            onClick={loginAsAdmin}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-slate-300 transform active:scale-[0.98]"
          >
            <ShieldCheck size={20} className="text-blue-400" /> Administrative Bypass
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-700 hover:text-blue-800 text-sm font-black uppercase tracking-wider underline decoration-2 underline-offset-4"
            >
              {isLogin ? "Join GyanDeep Today" : "Return to Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
