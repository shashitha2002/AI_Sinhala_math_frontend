import apiClient from './apiClient';

export const evaluateService = {
    evaluateBatch: (data: any) => apiClient.post('/evaluate/quiz', data)
};
