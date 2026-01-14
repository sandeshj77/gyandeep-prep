
import React from 'react';
import { Plus, Trash2, Edit, Save, Upload, Search, Settings, List, Users, BarChart3, X, Check, BookOpen, Trash, FileDown, FileUp, ChevronDown, Sparkles, Wand2, ArrowLeft, Clock, ToggleLeft, ToggleRight, Hash, Tag, Timer } from 'lucide-react';
import { Question, QuizSettings, Difficulty, UserProfile, Category } from '../types';
import { generateAIQuestions } from '../services/geminiService';

interface AdminPanelProps {
  questions: Question[];
  categories: Category[];
  currentSettings: QuizSettings;
  onSettingsChange: (settings: QuizSettings) => void;
  onQuestionsChange: (questions: Question[]) => void;
  onCategoriesChange: (cats: Category[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  questions, categories, currentSettings, onSettingsChange, onQuestionsChange, onCategoriesChange 
}) => {
  const [activeAdminTab, setActiveAdminTab] = React.useState<'questions' | 'categories' | 'manage_quizzes' | 'ai' | 'users' | 'settings'>('questions');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isEditingQuestion, setIsEditingQuestion] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // AI Generator State
  const [aiTopic, setAiTopic] = React.useState('');
  const [aiCount, setAiCount] = React.useState(5);
  const [aiDifficulty, setAiDifficulty] = React.useState<Difficulty>('Medium');
  const [isGenerating, setIsGenerating] = React.useState(false);

  // User Stats State
  const [registeredUsers, setRegisteredUsers] = React.useState<UserProfile[]>([]);

  const [currentQuestion, setCurrentQuestion] = React.useState<Partial<Question>>({
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'Easy',
    type: '',
    timeLimit: undefined
  });

