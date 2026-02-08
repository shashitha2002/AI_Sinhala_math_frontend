import apiClient from './apiClient';

export const gameService = {
    play: (data: any) => apiClient.post('/games/play', data),
    getStats: () => apiClient.get('/games/stats'),
    getActivity: (days = 30) => apiClient.get('/games/activity', { params: { days } }),
    getActivityLog: () => apiClient.get('/games/activity')
};
