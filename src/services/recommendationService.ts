import apiClient from './apiClient';

export const recommendationService = {
    getAdaptive: (includeXAI = true) => apiClient.get('/recommendations/adaptive', {
        params: { xai: includeXAI ? 'true' : 'false' }
    }),
    getKnowledgeState: () => apiClient.get('/recommendations/knowledge-state'),
    getDKTHealth: () => apiClient.get('/recommendations/dkt-health')
};
