import apiClient from './apiClient';

export const progressService = {
    getDashboard: () => apiClient.get('/progress/dashboard'),
    getPortfolio: () => apiClient.get('/progress/portfolio')
};
