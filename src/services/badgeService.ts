import apiClient from './apiClient';

export const badgeService = {
    getAll: () => apiClient.get('/badges'),
    getMyBadges: () => apiClient.get('/badges/my-badges'),
    check: (data: any) => apiClient.post('/badges/check', data),
    getStats: () => apiClient.get('/badges/stats'),
    initialize: () => apiClient.post('/badges/initialize')
};
