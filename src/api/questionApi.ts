import { apiClient } from './client';
import { QuestionResponse } from '../types';

export async function fetchRandomQuestion(): Promise<QuestionResponse> {
  const { data } = await apiClient.get<QuestionResponse>('/questions/random');
  return data;
}

export async function fetchQuestionById(id: string): Promise<QuestionResponse> {
  const { data } = await apiClient.get<QuestionResponse>(`/questions/${id}`);
  return data;
}
