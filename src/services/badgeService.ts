import apiClient from './apiClient';

export const badgeService = {
    getAll: () => apiClient.get('/badges/all'),
    getUserBadges: (userId: string) => apiClient.get(`/badges/user/${userId}`),
    check: (data: any) => apiClient.post('/badges/check', data), // Assuming this will be added or exists
    getStats: () => apiClient.get('/badges/stats'), // Assuming this will be added or exists
    initialize: () => apiClient.post('/badges/initialize'), // Assuming this will be added or exists
    getMyBadges: () => apiClient.get('/badges/my-badges')
};
