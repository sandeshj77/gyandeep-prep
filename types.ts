export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Category {
  id: string;
  name: string;
  icon: string;
  enabled?: boolean;
  maxQuestions?: number;
}

export interface Question {
  id: string;
  category: string;
  type?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  hint?: string;
  difficulty: Difficulty;
  timeLimit?: number;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  timeTaken: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpent: number;
  date: string;
  answers: UserAnswer[];
}

export interface UserProfile {
  name: string;
  email: string;
  examPreference: string;
  totalQuizzes: number;
  accuracy: number;
  rank: number;
  streak: number;
  maxStreak: number;
  badges: string[];
  isAdmin: boolean;
  timeSpent: number;
  lastActive: string;
}

export interface AIAnalysisReport {
  strengths: string[];
  weaknesses: string[];
  patterns: string[];
  timeManagement: string;
  actionPlan: string[];
  motivationalMessage: string;
}

export interface QuizSettings {
  questionsPerQuiz: number;
  timeLimitPerQuestion: number;
  showTimer: boolean;
}