  React.useEffect(() => {
    const savedUsers = localStorage.getItem('gd_all_users');
    if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));
  }, [activeAdminTab]);

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Delete this question?')) {
      onQuestionsChange(questions.filter(q => q.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('ARE YOU SURE? This will delete EVERY question in the database!')) {
      onQuestionsChange([]);
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.question || !currentQuestion.category) return;

    let updatedQuestions;
    if (currentQuestion.id) {
      updatedQuestions = questions.map(q => q.id === currentQuestion.id ? (currentQuestion as Question) : q);
    } else {
      const newQuestion = { ...currentQuestion, id: Date.now().toString() } as Question;
      updatedQuestions = [...questions, newQuestion];
    }
    
    onQuestionsChange(updatedQuestions);
    setIsEditingQuestion(false);
    setCurrentQuestion({ options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Easy', type: '', timeLimit: undefined });
  };

  const handleAddCategory = () => {
    const name = prompt('Category Name (Nepali or English):');
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '_').substring(0, 15);
      const icon = prompt('Category Icon (Emoji):', '📚') || '📚';
      onCategoriesChange([...categories, { id, name, icon, enabled: true, maxQuestions: currentSettings.questionsPerQuiz }]);
    }
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat);
    onCategoriesChange(updated);
  };

  const handleAIQuestionsGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      const newBatch = await generateAIQuestions(aiTopic, aiCount, aiDifficulty);
      onQuestionsChange([...questions, ...newBatch]);
      alert(`Successfully generated and added ${newBatch.length} questions about ${aiTopic}!`);
      setAiTopic('');
      setActiveAdminTab('questions');
    } catch (err) {
      alert("AI Generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const newQuestions: Question[] = [];
        const header = lines[0].toLowerCase();
        const startIdx = header.includes('question') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!parts || parts.length < 6) continue;

          const clean = parts.map(p => p.replace(/^"|"$/g, '').trim());
          const [question, op1, op2, op3, op4, correct, category, difficulty, explanation, hint, type, timeLimit] = clean;

          newQuestions.push({
            id: Math.random().toString(36).substr(2, 9),
            question: question,
            options: [op1, op2, op3, op4] as [string, string, string, string],
            correctAnswer: parseInt(correct) || 0,
            category: (category || 'gk').toLowerCase(),
            difficulty: (difficulty as Difficulty) || 'Medium',
            explanation: explanation || '',
            hint: hint || '',
            type: type || '',
            timeLimit: timeLimit ? parseInt(timeLimit) : undefined
          });
        }

        if (newQuestions.length > 0) {
          onQuestionsChange([...questions, ...newQuestions]);
          alert(`Import Successful: ${newQuestions.length} questions added.`);
        }
      } catch (err) {
        alert("Error parsing CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadCsvTemplate = () => {
    const header = "question,option1,option2,option3,option4,correctAnswerIndex,category,difficulty,explanation,hint,type,timeLimit\n";
    const example = "\"Who is the PM of Nepal?\",\"A\",\"B\",\"C\",\"D\",0,gk,Easy,\"Explanation...\",\"Hint...\",\"Current Affairs\",45\n";
    const blob = new Blob([header + example], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gyandeep_import.csv';
    a.click();
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
        {(['questions', 'categories', 'manage_quizzes', 'ai', 'users', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveAdminTab(tab)}
            className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl text-sm font-black capitalize transition-all ${
              activeAdminTab === tab ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab === 'ai' ? 'AI Generator' : tab === 'users' ? 'Learner Base' : tab === 'manage_quizzes' ? 'Manage Quizzes' : tab}
          </button>
        ))}
      </div>

      {activeAdminTab === 'questions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">MCQ Database</h2>
              <p className="text-slate-500 text-sm">Managing {questions.length} questions in the system.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCsvUpload} />
              <button onClick={downloadCsvTemplate} title="Download Template" className="bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl font-bold border-2 border-slate-200 hover:bg-white transition-all"><FileDown size={18} /></button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-slate-50 text-blue-700 px-6 py-3 rounded-2xl font-bold border-2 border-blue-100 hover:bg-white transition-all"><FileUp size={18} /> CSV</button>
              <button onClick={handleClearAll} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold border-2 border-red-100 hover:bg-white transition-all"><Trash size={18} /> Wipe</button>
              <button onClick={() => { setIsEditingQuestion(true); setCurrentQuestion({ options: ['', '', '', ''], correctAnswer: 0, difficulty: 'Easy', type: '', timeLimit: undefined }); }} className="bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition-all"><Plus size={18} /> New Question</button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by question, type, or category..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium rounded-2xl outline-none focus:bg-white focus:border-blue-600 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Category / Type</th>
                  <th className="px-6 py-4">Meta</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.filter(q => 
                  q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  q.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  q.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-sm truncate">{q.question}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-600 capitalize font-bold">{q.category.replace('_', ' ')}</span>
                        {q.type && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black w-fit border border-blue-100 uppercase tracking-tighter">{q.type}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border w-fit ${
                          q.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border-green-100' :
                          q.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {q.difficulty}
                        </span>
                        {q.timeLimit && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tight">
                            <Timer size={10} /> {q.timeLimit}s
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setCurrentQuestion(q); setIsEditingQuestion(true); }} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditingQuestion && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveQuestion} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <button 
                type="button" 
                onClick={() => setIsEditingQuestion(false)} 
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                <ArrowLeft size={18} /> Back to Database
              </button>
              <h3 className="text-2xl font-black text-slate-800">{currentQuestion.id ? 'Edit MCQ' : 'New MCQ'}</h3>
              <button type="button" onClick={() => setIsEditingQuestion(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Question Text</label>
                <textarea 
                  required
                  placeholder="Enter the question narrative..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium focus:bg-white focus:border-blue-600 outline-none transition-all h-28"
                  value={currentQuestion.question || ''}
                  onChange={e => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Category</label>
                  <select 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white outline-none cursor-pointer"
                    value={currentQuestion.category || ''}
                    onChange={e => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Difficulty</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white outline-none cursor-pointer"
                    value={currentQuestion.difficulty}
                    onChange={e => setCurrentQuestion({...currentQuestion, difficulty: e.target.value as Difficulty})}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Sub-topic / Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Geography"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white outline-none"
                    value={currentQuestion.type || ''}
                    onChange={e => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest flex items-center gap-1">
                    <Timer size={12} /> Custom Time (Sec)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Default if empty"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                    value={currentQuestion.timeLimit || ''}
                    onChange={e => setCurrentQuestion({...currentQuestion, timeLimit: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black uppercase text-slate-400 ml-1 tracking-widest">Options</label>
                {currentQuestion.options?.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <input 
                      required
                      type="text" 
                      placeholder={`Option ${String.fromCharCode(65+i)}`}
                      className={`flex-1 px-5 py-3 border-2 rounded-2xl outline-none font-medium transition-all ${currentQuestion.correctAnswer === i ? 'border-green-500 bg-green-50 text-green-900' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'}`}
                      value={opt}
                      onChange={e => {
                        const next = [...(currentQuestion.options || [])];
                        next[i] = e.target.value;
                        setCurrentQuestion({...currentQuestion, options: next as [string, string, string, string]});
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: i})}
                      className={`px-5 py-3 rounded-2xl border-2 font-black text-xs uppercase transition-all ${currentQuestion.correctAnswer === i ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300'}`}
                    >
                      {currentQuestion.correctAnswer === i ? <Check size={18} /> : 'Correct'}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Explanation</label>
                <input 
                  type="text" 
                  placeholder="Explain why this answer is correct..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium focus:bg-white outline-none"
                  value={currentQuestion.explanation || ''}
                  onChange={e => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-lg mt-8 shadow-xl hover:bg-blue-800 transition-all">
              Save MCQ Record
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
