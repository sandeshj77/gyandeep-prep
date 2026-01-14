import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserAnswer, AIAnalysisReport, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePerformance = async (
  questions: Question[],
  userAnswers: UserAnswer[]
): Promise<AIAnalysisReport | null> => {
  const performanceData = userAnswers.map((ua) => {
    const q = questions.find(item => item.id === ua.questionId);
    return {
      question: q?.question,
      category: q?.category,
      isCorrect: ua.selectedOption === q?.correctAnswer,
      timeTaken: ua.timeTaken
    };
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these results for a Nepal exam student: ${JSON.stringify(performanceData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeManagement: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivationalMessage: { type: Type.STRING }
          },
          required: ["strengths", "weaknesses", "patterns", "timeManagement", "actionPlan", "motivationalMessage"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

export const generateAIQuestions = async (
  topic: string,
  count: number = 5,
  difficulty: Difficulty = 'Medium'
): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} high-quality Loksewa/Nepal Banking style MCQs about ${topic} at ${difficulty} level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation", "difficulty", "type"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((r: any) => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9),
      category: 'ai_generated'
    }));
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};