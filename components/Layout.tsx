
import React from 'react';
import { Home, Trophy, User, Settings, LogOut, Menu, X, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Define nav items but filter based on role
  const navItems = isAdmin 
    ? [
        { id: 'admin', label: 'Admin Panel', icon: <Settings size={20} /> },
        { id: 'profile', label: 'My Account', icon: <User size={20} /> },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
        { id: 'quizzes', label: 'Quizzes', icon: <Database size={20} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
        { id: 'profile', label: 'Profile', icon: <User size={20} /> },
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-700 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-white text-blue-700 px-2 py-1 rounded">GD</span> ज्ञानदीप
        </h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <nav className={`
        fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-white border-r border-slate-200 z-40 flex flex-col
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            <span className="bg-blue-700 text-white px-2 py-1 rounded shadow-sm">GD</span> ज्ञानदीप
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {isAdmin ? 'System Administrator' : 'GyanDeep Prep Platform'}
          </p>
        </div>

        <div className="flex-1 px-4 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100' 
                  : 'text-slate-600 hover:bg-slate-50'}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold"
          >
            <LogOut size={20} />
            Exit System
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
};
