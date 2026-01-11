import apiClient from './apiClient';

export const projectionService = {
    runProjection: (params: any) => apiClient.post('/projections/run', params),
    getReport: () => apiClient.get('/projections/report'),
    getVisualizations: () => apiClient.get('/projections/visualizations'),
    getVisualization: (filename: string) => apiClient.get(`/projections/visualization/${filename}`, {
        responseType: 'blob'
    })
};
