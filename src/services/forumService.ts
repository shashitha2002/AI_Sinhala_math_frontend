import apiClient from './apiClient';

export const forumService = {
    getPosts: (params?: any) => apiClient.get('/forum/posts', { params }),
    getPost: (id: string) => apiClient.get(`/forum/posts/${id}`),
    createPost: (data: any) => apiClient.post('/forum/posts', data),
    addComment: (postId: string, data: any) => apiClient.post(`/forum/posts/${postId}/comments`, data),
    likePost: (postId: string, userId: string) => apiClient.post(`/forum/posts/${postId}/like`, null, { params: { user_id: userId } }),
    chatWithGemini: (question: string) => apiClient.post('/gemini', { question })
};
