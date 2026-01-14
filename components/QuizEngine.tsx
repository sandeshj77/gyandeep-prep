
import React from 'react';
import { Question, UserAnswer, QuizResult, QuizSettings } from '../types';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, Flag, FastForward, LayoutGrid, X, Sparkles, Timer } from 'lucide-react';

interface QuizEngineProps {
  category: string;
  type?: string | null;
  settings: QuizSettings;
  questionsPool: Question[];
  categories?: any[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ category, type, settings, questionsPool, categories, onComplete, onExit }) => {
  const [questions] = React.useState(() => {
    const catConfig = categories?.find(c => c.id === category);
    // Use category-specific limit, or global settings, but if a type is selected, we might want to show more
    const limit = type ? 50 : (catConfig?.maxQuestions || settings.questionsPerQuiz);
    
    let filtered = questionsPool.filter(q => q.category === category || category === 'all');
    
    // If a specific sub-topic (type) was selected, filter by it
    if (type) {
      filtered = filtered.filter(q => q.type === type);
    }
    
    // Shuffle the filtered questions for a fresh experience
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, limit);
  });
  
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<UserAnswer[]>([]);
  const [totalTimer, setTotalTimer] = React.useState(0);
  
  const currentQuestion = questions[currentIdx];
  const activeAnswer = userAnswers.find(ua => ua.questionId === currentQuestion?.id);

  // Per-question timer state - Fallback to 30 if nothing set
  const [questionTimer, setQuestionTimer] = React.useState(() => 
    currentQuestion?.timeLimit || 30
  );
  
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [showNavGrid, setShowNavGrid] = React.useState(false);
  const [markedForReview, setMarkedForReview] = React.useState<Set<number>>(new Set());

  const isLastQuestion = currentIdx === questions.length - 1;

  // Global elapsed timer
  React.useEffect(() => {
    const interval = setInterval(() => setTotalTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Question-specific timer logic
  React.useEffect(() => {
    if (settings.showTimer && questionTimer > 0) {
      const qTimerInterval = setInterval(() => {
        setQuestionTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(qTimerInterval);
    } else if (settings.showTimer && questionTimer === 0) {
      if (!isLastQuestion) {
        handleNext();
      } else {
        setShowConfirm(true);
      }
    }
  }, [questionTimer, currentIdx, settings.showTimer]);

  // Sync timer when question changes
  React.useEffect(() => {
    setQuestionTimer(currentQuestion?.timeLimit || 30);
  }, [currentIdx, currentQuestion]);

  const handleSelect = (optionIdx: number | null) => {
    const existingIdx = userAnswers.findIndex(ua => ua.questionId === currentQuestion.id);
    const limit = currentQuestion?.timeLimit || 30;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: optionIdx,
      timeTaken: limit - questionTimer
    };

    if (existingIdx >= 0) {
      const updated = [...userAnswers];
      updated[existingIdx] = newAnswer;
      setUserAnswers(updated);
    } else {
      setUserAnswers([...userAnswers, newAnswer]);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowHint(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowHint(false);
    }
  };

  const handleSkip = () => {
    const existing = userAnswers.find(ua => ua.questionId === currentQuestion.id);
    if (!existing) {
      handleSelect(null);
    }
    handleNext();
  };

  const toggleMarkReview = () => {
    const newSet = new Set(markedForReview);
    if (newSet.has(currentIdx)) newSet.delete(currentIdx);
    else newSet.add(currentIdx);
    setMarkedForReview(newSet);
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setShowNavGrid(false);
  };

  const submitQuiz = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach(q => {
      const ans = userAnswers.find(ua => ua.questionId === q.id);
      if (!ans || ans.selectedOption === null) skipped++;
      else if (ans.selectedOption === q.correctAnswer) correct++;
      else wrong++;
    });

    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      quizId: category,
      category,
      score: correct * 2,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      timeSpent: totalTimer,
      date: new Date().toISOString(),
      answers: userAnswers
    });
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200">
        <AlertCircle size={64} className="text-blue-500 mb-6" />
        <h3 className="text-2xl font-bold text-slate-800">No content available</h3>
        <p className="text-slate-500 mt-2 max-w-sm">There are no questions in this {type ? `"${type}" sub-topic` : 'category'}. Try another selection.</p>
        <button onClick={onExit} className="mt-8 bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Return Home</button>
      </div>
    );
  }

  const limitVal = currentQuestion?.timeLimit || 30;
  const timerPercentage = (questionTimer / limitVal) * 100;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-200 sticky top-0 z-20 shadow-sm transition-all duration-300">
        <button onClick={onExit} className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors">
          <ChevronLeft size={18} /> Exit
        </button>
        <div className="flex items-center gap-2">
          {settings.showTimer && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 transition-all duration-500 shadow-sm ${
              questionTimer < 10 
                ? 'bg-red-500 border-red-700 text-red-950 animate-pulse scale-105 ring-4 ring-red-100 font-black' 
                : 'bg-white border-slate-100 text-blue-600 font-bold'
            }`}>
              <Timer size={16} className={questionTimer < 10 ? 'animate-spin' : ''} />
              <span className="font-mono">{questionTimer}s</span>
            </div>
          )}
          <button 
            onClick={() => setShowNavGrid(!showNavGrid)}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 font-bold hover:bg-blue-100 transition-all"
          >
            {currentIdx + 1} / {questions.length} <LayoutGrid size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
           <span className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest">{type || 'Mix Practice'}</span>
           <button 
            onClick={() => setShowConfirm(true)}
            className={`px-6 py-1.5 rounded-full font-bold transition-all shadow-sm ${isLastQuestion ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {isLastQuestion ? 'Finish' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Navigation Grid Popover */}
      {showNavGrid && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl z-30 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Question Map</h4>
            <button onClick={() => setShowNavGrid(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const ans = userAnswers.find(ua => ua.questionId === q.id);
              const isMarked = markedForReview.has(i);
              return (
                <button
                  key={i}
                  onClick={() => jumpToQuestion(i)}
                  className={`
                    h-10 rounded-xl font-bold transition-all border
                    ${currentIdx === i ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    ${ans?.selectedOption !== null && ans?.selectedOption !== undefined ? 'bg-green-500 border-green-600 text-white' : 
                      isMarked ? 'bg-yellow-400 border-yellow-500 text-yellow-900' : 
                      ans?.selectedOption === null ? 'bg-slate-200 border-slate-300 text-slate-500' : 
                      'bg-slate-50 border-slate-200 text-slate-400'}
                  `}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl mb-6 relative overflow-hidden transition-all duration-300">
        {settings.showTimer && (
          <div className="w-full h-1.5 bg-slate-100">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${questionTimer < 10 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}

        <div className="p-6 md:p-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-blue-50 text-blue-600 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md mb-2 inline-block border border-blue-100">
                {currentQuestion.difficulty} • {currentQuestion.type || currentQuestion.category.replace('_', ' ')}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                {currentQuestion.question}
              </h2>
            </div>
            {markedForReview.has(currentIdx) && (
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                <Flag size={12} /> REVIEW
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`
                  p-5 text-left rounded-2xl border-2 transition-all group relative
                  ${activeAnswer?.selectedOption === idx 
                    ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' 
                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors
                    ${activeAnswer?.selectedOption === idx 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-lg font-medium ${activeAnswer?.selectedOption === idx ? 'text-blue-800' : 'text-slate-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowHint(!showHint)}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-sm"
          >
            Hint
          </button>
          <button 
            onClick={toggleMarkReview}
            className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-semibold border transition-all shadow-sm ${markedForReview.has(currentIdx) ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          >
            Mark
          </button>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            disabled={currentIdx === 0}
            onClick={handlePrev}
            className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all text-black font-black"
          >
            <ChevronLeft />
          </button>
          <button 
            onClick={handleSkip}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <FastForward size={18} /> Skip
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 md:flex-none bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 shadow-md active:scale-95 transition-all"
          >
            {isLastQuestion ? 'Review' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {showHint && (
        <div className="mt-6 bg-amber-50 border border-amber-200 p-6 rounded-3xl animate-in slide-in-from-bottom-4 shadow-sm">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" /> 💡 Quick Hint
          </h4>
          <p className="text-amber-900 font-medium">{currentQuestion.hint || "Analyze all options carefully. One is logically superior to others."}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95">
            <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Final Submission</h3>
            <p className="text-slate-500 mb-6 font-medium">
              You have attempted {userAnswers.filter(a => a.selectedOption !== null && a.selectedOption !== undefined).length} out of {questions.length} questions.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={submitQuiz}
                className="flex-1 px-4 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-md transition-all active:scale-95"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
