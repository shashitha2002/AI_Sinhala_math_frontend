import apiClient from './apiClient';

export const progressService = {
    getSummary: () => apiClient.get('/progress/summary'),
    getHistory: () => apiClient.get('/progress/history'),
    getDashboard: () => apiClient.get('/progress/dashboard'),
    getPortfolio: () => apiClient.get('/progress/portfolio')
};
