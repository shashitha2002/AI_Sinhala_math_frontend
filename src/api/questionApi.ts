import { apiClient } from './client';

export const DifficultyLevel = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard"
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export interface QuestionRequest {
  topic: string;
  difficulty: DifficultyLevel;
  num_questions: number;
}

export interface Question {
  question: string;
  solution: string;
  answer: string;
}

export interface QuestionResponse {
  success: boolean;
  topic: string;
  questions: Question[];
  generation_time_seconds: number;
  model_used: string;
}

export async function generateQuestions(request: QuestionRequest): Promise<QuestionResponse> {
  const { data } = await apiClient.post<QuestionResponse>('/math/generate', request);
  return data;
}
