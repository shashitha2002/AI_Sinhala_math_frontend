import apiClient from './apiClient';

// Define types as needed, using 'any' for now to facilitate migration
export const quizService = {
    generate: (params: any) => apiClient.get('/quiz/generate', { params }),
    getById: (id: string) => apiClient.get(`/quiz/${id}`),
    submit: (data: any) => apiClient.post('/quiz/submit', data),
    getModelPaper: () => apiClient.get('/quiz/model-paper'),
    getHistory: () => apiClient.get('/quiz/history'),
    getTopics: () => apiClient.get('/quiz/topics')
};
