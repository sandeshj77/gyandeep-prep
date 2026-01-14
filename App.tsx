
import React from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { QuizEngine } from './components/QuizEngine';
import { QuizSummary } from './components/QuizSummary';
import { Leaderboard } from './components/Leaderboard';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile, QuizResult, QuizSettings, Question, Category } from './types';
import { DEFAULT_QUIZ_SETTINGS, MOCK_QUESTIONS, EXAM_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = React.useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gd_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = React.useState(() => {
    const hash = window.location.hash.replace('#', '');
    const saved = localStorage.getItem('gd_user');
    const u = saved ? JSON.parse(saved) : null;

    if (hash === 'admin') {
      if (u?.isAdmin) return 'admin';
      window.location.hash = u ? 'dashboard' : '';
      return u ? 'dashboard' : 'dashboard';
    }
    
    if (u) {
      return hash || (u.isAdmin ? 'admin' : 'dashboard');
    }
    return 'dashboard';
  });

  const [currentQuizCategory, setCurrentQuizCategory] = React.useState<string | null>(null);
  const [currentQuizType, setCurrentQuizType] = React.useState<string | null>(null);
  const [quizResult, setQuizResult] = React.useState<QuizResult | null>(null);
  
  const [quizSettings, setQuizSettings] = React.useState<QuizSettings>(() => {
    const saved = localStorage.getItem('gd_settings');
    return saved ? JSON.parse(saved) : DEFAULT_QUIZ_SETTINGS;
  });

  const [questions, setQuestions] = React.useState<Question[]>(() => {
    const saved = localStorage.getItem('gd_questions');
    return saved ? JSON.parse(saved) : MOCK_QUESTIONS;
  });

  const [categories, setCategories] = React.useState<Category[]>(() => {
    const saved = localStorage.getItem('gd_categories');
    return saved ? JSON.parse(saved) : EXAM_CATEGORIES;
  });

  // Sync state with URL hash
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      if (hash === 'admin') {
        if (!user) {
          window.location.hash = ''; 
          return;
        }
        if (!user.isAdmin) {
          alert("Unauthorized Access: Admin privileges required.");
          window.location.hash = 'dashboard';
          setActiveTab('dashboard');
          return;
        }
      }
      
      setActiveTab(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const handleSetActiveTab = (tab: string) => {
    window.location.hash = tab;
    setActiveTab(tab);
  };

  const handleLogin = (userData: any) => {
    const profile: UserProfile = {
      ...userData,
      timeSpent: userData.timeSpent || 0,
      lastActive: new Date().toISOString()
    };
    setUser(profile);
    const targetTab = profile.isAdmin ? 'admin' : 'dashboard';
    handleSetActiveTab(targetTab);
    localStorage.setItem('gd_user', JSON.stringify(profile));

    const allUsers = JSON.parse(localStorage.getItem('gd_all_users') || '[]');
    if (!allUsers.find((u: UserProfile) => u.email === profile.email)) {
      allUsers.push(profile);
      localStorage.setItem('gd_all_users', JSON.stringify(allUsers));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gd_user');
    window.location.hash = '';
  };

  const handleSettingsChange = (newSettings: QuizSettings) => {
    setQuizSettings(newSettings);
    localStorage.setItem('gd_settings', JSON.stringify(newSettings));
  };

  const handleQuestionsChange = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    localStorage.setItem('gd_questions', JSON.stringify(newQuestions));
  };

  const handleCategoriesChange = (newCats: Category[]) => {
    setCategories(newCats);
    localStorage.setItem('gd_categories', JSON.stringify(newCats));
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    if (user) {
      const updatedUser = {
        ...user,
        totalQuizzes: user.totalQuizzes + 1,
        accuracy: Math.round(((user.accuracy * user.totalQuizzes) + ((result.correctCount / result.totalQuestions) * 100)) / (user.totalQuizzes + 1))
      };
      setUser(updatedUser);
      localStorage.setItem('gd_user', JSON.stringify(updatedUser));
    }
  };

  const handleSelectQuiz = (catId: string, type: string | null = null) => {
    setCurrentQuizCategory(catId);
    setCurrentQuizType(type);
    handleSetActiveTab('quizzes');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (currentQuizCategory && !quizResult) {
    return (
      <QuizEngine 
        category={currentQuizCategory} 
        type={currentQuizType}
        settings={quizSettings}
        questionsPool={questions}
        categories={categories}
        onComplete={handleQuizComplete} 
        onExit={() => { setCurrentQuizCategory(null); setCurrentQuizType(null); }} 
      />
    );
  }

  if (quizResult) {
    return (
      <Layout activeTab="quizzes" setActiveTab={handleSetActiveTab} onLogout={handleLogout} isAdmin={user.isAdmin}>
        <QuizSummary 
          result={quizResult} 
          questionsPool={questions}
          onRetry={() => { setQuizResult(null); }} 
          onBack={() => { setQuizResult(null); setCurrentQuizCategory(null); setCurrentQuizType(null); handleSetActiveTab('dashboard'); }} 
        />
      </Layout>
    );
  }

  const enabledCategories = categories.filter((c: Category) => c.enabled !== false);

  return (
    <Layout activeTab={activeTab} setActiveTab={handleSetActiveTab} onLogout={handleLogout} isAdmin={user.isAdmin}>
      {activeTab === 'dashboard' && !user.isAdmin && (
        <Dashboard 
          user={user} 
          categories={enabledCategories}
          allQuestions={questions}
          onSelectCategory={handleSelectQuiz} 
        />
      )}
      
      {activeTab === 'quizzes' && !user.isAdmin && (
        <Dashboard 
          user={user} 
          categories={enabledCategories}
          allQuestions={questions}
          onSelectCategory={handleSelectQuiz} 
        />
      )}

      {activeTab === 'leaderboard' && !user.isAdmin && <Leaderboard />}

      {activeTab === 'profile' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-32 h-32 rounded-full mb-4 border-4 border-blue-100 shadow-lg bg-blue-50" alt="Profile" />
            <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-slate-500 font-medium">{user.email}</p>
            {user.isAdmin && <span className="mt-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Administrator</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Exam Goal</span>
              <p className="text-lg font-bold text-slate-800 mt-1">{user.examPreference}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Time Spent</span>
              <p className="text-lg font-bold text-slate-800 mt-1">{user.timeSpent || 0} Minutes</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && user.isAdmin && (
        <AdminPanel 
          questions={questions}
          categories={categories}
          currentSettings={quizSettings} 
          onSettingsChange={handleSettingsChange}
          onQuestionsChange={handleQuestionsChange}
          onCategoriesChange={handleCategoriesChange}
        />
      )}
    </Layout>
  );
};

export default App;
