
import React from 'react';
import { QuizResult, Question, AIAnalysisReport } from '../types';
import { analyzePerformance } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, RefreshCcw, LayoutDashboard, Search, Sparkles, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface QuizSummaryProps {
  result: QuizResult;
  questionsPool: Question[];
  onRetry: () => void;
  onBack: () => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({ result, questionsPool, onRetry, onBack }) => {
  const [showReview, setShowReview] = React.useState(false);
  const [aiReport, setAiReport] = React.useState<AIAnalysisReport | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  const data = [
    { name: 'Correct', value: result.correctCount, color: '#10b981' },
    { name: 'Wrong', value: result.wrongCount, color: '#ef4444' },
    { name: 'Skipped', value: result.skippedCount, color: '#94a3b8' },
  ];

  const relevantQuestions = questionsPool.filter(q => q.category === result.category || result.category === 'all');

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    const report = await analyzePerformance(relevantQuestions, result.answers);
    setAiReport(report);
    setAnalyzing(false);
  };

  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);

  if (showReview) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
          <h3 className="text-xl font-bold">Answer Review</h3>
          <button onClick={() => setShowReview(false)} className="bg-slate-100 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors">Back to Summary</button>
        </div>
        
        {relevantQuestions.map((q, idx) => {
          const userAns = result.answers.find(a => a.questionId === q.id);
          const isCorrect = userAns?.selectedOption === q.correctAnswer;
          const isSkipped = userAns?.selectedOption === null || userAns?.selectedOption === undefined;

          return (
            <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {isCorrect ? <CheckCircle2 className="text-green-500" /> : isSkipped ? <AlertCircle className="text-slate-400" /> : <XCircle className="text-red-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-4">{idx + 1}. {q.question}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`p-4 rounded-xl border text-sm font-medium ${
                        i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800' :
                        i === userAns?.selectedOption ? 'bg-red-50 border-red-200 text-red-800' :
                        'bg-slate-50 border-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65+i)}. {opt}
                        {i === q.correctAnswer && <span className="float-right text-[10px] bg-green-200 px-2 py-0.5 rounded-full ml-2">CORRECT</span>}
                        {i === userAns?.selectedOption && i !== q.correctAnswer && <span className="float-right text-[10px] bg-red-200 px-2 py-0.5 rounded-full ml-2">YOURS</span>}
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm">
                    <p className="font-bold text-blue-800 mb-1">Explanation:</p>
                    <p className="text-blue-900 leading-relaxed">{q.explanation}</p>
                    {/* Fixed Error: Removed access to non-existent 'reference' property on the Question type */}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-4 bg-yellow-100 text-yellow-600 rounded-full mb-4 animate-bounce">
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Quiz Completed!</h2>
        <p className="text-slate-500">Excellent effort on the {result.category.replace('_', ' ')} preparation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black text-slate-800">{accuracy}%</span>
               <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Accuracy</span>
             </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 w-full pt-6 border-t border-slate-100">
             <div>
               <div className="text-2xl font-bold text-green-600">{result.correctCount}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Correct</div>
             </div>
             <div>
               <div className="text-2xl font-bold text-red-500">{result.wrongCount}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Wrong</div>
             </div>
             <div>
               <div className="text-2xl font-bold text-slate-500">{result.skippedCount}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Skipped</div>
             </div>
          </div>
        </div>

        {/* Info & Performance */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
           <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               📊 Performance Summary
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                 <span className="text-slate-600 font-medium">Total Score</span>
                 <span className="text-xl font-bold text-blue-700">{result.score} pts</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                 <span className="text-slate-600 font-medium">Time Taken</span>
                 <span className="text-xl font-bold text-slate-800">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                 <span className="text-slate-600 font-medium">Global Rank Delta</span>
                 <span className="text-xl font-bold text-green-600">↑ 12</span>
               </div>
             </div>
           </div>

           {!aiReport ? (
             <button 
              onClick={handleAIAnalysis}
              disabled={analyzing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
             >
               {analyzing ? 'Consulting Gemini AI...' : <><Sparkles size={20} /> View AI Performance Analysis</>}
             </button>
           ) : (
             <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" /> AI Personal Report
                </h4>
                <div className="space-y-4 text-sm text-indigo-900">
                  <div>
                    <span className="font-bold text-indigo-700 block mb-1">Key Strengths:</span>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiReport.strengths.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-700 block mb-1">Action Plan:</span>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiReport.actionPlan.slice(0, 2).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                  <p className="italic font-medium border-t border-indigo-200 pt-3 mt-3">"{aiReport.motivationalMessage}"</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <button 
           onClick={() => setShowReview(true)}
           className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
         >
           <Search size={20} /> Review Answers
         </button>
         <button 
           onClick={onRetry}
           className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
         >
           <RefreshCcw size={20} /> Retry Quiz
         </button>
         <button 
           onClick={onBack}
           className="flex items-center justify-center gap-2 bg-blue-700 py-4 rounded-2xl font-bold text-white hover:bg-blue-800 transition-all shadow-lg"
         >
           <LayoutDashboard size={20} /> Dashboard
         </button>
      </div>
    </div>
  );
};
