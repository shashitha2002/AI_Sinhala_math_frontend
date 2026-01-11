import apiClient from './apiClient';

export const stressService = {
    analyze: (data: any) => apiClient.post('/stress/analyze', data),
    getHistory: () => apiClient.get('/stress/history')
};
