import apiClient from './apiClient';

export const evaluateService = {
    evaluateBatch: (questions: any[]) => apiClient.post('/quiz/evaluate/quiz', questions)
};
